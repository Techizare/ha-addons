# Changelog

## 0.2.7
- `orders`: placed orders that haven't arrived yet (number, delivery or pickup, time, store, total), kept on the sensor as `orders` so Home Assistant can put them on the Calendar.

## 0.2.6
- Click & collect: `slots` with `method: pickup` lists pickup times at the chosen store (remembered; Claudelands to start), one per time, preferring to-the-boot. `stores` searches Woolworths stores by name.
- The trolley snapshot's `slot_info` also carries the kind and store.

## 0.2.5
- `query`: runs one read-only GraphQL query (mutations refused) and logs the answer, for working out the site's API.

## 0.2.4
- `slot_set`: books a delivery slot on the trolley (the website's own SetCartFulfilment call); an empty slot lets it go.
- `slots` lists delivery slots only. The trolley snapshot gains `slot_info` (id, method, start, end).

## 0.2.3
- `slots`: the delivery and pickup slots Woolworths offers for the account's saved address (the website's own Propositions query).
- `scan_js`: searches the website's JavaScript for named GraphQL operations, for working out the slot booking call.

## 0.2.2
- `diag` also logs whether the site allows being shown inside another page (X-Frame-Options / frame-ancestors).

## 0.2.1
- Trolley lines use the product's proper name (and picture, when the site gives one).

## 0.2.0
- Reads the trolley with the website's own CustomerCart query (`cart`), changes or removes lines (`cart_set`), and keeps a saved copy (`cart_get`, and the sensor's `cart` attribute) for the meal planner's trolley card. Every fill also refreshes the saved copy.

## 0.1.8
- `capture_page` request for working out how the site reads the trolley; kilo items try SKU-KG first.

## 0.1.7
- Trolley adds use the website's current GraphQL call (SetCartLineItemQuantity). The old REST trolley API now answers 401, which is why every add was refused.

## 0.1.6
- Fix: 0.1.5 shipped without the capture code.

## 0.1.5
- `capture` request: adds one remembered product with the website's own button and logs the API call it makes (Woolworths moved to a GraphQL API).

## 0.1.4
- `diag` also lists the headers the website itself sends on its API calls (names only) and all cookie names.

## 0.1.3
- New `diag` request: logs what the headless browser sees on the Woolworths home page (sign-in links, cookie names, page text), to work out sign-in problems.

## 0.1.2
- Trolley adds now run inside the signed-in browser, the way the website does them. Woolworths refused them from the plain HTTP client, and 0.1.0/0.1.1 then signed in again for every item (about a minute each).
- Each failed item is written to the log with Woolworths' answer.

## 0.1.1
- Answers requests relayed by `script.woolies_request`, so household members without an admin login can use the trolley after entering their PIN.

## 0.1.0
- First version: search, add to trolley, trolley summary and product matches, driven by the meal planner card through Home Assistant events.
