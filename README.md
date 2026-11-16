# Techizare Home Assistant add-ons

Add this repository in Home Assistant: **Settings → Add-ons → Add-on store → ⋮ → Repositories**, paste
`https://github.com/Techizare/ha-addons`, then install the add-on below.

| Add-on | What it does |
|---|---|
| [Woolies Bridge](woolies_bridge/) | Fills your Woolworths NZ online trolley from the Home Assistant shopping list (used by the meal planner's 🛒 Fill trolley button). Unofficial. |

## Meal Planner Card (HACS)

This repository is also a HACS **Dashboard** repository for the meal planner and shopping list cards
(source in [meal-planner-card/](meal-planner-card/), built file in `dist/`).

In HACS: **⋮ → Custom repositories**, add `https://github.com/Techizare/ha-addons` with type **Dashboard**,
then download **Meal Planner Card**. HACS adds the dashboard resource
`/hacsfiles/ha-addons/meal-planner-card.js` and offers each new commit on `main` as an update.
