# Woolies Bridge

Fills your Woolworths NZ online trolley from the Home Assistant shopping list. It is used by the
meal planner card's **🛒 Trolley** button.

**Unofficial.** Woolworths has no public API. This add-on uses
[woolies-nz-cli](https://github.com/mcinteerj/woolies-nz-cli), which signs in as you and uses the
website's own endpoints. Woolworths' terms do not allow automated tools, so they could block the
account, and a change to their site can stop it working until the tool is updated.

## Setup

1. Install this add-on and open its **Configuration** tab.
2. Enter your Woolworths email and password, then save.
3. Start the add-on. The first start downloads a browser, which takes a few minutes.
4. Check the **Log** tab shows `Listening for woolies_request events`.

`sensor.woolies_bridge` then appears. While it exists, the shopping list shows a 🛒 Trolley button
to everyone. Admins use it straight away; other logins enter a household PIN first (needs
`script.woolies_request`, see below).

## How it works

- The card asks for things by firing a `woolies_request` event, and the add-on answers with a
  `woolies_result` event. Only admins can fire and listen to these events, so for other logins the card
  calls `script.woolies_request` instead. That script checks a household PIN (`input_text.pin_<name>`),
  fires the event for them, waits for the answer and returns it as the script's response.
- The browser is used only to sign in, or to sign in again when the session expires (every few
  weeks). Searches and trolley changes are quick web requests.
- Your email, password, sign-in cookies and the products you picked for each list item stay in
  this add-on's storage on your Home Assistant box. Nothing is sent anywhere except woolworths.co.nz.
- It adds items to the trolley only. You book the time slot and check out in the Woolworths app.

## Sensor states

| State | Meaning |
|---|---|
| `ready` | Signed in and working |
| `working` | Busy with a request |
| `signed_out` | Missing or rejected email and password |
| `error` | The last request failed. See the `last_error` attribute and the add-on log |
