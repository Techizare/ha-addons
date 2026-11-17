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


def load_map() -> dict:
    try:
        return json.loads(MAP_FILE.read_text())
    except Exception:
        return {}


def save_map(m: dict) -> None:
    tmp = MAP_FILE.with_suffix(".tmp")
    tmp.write_text(json.dumps(m, indent=1, ensure_ascii=False))
    tmp.replace(MAP_FILE)


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
    if op == "map_get":
        return load_map()
    if op == "map_set":
        # {"key": "milk", "match": {...}} sets one; "match": null forgets it.
        m = load_map()
        key = str(req.get("key", "")).strip().lower()
        if not key:
            raise ValueError("No item name given")
        if req.get("match") is None:
            m.pop(key, None)
        else:
            m[key] = req["match"]
        save_map(m)
        return {"key": key, "match": m.get(key)}

    if op not in ("login", "search", "cart", "add", "diag", "capture", "capture_page", "cart_set", "slots", "slot_set", "stores", "orders", "scan_js", "query", "peek"):
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
