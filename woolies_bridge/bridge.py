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


def summarise_cart(cart: dict) -> dict:
    lines = []
    for cat in cart.get("items", []) or []:
        for p in cat.get("products", []) or []:
            q = p.get("quantity", {}) or {}
            lines.append({
                "sku": str(p.get("sku", "")),
                "name": p.get("name", ""),
                "qty": q.get("quantityInOrder") or q.get("value"),
                "unit": p.get("unit", ""),
            })
    totals = cart.get("subtotal") or cart.get("totals") or {}
    return {"count": len(lines), "lines": lines, "totals": totals}


# Trolley adds run inside the signed-in browser page, the way the website itself does them. Woolworths refuses
# the same POST from the plain HTTP client (0.1.0 then re-signed in for every item, about a minute each).
ADD_JS = """async ([sku, qty, unit]) => {
  const m = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]+)/);
  const h = {"content-type": "application/json", "accept": "application/json, text/plain, */*",
             "x-requested-with": "OnlineShopping.WebApp"};
  if (m) h["x-xsrf-token"] = decodeURIComponent(m[1]);
  const r = await fetch("/api/v1/trolleys/my/items", {method: "POST", credentials: "include", headers: h,
    body: JSON.stringify({sku: sku, quantity: String(qty), pricingUnit: unit})});
  let t = ""; try { t = await r.text(); } catch (e) {}
  return {status: r.status, xsrf: !!m, text: t.slice(0, 400)};
}"""


def add_error(res: dict) -> str:
    st, txt = res.get("status"), res.get("text") or ""
    try:
        msg = json.loads(txt).get("message") or ""
    except Exception:
        msg = ""
    if st in (401, 403):
        return f"Woolworths refused the add ({st}). The Woolies Bridge log has the details."
    return msg or f"Woolworths error {st}: {txt[:120]}"


async def add_items(items: list) -> dict:
    done, failed = [], []
    if not items:
        return {"added": done, "failed": failed}
    bs = BrowserSession(headless=True)
    async with bs as page:
        await bs.ensure_logged_in(page)
        await page.wait_for_timeout(1500)
        relogged = False
        for it in items:
            ref = it.get("ref") or it.get("sku")
            unit = "Kg" if (it.get("unit") or "Each") in ("Kilogram", "Kg") else "Each"
            qty = float(it.get("qty") or 1)
            if unit == "Each":
                qty = max(1, round(qty))
            try:
                res = await page.evaluate(ADD_JS, [str(it["sku"]), qty, unit])
                if res.get("status") in (401, 403) and not relogged:
                    log("add refused", res.get("status"), "xsrf" if res.get("xsrf") else "no xsrf", "- signing in again")
                    relogged = True
                    await bs.login(page)
                    await page.goto("https://www.woolworths.co.nz")
                    await page.wait_for_timeout(2500)
                    res = await page.evaluate(ADD_JS, [str(it["sku"]), qty, unit])
                if 200 <= (res.get("status") or 0) < 300:
                    done.append(ref)
                else:
                    err = add_error(res)
                    log("add failed", it.get("name", ""), res.get("status"), (res.get("text") or "")[:200])
                    failed.append({"ref": ref, "name": it.get("name", ""), "error": err})
            except Exception as e:  # one product shouldn't stop the rest
                log("add failed", it.get("name", ""), repr(e)[:200])
                failed.append({"ref": ref, "name": it.get("name", ""), "error": friendly(e)})
            await asyncio.sleep(0.4)  # gentle on their servers
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
        await page.goto("https://www.woolworths.co.nz")
        await page.wait_for_timeout(6000)
        d = await page.evaluate(DIAG_JS)
        d["all_cookies"] = sorted({c["name"] for c in await page.context.cookies()})
        d["api"] = seen
    for k in ("url", "title", "links", "cookies", "all_cookies", "api"):
        log("diag", k, json.dumps(d.get(k), ensure_ascii=False)[:1500])
    return d


async def handle(session: aiohttp.ClientSession, req: dict):
    op = req.get("op")
    if op == "status":
        return {"status": state["status"], "has_credentials": bool(OPTIONS.get("username")), "last_error": state["last_error"], "matches": len(load_map())}
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

    if op not in ("login", "search", "cart", "add", "diag", "capture"):
        raise ValueError(f"Unknown request: {op}")
    async with lock:
        await set_sensor(session, "working")
        try:
            if op == "diag":
                out = await diag()
            elif op == "capture":
                out = await capture(str(req.get("key", "")))
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
                out = summarise_cart(await client.get_cart())
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
