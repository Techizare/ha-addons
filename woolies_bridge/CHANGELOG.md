# Changelog

## 0.1.2
- Trolley adds now run inside the signed-in browser, the way the website does them. Woolworths refused them from the plain HTTP client, and 0.1.0/0.1.1 then signed in again for every item (about a minute each).
- Each failed item is written to the log with Woolworths' answer.

## 0.1.1
- Answers requests relayed by `script.woolies_request`, so household members without an admin login can use the trolley after entering their PIN.

## 0.1.0
- First version: search, add to trolley, trolley summary and product matches, driven by the meal planner card through Home Assistant events.
