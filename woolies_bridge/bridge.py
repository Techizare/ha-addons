"""Woolies Bridge: lets the meal planner card fill a Woolworths NZ trolley.

The card (signed in as a Home Assistant admin) fires a `woolies_request` event:
    {"id": "<random>", "op": "status" | "search" | "add" | "cart" | "map_get" | "map_set" | "login", ...}
and this add-on answers with a `woolies_result` event:
    {"id": "<same>", "ok": true, "data": ...}   or   {"id": "<same>", "ok": false, "error": "..."}

It also keeps `sensor.woolies_bridge` up to date (ready / signed_out / working / error), which the card
uses to decide whether to show its 🛒 Fill trolley button.

Everything stays on the Home Assistant box: the Woolworths email and password come from the add-on's
Configuration tab, and the sign-in cookies and the remembered product matches live in /data.
"""

import asyncio
import json
import os
import re
import time
from pathlib import Path

import aiohttp

DATA = Path(os.environ.get("BRIDGE_DATA", "/data"))
os.environ.setdefault("XDG_STATE_HOME", str(DATA / "state"))
os.environ.setdefault("XDG_CONFIG_HOME", str(DATA / "config"))

OPTIONS = json.loads((DATA / "options.json").read_text()) if (DATA / "options.json").exists() else {}
if OPTIONS.get("username") and OPTIONS.get("password"):
    os.environ["WOOLWORTHS_USERNAME"] = OPTIONS["username"]
    os.environ["WOOLWORTHS_PASSWORD"] = OPTIONS["password"]

# Imported after the environment is set, so the library finds the paths and credentials.
from woolies_cli.browser import BrowserSession  # noqa: E402
from woolies_cli.client import WoolworthsClient  # noqa: E402
from woolies_cli.http_client import CookieExpiredError  # noqa: E402

TOKEN = os.environ.get("SUPERVISOR_TOKEN", "")
WS_URL = os.environ.get("BRIDGE_WS", "ws://supervisor/core/websocket")
API = os.environ.get("BRIDGE_API", "http://supervisor/core/api")
MAP_FILE = DATA / "products.json"
SENSOR = "sensor.woolies_bridge"

client = WoolworthsClient(headless=True)
lock = asyncio.Lock()
state = {"status": "starting", "last_error": "", "last_ok": ""}


def log(*a):
    print(time.strftime("%H:%M:%S"), *a, flush=True)


SHOPS = ("woolworths", "pns", "nw")


def _map_file(shop: str = "woolworths") -> Path:
    # Each shop has its own products, so its own list-item -> product matches.
    return MAP_FILE if shop in ("", "woolworths") else DATA / f"products_{shop}.json"


def load_map(shop: str = "woolworths") -> dict:
    try:
        return json.loads(_map_file(shop).read_text())
    except Exception:
        return {}


def save_map(m: dict, shop: str = "woolworths") -> None:
    f = _map_file(shop)
    tmp = f.with_suffix(".tmp")
    tmp.write_text(json.dumps(m, indent=1, ensure_ascii=False))
    tmp.replace(f)


async def set_sensor(session: aiohttp.ClientSession, status: str, error: str = "") -> None:
    state["status"] = status
    if error:
        state["last_error"] = error
    if status == "ready":
        state["last_ok"] = time.strftime("%Y-%m-%dT%H:%M:%S%z")
    body = {
        "state": status,
        "attributes": {
            "friendly_name": "Woolies Bridge",
            "icon": "mdi:cart-arrow-down",
            "signed_in_as": OPTIONS.get("username", ""),
            "has_credentials": bool(OPTIONS.get("username") and OPTIONS.get("password")),
            "last_error": state["last_error"],
            "last_ok": state["last_ok"],
            "matches": len(load_map()),
            "cart": load_cart(),
            "orders": load_orders(),
        },
    }
    try:
        async with session.post(f"{API}/states/{SENSOR}", json=body, headers={"Authorization": f"Bearer {TOKEN}"}) as r:
            if r.status >= 300:
                log("sensor update failed", r.status)
    except Exception as e:  # Home Assistant restarting
        log("sensor update failed", e)


def friendly(e: Exception) -> str:
    s = str(e) or e.__class__.__name__
    if isinstance(e, CookieExpiredError) or "Credentials not found" in s:
        return "Not signed in to Woolworths. Check the email and password in the add-on's Configuration tab."
    return s


CART_FILE = DATA / "cart.json"


def load_cart() -> dict:
    try:
        return json.loads(CART_FILE.read_text())
    except Exception:
        return {}


def save_cart(c: dict) -> None:
    tmp = CART_FILE.with_suffix(".tmp")
    tmp.write_text(json.dumps(c, ensure_ascii=False))
    tmp.replace(CART_FILE)


_logged_product_keys = [False]


def summarise_cart(d: dict) -> dict:
    """The website's own CustomerCart answer, cut down to what the trolley card shows."""
    c = ((d or {}).get("data") or {}).get("customerCart") or {}
    names = {str(v.get("sku")): v.get("name") for v in load_map().values() if isinstance(v, dict)}
    lines = []
    for li in c.get("lineItems") or []:
        p = li.get("product") or {}
        if not _logged_product_keys[0]:
            _logged_product_keys[0] = True
            log("cart product keys", sorted(p.keys()))
        var = li.get("productVariantSku") or ""
        sku = str(li.get("sku") or var.split("-")[0])
        vs = [v for v in (p.get("variants") or []) if isinstance(v, dict)]
        vv = next((v for v in vs if v.get("variantKey") == var or v.get("sku") == var), vs[0] if vs else {})
        name = (vv.get("name") or p.get("name") or p.get("productName") or names.get(sku) or var)
        tot = li.get("lineTotal") or {}
        img = p.get("imageUrl") or ""
        for a in (vv.get("assets") or []) + (p.get("assets") or []):
            if not img and isinstance(a, dict):
                img = a.get("url") or a.get("imageUrl") or ""
        lines.append({"sku": sku, "variant": var, "kg": var.endswith("-KG"), "qty": li.get("quantity"),
                      "cents": tot.get("afterDiscountAsCents"), "saved": tot.get("discountAmountAsCents") or 0,
                      "name": name, "brand": p.get("brand") or "", "img": img if isinstance(img, str) else ""})
    ful = (c.get("fulfilment") or {}).get("fulfilmentProposition")
    slot, slot_info = "", None
    if isinstance(ful, dict):
        slot_info = {"id": ful.get("id") or (c.get("fulfilment") or {}).get("propositionId"), "method": ful.get("method"),
                     "start": ful.get("startTime"), "end": ful.get("endTime"), "name": ful.get("name"),
                     "kind": ful.get("kind"), "store": (ful.get("store") or {}).get("name") or ""}
        slot = " ".join(str(ful.get(k)) for k in ("method", "startTime", "endTime", "description", "name") if ful.get(k))
    elif ful:
        slot = str(ful)
    issues = [v.get("message") for v in ((c.get("validationResult") or {}).get("failedValidations") or [])
              if v.get("ruleName") != "ValidateHasFulfilmentProposition" and v.get("message")]
    return {"lines": lines, "count": len(lines), "total_cents": (c.get("checkout") or {}).get("amountToPayAsCents"),
            "fees": [{"type": f.get("type"), "cents": f.get("amountAsCents")} for f in c.get("fees") or []],
            "slot": slot, "slot_info": slot_info, "has_slot": bool(ful), "issues": issues, "at": time.strftime("%Y-%m-%dT%H:%M:%S%z")}


async def read_cart(page) -> dict:
    """Open the website's trolley page and keep its own CustomerCart answer."""
    loop = asyncio.get_running_loop()
    fut = loop.create_future()

    async def on_resp(r):
        try:
            if r.request.headers.get("wnzx-operation-name") == "CustomerCart" and not fut.done():
                fut.set_result(await r.json())
        except Exception as e:
            if not fut.done():
                fut.set_exception(e)

    page.on("response", on_resp)
    try:
        await page.goto("https://www.woolworths.co.nz/cart")
        data = await asyncio.wait_for(fut, 30)
    finally:
        page.remove_listener("response", on_resp)
    snap = summarise_cart(data)
    save_cart(snap)
    return snap


async def cart_set(changes: list) -> dict:
    """[{variant, qty}] sets each line's quantity (0 removes it), then reads the trolley back."""
    failed = []
    bs = BrowserSession(headless=True)
    async with bs as page:
        await page.goto("https://www.woolworths.co.nz")
        await page.wait_for_timeout(3000)
        for ch in changes:
            v = str(ch.get("variant") or "")
            q = float(ch.get("qty") or 0)
            if not v:
                continue
            q = round(q, 3) if v.endswith("-KG") else max(0, round(q))
            res = await page.evaluate(ADD_JS, [v, q])
            if not res.get("ok"):
                log("cart change failed", v, q, res.get("status"), res.get("error") or res.get("text", "")[:200])
                failed.append({"variant": v, "error": add_error(res)})
            await asyncio.sleep(0.3)
        snap = await read_cart(page)
    return dict(snap, failed=failed)


# Trolley adds run inside the signed-in browser page with the website's own GraphQL call (captured from its
# "Add to cart" button, Nov 2026). The old REST trolley API the woolies-nz-cli library uses now answers 401.
# The call SETS the line's quantity, so repeating it never doubles anything.
ADD_JS = """async ([variant, qty]) => {
  const q = "mutation SetCartLineItemQuantity($input: SetCartLineItemQuantitiesInput!) {\\n" +
    "  setCartLineItemQuantity(input: $input) { key totalItemQuantity totalUniqueProductSku }\\n}";
  const r = await fetch("/api/graphql", {method: "POST", credentials: "include",
    headers: {"content-type": "application/json", "accept": "*/*", "wnzx-operation-name": "SetCartLineItemQuantity"},
    body: JSON.stringify({operationName: "SetCartLineItemQuantity", query: q,
      variables: {input: {cartLineItemQuantityUpdates: [{variantKey: variant, quantity: qty}]}}})});
  let t = ""; try { t = await r.text(); } catch (e) {}
  let ok = false, err = "";
  try { const j = JSON.parse(t); ok = !!(j.data && j.data.setCartLineItemQuantity) && !(j.errors && j.errors.length);
        if (j.errors && j.errors.length) err = j.errors.map((e) => e.message).join("; "); } catch (e) {}
  return {status: r.status, ok: ok, error: err, text: t.slice(0, 300)};
}"""


def add_error(res: dict) -> str:
    st = res.get("status")
    if st in (401, 403):
        return f"Woolworths refused the add ({st}): the add-on isn't signed in."
    return res.get("error") or f"Woolworths error {st}: {(res.get('text') or '')[:120]}"


async def add_items(items: list) -> dict:
    done, failed = [], []
    if not items:
        return {"added": done, "failed": failed}
    bs = BrowserSession(headless=True)
    async with bs as page:
        await page.goto("https://www.woolworths.co.nz")
        await page.wait_for_timeout(4000)
        for it in items:
            ref = it.get("ref") or it.get("sku")
            sku = str(it["sku"])
            qty = float(it.get("qty") or 1)
            by_kg = (it.get("unit") or "Each") in ("Kilogram", "Kg")
            # Loose produce sold by weight: the kilo variant key is SKU-KG (seen working 2026-11-16).
            tries = [(f"{sku}-KG", round(qty, 3)), (f"{sku}-KGM", round(qty, 3))] if by_kg else \
                [(f"{sku}-EA", max(1, round(qty)))]
            try:
                res = {}
                for variant, q in tries:
                    res = await page.evaluate(ADD_JS, [variant, q])
                    if res.get("ok"):
                        if by_kg:
                            log("added by", variant, q)
                        break
                if res.get("ok"):
                    done.append(ref)
                else:
                    log("add failed", it.get("name", ""), res.get("status"), res.get("error") or res.get("text", "")[:200])
                    failed.append({"ref": ref, "name": it.get("name", ""), "error": add_error(res)})
            except Exception as e:  # one product shouldn't stop the rest
                log("add failed", it.get("name", ""), repr(e)[:200])
                failed.append({"ref": ref, "name": it.get("name", ""), "error": friendly(e)})
            await asyncio.sleep(0.4)  # gentle on their servers
        try:
            await read_cart(page)
        except Exception as e:
            log("trolley read after add failed", repr(e)[:200])
    log("added", len(done), "failed", len(failed))
    return {"added": done, "failed": failed}


DIAG_JS = """() => {
  const vis = (e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  const pick = [...document.querySelectorAll('a, button')].filter(vis)
    .map((e) => (e.tagName + ':' + (e.innerText || e.getAttribute('aria-label') || '').trim().replace(/\\s+/g, ' ')
      + (e.getAttribute('href') ? ' -> ' + e.getAttribute('href') : '')).slice(0, 120))
    .filter((t) => /sign|log|account|my |register|hi /i.test(t));
  return {url: location.href, title: document.title, links: pick.slice(0, 25),
          cookies: document.cookie.split('; ').map((c) => c.split('=')[0]),
          body: (document.body ? document.body.innerText : '').replace(/\\s+/g, ' ').slice(0, 600)};
}"""


async def diag() -> dict:
    """What the headless browser sees on the home page (for working out sign-in problems). No secrets logged."""
    bs = BrowserSession(headless=True)
    seen = []

    def on_req(r):
        if "/api/" in r.url and len(seen) < 12:
            h = r.headers
            seen.append(f"{r.method} {r.url.split('?')[0][-60:]} hdrs={sorted(h.keys())} "
                        f"xsrf={'x-xsrf-token' in h} auth={'authorization' in h}")

    async with bs as page:
        page.on("request", on_req)
        resp = await page.goto("https://www.woolworths.co.nz")
        await page.wait_for_timeout(6000)
        d = await page.evaluate(DIAG_JS)
        hd = (await resp.all_headers()) if resp else {}
        d["frame"] = {"x-frame-options": hd.get("x-frame-options"),
                      "frame-ancestors": [p.strip() for p in (hd.get("content-security-policy") or "").split(";")
                                          if p.strip().startswith("frame-ancestors")]}
        d["all_cookies"] = sorted({c["name"] for c in await page.context.cookies()})
        d["api"] = seen
    for k in ("url", "title", "links", "cookies", "all_cookies", "api", "frame"):
        log("diag", k, json.dumps(d.get(k), ensure_ascii=False)[:1500])
    return d


async def capture_page(url: str, click: str = "", match: str = "/api/") -> dict:
    """Open a Woolworths page (optionally click a button/link by text) and log the GraphQL calls it makes:
    operation name, request body and the start of the answer. For working out the site's API. No cookies logged."""
    bs = BrowserSession(headless=True)
    calls = []

    def on_req(r):
        if re.search(match or "/api/", r.url) and r.resource_type in ("fetch", "xhr") and len(calls) < 30:
            calls.append(r)

    async with bs as page:
        page.on("request", on_req)
        await page.goto(url or "https://www.woolworths.co.nz")
        await page.wait_for_timeout(6000)
        if click:
            try:
                await page.get_by_text(click, exact=False).first.click(timeout=8000)
                await page.wait_for_timeout(6000)
            except Exception as e:
                log("capture_page click failed", repr(e)[:300])
        log("capture_page at", page.url)
        out = []
        for r in calls:
            resp = await r.response()
            out.append({"op": r.headers.get("wnzx-operation-name") or (r.method + " " + r.url[:160]),
                        "hdrs": sorted(k for k in r.headers if k.lower() in ("authorization", "x-api-key", "access_token") or k.lower().startswith("x-")),
                        "status": resp.status if resp else None, "body": (r.post_data or "")[:1200],
                        "resp": ((await resp.text()) if resp else "")[:1500]})
    for c in out:
        log("capture_page call", json.dumps(c, ensure_ascii=False)[:3000])
    return {"url": url, "calls": [c["op"] for c in out]}


# Delivery and pickup slots: the website's own Propositions query (captured from its slot picker, Nov 2026),
# asked for the account's first saved address.
GQL_JS = """async ([op, query, variables]) => {
  const r = await fetch("/api/graphql", {method: "POST", credentials: "include",
    headers: {"content-type": "application/json", "accept": "*/*", "wnzx-operation-name": op},
    body: JSON.stringify({operationName: op, query: query, variables: variables || {}})});
  let t = ""; try { t = await r.text(); } catch (e) {}
  let j = null; try { j = JSON.parse(t); } catch (e) {}
  return {status: r.status, json: j, text: j ? "" : t.slice(0, 300)};
}"""

ADDR_Q = "query GetMeAddresses { me { id addresses { id lines { line1 line2 } } } }"
PROP_Q = ("query Propositions($input: PropositionsInput!) { propositions(input: $input) { propositions { "
          "store { storeId name } id storeId name method type kind available startTime endTime "
          "fees { type amountInCents rateCard { orderValueMinInCents orderValueMaxInCents amountInCents } } tags } } }")


async def gql(page, op: str, query: str, variables: dict | None = None) -> dict:
    res = await page.evaluate(GQL_JS, [op, query, variables or {}])
    j = res.get("json") or {}
    if res.get("status") in (401, 403):
        raise RuntimeError(f"Woolworths refused {op} ({res.get('status')}): the add-on isn't signed in.")
    if j.get("errors"):
        raise RuntimeError(f"Woolworths {op}: " + "; ".join(str(e.get("message")) for e in j["errors"])[:300])
    if not j.get("data"):
        raise RuntimeError(f"Woolworths {op} error {res.get('status')}: {res.get('text', '')[:150]}")
    return j["data"]


def slot_fee(p: dict, cart_cents) -> int | None:
    for f in p.get("fees") or []:
        if f.get("amountInCents") is not None:
            return f["amountInCents"]
        for rc in f.get("rateCard") or []:
            lo, hi = rc.get("orderValueMinInCents") or 0, rc.get("orderValueMaxInCents")
            if cart_cents is None or (cart_cents >= lo and (hi is None or cart_cents <= hi)):
                return rc.get("amountInCents")
    return None


PREFS_FILE = DATA / "prefs.json"
DEFAULT_PICKUP = {"id": "9473", "name": "Claudelands Woolworths"}  # nearest to Newstead; changeable from the card
LOC_Q = ("query SearchLocations($input: LocationsInput!) { locations(input: $input) { locations { "
         "id name storeId address { locality { suburb } lines { line1 } } } } }")


def load_prefs() -> dict:
    try:
        return json.loads(PREFS_FILE.read_text())
    except Exception:
        return {}


def save_prefs(d: dict) -> None:
    PREFS_FILE.write_text(json.dumps(d, ensure_ascii=False))


def _why(p: dict) -> str:
    return next((t.split(":", 1)[1] for t in p.get("tags") or [] if str(t).startswith("unavailableReason:")), "")


async def slots(method: str = "delivery", store: dict | None = None) -> dict:
    """Delivery times for the account's saved address, or Click & collect times at a pickup store
    (the website's own Propositions query: locationId is the address id or the store id)."""
    prefs = load_prefs()
    if method == "pickup":
        if store and store.get("id"):
            prefs["pickup_store"] = {"id": str(store["id"]), "name": str(store.get("name") or "")}
            save_prefs(prefs)
        st = prefs.get("pickup_store") or DEFAULT_PICKUP
    bs = BrowserSession(headless=True)
    async with bs as page:
        await page.goto("https://www.woolworths.co.nz")
        await page.wait_for_timeout(3000)
        a = {}
        if method == "pickup":
            loc = st["id"]
        else:
            addrs = ((await gql(page, "GetMeAddresses", ADDR_Q)).get("me") or {}).get("addresses") or []
            if not addrs:
                raise RuntimeError("No delivery address saved on the Woolworths account.")
            a = addrs[0]
            loc = a["id"]
        props = ((await gql(page, "Propositions", PROP_Q, {"input": {"locationId": loc}}))
                 .get("propositions") or {}).get("propositions") or []
    cart = load_cart().get("total_cents")
    props = [p for p in props if p.get("method") == method]
    log("slots", method, loc, len(props))
    if method == "pickup":
        # Each pickup time comes twice: brought to your boot (dtb-team) or you pick it up from the bay
        # (dtb-customer). Show one per time, preferring to-the-boot when it is free.
        by = {}
        for p in props:
            by.setdefault((p.get("startTime"), p.get("endTime")), []).append(p)
        props = []
        for k in sorted(by):
            g = by[k]
            props.append(next((p for p in g if p.get("available") and p.get("kind") == "dtb-team"), None)
                         or next((p for p in g if p.get("available")), None) or g[0])
    out = [{"id": p.get("id"), "method": p.get("method"), "kind": p.get("kind"),
            "available": bool(p.get("available")), "start": p.get("startTime"), "end": p.get("endTime"),
            "store": (p.get("store") or {}).get("name") or "", "fee_cents": slot_fee(p, cart), "why": _why(p)}
           for p in props]
    res = {"method": method, "slots": out}
    if method == "pickup":
        res["store"] = st
    else:
        res["address"] = ", ".join(x for x in ((a.get("lines") or {}).get("line1"), (a.get("lines") or {}).get("line2")) if x)
    return res


async def stores(q: str) -> dict:
    bs = BrowserSession(headless=True)
    async with bs as page:
        await page.goto("https://www.woolworths.co.nz")
        await page.wait_for_timeout(3000)
        locs = ((await gql(page, "SearchLocations", LOC_Q, {"input": {"search": q or "Hamilton"}}))
                .get("locations") or {}).get("locations") or []
    return {"stores": [{"id": l.get("id"), "name": l.get("name"),
                        "suburb": ((l.get("address") or {}).get("locality") or {}).get("suburb") or "",
                        "street": ((l.get("address") or {}).get("lines") or {}).get("line1") or ""} for l in locs],
            "current": load_prefs().get("pickup_store") or DEFAULT_PICKUP}


SET_SLOT_Q = ("mutation SetCartFulfilment($fulfilmentPropositionId: String!) { "
              "setCartFulfilment(fulfilmentPropositionId: $fulfilmentPropositionId) { "
              "fulfilment { propositionId } validationResult { isValid failedValidations { ruleName message } } } }")
CLEAR_SLOT_Q = "mutation ClearCartFulfilment { clearCartFulfilment { fulfilment { propositionId } } }"


async def slot_set(pid: str) -> dict:
    """Book (reserve) a slot on the trolley with the website's own SetCartFulfilment call, or with an empty id
    let it go (ClearCartFulfilment). Then read the trolley back so the card shows the slot."""
    bs = BrowserSession(headless=True)
    async with bs as page:
        await page.goto("https://www.woolworths.co.nz")
        await page.wait_for_timeout(3000)
        if pid:
            d = (await gql(page, "SetCartFulfilment", SET_SLOT_Q, {"fulfilmentPropositionId": pid})).get("setCartFulfilment") or {}
            got = (d.get("fulfilment") or {}).get("propositionId")
            log("slot set", pid, "->", got)
            if got != pid:
                raise RuntimeError("Woolworths didn't keep that slot. It may have just filled up: try another.")
        else:
            await gql(page, "ClearCartFulfilment", CLEAR_SLOT_Q)
            log("slot cleared")
        snap = await read_cart(page)
    if pid and snap.get("slot_info"):
        prefs = load_prefs(); prefs["last_slot"] = snap["slot_info"]; save_prefs(prefs)
    return snap


async def query(q: str, variables: dict) -> dict:
    """Run one read-only GraphQL query in the signed-in page and log the answer (for working out the site's API).
    Mutations are refused, so this can't change the trolley or the account."""
    q = q.strip()
    if not q.startswith("query"):
        raise ValueError("Only queries are allowed here")
    name = (re.match(r"query\s+([A-Za-z0-9_]+)", q) or [None, "Query"])[1]
    bs = BrowserSession(headless=True)
    async with bs as page:
        await page.goto("https://www.woolworths.co.nz")
        await page.wait_for_timeout(3000)
        res = await page.evaluate(GQL_JS, [name, q, variables or {}])
    txt = json.dumps(res.get("json") or res.get("text"), ensure_ascii=False)
    for i in range(0, min(len(txt), 12000), 2500):
        log("query", name, i, txt[i:i + 2500])
    return {"status": res.get("status"), "size": len(txt)}


ORDERS_FILE = DATA / "orders.json"
ORDERS_Q = ("query Orders($input: OrdersInput!) { orders(input: $input) { totalCount results { orderNumber "
            "createdDateTime orderStatus fulfilmentStatus fulfilments { method startTime endTime fulfilmentLocation { name } } "
            "total { afterDiscountInCents } isAmendable } } }")


def load_orders() -> list:
    try:
        return json.loads(ORDERS_FILE.read_text())
    except Exception:
        return []


async def orders() -> list:
    """Active (placed, not yet delivered) orders, for the Calendar / Highlights. Pickup orders don't say which store,
    so the store comes from the slot booked on the card, or the remembered pickup store."""
    bs = BrowserSession(headless=True)
    async with bs as page:
        await page.goto("https://www.woolworths.co.nz")
        await page.wait_for_timeout(3000)
        res = ((await gql(page, "Orders", ORDERS_Q, {"input": {"pageIndex": 0, "pageSize": 10, "inclusiveFilter": "ACTIVE"}}))
               .get("orders") or {}).get("results") or []
    prefs = load_prefs()
    last = prefs.get("last_slot") or {}
    out = []
    for o in res:
        f = (o.get("fulfilments") or [{}])[0] or {}
        store = (f.get("fulfilmentLocation") or {}).get("name") or ""
        if f.get("method") == "pickup" and not store:
            store = last.get("store") if last.get("start") == f.get("startTime") and last.get("store") else \
                (prefs.get("pickup_store") or DEFAULT_PICKUP).get("name", "")
        out.append({"number": o.get("orderNumber"), "status": o.get("orderStatus"), "method": f.get("method"),
                    "start": f.get("startTime"), "end": f.get("endTime"), "store": store,
                    "total_cents": (o.get("total") or {}).get("afterDiscountInCents"), "amendable": bool(o.get("isAmendable"))})
    ORDERS_FILE.write_text(json.dumps(out, ensure_ascii=False))
    log("orders", json.dumps(out, ensure_ascii=False)[:600])
    return out


# ---------------------------------------------------------------------------------------------------------
# Pak'nSave and New World (Foodstuffs). Both run on one platform: an anonymous token from the shop's website,
# then a shared API that takes a store id. Search and prices need no account.
FS = {
    "pns": {"site": "https://www.paknsave.co.nz", "name": "Pak'nSave", "banner": "PNS"},
    "nw": {"site": "https://www.newworld.co.nz", "name": "New World", "banner": "MNW"},
}
FS_API = "https://api-prod.newworld.co.nz/v1/edge"
FS_IMG = "https://a.fsimg.co.nz/product/retail/fan/image/400x400/{}.png"
_fs_tok = {}  # shop -> (token, expires)


async def _fs_token(http: aiohttp.ClientSession, shop: str) -> str:
    t = _fs_tok.get(shop)
    if t and t[1] > time.time() + 60:
        return t[0]
    async with http.post(FS[shop]["site"] + "/api/user/get-current-user", json={},
                         headers={"origin": FS[shop]["site"], "referer": FS[shop]["site"] + "/"}) as r:
        if r.status != 200:
            raise RuntimeError(f"{FS[shop]['name']} didn't answer ({r.status})")
        d = await r.json(content_type=None)
    tok = d.get("access_token")
    if not tok:
        raise RuntimeError(f"{FS[shop]['name']} didn't give a token")
    _fs_tok[shop] = (tok, time.time() + int(d.get("expires_in") or 1500))
    return tok


async def fs_call(shop: str, path: str, method: str = "GET", body=None):
    """One call to the Foodstuffs API. Tried straight from Python first (fast); if the shop turns that away
    it is made from inside the shop's website in the browser instead, as the site itself would."""
    UA = "Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0"
    try:
        async with aiohttp.ClientSession(headers={"user-agent": UA}, timeout=aiohttp.ClientTimeout(total=40)) as http:
            tok = await _fs_token(http, shop)
            hdr = {"authorization": "Bearer " + tok, "accept": "application/json", "origin": FS[shop]["site"],
                   "referer": FS[shop]["site"] + "/"}
            async with http.request(method, FS_API + path, json=body, headers=hdr) as r:
                if r.status == 401:
                    _fs_tok.pop(shop, None)
                if r.status != 200:
                    raise RuntimeError(f"{r.status} {(await r.text())[:200]}")
                return await r.json(content_type=None)
    except Exception as e:
        log("fs direct failed, using the browser:", repr(e)[:300])
    bs = BrowserSession(headless=True)
    async with bs as page:
        await page.goto(FS[shop]["site"])
        await page.wait_for_timeout(3000)
        res = await page.evaluate(PEEK_JS.replace(".slice(0, 12000)", ""), [FS_API + path, method, {}, body,
                                  FS[shop]["site"] + "/api/user/get-current-user"])
    if res.get("status") != 200:
        raise RuntimeError(f"{FS[shop]['name']} said {res.get('status')}")
    return json.loads(res.get("text") or "null")


async def fs_stores(shop: str, q: str = "Hamilton") -> dict:
    d = await fs_call(shop, "/store")
    rows = d.get("stores") if isinstance(d, dict) else d
    ql = (q or "").lower()
    out = []
    for st in rows or []:
        pa = st.get("physicalAddress") or {}
        hay = " ".join(str(x) for x in (st.get("name"), st.get("address"), pa.get("cityName"), pa.get("regionName"),
                                         pa.get("suburb"))).lower()
        if ql and ql not in hay:
            continue
        out.append({"id": st.get("id"), "name": st.get("name"), "address": st.get("address") or "",
                    "click_collect": bool(st.get("clickAndCollect")), "delivery": bool(st.get("delivery")),
                    "lat": st.get("latitude"), "lon": st.get("longitude")})
    cur = load_prefs().get(shop + "_store")
    log(shop, "stores", q, json.dumps(out, ensure_ascii=False)[:2000])
    return {"shop": shop, "stores": out, "current": cur}


def fs_store_set(shop: str, store: dict) -> dict:
    prefs = load_prefs()
    prefs[shop + "_store"] = {"id": str(store.get("id")), "name": str(store.get("name") or "")}
    save_prefs(prefs)
    return prefs[shop + "_store"]


def _fs_product(p: dict) -> dict:
    sp = p.get("singlePrice") or {}
    cp = sp.get("comparativePrice") or {}
    price = (sp.get("price") or 0) / 100
    promo = None
    for pr in p.get("promotions") or []:  # club card / multi-buy deals come through here
        v = pr.get("rewardValue") or pr.get("price")
        if isinstance(v, (int, float)) and 0 < v / 100 < price and not pr.get("threshold", 1) > 1:
            promo = v / 100 if promo is None else min(promo, v / 100)
    weight = p.get("saleType") in ("WEIGHT", "BOTH")
    return {"sku": p.get("productId"), "name": p.get("name") or "", "brand": p.get("brand") or "",
            "size": p.get("displayName") or "", "price": price, "sale_price": promo, "is_special": promo is not None,
            "per_kg": weight and p.get("saleType") == "WEIGHT",
            "unit_price": (cp.get("pricePerUnit") or 0) / 100 or None, "unit": cp.get("measureDescription") or "",
            "supports_dual_pricing": p.get("saleType") == "BOTH",
            "in_stock": "ONLINE" in (p.get("availability") or ["ONLINE"]),
            "avg_g": (p.get("variableWeight") or {}).get("averageWeight"),
            "image": FS_IMG.format(str(p.get("productId") or "").split("-")[0])}


async def fs_search(shop: str, q: str, limit: int = 20, store: str = "") -> list:
    st = store or _fs_store(shop)
    d = await fs_call(shop, "/search/paginated/products", "POST", {
        "algoliaQuery": {"query": q}, "storeId": st, "hitsPerPage": max(1, min(int(limit), 50)), "page": 0,
        "sortOrder": "NI_POPULARITY_ASC", "tobaccoQuery": False})
    raw = d.get("products") or []
    if raw and any(r.get("promotions") for r in raw):
        log(shop, "promo sample", json.dumps(next(r for r in raw if r.get("promotions")), ensure_ascii=False)[:1500])
    out = [_fs_product(p) for p in raw]
    log(shop, "search", q, len(out), json.dumps(out[:2], ensure_ascii=False)[:600])
    return out


async def _fs_find(shop: str, store: str, q: str, n: int = 10) -> list:
    d = await fs_call(shop, "/search/paginated/products", "POST", {
        "algoliaQuery": {"query": q}, "storeId": store, "hitsPerPage": n, "page": 0,
        "sortOrder": "NI_POPULARITY_ASC", "tobaccoQuery": False})
    return [_fs_product(p) for p in d.get("products") or []]


def _fs_store(shop: str) -> str:
    st = (load_prefs().get(shop + "_store") or {}).get("id")
    if not st:
        raise RuntimeError(f"Pick a {FS[shop]['name']} store first")
    return st


def _size_key(x: str) -> str:
    x = re.sub(r"\s+", "", str(x or "").lower())
    return {"each": "ea", "1ea": "ea", "perkg": "kg", "1kg": "kg"}.get(x, x)


def _as_match(p: dict, guess: bool = False) -> dict:
    m = {k: p.get(k) for k in ("sku", "name", "brand", "size", "per_kg", "avg_g", "unit_price", "unit")}
    m["price"] = p["sale_price"] if p.get("is_special") and p.get("sale_price") else p.get("price")
    m["at"] = time.strftime("%Y-%m-%d")
    if guess:
        m["guess"] = True
    return m


async def fs_prices(shop: str) -> dict:
    """Today's price for every matched product at the chosen store, saved back into the matches."""
    st, m = _fs_store(shop), load_map(shop)
    changed = gone = 0
    for key, mt in m.items():
        if not isinstance(mt, dict) or mt.get("skip") or not mt.get("sku"):
            continue
        try:
            hit = next((p for p in await _fs_find(shop, st, " ".join(x for x in (mt.get("brand"), mt.get("name")) if x), 20)
                        if p["sku"] == mt["sku"]), None)
        except Exception as e:
            log(shop, "price check failed", key, repr(e)[:200])
            continue
        if not hit:
            mt["missing"] = True
            gone += 1
            continue
        new = _as_match(hit, bool(mt.get("guess")))
        changed += new["price"] != mt.get("price")
        mt.pop("missing", None)
        mt.update(new)
    save_map(m, shop)
    return {"map": m, "changed": changed, "missing": gone}


async def w_prices() -> dict:
    """Today's Woolworths price for every matched product, saved back into the matches."""
    m = load_map()
    changed = 0
    for key, mt in m.items():
        if not isinstance(mt, dict) or mt.get("skip") or not mt.get("sku"):
            continue
        try:
            p = await client.get_product(str(mt["sku"]))
        except Exception as e:
            log("woolworths price check failed", key, repr(e)[:200])
            continue
        price = p.get("sale_price") if p.get("is_special") and p.get("sale_price") else p.get("price")
        if not price:
            continue
        changed += price != mt.get("price")
        mt.update({"price": price, "at": time.strftime("%Y-%m-%d"), "in_stock": p.get("in_stock")})
    save_map(m)
    return {"map": m, "changed": changed}


async def fs_suggest(shop: str, items: list) -> dict:
    """First guesses for list items with no match yet: search each name and take the most popular product,
    preferring the same pack size as the Woolworths match. Saved marked as a guess, to be checked."""
    st, m = _fs_store(shop), load_map(shop)
    made = 0
    for it in items[:60]:
        key = str(it.get("key") or "").strip().lower()
        q = str(it.get("q") or key).strip()
        if not key or not q or key in m:
            continue
        try:
            res = [p for p in await _fs_find(shop, st, q, 10) if p.get("in_stock") is not False]
        except Exception as e:
            log(shop, "suggest failed", q, repr(e)[:200])
            continue
        if not res:
            continue
        want = _size_key(it.get("size"))
        pick = next((p for p in res if want and _size_key(p["size"]) == want), res[0])
        m[key] = _as_match(pick, True)
        made += 1
    save_map(m, shop)
    log(shop, "suggested", made)
    return {"map": m, "made": made}


# ---------------------------------------------------------------------------------------------------------
# Pak'nSave trolley (needs paknsave_username / paknsave_password). Signing in goes through Foodstuffs' Club+
# login page in the browser; the site's own cookies (a 14-day refresh token) are kept in /data so later calls
# skip the login. Every trolley call is made from inside paknsave.co.nz with the signed-in token, as the site does.
PNS_COOKIES = DATA / "pns_cookies.json"
PNS_SITE = "https://www.paknsave.co.nz"
PNS_LOGIN = "https://login.clubplus.co.nz/?banner=PNS&channel=WEB"

PNS_CALL_JS = """async ([calls]) => {
  const t = await (await fetch("/api/user/get-current-user", {method: "POST", credentials: "include",
      headers: {"content-type": "application/json"}, body: "{}"})).json();
  const tok = t && t.access_token;
  let who = "anonymous";
  try { who = JSON.parse(atob(tok.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))).email || "anonymous"; } catch (e) {}
  const out = [];
  for (const c of calls || []) {
    const r = await fetch(c.url, {method: c.method || "GET", credentials: "include",
      headers: {"accept": "application/json", "content-type": "application/json", "authorization": "Bearer " + tok},
      body: c.body ? JSON.stringify(c.body) : undefined});
    const txt = await r.text();
    let data = null; try { data = JSON.parse(txt); } catch (e) { data = txt.slice(0, 2000); }
    out.push({status: r.status, data});
  }
  return {who, out};
}"""


def _pns_creds():
    u, p = OPTIONS.get("paknsave_username"), OPTIONS.get("paknsave_password")
    if not u or not p:
        raise RuntimeError("Add your Pak'nSave email and password in the app's Configuration tab.")
    return u, p


async def _pns_open(page):
    try:
        await page.context.add_cookies(json.loads(PNS_COOKIES.read_text()))
    except Exception:
        pass
    await page.goto(PNS_SITE)
    await page.wait_for_timeout(2500)


async def _pns_save(page):
    ck = [c for c in await page.context.cookies() if re.search(r"paknsave|clubplus|foodstuffs", c.get("domain", ""))]
    PNS_COOKIES.write_text(json.dumps(ck))


async def _pns_calls(page, calls: list) -> dict:
    return await page.evaluate(PNS_CALL_JS, [calls])


async def _pns_signin(page) -> str:
    """Sign in on the Club+ page. Logs what it sees at each step, so a changed page is easy to fix."""
    u, p = _pns_creds()
    await page.goto(PNS_LOGIN)
    await page.wait_for_timeout(5000)
    for step in range(4):
        info = await page.evaluate("""() => ({url: location.href, inputs: [...document.querySelectorAll('input')].filter(i => i.offsetParent)
            .map(i => [i.type, i.name, i.id, i.autocomplete].join('|')), buttons: [...document.querySelectorAll('button,[type=submit]')]
            .filter(b => b.offsetParent).map(b => (b.innerText || b.value || '').trim().slice(0, 30))})""")
        log("pns login step", step, json.dumps(info)[:800])
        if "paknsave.co.nz" in info["url"]:
            break
        em = page.locator("input[type=email], input[name*=mail i], input[name=username], input[id*=mail i]").first
        pw = page.locator("input[type=password]").first
        if await em.count() and await em.is_visible() and not (await em.input_value()):
            await em.fill(u)
        if await pw.count() and await pw.is_visible():
            await pw.fill(p)
        btn = page.locator("button[type=submit], input[type=submit], button:has-text('Log in'), button:has-text('Sign in'), button:has-text('Continue'), button:has-text('Next')").first
        if await btn.count():
            await btn.click()
        await page.wait_for_timeout(7000)
    if "paknsave.co.nz" not in page.url:
        await page.goto(PNS_SITE)
        await page.wait_for_timeout(4000)
    res = await _pns_calls(page, [])
    log("pns signed in as", "a customer" if res["who"] != "anonymous" else "anonymous")
    return res["who"]


async def pns_session(fn):
    """Open paknsave.co.nz signed in (signing in when the saved session has run out), then run fn(page)."""
    bs = BrowserSession(headless=True)
    async with bs as page:
        await _pns_open(page)
        if (await _pns_calls(page, []))["who"] == "anonymous":
            if await _pns_signin(page) == "anonymous":
                await _pns_save(page)
                raise RuntimeError("Couldn't sign in to Pak'nSave. Check the email and password in the app's Configuration.")
        try:
            return await fn(page)
        finally:
            await _pns_save(page)


def _pns_cart_summary(d) -> dict:
    d = d if isinstance(d, dict) else {}
    items = []
    for p in d.get("products") or []:
        items.append({"sku": p.get("productId"), "name": " ".join(x for x in (p.get("brand"), p.get("name")) if x),
                      "size": p.get("displayName") or "", "qty": p.get("quantity"), "sale_type": p.get("sale_type") or p.get("saleType"),
                      "price_cents": p.get("price"), "image": FS_IMG.format(str(p.get("productId") or "").split("-")[0])})
    st = d.get("store") or {}
    return {"items": items, "store": st.get("storeName") or st.get("name") or "", "store_id": st.get("storeId") or st.get("id"),
            "subtotal_cents": (d.get("subtotal") if isinstance(d.get("subtotal"), int) else None), "raw_keys": list(d.keys())[:30]}


async def pns_cart() -> dict:
    async def go(page):
        r = (await _pns_calls(page, [{"url": FS_API + "/cart"}]))["out"][0]
        log("pns cart", r["status"], json.dumps(r["data"], ensure_ascii=False)[:2500])
        if r["status"] != 200:
            raise RuntimeError(f"Pak'nSave trolley said {r['status']}")
        return _pns_cart_summary(r["data"])
    return await pns_session(go)


async def pns_add(items: list) -> dict:
    """Put list items in the Pak'nSave trolley: [{ref, sku, qty, sale_type}] (qty in units, or kg for WEIGHT).
    Sets each line to that quantity, at the chosen Pak'nSave store."""
    store = _fs_store("pns")

    async def go(page):
        cur = (await _pns_calls(page, [{"url": FS_API + "/cart"}]))["out"][0]
        cst = ((cur.get("data") or {}).get("store") or {}) if isinstance(cur.get("data"), dict) else {}
        if (cst.get("storeId") or cst.get("id")) not in (None, store):
            r = (await _pns_calls(page, [{"url": FS_API + f"/cart/store/{store}", "method": "POST", "body": {}}]))["out"][0]
            log("pns cart store", r["status"], json.dumps(r["data"])[:400])
        prods = []
        for it in items:
            weight = it.get("sale_type") == "WEIGHT"
            q = float(it.get("qty") or 1)
            prods.append({"productId": it["sku"], "quantity": int(round(q * 1000)) if weight else int(round(q)),
                          "sale_type": "WEIGHT" if weight else "UNITS"})
        r = (await _pns_calls(page, [{"url": FS_API + "/cart", "method": "POST", "body": {"products": prods, "allowSubstitutions": True}}]))["out"][0]
        log("pns add", r["status"], json.dumps(r["data"], ensure_ascii=False)[:2500])
        if r["status"] != 200:
            msg = r["data"].get("message") if isinstance(r["data"], dict) else str(r["data"])[:200]
            return {"added": [], "failed": [{"ref": it.get("ref"), "error": msg or f"Pak'nSave said {r['status']}"} for it in items]}
        have = {p.get("productId") for p in (r["data"] or {}).get("products") or []} if isinstance(r["data"], dict) else set()
        return {"added": [it.get("ref") for it in items if it["sku"] in have],
                "failed": [{"ref": it.get("ref"), "error": "Not in the trolley afterwards"} for it in items if it["sku"] not in have],
                "cart": _pns_cart_summary(r["data"])}
    return await pns_session(go)


async def pns_login() -> dict:
    async def go(page):
        return {"signed_in": True}
    return await pns_session(go)


PEEK_JS = """async ([url, method, headers, body, tokenFrom]) => {
  const h = Object.assign({"accept": "application/json", "content-type": "application/json"}, headers || {});
  if (tokenFrom) {  // a fresh anonymous token from the site's own endpoint, sent as a Bearer token
    const t = await (await fetch(tokenFrom, {method: "POST", credentials: "include", headers: {"content-type": "application/json"}, body: "{}"})).json();
    if (t && t.access_token) h["authorization"] = "Bearer " + t.access_token;
  }
  const r = await fetch(url, {method: method || "GET", credentials: "include", headers: h, body: body ? JSON.stringify(body) : undefined});
  return {status: r.status, text: (await r.text()).slice(0, 12000)};
}"""


async def peek(site: str, url: str, method: str, headers: dict, body, token_from: str) -> dict:
    """For working out another shop's API: open its site, make one request from the page (as the site would) and
    log the answer. Only GET, or POST to search/list endpoints, so nothing on an account changes."""
    if method.upper() not in ("GET", "POST") or (method.upper() == "POST" and not re.search(r"search|product|store|list|get", url, re.I)):
        raise ValueError("peek only reads")
    bs = BrowserSession(headless=True)
    async with bs as page:
        await page.goto(site)
        await page.wait_for_timeout(4000)
        res = await page.evaluate(PEEK_JS, [url, method.upper(), headers or {}, body, token_from])
    txt = res.get("text") or ""
    for i in range(0, len(txt), 2500):
        log("peek", res.get("status"), i, txt[i:i + 2500])
    return {"status": res.get("status"), "size": len(txt)}


async def scan_js(terms: list, url: str = "") -> dict:
    """Search the website's own JavaScript for GraphQL operations (e.g. the slot booking mutation) and log
    each match with some text either side. Read-only: nothing is clicked or sent."""
    bs = BrowserSession(headless=True)
    found = {}
    async with bs as page:
        await page.goto(url or "https://www.woolworths.co.nz")
        await page.wait_for_timeout(6000)
        urls = await page.evaluate("""() => [...new Set([...document.scripts].map(s => s.src)
            .concat(performance.getEntriesByType('resource').map(e => e.name)).filter(u => /\\.js(\\?|$)/.test(u)))]""")
        log("scan_js scripts", len(urls))
        for u in urls:
            try:
                txt = await page.evaluate("async (u) => { const r = await fetch(u); return await r.text(); }", u)
            except Exception:
                continue
            for t in terms:
                for m in re.finditer(t, txt):
                    found[t] = found.get(t, 0) + 1
                    if found[t] <= 12:
                        log("scan_js", t, u.split("/")[-1][:60], txt[max(0, m.start() - 300): m.end() + 900])
    return {"scripts": len(urls), "found": found}


async def capture(key: str) -> dict:
    """Add one remembered product to the trolley through the website's own button and log the API calls it makes,
    so the add-on can make the same call. Logs operation names, request bodies and response codes (no cookies)."""
    m = load_map().get(key.strip().lower()) or {}
    sku = str(m.get("sku") or "")
    if not sku:
        raise ValueError(f"No remembered product for '{key}'")
    bs = BrowserSession(headless=True)
    calls = []

    def on_req(r):
        if "/api/" in r.url and r.method != "GET" and len(calls) < 20:
            calls.append(r)

    async with bs as page:
        await page.goto(f"https://www.woolworths.co.nz/shop/productdetails?stockcode={sku}")
        await page.wait_for_timeout(6000)
        page.on("request", on_req)
        btns = await page.evaluate("""() => [...document.querySelectorAll('button')]
            .filter((b) => { const r = b.getBoundingClientRect(); return r.width > 0 && r.height > 0; })
            .map((b) => (b.innerText || b.getAttribute('aria-label') || '').trim().replace(/\\s+/g, ' ').slice(0, 60))
            .filter((t) => /add|trolley|cart|quantity|increase/i.test(t))""")
        log("capture", sku, "buttons", json.dumps(btns, ensure_ascii=False)[:800])
        loc = page.locator("button", has_text="Add").first
        try:
            await loc.click(timeout=8000)
        except Exception as e:
            log("capture click failed", repr(e)[:300])
        await page.wait_for_timeout(5000)
        out = []
        for r in calls:
            resp = await r.response()
            body = r.post_data or ""
            out.append({"url": r.url.split("?")[0], "op": r.headers.get("wnzx-operation-name"),
                        "status": resp.status if resp else None, "body": body[:1500],
                        "resp": ((await resp.text()) if resp else "")[:500]})
    for c in out:
        log("capture call", json.dumps(c, ensure_ascii=False)[:2600])
    return {"sku": sku, "buttons": btns, "calls": out}


async def handle(session: aiohttp.ClientSession, req: dict):
    op = req.get("op")
    if op == "status":
        return {"status": state["status"], "has_credentials": bool(OPTIONS.get("username")), "last_error": state["last_error"], "matches": len(load_map())}
    if op == "cart_get":
        return load_cart()
    shop = str(req.get("shop") or "woolworths")
    if shop not in SHOPS:
        raise ValueError(f"Unknown shop: {shop}")
    if op == "map_get":
        return load_map(shop)
    if op == "map_set":
        # {"key": "milk", "match": {...}, "shop": "pns"} sets one; "match": null forgets it.
        m = load_map(shop)
        key = str(req.get("key", "")).strip().lower()
        if not key:
            raise ValueError("No item name given")
        if req.get("match") is None:
            m.pop(key, None)
        else:
            m[key] = req["match"]
        save_map(m, shop)
        return {"key": key, "match": m.get(key)}

    if op not in ("login", "search", "cart", "add", "diag", "capture", "capture_page", "cart_set", "slots", "slot_set", "stores", "orders", "scan_js", "query", "peek",
                  "fs_stores", "fs_store_set", "fs_search", "fs_prices", "fs_suggest", "w_prices",
                  "pns_login", "pns_cart", "pns_add"):
        raise ValueError(f"Unknown request: {op}")
    async with lock:
        await set_sensor(session, "working")
        try:
            if op == "diag":
                out = await diag()
            elif op == "capture_page":
                out = await capture_page(str(req.get("url", "")), str(req.get("click", "")), str(req.get("match", "/api/")))
            elif op == "capture":
                out = await capture(str(req.get("key", "")))
            elif op == "peek":
                out = await peek(str(req.get("site") or ""), str(req.get("url") or ""), str(req.get("method") or "GET"),
                                 req.get("headers") or {}, req.get("body"), str(req.get("token_from") or ""))
            elif op in ("fs_stores", "fs_store_set", "fs_search", "fs_prices", "fs_suggest") and shop not in FS:
                raise ValueError("Say which shop: pns or nw")
            elif op == "fs_stores":
                out = await fs_stores(shop, str(req.get("q") or "Hamilton"))
            elif op == "fs_store_set":
                out = fs_store_set(shop, req.get("store") or {})
            elif op == "fs_search":
                out = await fs_search(shop, str(req.get("q", "")), int(req.get("limit", 20)), str(req.get("store") or ""))
            elif op == "fs_prices":
                out = await fs_prices(shop)
            elif op == "pns_login":
                out = await pns_login()
            elif op == "pns_cart":
                out = await pns_cart()
            elif op == "pns_add":
                out = await pns_add(req.get("items", []) or [])
            elif op == "w_prices":
                out = await w_prices()
            elif op == "fs_suggest":
                out = await fs_suggest(shop, req.get("items") or [])
            elif op == "query":
                out = await query(str(req.get("q", "")), req.get("variables") or {})
            elif op == "slots":
                out = await slots("pickup" if req.get("method") == "pickup" else "delivery", req.get("store"))
            elif op == "orders":
                out = {"orders": await orders()}
            elif op == "stores":
                out = await stores(str(req.get("q") or "Hamilton"))
            elif op == "slot_set":
                out = await slot_set(str(req.get("slot") or ""))
            elif op == "scan_js":
                out = await scan_js([str(t) for t in (req.get("terms") or [])][:6], str(req.get("url") or ""))
            elif op == "login":
                bs = BrowserSession(headless=True)
                async with bs as page:
                    await bs.ensure_logged_in(page)
                    await page.goto("https://www.woolworths.co.nz")
                    await page.wait_for_timeout(2000)
                out = {"signed_in": True}
            elif op == "search":
                out = await client.search(str(req.get("q", "")), int(req.get("limit", 12)))
            elif op == "cart":
                bs = BrowserSession(headless=True)
                async with bs as page:
                    out = await read_cart(page)
            elif op == "cart_set":
                out = await cart_set(req.get("changes", []) or [])
            elif op == "add":
                # {"items": [{"sku", "qty", "unit": "Each" | "Kilogram", "name", "ref"}]}
                out = await add_items(req.get("items", []) or [])
            else:
                raise ValueError(f"Unknown request: {op}")
            await set_sensor(session, "ready")
            return out
        except Exception as e:
            msg = friendly(e)
            await set_sensor(session, "signed_out" if "signed in" in msg.lower() or "AuthError" in repr(e) else "error", msg)
            raise RuntimeError(msg) from e


async def main():
    if not TOKEN:
        log("No SUPERVISOR_TOKEN: is homeassistant_api enabled?")
    async with aiohttp.ClientSession() as session:
        await set_sensor(session, "ready" if OPTIONS.get("username") else "signed_out",
                         "" if OPTIONS.get("username") else "Add your Woolworths email and password in the Configuration tab.")
        while True:
            try:
                async with session.ws_connect(WS_URL, heartbeat=30) as ws:
                    await ws.receive_json()  # auth_required
                    await ws.send_json({"type": "auth", "access_token": TOKEN})
                    auth = await ws.receive_json()
                    if auth.get("type") != "auth_ok":
                        raise RuntimeError(f"Home Assistant refused the add-on: {auth}")
                    await ws.send_json({"id": 1, "type": "subscribe_events", "event_type": "woolies_request"})
                    log("Listening for woolies_request events")
                    await set_sensor(session, state["status"] if state["status"] != "starting" else "ready")
                    next_id = [2]

                    async def reply(rid, payload):
                        next_id[0] += 1
                        await ws.send_json({"id": next_id[0], "type": "fire_event", "event_type": "woolies_result",
                                            "event_data": dict(payload, id=rid)})

                    async def run(req):
                        rid = req.get("id")
                        # From script.woolies_request (non-admins, PIN checked there): the request sits under "req",
                        # and the script only starts listening for the answer after it fires, so don't answer instantly.
                        relayed = isinstance(req.get("req"), dict)
                        if relayed:
                            req = {**req["req"], "id": rid, "op": req.get("op")}
                        log("request", req.get("op"), rid)
                        try:
                            data = await handle(session, req)
                            if relayed:
                                await asyncio.sleep(0.3)
                            await reply(rid, {"ok": True, "data": data})
                        except Exception as e:
                            log("failed", req.get("op"), e)
                            if relayed:
                                await asyncio.sleep(0.3)
                            await reply(rid, {"ok": False, "error": str(e)})

                    async for msg in ws:
                        if msg.type != aiohttp.WSMsgType.TEXT:
                            continue
                        m = json.loads(msg.data)
                        if m.get("type") == "event" and m.get("event", {}).get("event_type") == "woolies_request":
                            asyncio.create_task(run(m["event"].get("data") or {}))
            except Exception as e:
                log("connection lost, retrying in 10 s:", e)
            await asyncio.sleep(10)


if __name__ == "__main__":
    asyncio.run(main())
