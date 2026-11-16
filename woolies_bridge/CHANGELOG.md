# Changelog

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
