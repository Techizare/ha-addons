/* meal-planner-card + shopping-list-card  (v1.1, 30 October): the Meals page
 *
 * v1.1: tapping a planned night opens that night, with Remove on each meal,
 * so a meal can be taken off any day, past ones included. The meal sheet
 * keeps its Open button.
 *
 * v1.2: meal ideas can be dragged onto a night in the week strip. With a
 * mouse, press and move; on a touchscreen, hold for a moment, then drag, so
 * an ordinary swipe still scrolls the page. A tap still opens the meal.
 *
 * v1.3: the quick-add chips on the shopping list are editable. They live in
 * a third Local To-do list, todo.staples, one item per chip, so they can be
 * changed from the card (✎ at the end of the row) or the HA app. Without that
 * list the card falls back to quick_add from the config.
 *
 * v1.4: a Send button on the shopping list writes the open items out as plain
 * text in aisle order, to share (phone share sheet) or copy (the panel), for
 * pasting into a supermarket app, a message or notes.
 *
 * v1.5: a much bigger choice of meal pictures, plus a box to type or paste
 * any emoji at all.
 *
 * v1.6: a tap outside the meal or item editor no longer closes it once you have
 * changed something, and unsaved meal edits are kept in this browser until
 * Save or Cancel, so they come back if the editor closes another way. Meals
 * with no ingredients offer built-in suggested ingredients to check and tweak.
 *
 * v1.7: no double-ups on the shopping list. Planning reads the list fresh and
 * one meal at a time, and the shopping card merges any two open lines for the
 * same thing (however they got there) into one, keeping both meals' amounts.
 * Pantry-aisle ingredients and ⭐ staples are no longer added when a meal is
 * planned. The shopping list shows them under "Check the pantry": tick what is
 * in the cupboard (remembered on that screen), or ＋ List to add what isn't.
 *
 * v1.8: tap the Meal ideas heading to fold the library away or bring it back
 * (remembered on each screen).
 *
 * v1.9: under the shopping list's count, a row of nights shows which planned
 * dinners the list is buying for. Tap a night to see only its items; a night
 * that has been and gone is marked ⌛ and can be taken off the list.
 *
 * v1.10: tap as many nights as you like (say Tonight to Sunday) to shop for
 * just those; tap a night again to drop it from the selection. Nights come
 * from the meal plan too, so a planned meal whose ingredients aren't on the
 * list yet (planned before its ingredients were typed in) shows with a ＋ and
 * an Add button. Saving a planned meal's ingredients now updates the list.
 *
 * v1.11: the ticked nights decide what the list adds up to: quantities count
 * only those nights (plus anything added by hand), and Send and Check the
 * pantry follow them. The choice is remembered on each screen. The quick-add
 * row and the nights row fade at the edge, with a › nudge, when they scroll.
 *
 * v1.12: the list works by shops. "Next shop" runs from the first night the
 * last shop didn't cover to an end night you tap (tap the first night to
 * trim it, tap outside to stretch). "Done shopping" (also in Send) clears the
 * ticked items and records the range as the last shop; anything not ticked
 * stays. Open items for nights the last shop covered come back as top-ups.
 * The shop lives in input_text.meals_shop (JSON), so every screen agrees.
 *
 * v1.26: the week's day tiles show each meal's health pill, and the week
 * heading shows the average rating of the meals planned that week. Changing an
 * ingredient's aisle in the editor now also moves it in every other meal that
 * uses it and on the shopping list (lines kept the aisle they were made with).
 *
 * v1.25: 🩺 health rating and macro ring. Each meal with ingredients gets a
 * holistic 1-10 rating worked out from its ingredient list (processed meat,
 * red meat, veg and fruit, plant variety, fibre, beans, whole grains, oily
 * fish, fried or ultra-processed items, rich dairy, added sugar, a very big
 * serve), shown on the idea tiles and, with the reason for every point, in the
 * meal sheet. "Rate it myself" stores your own number as "health: N" in the
 * header; it wins until "Use the estimate". The sheet also shows a ring of the
 * protein / carbs / fat split by calories and the kcal a serve. All of it is an
 * estimate from a built-in table of typical values (NUT), said so on screen.
 * Fix: the ingredient Aisle box was hidden on phones; it now sits on a second
 * line under each ingredient.
 *
 * v1.24: ✨ Fill my week. A button by the week drafts dinners for the shown
 * week's empty nights (today on): nothing had or planned the week before or
 * already this week, quick meals on nights Cherisha's work calendar says she is
 * working in the evening, meals with ❄️ ingredients only on nights the 06:00
 * defrost reminder can still catch, least recently had first. Each night can be
 * swapped, chosen from a list or left empty before "Plan N nights" plans them
 * (shopping list and all, as if planned by hand). Options: busy_calendars
 * (default [calendar.cherisha_work]), busy_label, busy_from / busy_to (evening
 * window, default 16:00 to 19:30), quick_mins (default 30, or a Quick/Fast/Easy
 * tag), defrost_time (default 06:00).
 *
 * v1.14: an ingredient can be marked ❄️ (needs defrosting; line prefix "❄ ",
 * after any * or !). The planner shows "Take out of the freezer" on the morning
 * of a planned night, with ❄️ on that night's tile; an HA automation also sends
 * a phone reminder. A meal sheet's ✓ now means this meal's own share, so it can
 * be unticked even when another meal has the same thing on the list.
 * v1.20: Spices and Condiments aisles. Like Pantry, their ingredients count as
 * cupboard stock and show under Check the pantry rather than going on the list.
 *
 * v1.19: typing an ingredient name in Edit suggests the ones already used in
 * other meals (and on the list), picks up their aisle, and on Save "butter" takes
 * the spelling the other meals use ("Butter"), so the list doesn't double up.
 *
 * v1.18: unticking an item in Check the pantry works again when it was ticked
 * by a "we have it" line (✕ on the list): unticking now clears that line too.
 *
 * v1.17: servings. A meal's "Serves" is what its ingredient amounts are for. Any
 * planned night can be set to more or fewer people (the stepper on that night's
 * sheet); its share of the shopping list, the pantry check and the defrost
 * reminder scale to match, and the night's tile shows 👥 and the count. Stored
 * per night in the meal header as "servings: 2026-11-04=6" (planned nights only).
 * v1.13: any list or pantry item can be switched between "⭐ Pantry staple"
 * (check the cupboard) and "Always on the list". The switch changes that
 * ingredient in every meal that uses it. An ingredient line starting "! "
 * is never a staple, even in the Pantry aisle.
 *
 * Two cards in one module, meant to sit side by side on the 24" panel and
 * stack on a phone:
 *
 *   custom:meal-planner-card   Tonight, this week's dinners, and the meal
 *                              library (thumbnails, ingredients, edit).
 *   custom:shopping-list-card  the shopping list, grouped by aisle, editable.
 *
 * Planning a meal for a night adds its ingredients to the shopping list, and
 * un-planning it takes them off again (only the share that meal put there,
 * and never anything already ticked). Two meals that both need an onion make
 * one line, "2", with both meals shown on it.
 *
 * Everything is stored in two Local To-do lists, so nothing leaves the house:
 *
 *   todo.meals      one item per meal. The description is a header, the
 *                   ingredients, then free notes, separated by "---":
 *
 *                       emoji: 🍝
 *                       img: /local/meals/bolognese.jpg   (optional photo)
 *                       tags: Pasta, Family
 *                       serves: 4
 *                       mins: 40
 *                       plan: 2026-11-02, 2026-11-09      (nights it is planned)
 *                       servings: 2026-11-09=6            (a night cooked for more or fewer)
 *                       cooked: 2026-10-20                (last time it was had)
 *                       ---
 *                       500 g | Beef mince | Meat & Fish
 *                       1 | Brown onion | Produce
 *                       * 2 tbsp | Olive oil | Pantry     (* = pantry staple, not added)
 *                   Pantry-aisle ingredients and * staples are not added when a
 *                   meal is planned; the shopping card lists them under
 *                   "Check the pantry" to tick off or add.
 *                       ---
 *                       Notes, method, where the recipe is.
 *
 *   todo.shopping   one item per thing to buy. Name is the summary; the
 *                   description holds
 *
 *                       qty: 2 L                          (typed by hand)
 *                       aisle: Dairy & Eggs
 *                       for: Butter Chicken@2026-10-29=300 ml; Pizza@2026-10-31=1
 *
 *                   so the HA app on a phone still shows something readable.
 *                   The built-in "Shopping List" integration cannot store a
 *                   description, which is why this wants a Local To-do list.
 *
 * Dates are plain YYYY-MM-DD strings in local time, as on the task list.
 *
 * Config (meal-planner-card):
 *   meals_entity:     todo.meals     (required)
 *   shopping_entity:  todo.shopping  (required for planning to fill the list)
 *   aisles:           optional list of { name, icon, colour }, in shop order
 *   title:            optional heading
 *   busy_calendars, busy_label, busy_from, busy_to, quick_mins, defrost_time:
 *                     Fill my week (see v1.24 above)
 * Config (shopping-list-card):
 *   entity:           todo.shopping  (required)
 *   meals_entity:     todo.meals     (optional: meal emoji on each line)
 *   aisles, title
 *   staples_entity:   todo.staples   (default; the editable quick-add chips)
 *   quick_add:        chips to show when there is no staples list (default Milk, Bread, Eggs ...)
 *   shop_entity:      input_text.meals_shop (default; next and last shop, max 255)
 */

const MP_VERSION = "1.28";
const P2 = (n) => String(n).padStart(2, "0");
const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DOW_LONG = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function today() { const d = new Date(); return d.getFullYear() + "-" + P2(d.getMonth() + 1) + "-" + P2(d.getDate()); }
function parts(iso) { const [y, m, d] = iso.split("-").map(Number); return [y, m, d]; }
function addDays(iso, n) { const [y, m, d] = parts(iso); const t = new Date(Date.UTC(y, m - 1, d + n)); return t.getUTCFullYear() + "-" + P2(t.getUTCMonth() + 1) + "-" + P2(t.getUTCDate()); }
function dowIdx(iso) { const [y, m, d] = parts(iso); return (new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7; }
function weekStart(iso) { return addDays(iso, -dowIdx(iso)); }
function daysBetween(a, b) { const [y1, m1, d1] = parts(a), [y2, m2, d2] = parts(b); return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86400000); }
function dayNum(iso) { return parts(iso)[2]; }
function monShort(iso) { return MON[parts(iso)[1] - 1]; }
const ISO = /^\d{4}-\d{2}-\d{2}$/;
// "Tonight", "Sat" within the coming week, otherwise "4 Nov", so a next-week Wednesday is not mistaken for this one.
function longDay(d) { return DOW[dowIdx(d)] + " " + dayNum(d) + " " + monShort(d); }
function dayWord(d) { const t = today(); const n = daysBetween(t, d); return n === 0 ? "Tonight" : n > 0 && n < 7 ? DOW[dowIdx(d)] : dayNum(d) + " " + monShort(d); }

function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
function hash(s) { let h = 2166136261; for (const c of String(s)) { h ^= c.codePointAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }

const DEFAULT_AISLES = [
  { name: "Produce", icon: "🥬", colour: "#5fb86a" },
  { name: "Meat & Fish", icon: "🥩", colour: "#e5615e" },
  { name: "Dairy & Eggs", icon: "🧀", colour: "#e9b949" },
  { name: "Bakery", icon: "🍞", colour: "#c8915a" },
  { name: "Pantry", icon: "🥫", colour: "#ee8455" },
  { name: "Spices", icon: "🌶️", colour: "#d4663a" },
  { name: "Condiments", icon: "🫙", colour: "#b8913a" },
  { name: "Frozen", icon: "🧊", colour: "#4cb5e6" },
  { name: "Snacks & Drinks", icon: "🧃", colour: "#b07cd1" },
  { name: "Household", icon: "🧻", colour: "#8fa3ad" },
  { name: "Other", icon: "📦", colour: "#a7adb4" },
];

// First match wins, so the more specific words come first.
const GUESS = [
  // Spices and Condiments first: "garlic powder" isn't Produce, "peanut butter" isn't Dairy.
  [/(cumin|paprika|turmeric|garam masala|chill?i (powder|flakes)|cinnamon|nutmeg|oregano|curry powder|cayenne|cardamom|star anise|five spice|mixed herbs|italian herbs|dried herbs|seasoning|spice|\bsalt\b|black pepper|cracked pepper|white pepper|peppercorn|bay lea|sesame seed|mustard seed|fennel seed|garlic powder|onion powder|stock powder|chicken salt)/i, "Spices"],
  [/(tomato sauce|bbq sauce|barbecue sauce|soy sauce|fish sauce|oyster sauce|worcestershire|hoisin|sriracha|sweet chill?i sauce|hot sauce|mayo|mustard|ketchup|relish|chutney|pickle|vinegar|tartare|aioli|dressing|gochujang|kecap|mirin|pesto|salsa|honey|\bjam\b|peanut butter|vegemite|marmite|maple syrup|sesame oil)/i, "Condiments"],
  [/(frozen|ice ?cream|peas|chips|edamame|ice\b)/i, "Frozen"],
  [/(milk|cream|cheese|butter|yog|egg|parmesan|mozzarella|feta|sour cream)/i, "Dairy & Eggs"],
  [/(chicken|beef|mince|lamb|pork|bacon|ham|sausage|salmon|fish|prawn|tarakihi|steak|pepperoni|tuna)/i, "Meat & Fish"],
  [/(bread|bun|roll|naan|wrap|tortilla|pizza base|bagel|croissant|loaf)/i, "Bakery"],
  [/(apple|banana|onion|garlic|carrot|potato|kumara|kūmara|tomato|lettuce|avocado|lemon|lime|pumpkin|capsicum|mushroom|cucumber|ginger|coriander|parsley|spinach|broccoli|berr|grape|orange|kiwi|celery|herb|salad|coleslaw|veg)/i, "Produce"],
  [/(chip|crisp|biscuit|chocolate|lolly|juice|soft drink|coke|beer|wine|coffee|tea\b|snack)/i, "Snacks & Drinks"],
  [/(toilet|paper towel|dishwash|detergent|soap|shampoo|cleaner|bin bag|foil|glad|tissue|nappy|battery|batteries)/i, "Household"],
  [/(rice|pasta|spaghetti|noodle|flour|sugar|oil|sauce|stock|tin|can|jar|passata|spice|salt|pepper|taco|cereal|oat|syrup|honey|vinegar|soy|bean|lentil)/i, "Pantry"],
];
function guessAisle(name) { for (const [re, a] of GUESS) if (re.test(name)) return a; return "Other"; }

// ---------- quantities ----------

const UNIT = { g: "g", gram: "g", grams: "g", kg: "kg", kgs: "kg", ml: "ml", l: "L", litre: "L", litres: "L", liter: "L", liters: "L" };
function parseQty(s) {
  s = String(s || "").trim();
  if (!s) return null;
  s = s.replace(/(\d)?\s*([¼½¾⅓⅔⅛])/g, (x, w, f) => (w || "0") + "+" + FRAC_IN[f]);
  // Whole and fraction first ("1 1/2", "1/2"), so "1/2" never reads as 1 of a unit called "/2".
  const m = s.match(/^(\d+\s*\+\s*\d+\/\d+|\d+\s+\d+\/\d+|\d+\s*\/\s*\d+|\d+(?:[.,]\d+)?)\s*(.*)$/);
  if (!m) return { n: null, u: s };
  let n = m[1].split(/\s*\+\s*|\s+(?=\d+\s*\/)/).reduce((a, x) => a + (x.includes("/") ? x.split("/").map((y) => Number(y.trim())).reduce((p, q) => p / q) : parseFloat(x.replace(",", "."))), 0);
  let u = m[2].trim();
  const k = UNIT[u.toLowerCase()];
  if (k === "kg") { n *= 1000; u = "g"; } else if (k === "L") { n *= 1000; u = "ml"; } else if (k) u = k;
  return { n, u };
}
const FRAC_IN = { "¼": "1/4", "½": "1/2", "¾": "3/4", "⅓": "1/3", "⅔": "2/3", "⅛": "1/8" };
const FRAC_OUT = [[0.25, "¼"], [0.5, "½"], [0.75, "¾"], [1 / 3, "⅓"], [2 / 3, "⅔"], [0.125, "⅛"]];
// 0.5 shows as ½ and 1.5 as 1½; anything else keeps two decimals at most.
function trimNum(n) {
  const w = Math.floor(n + 1e-9), f = n - w, g = FRAC_OUT.find(([v]) => Math.abs(f - v) < 0.01);
  if (g && f > 0.01) return (w ? String(w) : "") + g[1];
  return String(Math.round(n * 100) / 100);
}
function fmtQty(q) {
  if (q.u === "g" && q.n >= 1000) return trimNum(q.n / 1000) + " kg";
  if (q.u === "ml" && q.n >= 1000) return trimNum(q.n / 1000) + " L";
  let u = q.u;
  if (u && q.n > 1 && !/^(g|ml)$/.test(u) && !/s$/.test(u)) u += /(ch|sh|x)$/i.test(u) ? "es" : "s";
  return trimNum(q.n) + (u ? " " + u : "");
}
// "bunches", "bunch" and "Bunch" are one unit; so are "tins" and "tin".
function unitOne(u) { return u.replace(/(ch|sh|x)es$/i, "$1").replace(/s$/i, ""); }
function sumQty(list) {
  const by = new Map(); const loose = [];
  for (const s of list) {
    const q = parseQty(s); if (!q) continue;
    if (q.n == null) { if (!loose.includes(q.u)) loose.push(q.u); continue; }
    const key = unitOne(q.u.toLowerCase());
    const e = by.get(key);
    if (e) e.n += q.n; else by.set(key, { n: q.n, u: unitOne(q.u) || q.u });
  }
  return [...[...by.values()].map(fmtQty), ...loose].join(" + ");
}
// Servings: a meal's ingredients are written for its "serves"; a night can be cooked for more or fewer.
// A meal with no Serves set counts as serving 4, so every meal has a number to step up or down.
const DEFAULT_SERVES = 4;
function servesN(m) { const n = parseFloat(String((m && m.serves) || "").replace(",", ".")); return n > 0 ? n : DEFAULT_SERVES; }
function nightServes(m, d) { return (m.ppl && m.ppl[d]) || servesN(m); }
function factor(m, d) { const b = servesN(m), n = m.ppl && m.ppl[d]; return b && n && n !== b ? n / b : 1; }
// Amounts by unit ("200 g + 1 tin" is { g: 200, tin: 1 }), so a change in head count can be added or taken off a line.
function qtyMap(list) {
  const by = new Map(), loose = [];
  for (const s of list) for (const part of String(s || "").split(/\s+\+\s+/)) {
    const q = parseQty(part); if (!q) continue;
    if (q.n == null) { if (!loose.includes(q.u)) loose.push(q.u); continue; }
    const key = unitOne(q.u.toLowerCase()), e = by.get(key);
    if (e) e.n += q.n; else by.set(key, { n: q.n, u: unitOne(q.u) || q.u });
  }
  return { by, loose };
}
function mapQty(m) { return [...[...m.by.values()].filter((e) => e.n > 1e-6).map(fmtQty), ...m.loose].join(" + "); }
// "500 g" for 6 instead of 4 is "750 g"; an amount with no number ("a handful") stays as it is.
function scaleQty(s, f) {
  if (f === 1 || !s) return s;
  const q = parseQty(s); if (!q || q.n == null) return s;
  // Things bought whole (onions, tins, packs) round up; measured amounts keep their fraction.
  const n = /^(g|ml|tbsp|tsp|tablespoons?|teaspoons?|cups?)$/i.test(q.u) ? q.n * f : Math.ceil(q.n * f - 1e-9);
  return fmtQty({ n, u: q.u });
}
// Assumed to be in the cupboard: held back from the list and shown under Check the pantry instead.
// These aisles count as cupboard stock: their ingredients go under Check the pantry, not on the list.
const PANTRY_AISLES = ["Pantry", "Spices", "Condiments"];
// A meal with no ingredients typed in: planning it puts nothing on the list, so it's flagged.
function noIngs(m) { return !(m.ingredients || []).some((i) => i.name); }
const NOI = "__noi";
function isPantry(i) { return !i.list && (!!i.staple || PANTRY_AISLES.includes(i.aisle)); }
function normName(s) { return shopName(s).toLowerCase().replace(/(es|s)$/, ""); }
// "Tomato (finely diced)" goes on the list as "Tomato": the bracket is how to prep it, not what to buy.
function shopName(s) { return String(s || "").replace(/\s*\([^)]*\)/g, " ").replace(/\s+/g, " ").trim() || String(s || "").trim(); }
// A line kept only to remember "we have it" for some meals: not shown, but it stops the list asking again.
function isGhost(s) { return !s.done && !s.for.length && !s.qty && (s.have || []).length > 0; }
// Every day a meal was had or planned up to today, newest first (had: + plan: + cooked:).
// Tonight's plan only counts once tonight is over (or "We had this" is tapped).
function eaten(m, t) { return [...new Set([...[...(m.had || []), ...m.plan].filter((d) => d < t), m.cooked].filter((d) => d && ISO.test(d) && d <= t))].sort().reverse(); }
function lastHad(m, t) { return eaten(m, t)[0] || ""; }
const POPULAR_DAYS = 90, POPULAR_N = 3;
function popular(m, t) { const lo = addDays(t, -POPULAR_DAYS); return eaten(m, t).filter((d) => d >= lo).length >= POPULAR_N; }

// ---------- health rating and macros (v1.25) ----------
// Everything here is an estimate from the ingredient list: a built-in table of rough values per 100 g
// (protein, carbs, fat, fibre) and typical weights, no internet. First match wins, specific words first.
// Kinds: pm processed meat, rm red meat, wm poultry, fi fish, of oily fish, egg, sat rich dairy/coconut,
// dy milk/yoghurt, wg whole grain, rg refined grain, st potato, leg beans/lentils, veg, fr fruit, nut nuts/seeds,
// oil, sug sugar/sweets, upf ultra-processed, fried, cond sauces, sp spices (no macros), x other.
// Options: e = grams each (or per sheet/piece), k = grams per tin/pack/bag/jar, c = grams per cup, d = grams when no amount is given.
const NUT = [
  [/(nacho|taco|fajita|burrito|enchilada|chilli con carne) (seasoning|spice|mix|kit)|seasoning (mix|sachet)|\bgravy/i, "upf", 6, 55, 3, 2, { k: 35, e: 35, d: 35 }],
  [/(risotto|rice) (box|mix|sachet|packet)|rice risotto|flavoured rice|rice sides|pasta sides/i, "upf", 8, 75, 3, 2, { k: 250, e: 250, d: 250 }],
  [/(chicken|tomato|mushroom|pumpkin|vegetable) soup|condensed|packet soup|soup mix|instant noodle|2 minute|mi goreng|cup noodle/i, "upf", 2, 9, 3, 1, { k: 420, e: 420, d: 420 }],
  [/(butter chicken|tikka|korma|masala|rogan josh|vindaloo|simmer|curry|pasta|stir ?fry|carbonara|alfredo|satay|teriyaki|sweet (and|&) sour) sauce|tikka masala|jar(red)? sauce/i, "upf", 2, 9, 7, 1, { k: 485, e: 485, d: 485 }],
  [/(tender|nugget|crumbed|schnitzel|katsu|battered|popcorn chicken|fish finger|kiev|hash ?brown|potato gem|spring roll|dumpling)/i, "fried", 15, 18, 12, 1, { e: 30, k: 500, d: 500 }],
  [/(corn chips|tortilla chips|doritos|crisps|potato chips|chippies)/i, "fried", 7, 60, 25, 4, { k: 230, e: 230, d: 150 }],
  [/(chips|fries|wedges)/i, "fried", 3, 25, 6, 2.5, { k: 1000, e: 1000, d: 500 }],
  [/pastry/i, "upf", 6, 38, 25, 1.5, { e: 170, k: 1000, d: 340 }],
  [/bacon|pancetta/i, "pm", 15, 1, 25, 0, { e: 25, k: 250, d: 200 }],
  [/salami|pepperoni|chorizo|kabana|cabanossi/i, "pm", 22, 2, 34, 0, { e: 10, k: 100, d: 100 }],
  [/sausage|saveloy|frankfurt|hot ?dog|bratwurst|kransky|banger|cheerio/i, "pm", 13, 5, 20, 0.5, { e: 70, k: 500, d: 500 }],
  [/\bham\b|prosciutto|corned beef|pastrami|luncheon|\bspam\b|deli meat|bresaola/i, "pm", 18, 2, 8, 0, { e: 20, k: 200, d: 150 }],
  [/(stock|broth|bouillon)(?! powder)/i, "cond", 0.5, 0.5, 0.2, 0, { c: 240, k: 1000, e: 250, d: 250 }],
  [/mayo|aioli|kewpie|ranch|caesar dressing/i, "cond", 1, 2, 75, 0, { c: 220, k: 400, d: 40 }],
  [/pesto/i, "cond", 4, 6, 40, 2, { k: 190, e: 190, d: 100, c: 240 }],
  [/coconut (milk|cream)/i, "sat", 2, 3, 20, 0, { k: 400, e: 400, c: 240, d: 200 }],
  [/curry paste|laksa paste|tom yum paste/i, "cond", 2, 12, 10, 2, { e: 15, k: 200, d: 30 }],
  [/soy|fish sauce|squid sauce|oyster|worcestershire|kecap|tamari|miso/i, "cond", 5, 8, 0, 0, { c: 255, d: 15 }],
  [/hoisin|gochujang|bbq|barbecue|tomato sauce|ketchup|relish|chutney|sweet chill?i|plum sauce|chill?i sauce|sriracha|siracha|hot sauce|salsa|tabasco/i, "cond", 2, 35, 1, 1, { c: 280, k: 500, d: 15 }],
  [/mustard/i, "cond", 4, 5, 4, 3, { c: 250, d: 10 }],
  [/vinegar|lemon juice|lime juice/i, "x", 0, 10, 0, 0, { c: 240, d: 5 }],
  [/dark chocolate|chocolate|choc chips|cocoa nib/i, "sug", 7, 50, 35, 7, { c: 170, k: 200, e: 10, d: 100 }],
  [/honey|syrup|treacle|\bjam\b|nutella|caramel/i, "sug", 0.3, 82, 0, 0, { c: 340, d: 20 }],
  [/sugar/i, "sug", 0, 100, 0, 0, { c: 200, d: 20 }],
  [/ice ?cream|custard|lollies|marshmallow|biscuit|cookie/i, "sug", 4, 60, 15, 1, { k: 500, e: 15, d: 100 }],
  [/cranberr|raisin|sultana|dried (apricot|fruit|date|fig)|\bdates\b|currant/i, "fr", 1, 75, 1, 5, { c: 130, k: 250, d: 30 }],
  [/peanut butter|almond butter|tahini/i, "nut", 25, 20, 50, 6, { c: 250, d: 30 }],
  [/peanut|almond|cashew|walnut|pecan|pistachio|hazelnut|macadamia|pine nut|\bnuts?\b/i, "nut", 22, 15, 52, 8, { c: 140, k: 200, d: 30 }],
  [/sesame seed|chia|flax|linseed|pumpkin seed|sunflower seed|pepita|hemp seed|\bseeds?\b/i, "nut", 18, 25, 45, 15, { c: 140, d: 10 }],
  [/brewer'?s yeast|nutritional yeast/i, "x", 48, 36, 1, 30, { c: 128, d: 10 }],
  [/coconut oil|ghee|lard|dripping/i, "sat", 0, 0, 100, 0, { c: 218, d: 10 }],
  [/\boil\b/i, "oil", 0, 0, 100, 0, { c: 218, d: 10 }],
  [/butter(?!milk| bean|nut)/i, "sat", 1, 0, 81, 0, { c: 227, k: 500, e: 10, d: 20 }],
  [/powder|seasoning|spice|\bherbs\b|cumin|paprika|turmeric|tumeric|cinnamon|oregano|nutmeg|garam|cardamom|clove(s)? ground|star anise|chill?i flakes|bay lea|vanilla|essence|baking soda|bicarb|cream of tartar|stock cube|gelatine?|dried (thyme|parsley|basil|rosemary|sage|dill|mint|chill?i|coriander)|ground (coriander|ginger|cloves|allspice|pepper)|coriander seed|mustard seed|fennel seed|saffron|zest/i, "sp", 0, 0, 0, 0, { d: 0 }],
  [/^(black |white |cracked |ground |sea |rock |table )?(salt|pepper(corns)?)$/i, "sp", 0, 0, 0, 0, { d: 0 }],
  [/cream cheese|mascarpone/i, "sat", 6, 4, 34, 0, { k: 250, c: 230, d: 100 }],
  [/sour cream|creme fraiche|crème fraîche/i, "sat", 3, 4, 20, 0, { k: 250, e: 250, c: 240, d: 100 }],
  [/cream/i, "sat", 2, 3, 35, 0, { c: 240, k: 300, e: 300, d: 150 }],
  [/parmesan|parmigiano|pecorino|grana/i, "sat", 35, 3, 28, 0, { c: 90, k: 200, d: 30 }],
  [/feta|halloumi|haloumi|paneer|goat'?s cheese|ricotta/i, "sat", 15, 2, 21, 0, { k: 200, e: 200, c: 150, d: 100 }],
  [/cheese|cheddar|mozzarella|edam|colby|tasty|gouda|brie|camembert/i, "sat", 25, 1, 33, 0, { c: 100, k: 500, e: 20, d: 100 }],
  [/yog(h)?urt|kefir/i, "dy", 4, 12, 3, 0, { c: 245, k: 150, e: 150, d: 150 }],
  [/milk|buttermilk/i, "dy", 3.4, 5, 3.5, 0, { c: 245, k: 1000, d: 250 }],
  [/egg yolk|yolk/i, "egg", 16, 1, 27, 0, { e: 18, d: 18 }],
  [/\beggs?\b(?! ?noodle)/i, "egg", 12.5, 1, 10, 0, { e: 55, k: 660, d: 110 }],
  [/chicken.*breast|breast/i, "wm", 23, 0, 2, 0, { e: 220, k: 500, d: 500 }],
  [/chicken.*(thigh|drum|wing|leg|maryland)|thigh|drum/i, "wm", 18, 0, 9, 0, { e: 120, k: 1000, d: 500 }],
  [/chicken|turkey|duck/i, "wm", 20, 0, 7, 0, { e: 200, k: 500, d: 500 }],
  [/salmon|sardine|mackerel|trout|kahawai|anchov|herring|eel\b/i, "of", 20, 0, 13, 0, { e: 150, k: 400, d: 150 }],
  [/tuna/i, "fi", 25, 0, 1, 0, { e: 185, k: 185, d: 185 }],
  [/fish|tarakihi|terakihi|snapper|hoki|\bcod\b|gurnard|hake|basa|tilapia|kingfish|blue warehou|prawn|shrimp|squid|calamari|mussel|scallop|crab|lobster|crayfish|oyster/i, "fi", 18, 0, 1.5, 0, { e: 150, k: 500, d: 400 }],
  [/steak|sirloin|scotch fillet|rump|ribeye|eye fillet/i, "rm", 21, 0, 8, 0, { e: 250, d: 500 }],
  [/shank/i, "rm", 18, 0, 12, 0, { e: 300, d: 1200 }],
  [/mince|beef|lamb|pork|veal|venison|mutton|goat|meatball|\bribs?\b|brisket|\bchops?\b/i, "rm", 19, 0, 15, 0, { e: 200, k: 500, d: 500 }],
  [/tofu|tempeh/i, "leg", 12, 2, 7, 1, { k: 300, e: 300, d: 300 }],
  [/kidney bean|black bean|chickpea|garbanzo|lentil|cannellini|butter bean|borlotti|baked bean|pinto|refried|four bean|mixed bean|split pea|hummus|houmous|edamame|haricot/i, "leg", 8, 16, 0.6, 7, { k: 400, e: 400, c: 180, d: 400 }],
  [/rolled oats|\boats\b|porridge|oatmeal/i, "wg", 13, 60, 7, 10, { c: 90, k: 750, d: 200 }],
  [/wholemeal|whole ?wheat|wholegrain|whole grain|brown rice|quinoa|barley|bulgur|bulgar|freekeh|\brye\b|buckwheat|spelt|wild rice/i, "wg", 12, 66, 3, 8, { c: 180, k: 500, e: 40, d: 300 }],
  [/rice noodle|pad thai|vermicelli|rice stick/i, "rg", 6, 80, 1, 1.5, { k: 200, e: 200, d: 250 }],
  [/noodle|hokkien|udon|ramen|soba/i, "rg", 12, 70, 3, 3, { k: 450, e: 450, d: 250 }],
  [/tortellini|ravioli|filled pasta/i, "rg", 11, 45, 8, 2, { k: 375, e: 375, d: 375 }],
  [/gnocchi/i, "rg", 3, 33, 0.5, 2, { k: 500, e: 500, d: 500 }],
  [/pasta|spaghetti|penne|macaroni|fusilli|spiral|lasagne|lasagna|orzo|linguine|fettuccine|tagliatelle|rigatoni|farfalle|seashell|\bshells\b|risoni/i, "rg", 13, 72, 1.5, 3, { c: 100, k: 500, e: 20, d: 400 }],
  [/cous ?cous/i, "rg", 13, 72, 1, 5, { c: 175, k: 500, d: 250 }],
  [/rice/i, "rg", 7, 79, 0.6, 1, { c: 185, k: 1000, e: 75, d: 300 }],
  [/panko|breadcrumb|bread crumb/i, "rg", 12, 72, 4, 4, { c: 60, k: 200, d: 60 }],
  [/flour|cornflour|cornstarch/i, "rg", 10, 76, 1, 3, { c: 125, k: 1000, d: 50 }],
  [/bread|\broll|\bbuns?\b|naan|\bwraps?\b|tortilla|pita|bagel|croissant|loaf|baguette|focaccia|crumpet|muffin/i, "rg", 9, 49, 3, 3, { e: 40, k: 400, c: 50, d: 300 }],
  [/kumara|kūmara|sweet potato|yam/i, "veg", 1.6, 20, 0.1, 3, { e: 250, k: 1000, c: 200, d: 500 }],
  [/potato|mash/i, "st", 2, 17, 0.1, 2, { e: 170, k: 2000, c: 210, d: 600 }],
  [/spring onion|scallion|green onion/i, "veg", 1.8, 7, 0.2, 2.6, { e: 15, k: 100, c: 100, d: 30 }],
  [/garlic/i, "veg", 6, 33, 0.5, 2, { e: 5, k: 40, c: 136, d: 5 }],
  [/ginger|lemongrass|galangal/i, "veg", 1.8, 18, 0.8, 2, { e: 20, k: 50, c: 96, d: 10 }],
  [/chill?i|jalape/i, "veg", 2, 9, 0.4, 1.5, { e: 10, k: 100, d: 10 }],
  [/avocado|guacamole/i, "veg", 2, 2, 15, 7, { e: 150, k: 400, c: 150, d: 150 }],
  [/sun-? ?dried tomato/i, "veg", 5, 25, 14, 6, { e: 6, k: 280, c: 110, d: 60 }],
  [/tomato (paste|puree|purée)/i, "veg", 4, 19, 0.5, 4, { c: 260, k: 140, d: 30 }],
  [/chopped tomato|diced tomato|crushed tomato|tinned tomato|canned tomato|passata|tomatoes in|tomato pasta/i, "veg", 1, 4, 0.2, 1, { k: 400, e: 400, c: 240, d: 400 }],
  [/(sweet ?)?corn|maize/i, "veg", 3, 19, 1.5, 2, { c: 150, k: 400, e: 200, d: 200 }],
  [/\bpeas\b|snow pea|sugar snap|mange/i, "veg", 5, 14, 0.4, 5, { c: 145, k: 500, d: 150 }],
  [/onion|shallot|leek/i, "veg", 1.1, 9, 0.1, 1.7, { e: 150, k: 1000, c: 160, d: 150 }],
  [/carrot/i, "veg", 0.9, 10, 0.2, 2.8, { e: 100, k: 1000, c: 130, d: 100 }],
  [/capsicum|bell pepper|red pepper|green pepper|pepper (red|green|yellow)/i, "veg", 1, 6, 0.3, 2, { e: 160, k: 450, c: 150, d: 160 }],
  [/courgette|zucchini|squash|marrow/i, "veg", 1.2, 3, 0.3, 1, { e: 200, k: 500, c: 125, d: 200 }],
  [/pumpkin|butternut/i, "veg", 1, 7, 0.1, 1.5, { e: 1200, k: 1000, c: 140, d: 500 }],
  [/broccoli|cauli|brussels|cabbage|bok choy|pak choi|kale|silverbeet|chard/i, "veg", 2.8, 6, 0.4, 2.6, { e: 350, k: 300, c: 90, d: 300 }],
  [/spinach|lettuce|rocket|salad|greens|slaw|watercress|mesclun|cos\b/i, "veg", 2, 4, 0.4, 2.2, { e: 300, k: 150, c: 30, d: 120 }],
  [/mushroom/i, "veg", 3, 3, 0.3, 1, { e: 20, k: 200, c: 70, d: 200 }],
  [/celery/i, "veg", 0.7, 3, 0.2, 1.6, { e: 40, k: 500, c: 100, d: 40 }],
  [/cucumber|radish|fennel/i, "veg", 0.7, 3.6, 0.1, 0.6, { e: 300, k: 500, c: 120, d: 150 }],
  [/eggplant|aubergine/i, "veg", 1, 6, 0.2, 3, { e: 300, k: 300, c: 80, d: 300 }],
  [/green bean|runner bean|string bean|asparagus|beetroot|beet\b|turnip|parsnip|swede|okra|artichoke/i, "veg", 2, 8, 0.2, 3, { e: 150, k: 400, c: 110, d: 200 }],
  [/tomato/i, "veg", 0.9, 3.9, 0.2, 1.2, { e: 120, k: 250, c: 180, d: 120 }],
  [/parsley|coriander|cilantro|basil|mint|dill|chives|rosemary|thyme|sage|tarragon|herb/i, "veg", 3, 6, 0.8, 3, { e: 5, k: 30, c: 30, d: 10 }],
  [/lemon|lime|orange|mandarin|grapefruit/i, "fr", 1, 9, 0.3, 2.8, { e: 70, k: 1000, c: 240, d: 70 }],
  [/berr|cherr|grape/i, "fr", 0.7, 12, 0.3, 2.4, { c: 150, k: 250, e: 5, d: 150 }],
  [/banana|apple|pear|peach|plum|apricot|mango|kiwi|feijoa|pineapple|melon|nectarine|fruit/i, "fr", 0.6, 13, 0.3, 2.2, { e: 150, k: 1000, c: 160, d: 150 }],
  [/baking powder|yeast|water|ice\b/i, "sp", 0, 0, 0, 0, { d: 0 }],
];
const NUT_HIT = new Map();
function nutOf(name) {
  const k = shopName(name).toLowerCase();
  if (NUT_HIT.has(k)) return NUT_HIT.get(k);
  const r = NUT.find((x) => x[0].test(k)) || null;
  NUT_HIT.set(k, r); return r;
}
// Grams for one ingredient line. A missing amount uses a typical amount (d), and is counted as a guess.
function nutGrams(qty, o) {
  const s = String(qty || "").trim();
  if (!s) return { g: o.d == null ? 30 : o.d, guess: true };
  const q = parseQty(s);
  if (!q || q.n == null) {
    const w = s.toLowerCase();
    return { g: /drizzle|splash|dash|knob/.test(w) ? 10 : /pinch|sprinkle/.test(w) ? 1 : /handful/.test(w) ? 30 : (o.d == null ? 30 : o.d), guess: true };
  }
  const u = q.u.toLowerCase().replace(/\.$/, "");
  const inner = u.match(/\((\d+(?:\.\d+)?)\s*(g|ml)\)/);
  if (inner) return { g: q.n * parseFloat(inner[1]) };
  const cup = o.c || 240;
  if (!u) return { g: q.n * (o.e || o.d || 100) };
  if (u === "g" || u === "ml") return { g: q.n };
  if (/^(c|cups?|cps?|ups?|mugs?)$/.test(u)) return { g: q.n * cup };
  if (/^(tbsp|tbs|tbl|tablespoons?|tb|t)$/.test(u)) return { g: q.n * cup / 16 };
  if (/^(tsp|teaspoons?|ts)$/.test(u)) return { g: q.n * cup / 48 };
  if (/^cloves?$/.test(u)) return { g: q.n * 5 };
  if (/^(sticks?|stalks?|ribs?)$/.test(u)) return { g: q.n * 40 };
  if (/^(slices?|rashers?)$/.test(u)) return { g: q.n * 25 };
  if (/^(servings?|serves?|portions?)$/.test(u)) return { g: q.n * (o.e || 75) };
  if (/^(sheets?|pieces?|pcs?|fillets?|heads?|whole|large|medium|small|each)$/.test(u)) return { g: q.n * (o.e || 100) };
  if (/^(bunch(es)?|sprigs?)$/.test(u)) return { g: q.n * (o.k || 100) };
  if (/^(tins?|cans?|jars?|pouch(es)?|packs?|packets?|pkts?|bags?|tubs?|pots?|sachets?|blocks?|box(es)?|caps?|punnets?|bottles?|cartons?|trays?|bottles?)$/.test(u)) return { g: q.n * (o.k || o.e || 400) };
  return { g: q.n * (o.e || 100), guess: true };
}
const NUT_CACHE = new Map();
// Totals for one serve, plus the counts the health rating works from. null when there's nothing to go on.
function nutrition(m) {
  const ings = (m.ingredients || []).filter((i) => i.name);
  if (!ings.length) return null;
  const sv = servesN(m);
  const key = sv + "\n" + ings.map((i) => i.qty + "|" + i.name).join("\n");
  if (NUT_CACHE.has(key)) return NUT_CACHE.get(key);
  const r = { p: 0, c: 0, f: 0, fib: 0, kcal: 0, by: {}, names: {}, unknown: [], guessed: 0, counted: 0, serves: sv, plants: new Set() };
  for (const i of ings) {
    const e = nutOf(i.name);
    if (!e) { r.unknown.push(shopName(i.name)); continue; }
    const [, kind, p, c, f, fib, o] = e;
    if (kind === "sp") continue;
    const gg = nutGrams(i.qty, o), g = gg.g / sv;
    r.counted++; if (gg.guess) r.guessed++;
    r.p += p * g / 100; r.c += c * g / 100; r.f += f * g / 100; r.fib += fib * g / 100;
    r.by[kind] = (r.by[kind] || 0) + g;
    if (kind === "sat") r.satFat = (r.satFat || 0) + f * g / 100;
    if (kind === "sug") r.sugar = (r.sugar || 0) + c * g / 100;
    (r.names[kind] = r.names[kind] || []).push(shopName(i.name));
    if (/^(veg|fr|leg|nut|wg)$/.test(kind)) r.plants.add(normName(i.name));
  }
  r.kcal = r.p * 4 + r.c * 4 + r.f * 9;
  r.ok = r.counted > 0 && r.kcal > 30;
  r.rough = r.unknown.length > r.counted / 2 || r.guessed > r.counted / 2;
  r.health = r.ok ? healthScore(r) : null;
  NUT_CACHE.set(key, r);
  return r;
}
const g0 = (n) => Math.round(n / 5) * 5;
const listN = (a) => { const u = [...new Set(a)]; return u.length > 3 ? u.slice(0, 3).join(", ") + " +" + (u.length - 3) : u.join(", "); };
// Starts at 6 (an ordinary home-cooked dinner) and moves for what's in it. Each step is one reason line.
function healthScore(r) {
  const why = []; let s = 6;
  const add = (d, t) => { s += d; why.push({ d, t }); };
  const by = (k) => r.by[k] || 0, nm = (...ks) => listN(ks.flatMap((k) => r.names[k] || []));
  const pm = by("pm");
  if (pm > 0) add(pm >= 60 ? -3 : pm >= 20 ? -2 : -1, `Processed meat (${nm("pm")}), about ${g0(pm) || "<5"} g a serve. The WHO classes it as a Group 1 carcinogen (bowel cancer); the advice is to eat as little as you can.`);
  const rm = by("rm");
  if (rm >= 150) add(-1, `Lots of red meat (${nm("rm")}), about ${g0(rm)} g a serve. The WHO lists red meat as Group 2A (probably carcinogenic); aim for no more than about 350 to 500 g cooked a week.`);
  else if (rm > 0) add(0, `Red meat (${nm("rm")}), about ${g0(rm)} g a serve: fine in moderation.`);
  // Plant-food bonuses (veg, variety, fibre, beans, whole grains) overlap, so together they're capped at +4.
  let plus = 0; const pAdd = (d, t) => { const k = Math.max(0, Math.min(d, 4 - plus)); plus += k; add(k, k < d ? t + " (plant bonuses top out at +4, already reached)" : t); };
  const sweet = (r.sugar || 0) >= 12;
  const plants = by("veg") + by("fr") + by("leg");
  if (plants >= 200) pAdd(2, `Plenty of veg and fruit, about ${g0(plants)} g a serve (that's ${Math.floor(plants / 80)} of your 5+ a day).`);
  else if (plants >= 100) pAdd(1, `Some veg, about ${g0(plants)} g a serve (${Math.floor(plants / 80)} of your 5+ a day).`);
  else if (plants < 40 && !sweet) add(-1, `Little or no veg (about ${g0(plants)} g a serve). Adding a side salad or greens would lift it.`);
  else if (plants >= 40) add(0, `A little veg, about ${g0(plants)} g a serve.`);
  if (r.plants.size >= 5) pAdd(1, `${r.plants.size} different plant foods: variety is good for your gut.`);
  if (r.fib >= 8) pAdd(1, `Good fibre, about ${Math.round(r.fib)} g a serve.`);
  else if (r.fib < 3 && plants >= 40) add(-1, `Low fibre, about ${Math.round(r.fib)} g a serve.`);
  if (by("leg") >= 50) pAdd(1, `Beans or lentils (${nm("leg")}): fibre and plant protein.`);
  if (by("wg") >= 30) pAdd(1, `Whole grains (${nm("wg")}).`);
  if (by("of") >= 60) add(1, `Oily fish (${nm("of")}): omega-3s.`);
  if (by("fried") >= 20) add(-1, `Fried or crumbed (${nm("fried")}).`);
  const upf = (r.names.upf || []).length;
  if (upf && by("upf") >= 15) add(upf >= 2 ? -2 : -1, `Ultra-processed (${nm("upf")}): ready-made sauces, mixes and pastry tend to be high in salt, sugar or fat.`);
  const sf = r.satFat || 0;
  if (sf >= 20) add(sf >= 35 ? -2 : -1, `Rich: lots of cream, cheese, butter or coconut (${nm("sat")}), about ${Math.round(sf)} g fat a serve from them.`);
  const sug = r.sugar || 0;
  if (sug >= 12) add(sug >= 30 ? -2 : -1, `Added sugar (${nm("sug")}), about ${Math.round(sug)} g a serve. The WHO suggests under 25 g a day.`);
  if (r.kcal >= 1000) add(-1, `A big serve, about ${g0(r.kcal)} kcal.`);
  const score = Math.max(1, Math.min(10, s));
  return { score, why };
}
const HEALTH_BANDS = [[9, "Great", "#2e9d57"], [7, "Good", "#7cb342"], [5, "OK", "#e0a526"], [3, "Go easy", "#ef7d32"], [1, "Treat", "#d64541"]];
function healthBand(n) { return HEALTH_BANDS.find((b) => n >= b[0]); }
function hpill(m) {
  const h = healthOf(m); if (!h) return "";
  const b = healthBand(h.score);
  return `<span class="hp${h.own ? " own" : ""}" style="--hc:${b[2]}" title="Health ${h.score}/10 · ${b[1]} (${h.own ? "your rating" : "estimate"})">${h.score}</span>`;
}
// The meal's rating: your own if you set one, otherwise the estimate. null when there's nothing to rate.
function healthOf(m) {
  const own = parseInt(m.health, 10);
  const r = nutrition(m);
  if (own >= 1 && own <= 10) return { score: own, own: true, est: r && r.health ? r.health.score : null };
  return r && r.health ? { score: r.health.score, own: false, est: r.health.score } : null;
}
// The protein / carbs / fat split as a ring, by share of calories, kcal a serve in the middle.
const MACRO_COL = { p: "#f0883e", c: "#2bb3c0", f: "#a46fd6" };
function macroRing(r, size) {
  const R = 40, C = 2 * Math.PI * R, tot = r.p * 4 + r.c * 4 + r.f * 9 || 1;
  let off = 0;
  const arcs = [["c", r.c * 4], ["f", r.f * 9], ["p", r.p * 4]].map(([k, v]) => {
    const len = C * v / tot, gap = len > 6 ? 2 : 0;
    const s = `<circle r="${R}" cx="50" cy="50" fill="none" stroke="${MACRO_COL[k]}" stroke-width="13" stroke-dasharray="${Math.max(0, len - gap).toFixed(2)} ${C.toFixed(2)}" stroke-dashoffset="${(-off).toFixed(2)}" transform="rotate(-90 50 50)"/>`;
    off += len; return s;
  }).join("");
  return `<svg viewBox="0 0 100 100" width="${size}" height="${size}" role="img" aria-label="Estimated macros: ${Math.round(r.c * 400 / tot)}% carbs, ${Math.round(r.f * 900 / tot)}% fat, ${Math.round(r.p * 400 / tot)}% protein">
    <circle r="${R}" cx="50" cy="50" fill="none" stroke="color-mix(in srgb, currentColor 10%, transparent)" stroke-width="13"/>${arcs}
    <text x="50" y="49" text-anchor="middle" font-size="19" font-weight="800" fill="currentColor">~${g0(r.kcal)}</text>
    <text x="50" y="64" text-anchor="middle" font-size="10" fill="currentColor" opacity=".65">kcal / serve</text></svg>`;
}

// ---------- item formats ----------

const MEAL_KEYS = ["emoji", "img", "tags", "serves", "mins", "plan", "servings", "cooked", "had", "health"];
function parseMeal(it) {
  const lines = String(it.description || "").split("\n");
  const m = { uid: it.uid, name: it.summary, health: "", emoji: "", img: "", tags: [], serves: "", mins: "", plan: [], ppl: {}, cooked: "", had: [], ingredients: [], notes: "" };
  let i = 0;
  const hasHdr = lines.length && /^(\w+):/.test(lines[0]) && MEAL_KEYS.includes(lines[0].split(":")[0].toLowerCase());
  if (hasHdr) {
    for (; i < lines.length && lines[i].trim() !== "---"; i++) {
      const mm = lines[i].match(/^(\w+):\s*(.*)$/); if (!mm) continue;
      const k = mm[1].toLowerCase(), v = mm[2].trim();
      if (k === "tags") m.tags = v.split(",").map((x) => x.trim()).filter(Boolean);
      else if (k === "plan") m.plan = v.split(",").map((x) => x.trim()).filter((x) => ISO.test(x));
      else if (k === "cooked") m.cooked = ISO.test(v) ? v : "";
      else if (k === "had") m.had = v.split(",").map((x) => x.trim()).filter((x) => ISO.test(x));
      else if (k === "servings") for (const x of v.split(",")) { const mm2 = x.trim().match(/^(\d{4}-\d{2}-\d{2})\s*=\s*(\d+)$/); if (mm2 && +mm2[2] > 0) m.ppl[mm2[1]] = +mm2[2]; }
      else if (MEAL_KEYS.includes(k)) m[k] = v;
    }
    i++;
    for (; i < lines.length && lines[i].trim() !== "---"; i++) {
      let l = lines[i].trim(); if (!l) continue;
      let staple = false, list = false, frozen = false;
      for (let g = 0; g < 4; g++) {
        if (/^\u2744/.test(l)) { frozen = true; l = l.replace(/^\u2744\uFE0F?/, "").trim(); }
        else if (l.startsWith("*")) { staple = true; l = l.slice(1).trim(); }
        else if (l.startsWith("!")) { list = true; l = l.slice(1).trim(); }
        else break;
      }
      const p = l.split("|").map((x) => x.trim());
      const ing = p.length >= 2 ? { qty: p[0], name: p[1], aisle: p[2] || guessAisle(p[1]), staple, list, frozen } : { qty: "", name: p[0], aisle: guessAisle(p[0]), staple, list, frozen };
      if (ing.name) m.ingredients.push(ing);
    }
    i++;
  }
  m.notes = lines.slice(i).join("\n").trim();
  return m;
}
function composeMeal(m) {
  const h = [];
  if (m.emoji) h.push("emoji: " + m.emoji);
  if (m.img) h.push("img: " + m.img);
  if (m.tags.length) h.push("tags: " + m.tags.join(", "));
  if (m.serves) h.push("serves: " + m.serves);
  if (m.mins) h.push("mins: " + m.mins);
  if (m.plan.length) h.push("plan: " + [...new Set(m.plan)].sort().join(", "));
  const ppl = Object.keys(m.ppl || {}).filter((d) => m.plan.includes(d) && m.ppl[d] > 0 && m.ppl[d] !== servesN(m)).sort();
  if (ppl.length) h.push("servings: " + ppl.map((d) => d + "=" + m.ppl[d]).join(", "));
  if (m.cooked) h.push("cooked: " + m.cooked);
  if ((m.had || []).length) h.push("had: " + [...new Set(m.had)].sort().slice(-30).join(", "));
  if (parseInt(m.health, 10) >= 1) h.push("health: " + parseInt(m.health, 10));
  if (!h.length) h.push("emoji: 🍽️");
  const ing = m.ingredients.filter((x) => x.name).map((x) => (x.staple ? "* " : x.list ? "! " : "") + (x.frozen ? "\u2744 " : "") + [x.qty || "", x.name, x.aisle || guessAisle(x.name)].join(" | "));
  return h.join("\n") + "\n---\n" + ing.join("\n") + "\n---\n" + (m.notes || "");
}

function parseShop(it) {
  const s = { uid: it.uid, name: it.summary, done: it.status === "completed", qty: "", aisle: "", for: [], have: [], notes: "" };
  const lines = String(it.description || "").split("\n");
  const rest = [];
  for (const l of lines) {
    const mm = l.match(/^(qty|aisle|for|have):\s*(.*)$/i);
    if (!mm) { rest.push(l); continue; }
    const k = mm[1].toLowerCase(), v = mm[2].trim();
    if (k === "for" || k === "have") {
      s[k] = v.split(";").map((x) => x.trim()).filter(Boolean).map((x) => {
        const eq = x.lastIndexOf("="); const key = eq > 0 ? x.slice(0, eq) : x; const qty = eq > 0 ? x.slice(eq + 1) : "";
        const at = key.lastIndexOf("@");
        return { meal: at > 0 ? key.slice(0, at) : key, date: at > 0 ? key.slice(at + 1) : "", qty };
      });
    } else s[k] = v;
  }
  s.notes = rest.join("\n").trim();
  if (!s.aisle) s.aisle = guessAisle(s.name);
  s.total = sumQty([s.qty, ...s.for.map((f) => f.qty)].filter(Boolean));
  return s;
}
function composeShop(s) {
  const l = [];
  if (s.qty) l.push("qty: " + s.qty);
  l.push("aisle: " + (s.aisle || guessAisle(s.name)));
  if (s.for.length) l.push("for: " + s.for.map((f) => f.meal + "@" + f.date + "=" + (f.qty || "")).join("; "));
  if ((s.have || []).length) l.push("have: " + s.have.map((f) => f.meal + "@" + f.date + "=" + (f.qty || "")).join("; "));
  if (s.notes) l.push(s.notes);
  return l.join("\n");
}

// ---------- the to-do feed ----------

class TodoFeed {
  constructor(ent, cb) { this.ent = ent; this.cb = cb; }
  async start(hass) {
    this.hass = hass;
    if (!hass.states[this.ent]) { this.cb(null, this.ent + " does not exist yet."); return; }
    try {
      this.unsub = await hass.connection.subscribeMessage((m) => this.cb((m && m.items) || []), { type: "todo/item/subscribe", entity_id: this.ent });
    } catch (e) { this.poll = true; this.load(); }
  }
  update(hass) {
    this.hass = hass;
    if (!this.poll) return;
    const s = hass.states[this.ent]; const sig = s ? s.state + "@" + s.last_updated : "-";
    if (sig !== this.sig) { this.sig = sig; this.load(); }
  }
  async load() {
    try {
      const r = await this.hass.callWS({ type: "call_service", domain: "todo", service: "get_items", target: { entity_id: this.ent }, return_response: true });
      this.cb(((r && r.response && r.response[this.ent]) || {}).items || []);
    } catch (e) { this.cb(null, (e && e.message) || String(e)); }
  }
  // A fresh read of the list, for when a stale copy could make a double-up.
  async fetch() {
    try {
      const r = await this.hass.callWS({ type: "call_service", domain: "todo", service: "get_items", target: { entity_id: this.ent }, return_response: true });
      return ((r && r.response && r.response[this.ent]) || {}).items || null;
    } catch (e) { return null; }
  }
  stop() { if (this.unsub) { try { this.unsub(); } catch (e) { /* gone */ } this.unsub = null; } }
  canDescribe() { const s = this.hass && this.hass.states[this.ent]; return !!s && ((s.attributes.supported_features || 0) & 64) === 64; }
  async call(svc, data) { await this.hass.callService("todo", svc, Object.assign({ entity_id: this.ent }, data)); if (this.poll) this.load(); }
}

// ---------- shared look ----------

function thumb(m, cls) {
  const h = hash(m.name) % 360;
  const bg = `background:radial-gradient(120% 90% at 20% 15%, hsla(${h},90%,80%,.55), transparent 60%),linear-gradient(135deg, hsl(${h} 62% 58%), hsl(${(h + 38) % 360} 66% 44%))`;
  const img = m.img ? `<img src="${esc(m.img)}" alt="" loading="lazy" onerror="this.remove()">` : "";
  return `<div class="th ${cls || ""}" style="${bg}"><span class="em">${esc(m.emoji || "🍽️")}</span>${img}</div>`;
}

const BASE = `
:host { display:block; min-width:0; }
* { box-sizing:border-box; }
ha-card { display:block; padding:16px; overflow:hidden; color:var(--primary-text-color); font-size:15px; }
button { font:inherit; color:inherit; }
.hd { display:flex; align-items:center; gap:10px; margin-bottom:12px; }
.hd .t { font-size:20px; font-weight:700; letter-spacing:-.2px; }
.hd .s { color:var(--secondary-text-color); font-size:13px; }
.hd .sp { flex:1; }
.btn { border:1px solid var(--divider-color); background:none; border-radius:999px; padding:0 14px; height:38px; cursor:pointer; font-size:14px; font-weight:600;
  display:inline-flex; align-items:center; gap:6px; white-space:nowrap; -webkit-tap-highlight-color:transparent; }
.btn:hover { background:color-mix(in srgb, var(--primary-text-color) 6%, transparent); }
.btn.pri { background:var(--primary-color); border-color:var(--primary-color); color:var(--text-primary-color, #fff); }
.btn.del { color:var(--error-color, #d64541); border-color:color-mix(in srgb, var(--error-color, #d64541) 45%, transparent); }
.btn.sm { height:32px; padding:0 11px; font-size:13px; }
.ico { width:38px; padding:0; justify-content:center; font-size:18px; }
.th { position:relative; overflow:hidden; display:grid; place-items:center; }
.th .em { font-size:44px; line-height:1; filter:drop-shadow(0 3px 5px rgba(0,0,0,.25)); }
.th img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
.th::after { content:""; position:absolute; inset:0; background:radial-gradient(circle at 50% 120%, rgba(0,0,0,.18), transparent 60%); pointer-events:none; }
.chip { display:inline-flex; align-items:center; gap:4px; height:26px; padding:0 10px; border-radius:999px; font-size:12.5px; font-weight:600;
  background:color-mix(in srgb, var(--primary-text-color) 7%, transparent); color:var(--secondary-text-color); white-space:nowrap; }
.mut { color:var(--secondary-text-color); }
/* Rows that scroll sideways: the end with more to see fades out and gets a round arrow button. */
.srw { position:relative; min-width:0; }
.sr { display:flex; gap:6px; overflow-x:auto; scrollbar-width:none; scroll-behavior:smooth; }
.sr::-webkit-scrollbar { display:none; }
.sr.e-r { -webkit-mask-image:linear-gradient(to right, #000 calc(100% - 64px), transparent calc(100% - 8px)); mask-image:linear-gradient(to right, #000 calc(100% - 64px), transparent calc(100% - 8px)); }
.sr.e-l { -webkit-mask-image:linear-gradient(to right, transparent 8px, #000 56px); mask-image:linear-gradient(to right, transparent 8px, #000 56px); }
.sr.e-l.e-r { -webkit-mask-image:linear-gradient(to right, transparent 8px, #000 56px, #000 calc(100% - 64px), transparent calc(100% - 8px)); mask-image:linear-gradient(to right, transparent 8px, #000 56px, #000 calc(100% - 64px), transparent calc(100% - 8px)); }
.srb { position:absolute; top:50%; width:32px; height:32px; margin-top:-16px; border-radius:50%; border:none; padding:0; cursor:pointer; z-index:2;
  background:var(--primary-color); color:var(--text-primary-color, #fff); font-size:20px; font-weight:700; line-height:1; display:grid; place-items:center;
  box-shadow:0 2px 6px rgba(0,0,0,.28); opacity:0; pointer-events:none; transition:opacity .2s; -webkit-tap-highlight-color:transparent; }
.srb.l { left:0; } .srb.r { right:0; }
.srw.l .srb.l, .srw.r .srb.r { opacity:1; pointer-events:auto; }
.srw.hint .srb.r { animation:srnudge 1s ease-in-out 2; }
@keyframes srnudge { 0%, 100% { transform:translateX(0); } 50% { transform:translateX(5px); } }
@media (prefers-reduced-motion: reduce) { .srw.hint .srb.r { animation:none; } .sr { scroll-behavior:auto; } }
.noi { color:var(--warning-color, #c98a00) !important; font-weight:700; }
.warn { padding:10px 12px; border-radius:10px; font-size:13px; margin-bottom:12px;
  background:color-mix(in srgb, var(--warning-color, #f4b400) 16%, transparent); border:1px solid color-mix(in srgb, var(--warning-color, #f4b400) 45%, transparent); }
.toast { position:fixed; left:50%; bottom:28px; transform:translate(-50%, 20px); opacity:0; transition:all .25s; z-index:10001; pointer-events:none;
  background:var(--primary-text-color); color:var(--card-background-color, #fff); padding:10px 18px; border-radius:999px; font-weight:600; font-size:14px; box-shadow:0 6px 20px rgba(0,0,0,.25); }
.toast.on { opacity:1; transform:translate(-50%, 0); }

/* sheets */
.ov { position:fixed; inset:0; z-index:10000; background:rgba(0,0,0,.45); display:flex; align-items:center; justify-content:center; padding:24px;
  animation:mp-fade .15s ease; }
.sh { width:min(680px, 100%); max-height:min(88vh, 900px); overflow:auto; border-radius:20px; background:var(--card-background-color, #fff);
  color:var(--primary-text-color); box-shadow:0 20px 60px rgba(0,0,0,.35); animation:mp-up .2s ease; }
.sh.nudge { animation:mpnudge .32s ease; }
@keyframes mpnudge { 0%,100% { transform:translateX(0); } 25% { transform:translateX(-8px); } 75% { transform:translateX(8px); } }
.draftn { display:flex; align-items:center; gap:8px; margin:0 0 10px; padding:8px 12px; border-radius:12px; background:rgba(255,138,101,.16); font-size:13px; }
.draftn .sp { flex:1; }
.draftn[hidden] { display:none; }
.draftn.sugg { background:rgba(255,213,79,.18); flex-wrap:wrap; }
.gmsg { position:sticky; bottom:64px; margin:0 16px 8px; padding:10px 14px; border-radius:12px; background:#ff8a65; color:#1a1a1a; font-size:14px; font-weight:600; text-align:center; }
.sh .pad { padding:18px 20px 20px; }
.sh h2 { margin:0; font-size:22px; letter-spacing:-.3px; }
.sh h3 { margin:18px 0 8px; font-size:13px; text-transform:uppercase; letter-spacing:.6px; color:var(--secondary-text-color); }
.sh .foot { position:sticky; bottom:0; display:flex; gap:8px; flex-wrap:wrap; padding:12px 20px; background:var(--card-background-color, #fff);
  border-top:1px solid var(--divider-color); }
.sh .foot .sp { flex:1; }
.sh .x { position:absolute; top:12px; right:12px; z-index:2; background:rgba(0,0,0,.35); color:#fff; border:none; }
@media (max-width: 600px) {
  .ov { padding:0; align-items:flex-end; }
  .sh { border-radius:20px 20px 0 0; max-height:92vh; }
}
@keyframes mp-fade { from { opacity:0; } }
@keyframes mp-up { from { transform:translateY(24px); opacity:.4; } }
label.f { display:block; font-size:12px; font-weight:600; color:var(--secondary-text-color); margin:12px 0 4px; }
input.i, select.i, textarea.i { width:100%; height:42px; border-radius:10px; border:1px solid var(--divider-color); padding:0 12px; font:inherit; font-size:15px;
  background:color-mix(in srgb, var(--primary-text-color) 3%, var(--card-background-color, #fff)); color:var(--primary-text-color); outline:none; }
textarea.i { height:auto; min-height:84px; padding:10px 12px; resize:vertical; }
input.i:focus, select.i:focus, textarea.i:focus { border-color:var(--primary-color); box-shadow:0 0 0 2px color-mix(in srgb, var(--primary-color) 25%, transparent); }
`;

// Unsaved meal edits live in this browser (localStorage) until Save or Cancel, so they survive a stray tap or tab change.
const DRAFT_KEY = "meal-planner-drafts", DRAFT_DAYS = 14;
function draftAll() { try { return JSON.parse(localStorage.getItem(DRAFT_KEY) || "{}") || {}; } catch (e) { return {}; } }
function draftSave(all) { try { localStorage.setItem(DRAFT_KEY, JSON.stringify(all)); } catch (e) { /* storage off: no drafts */ } }
function draftGet(k) { const d = draftAll()[k]; return d && Date.now() - d.t < DRAFT_DAYS * 864e5 ? d.m : null; }
function draftPut(k, m) { const all = draftAll(); all[k] = { t: Date.now(), m }; draftSave(all); }
function draftDel(k) { const all = draftAll(); if (k in all) { delete all[k]; draftSave(all); } }

class MPBase extends HTMLElement {
  constructor() { super(); this.attachShadow({ mode: "open" }); this._aisles = DEFAULT_AISLES; }
  _aisle(name) { return this._aisles.find((a) => a.name === name) || this._aisles[this._aisles.length - 1]; }
  _toast(msg) {
    let t = this.shadowRoot.querySelector(".toast");
    if (!t) { t = document.createElement("div"); t.className = "toast"; this.shadowRoot.appendChild(t); }
    t.textContent = msg; t.classList.add("on");
    clearTimeout(this._tt); this._tt = setTimeout(() => t.classList.remove("on"), 2200);
  }
  _openSheet(html, onClick, onInput, opts = {}) {
    this._closeSheet();
    const ov = document.createElement("div"); ov.className = "ov";
    ov.innerHTML = `<div class="sh" role="dialog">${html}</div>`;
    // Editor sheets ("guard") ignore a tap outside once something has changed, so a stray tap can't throw work away.
    ov.addEventListener("click", (e) => {
      if (e.target === ov) {
        if (opts.guard && ov._dirty) {
          const sh = ov.querySelector(".sh"); sh.classList.remove("nudge"); void sh.offsetWidth; sh.classList.add("nudge");
          let g = sh.querySelector(".gmsg");
          if (!g) { g = document.createElement("div"); g.className = "gmsg"; g.textContent = opts.guardMsg || "You have unsaved changes. Tap Save to keep them, or Cancel to throw them away."; sh.insertBefore(g, sh.querySelector(".foot")); }
          clearTimeout(ov._gt); ov._gt = setTimeout(() => g.remove(), 4000);
          return;
        }
        this._closeSheet(); return;
      }
      const b = e.target.closest("[data-a]");
      if (b) { if (b.dataset.a !== "cancel" && b.dataset.a !== "close") ov._dirty = true; onClick(b.dataset.a, b, e); }
    });
    ov.addEventListener("input", () => { ov._dirty = true; });
    ov.addEventListener("change", () => { ov._dirty = true; });
    if (onInput) ov.addEventListener("input", onInput);
    this.shadowRoot.appendChild(ov); this._ov = ov;
    return ov;
  }
  _closeSheet() { if (this._ov) { this._ov.remove(); this._ov = null; this._sheet = null; } }
  // A sideways row of chips with ‹ › buttons; key names it so the first-time nudge plays once per row.
  _rowHtml(cls, inner, key, id) {
    return `<div class="srw" data-k="${key}"><div class="sr ${cls}"${id ? ` id="${id}"` : ""}>${inner}</div>
      <button class="srb l" data-a="srl" aria-label="Scroll left">‹</button><button class="srb r" data-a="srr" aria-label="Scroll right">›</button></div>`;
  }
  _rowScroll(b, dir) { const r = b.parentElement.querySelector(".sr"); if (r) r.scrollBy({ left: dir * Math.max(120, r.clientWidth * 0.7) }); }
  // Fades and arrows follow the scroll position; a mouse wheel scrolls the row sideways.
  _rows() {
    for (const r of this.shadowRoot.querySelectorAll(".sr")) {
      if (!r._wired) {
        r._wired = true;
        r.addEventListener("scroll", () => this._edges(r), { passive: true });
        r.addEventListener("wheel", (e) => {
          if (r.scrollWidth <= r.clientWidth || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
          e.preventDefault(); r.scrollLeft += e.deltaY;
        }, { passive: false });
      }
      this._edges(r);
    }
  }
  _edges(el) {
    if (!el) return;
    const l = el.scrollLeft > 4, r = el.scrollLeft + el.clientWidth < el.scrollWidth - 4;
    el.classList.toggle("e-l", l); el.classList.toggle("e-r", r);
    const w = el.parentElement;
    if (w && w.classList.contains("srw")) {
      w.classList.toggle("l", l); w.classList.toggle("r", r);
      this._hinted = this._hinted || {};
      if (r && !this._hinted[w.dataset.k]) { this._hinted[w.dataset.k] = true; w.classList.add("hint"); }
    }
  }
  _resize() {
    const w = this.offsetWidth || 0;
    const c = this.shadowRoot.querySelector("ha-card"); if (!c) return;
    c.classList.toggle("narrow", w > 0 && w < 640);
    c.classList.toggle("xs", w > 0 && w < 420);
  }
  connectedCallback() {
    if (!this._ro && window.ResizeObserver) { this._ro = new ResizeObserver(() => this._resize()); this._ro.observe(this); }
    if (this._hass && !this._started) this._start();
  }
  disconnectedCallback() {
    for (const f of this._feeds || []) f.stop();
    this._started = false;
    if (this._ro) { this._ro.disconnect(); this._ro = null; }
    clearInterval(this._timer); this._timer = null;
  }
  set hass(h) {
    this._hass = h;
    if (!this._started) this._start(); else for (const f of this._feeds || []) f.update(h);
  }
}

// =====================================================================
// meal-planner-card
// =====================================================================

const PL_STYLE = BASE + `
.tn { display:grid; grid-template-columns:minmax(200px, 300px) 1fr; gap:18px; align-items:stretch; margin-bottom:18px; border-radius:18px; overflow:hidden;
  background:color-mix(in srgb, var(--primary-color) 8%, transparent); border:1px solid color-mix(in srgb, var(--primary-color) 22%, transparent); }
.tn .th { min-height:168px; height:100%; cursor:pointer; }
.tn .th .em { font-size:84px; }
.tn .bd { padding:16px 18px 16px 0; display:flex; flex-direction:column; gap:6px; min-width:0; }
.tn .k { font-size:12px; font-weight:700; letter-spacing:.8px; text-transform:uppercase; color:var(--primary-color); }
.tn .n { font-size:28px; font-weight:750; letter-spacing:-.5px; line-height:1.1; }
.tn .mt { display:flex; flex-wrap:wrap; gap:6px; }
.tn .act { margin-top:auto; display:flex; gap:8px; flex-wrap:wrap; padding-top:8px; }
.tn.empty { grid-template-columns:1fr; padding:18px; }
.tn.empty .bd { padding:0; }
.narrow .tn { grid-template-columns:1fr; }
.narrow .tn .th { min-height:140px; }
.narrow .tn .bd { padding:0 16px 16px; }
.narrow .tn .n { font-size:23px; }

.sec { display:flex; align-items:center; gap:8px; margin:6px 0 10px; }
.sec .l { white-space:nowrap; font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:.7px; color:var(--secondary-text-color); }
.sec .sp { flex:1; }
.wk { position:relative; display:grid; grid-template-columns:repeat(7, minmax(0, 1fr)); gap:10px; margin-bottom:20px; }
.dy { border-radius:14px; border:1px solid var(--divider-color); overflow:hidden; cursor:pointer; display:flex; flex-direction:column; min-height:150px;
  background:var(--card-background-color); transition:transform .1s, box-shadow .2s; -webkit-tap-highlight-color:transparent; }
.dy:active { transform:scale(.98); }
.dy .dh { display:flex; align-items:baseline; gap:6px; padding:8px 10px 6px; }
.dy .dn { font-weight:700; font-size:14px; }
.dy .dd { font-size:12px; color:var(--secondary-text-color); }
.dy.td { border-color:var(--primary-color); box-shadow:0 0 0 2px color-mix(in srgb, var(--primary-color) 35%, transparent); }
.dy.td .dn { color:var(--primary-color); }
.dy.past { opacity:.55; }
.dy .th { flex:1; min-height:76px; }
.dy .th .em { font-size:38px; }
.dy .mn { padding:7px 10px 9px; font-size:13px; font-weight:650; line-height:1.25; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
.dy .more { font-size:11px; color:var(--secondary-text-color); padding:0 10px 8px; margin-top:-6px; }
.dy .add { flex:1; margin:0 8px 8px; border:2px dashed var(--divider-color); border-radius:10px; display:grid; place-items:center; color:var(--secondary-text-color); font-size:26px; }
.dy:hover .add { border-color:var(--primary-color); color:var(--primary-color); }
.narrow .wk { grid-auto-flow:column; grid-template-columns:none; grid-auto-columns:116px; overflow-x:auto; scroll-snap-type:x mandatory; padding-bottom:6px; margin:0 -16px 18px; padding-left:16px; padding-right:16px; scrollbar-width:none; }
.narrow .wk::-webkit-scrollbar { display:none; }
.narrow .dy { scroll-snap-align:start; }

.fl { display:flex; gap:8px; align-items:center; margin-bottom:12px; flex-wrap:wrap; }
.fl input.i { flex:1 1 200px; height:40px; border-radius:999px; padding-left:38px;
  background:color-mix(in srgb, var(--primary-text-color) 5%, transparent) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='%23888'%3E%3Cpath d='M9.5 3a6.5 6.5 0 0 1 5.2 10.4l5.4 5.4-1.4 1.4-5.4-5.4A6.5 6.5 0 1 1 9.5 3m0 2a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9'/%3E%3C/svg%3E") no-repeat 13px 50%; border-color:transparent; }
.tgw { flex:1 1 100%; min-width:0; }
.tg .chip { flex:none; }
.tg .chip.noi { border:1px dashed currentColor; }
.tg .chip.noi.on { background:var(--warning-color, #c98a00); color:#fff !important; }
.tg .chip { cursor:pointer; height:32px; padding:0 13px; font-size:13px; border:1px solid transparent; }
.tg .chip.on { background:var(--primary-color); color:var(--text-primary-color, #fff); }
.lib { display:grid; grid-template-columns:repeat(auto-fill, minmax(168px, 1fr)); gap:12px; }
.narrow .lib { grid-template-columns:repeat(auto-fill, minmax(140px, 1fr)); gap:10px; }
.ml { border-radius:16px; overflow:hidden; cursor:pointer; background:var(--card-background-color); border:1px solid var(--divider-color);
  display:flex; flex-direction:column; transition:transform .1s, box-shadow .2s; position:relative; -webkit-tap-highlight-color:transparent; }
.ml:hover { box-shadow:0 6px 18px rgba(0,0,0,.12); }
.ml:active { transform:scale(.98); }
.ml .th { aspect-ratio:4/3; }
.ml .th .em { font-size:54px; }
.ml .b { padding:9px 11px 11px; }
.ml .n { font-weight:700; font-size:14.5px; line-height:1.25; }
.ml .m { font-size:12px; color:var(--secondary-text-color); margin-top:3px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.lib .ml { -webkit-user-select:none; user-select:none; -webkit-touch-callout:none; }
.ml.lift { transform:scale(.96); opacity:.5; }
.ghost { position:fixed; z-index:10002; width:120px; border-radius:14px; overflow:hidden; pointer-events:none; background:var(--card-background-color, #fff);
  box-shadow:0 14px 34px rgba(0,0,0,.35); transform:translate(-50%, -60%) rotate(-3deg); }
.ghost .th { aspect-ratio:4/3; }
.ghost .th .em { font-size:40px; }
.ghost .n { padding:6px 9px 8px; font-size:12.5px; font-weight:700; line-height:1.2; color:var(--primary-text-color); }
.dragging .dy:not(.past) { border-style:dashed; border-color:color-mix(in srgb, var(--primary-color) 55%, transparent); }
.dy.over { border-style:solid !important; border-color:var(--primary-color) !important; transform:scale(1.04);
  box-shadow:0 0 0 3px color-mix(in srgb, var(--primary-color) 40%, transparent), 0 8px 20px rgba(0,0,0,.15); }
.sec .hint { font-size:12px; color:var(--secondary-text-color); }
.sec .l.fold { cursor:pointer; -webkit-tap-highlight-color:transparent; padding:6px 0; }
.shut { padding:14px; text-align:center; border:2px dashed var(--divider-color); border-radius:14px; cursor:pointer; font-size:14px; }
.narrow .sec .hint { display:none; }
.ml .rmb { position:absolute; top:8px; right:8px; z-index:2; height:32px; padding:0 12px; border-radius:999px; border:none; cursor:pointer; font-size:12.5px; font-weight:700;
  background:rgba(255,255,255,.94); color:var(--error-color, #d64541); box-shadow:0 2px 6px rgba(0,0,0,.18); }
.ml .pin { position:absolute; top:8px; left:8px; z-index:2; height:24px; padding:0 9px; border-radius:999px; font-size:11.5px; font-weight:700;
  background:rgba(255,255,255,.92); color:#333; display:flex; align-items:center; box-shadow:0 2px 6px rgba(0,0,0,.15); }
.ml .pop { position:absolute; top:8px; right:8px; z-index:2; width:28px; height:28px; border-radius:50%; font-size:15px; display:grid; place-items:center;
  background:rgba(255,255,255,.92); box-shadow:0 2px 6px rgba(0,0,0,.15); }
.nut { display:grid; grid-template-columns:auto minmax(150px, 260px) 1fr; gap:14px 16px; align-items:start; margin-top:14px; padding:14px;
  border:1px solid var(--divider-color); border-radius:16px; }
.nut .rg { color:var(--primary-text-color); line-height:0; }
.nut .hc { grid-column:1 / -1; }
.hpick[hidden] { display:none; }
.nut .lg { display:grid; gap:5px; font-size:13px; align-self:center; }
.nut .lg div { display:flex; align-items:center; gap:7px; }
.nut .lg i { width:10px; height:10px; border-radius:50%; flex:none; }
.nut .lg b { margin-left:auto; font-variant-numeric:tabular-nums; }
.nut .lg .mut { font-size:12px; }
.nut .est { grid-column:1 / -1; font-size:11.5px; color:var(--secondary-text-color); line-height:1.4; margin-top:-4px; }
.hc .hh { display:flex; align-items:center; gap:10px; }
.hs { width:46px; height:46px; border-radius:50%; flex:none; display:grid; place-items:center; font-size:21px; font-weight:800; color:#fff; background:var(--hc); }
.hc .hl b { font-size:16px; display:block; }
.hc .hl span { font-size:12px; color:var(--secondary-text-color); }
.hc .hh .btn { margin-left:auto; }
.why { list-style:none; margin:10px 0 0; padding:0; display:grid; gap:6px; font-size:13px; line-height:1.4; }
.why li { display:flex; gap:8px; align-items:flex-start; }
.why .d { flex:none; min-width:30px; height:20px; border-radius:999px; font-size:11.5px; font-weight:800; display:grid; place-items:center;
  background:color-mix(in srgb, var(--dc) 18%, transparent); color:var(--dc); }
.hpick { display:flex; flex-wrap:wrap; gap:6px; margin-top:10px; align-items:center; }
.hpick button { width:38px; height:38px; border-radius:50%; border:2px solid var(--hc); background:none; color:var(--primary-text-color); font-weight:800; font-size:14px; cursor:pointer; }
.hpick button.on { background:var(--hc); color:#fff; }
.hp { display:inline-grid; place-items:center; min-width:20px; height:18px; padding:0 5px; border-radius:999px; font-size:11px; font-weight:800; color:#fff; background:var(--hc); margin-right:5px; vertical-align:1px; }
.chip.hav { background:color-mix(in srgb, var(--hc) 20%, transparent); color:var(--primary-text-color); white-space:nowrap; }
.chip.hav b { color:var(--hc); font-weight:800; }
.dy .mn .hp { margin-right:4px; }
.sec .ws { display:none; }
.narrow .sec .wl { display:none; }
.narrow .sec .ws { display:inline; }
.hp.own { box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.75); }
.chip.pop2 { background:color-mix(in srgb, #ff7043 18%, transparent); }
.ml.new { border-style:dashed; border-width:2px; align-items:center; justify-content:center; min-height:180px; color:var(--secondary-text-color); gap:6px; background:none; }
.ml.new .plus { font-size:34px; line-height:1; }
.ml.new:hover { color:var(--primary-color); border-color:var(--primary-color); }
.empty-lib { padding:28px; text-align:center; border:2px dashed var(--divider-color); border-radius:16px; }

/* meal sheet */
.hero { height:220px; position:relative; }
.hero .th { position:absolute; inset:0; }
.hero .th .em { font-size:110px; }
.mt2 { display:flex; gap:6px; flex-wrap:wrap; margin-top:8px; }
.days { display:grid; grid-template-columns:repeat(7, 1fr); gap:6px; }
.dc { border:1px solid var(--divider-color); border-radius:12px; padding:7px 0; text-align:center; cursor:pointer; background:none; }
.dc b { display:block; font-size:13px; }
.dc span { font-size:11.5px; color:var(--secondary-text-color); }
.dc.on { background:var(--primary-color); border-color:var(--primary-color); color:var(--text-primary-color, #fff); }
.dc.on span { color:inherit; opacity:.85; }
.dc.td { border-color:var(--primary-color); }
.dc[disabled] { opacity:.4; cursor:default; }
.wkn { display:flex; align-items:center; gap:6px; margin-bottom:8px; font-size:13px; }
.wkn .sp { flex:1; }
.ings { border:1px solid var(--divider-color); border-radius:14px; overflow:hidden; }
.ig { display:flex; align-items:center; gap:10px; padding:8px 8px 8px 12px; border-top:1px solid var(--divider-color); min-height:50px; }
.ig:first-child { border-top:none; }
.ig .ai { width:30px; height:30px; flex:none; border-radius:9px; display:grid; place-items:center; font-size:16px; }
.ig .q { min-width:66px; font-weight:700; font-size:14px; }
.ig .nm { flex:1; min-width:0; }
.ig .nm small { display:block; font-size:11.5px; color:var(--secondary-text-color); }
.ig .tgl { width:38px; height:38px; border-radius:50%; border:1.5px solid var(--divider-color); background:none; cursor:pointer; font-size:18px; display:grid; place-items:center; flex:none; }
.ig .tgl.on { background:#43a047; border-color:#43a047; color:#fff; }
.notes { white-space:pre-wrap; line-height:1.5; font-size:14px; }
.pick { display:grid; grid-template-columns:repeat(auto-fill, minmax(130px, 1fr)); gap:10px; }
.pick .ml .th { aspect-ratio:16/10; }
.pick .ml .th .em { font-size:40px; }

/* edit sheet */
.row2 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; }
.emo { display:flex; flex-wrap:wrap; gap:4px; }
.emo button { width:40px; height:40px; border-radius:10px; border:1px solid transparent; background:none; font-size:22px; cursor:pointer; }
.emo { max-height:206px; overflow-y:auto; padding:2px; }
.emoc { display:flex; gap:8px; align-items:center; margin-top:8px; font-size:13px; }
.emoc input.i { width:110px; height:38px; font-size:20px; text-align:center; }
.emo button.on { border-color:var(--primary-color); background:color-mix(in srgb, var(--primary-color) 14%, transparent); }
.er { display:grid; grid-template-columns:86px 1fr 132px 40px 40px 34px; gap:6px; align-items:center; margin-bottom:6px; }
.er input.i, .er select.i { height:38px; font-size:14px; padding:0 8px; }
.er .st { width:40px; height:38px; border-radius:10px; border:1px solid var(--divider-color); background:none; cursor:pointer; font-size:16px; opacity:.45; }
.er .st.on { opacity:1; border-color:#e9b949; background:color-mix(in srgb, #e9b949 18%, transparent); }
.er .st.fz.on { border-color:#4fc3f7; background:color-mix(in srgb, #4fc3f7 18%, transparent); }
.dfz { display:flex; align-items:center; flex-wrap:wrap; gap:8px; padding:10px 12px; margin-bottom:12px; border-radius:12px; font-size:14px; line-height:1.4;
  border:1.5px solid #4fc3f7; background:color-mix(in srgb, #4fc3f7 14%, transparent); }
.dfz .t { flex:1 1 220px; }
.dy .dh .fz { margin-left:auto; font-size:12px; }
.dy .svb { align-self:flex-end; position:relative; z-index:1; margin:-28px 6px 6px 0; padding:2px 7px; border-radius:999px; font-size:12px; font-weight:800; line-height:1.4;
  background:rgba(0,0,0,.62); color:#fff; pointer-events:none; white-space:nowrap; }
.dy .svb.ch { background:var(--primary-color); }
.svs { display:flex; align-items:center; gap:6px; margin-top:6px; font-size:13px; }
.svs button { width:34px; height:34px; border-radius:50%; border:1px solid var(--divider-color); background:var(--secondary-background-color); color:var(--primary-text-color); font-size:18px; font-weight:700; cursor:pointer; line-height:1; padding:0; }
.svs button:disabled { opacity:.35; cursor:default; }
.svs b { min-width:22px; text-align:center; font-size:16px; }
.svs .ch { font-size:11.5px; color:var(--primary-color); font-weight:700; }
.er .rm { width:34px; height:34px; border:none; background:none; cursor:pointer; font-size:18px; color:var(--secondary-text-color); }
/* Fill my week */
.fillb { border-color:color-mix(in srgb, var(--primary-color) 55%, transparent); color:var(--primary-color); }
.fillb2 { display:none; }
.narrow .sec .fillb { display:none; }
.narrow .fillb2 { display:flex; width:100%; justify-content:center; margin:-8px 0 20px; }
.fsub { margin:6px 0 12px; font-size:13.5px; line-height:1.45; }
.fw { display:flex; flex-direction:column; gap:8px; }
.fr { display:grid; grid-template-columns:62px 64px 1fr auto; gap:10px; align-items:center; padding:8px; border:1px solid var(--divider-color); border-radius:14px; }
.fr.off { grid-template-columns:62px 1fr auto; opacity:.6; border-style:dashed; }
.fr .fd b { display:block; font-size:14px; }
.fr .fd span { font-size:12px; color:var(--secondary-text-color); }
.fr .fth { width:64px; height:64px; border-radius:12px; }
.fr .fth .em { font-size:32px; }
.fr .fb { min-width:0; }
.fr .fb .n { font-weight:700; }
.fsw { position:relative; display:flex; align-items:center; gap:6px; min-width:0; cursor:pointer; border-radius:6px; }
.fsw .fn { font-size:15.5px; font-weight:750; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; min-width:0; }
.fsw .car { flex:none; color:var(--secondary-text-color); font-size:13px; }
.fs { position:absolute; inset:0; width:100%; height:100%; opacity:0; cursor:pointer; font-size:16px; }
.fs option { color:#1c1c1e; background:#fff; }
.fsw:focus-within { box-shadow:0 0 0 2px color-mix(in srgb, var(--primary-color) 40%, transparent); }
.fc { display:flex; flex-wrap:wrap; gap:4px; margin-top:4px; }
.fc .chip { height:22px; font-size:11.5px; padding:0 8px; }
.fc .fbz { background:color-mix(in srgb, #c39bd3 26%, transparent); color:var(--primary-text-color); }
.fc .fq { background:color-mix(in srgb, #43a047 20%, transparent); color:var(--primary-text-color); }
.fc .ffz { background:color-mix(in srgb, #4fc3f7 22%, transparent); color:var(--primary-text-color); }
.fr .fa { display:flex; gap:6px; }
.btn[disabled] { opacity:.45; cursor:default; }
@media (max-width: 600px) {
  .fr { grid-template-columns:48px 1fr auto; }
  .fr .fth { display:none; }
  .fr.off { grid-template-columns:48px 1fr auto; }
  .fr .fa { flex-direction:column; }
}
.erh { display:grid; grid-template-columns:86px 1fr 132px 40px 40px 34px; gap:6px; font-size:11px; font-weight:700; color:var(--secondary-text-color); text-transform:uppercase; letter-spacing:.5px; margin-bottom:4px; }
@media (max-width: 600px) {
  .er, .erh { grid-template-columns:60px 1fr 38px 38px 28px; }
  .erh .ha { display:none; }
  .er { row-gap:4px; padding-bottom:8px; margin-bottom:8px; border-bottom:1px solid var(--divider-color); }
  .er select.i { grid-row:2; grid-column:2 / -1; height:34px; font-size:13.5px; }
  .nut { grid-template-columns:auto 1fr; }
  .row2 { grid-template-columns:1fr 1fr; }
}
`;

// Meal pictures, roughly grouped: mains, meat and fish, Asian, breakfast and baking, veg and fruit, treats. Any other emoji can be typed in.
const EMOJI = [
  "🍝", "🍛", "🍲", "🥘", "🫕", "🍜", "🍕", "🍔", "🌭", "🌮", "🌯", "🫔", "🥙", "🥪", "🧆", "🥗", "🥧", "🍟", "🥫",
  "🍗", "🍖", "🥩", "🥓", "🐔", "🐄", "🐖", "🐑", "🐟", "🐠", "🍤", "🦐", "🦑", "🦀", "🦞", "🦪", "🐙",
  "🍣", "🍱", "🍙", "🍚", "🍘", "🥟", "🥠", "🥡", "🍢", "🍥",
  "🍳", "🥚", "🥞", "🧇", "🥯", "🥐", "🍞", "🥖", "🫓", "🥨", "🧀", "🧈", "🥣",
  "🥔", "🍠", "🎃", "🥕", "🌽", "🥦", "🥬", "🥒", "🫑", "🌶️", "🍅", "🍆", "🥑", "🧄", "🧅", "🍄", "🫘", "🥜", "🌰", "🍋", "🍎", "🍓", "🫐", "🍌",
  "🍰", "🎂", "🧁", "🍪", "🍩", "🍮", "🍨", "🍦", "🥧", "🍫", "🍿", "🥤", "☕", "🍷", "🍺", "🔥", "⭐", "❤️",
];

// Suggested ingredients for meals that have none yet, matched on the meal's name (first match wins, so specific
// names sit above general words). Same line format as a saved meal: "qty | name | aisle", "*" = pantry staple.
// Built into the card, so suggestions need no internet or AI service.
const SUGGEST = [
  [/butter\s*sausage/, "8 | Sausages | Meat & Fish; 1 | Onion | Produce; 3 cloves | Garlic | Produce; 1 jar | Butter chicken sauce | Pantry; 1 tin | Chopped tomatoes | Pantry; 200 ml | Cream | Dairy & Eggs; 1 bunch | Coriander | Produce; * 2 cups | Rice | Pantry; 1 pack | Naan bread | Bakery"],
  [/butter\s*chicken/, "1 kg | Chicken thighs | Meat & Fish; 1 | Onion | Produce; 3 cloves | Garlic | Produce; 1 tbsp | Ginger | Produce; 1 tin | Tomato puree | Pantry; 300 ml | Cream | Dairy & Eggs; * 50 g | Butter | Dairy & Eggs; * 2 tbsp | Garam masala | Pantry; * 1 tsp | Ground cumin | Pantry; * 1 tsp | Chilli powder | Pantry; 1 bunch | Coriander | Produce; * 2 cups | Rice | Pantry; 1 pack | Naan bread | Bakery"],
  [/thai.*fish|fish.*curry/, "600 g | White fish fillets | Meat & Fish; 2 tbsp | Thai red curry paste | Pantry; 1 tin | Coconut milk | Pantry; 1 | Red capsicum | Produce; 1 head | Broccoli | Produce; 1 | Lime | Produce; * 1 tbsp | Fish sauce | Pantry; * 1 tsp | Brown sugar | Pantry; 1 bunch | Coriander | Produce; * 2 cups | Jasmine rice | Pantry"],
  [/vindaloo/, "1 kg | Pork shoulder or lamb | Meat & Fish; 2 | Onion | Produce; 4 cloves | Garlic | Produce; 1 tbsp | Ginger | Produce; 1 jar | Vindaloo paste | Pantry; 1 tin | Chopped tomatoes | Pantry; 2 | Potatoes | Produce; * 2 tbsp | Vinegar | Pantry; 1 tub | Natural yoghurt | Dairy & Eggs; * 2 cups | Rice | Pantry; 1 pack | Naan bread | Bakery"],
  [/chill?i/, "500 g | Beef mince | Meat & Fish; 1 | Onion | Produce; 2 cloves | Garlic | Produce; 1 | Red capsicum | Produce; 1 tin | Kidney beans | Pantry; 1 tin | Chopped tomatoes | Pantry; * 2 tbsp | Tomato paste | Pantry; * 2 tsp | Ground cumin | Pantry; * 1 tsp | Chilli powder | Pantry; * 1 tsp | Smoked paprika | Pantry; 1 tub | Sour cream | Dairy & Eggs; 1 cup | Grated cheese | Dairy & Eggs; * 2 cups | Rice | Pantry"],
  [/lamb\s*shank/, "4 | Lamb shanks | Meat & Fish; 1 | Onion | Produce; 2 | Carrots | Produce; 2 sticks | Celery | Produce; 4 cloves | Garlic | Produce; 1 tin | Chopped tomatoes | Pantry; 2 cups | Beef stock | Pantry; 1 cup | Red wine | Snacks & Drinks; * 2 tbsp | Tomato paste | Pantry; * 2 sprigs | Rosemary | Produce; 1.2 kg | Potatoes | Produce; * 50 g | Butter | Dairy & Eggs; * 0.5 cup | Milk | Dairy & Eggs; 1 bag | Frozen peas | Frozen"],
  [/lamb\s*rag[uù]|rag[uù]/, "800 g | Lamb shoulder or mince | Meat & Fish; 1 | Onion | Produce; 1 | Carrot | Produce; 2 sticks | Celery | Produce; 3 cloves | Garlic | Produce; 2 tins | Chopped tomatoes | Pantry; 1 cup | Red wine | Snacks & Drinks; 1 cup | Beef stock | Pantry; * 2 tbsp | Tomato paste | Pantry; * 2 sprigs | Rosemary | Produce; 500 g | Pappardelle or rigatoni | Pantry; 1 wedge | Parmesan | Dairy & Eggs"],
  [/meat\s*curry|\bcurry/, "800 g | Beef or lamb, diced | Meat & Fish; 2 | Onion | Produce; 3 cloves | Garlic | Produce; 1 tbsp | Ginger | Produce; 1 jar | Curry paste | Pantry; 1 tin | Chopped tomatoes | Pantry; 1 tin | Coconut milk | Pantry; 2 | Potatoes | Produce; 1 bag | Baby spinach | Produce; * 2 cups | Rice | Pantry; 1 pack | Naan bread | Bakery"],
  [/steak/, "4 | Sirloin or scotch fillet steaks | Meat & Fish; 4 | Eggs | Dairy & Eggs; 1 bag | Frozen oven chips | Frozen; 1 bag | Salad leaves | Produce; 2 | Tomatoes | Produce; * 2 tbsp | Butter | Dairy & Eggs; * 1 tbsp | Olive oil | Pantry"],
  [/bolognai?se|spag/, "500 g | Beef mince | Meat & Fish; 1 | Onion | Produce; 1 | Carrot | Produce; 2 cloves | Garlic | Produce; 2 tins | Chopped tomatoes | Pantry; * 2 tbsp | Tomato paste | Pantry; * 1 tsp | Dried oregano | Pantry; 500 g | Spaghetti | Pantry; 1 wedge | Parmesan | Dairy & Eggs"],
  [/carbonara/, "500 g | Spaghetti | Pantry; 200 g | Streaky bacon or pancetta | Meat & Fish; 4 | Eggs | Dairy & Eggs; 1 cup | Grated Parmesan | Dairy & Eggs; 2 cloves | Garlic | Produce; * 1 tsp | Cracked black pepper | Pantry"],
  [/chicken.*bacon.*corn|bacon.*corn/, "500 g | Chicken breast | Meat & Fish; 200 g | Bacon | Meat & Fish; 1 tin | Creamed corn | Pantry; 1 cup | Frozen corn | Frozen; 300 ml | Cream | Dairy & Eggs; 2 cloves | Garlic | Produce; 1 bag | Baby spinach | Produce; 500 g | Penne | Pantry; 1 cup | Grated cheese | Dairy & Eggs"],
  [/pasta\s*salad/, "500 g | Spiral pasta | Pantry; 1 | Red capsicum | Produce; 1 | Cucumber | Produce; 1 punnet | Cherry tomatoes | Produce; 1 | Red onion | Produce; 200 g | Ham | Meat & Fish; 1 cup | Frozen corn | Frozen; 0.5 cup | Mayonnaise | Pantry; 1 block | Feta | Dairy & Eggs"],
  [/chicken.*rice|rice.*cucumber/, "800 g | Chicken thighs | Meat & Fish; * 2 cups | Rice | Pantry; 2 | Cucumber | Produce; 1 bunch | Spring onion | Produce; 2 cloves | Garlic | Produce; * 3 tbsp | Soy sauce | Pantry; * 2 tbsp | Honey | Pantry; * 1 tbsp | Sesame oil | Pantry; * 1 tbsp | Rice vinegar | Pantry; * 1 tbsp | Sesame seeds | Pantry"],
  [/devil+ed/, "8 | Sausages | Meat & Fish; 1 | Onion | Produce; 1 | Apple | Produce; 1 tin | Chopped tomatoes | Pantry; * 2 tbsp | Worcestershire sauce | Pantry; * 2 tbsp | Brown sugar | Pantry; * 1 tbsp | Curry powder | Pantry; * 1 tbsp | Vinegar | Pantry; 1 cup | Beef stock | Pantry; 1.2 kg | Potatoes | Produce; 1 bag | Frozen peas | Frozen"],
  [/bangers|sausage/, "8 | Sausages | Meat & Fish; 1.2 kg | Potatoes | Produce; 2 | Onion | Produce; * 50 g | Butter | Dairy & Eggs; * 0.5 cup | Milk | Dairy & Eggs; 1 sachet | Gravy mix | Pantry; 1 bag | Frozen peas | Frozen"],
  [/meatball/, "500 g | Beef or pork mince | Meat & Fish; 1 | Egg | Dairy & Eggs; 0.5 cup | Breadcrumbs | Pantry; 1 | Onion | Produce; 3 cloves | Garlic | Produce; 1 | Red capsicum | Produce; 2 tins | Chopped tomatoes | Pantry; * 2 tsp | Smoked paprika | Pantry; * 1 tsp | Ground cumin | Pantry; 1 bunch | Parsley | Produce; 1 | Crusty bread | Bakery"],
  [/chicken\s*noodle/, "500 g | Chicken thighs | Meat & Fish; 1.5 L | Chicken stock | Pantry; 2 | Carrots | Produce; 2 sticks | Celery | Produce; 1 | Onion | Produce; 2 cloves | Garlic | Produce; 200 g | Egg noodles | Pantry; 1 bunch | Parsley | Produce"],
  [/pumpkin|kumara/, "1 kg | Pumpkin | Produce; 500 g | Kumara | Produce; 1 | Onion | Produce; 2 cloves | Garlic | Produce; 1 L | Vegetable stock | Pantry; 200 ml | Cream | Dairy & Eggs; * 1 tsp | Ground cumin | Pantry; 1 | Crusty bread | Bakery"],
  [/toastie/, "1 loaf | Bread | Bakery; 2 cups | Grated cheese | Dairy & Eggs; * 2 tbsp | Butter | Dairy & Eggs; 4 tins | Soup | Pantry; 100 g | Ham | Meat & Fish"],
  [/nacho/, "500 g | Beef mince | Meat & Fish; 1 | Onion | Produce; 1 tin | Kidney beans | Pantry; 1 sachet | Taco seasoning | Pantry; 1 tin | Chopped tomatoes | Pantry; 1 bag | Corn chips | Snacks & Drinks; 2 cups | Grated cheese | Dairy & Eggs; 1 tub | Sour cream | Dairy & Eggs; 1 jar | Salsa | Pantry; 1 | Avocado | Produce"],
  [/fajita/, "600 g | Chicken breast or beef strips | Meat & Fish; 2 | Capsicums | Produce; 1 | Red onion | Produce; 1 sachet | Fajita seasoning | Pantry; 1 pack | Tortillas | Bakery; 1 tub | Sour cream | Dairy & Eggs; 1 cup | Grated cheese | Dairy & Eggs; 1 | Avocado | Produce; 1 | Lime | Produce; 1 bag | Lettuce | Produce"],
  [/taco/, "500 g | Beef mince | Meat & Fish; 1 sachet | Taco seasoning | Pantry; 1 pack | Taco shells or tortillas | Pantry; 1 | Iceberg lettuce | Produce; 2 | Tomatoes | Produce; 1 | Avocado | Produce; 1 cup | Grated cheese | Dairy & Eggs; 1 tub | Sour cream | Dairy & Eggs; 1 jar | Salsa | Pantry"],
  [/pesto.*salmon|salmon/, "4 | Salmon fillets | Meat & Fish; 3 tbsp | Basil pesto | Pantry; 200 ml | Cream | Dairy & Eggs; 2 cloves | Garlic | Produce; 1 bag | Baby spinach | Produce; 1 punnet | Cherry tomatoes | Produce; 1.2 kg | Potatoes | Produce; * 50 g | Butter | Dairy & Eggs; * 0.5 cup | Milk | Dairy & Eggs; 1 | Lemon | Produce"],
  [/stir\s*fry/, "500 g | Chicken, beef or pork strips | Meat & Fish; 1 bag | Stir fry vegetables | Produce; 2 cloves | Garlic | Produce; 1 tbsp | Ginger | Produce; * 3 tbsp | Soy sauce | Pantry; 2 tbsp | Oyster sauce | Pantry; * 1 tbsp | Sesame oil | Pantry; 400 g | Hokkien noodles | Pantry; 1 bunch | Spring onion | Produce"],
  [/roast/, "1.8 kg | Whole chicken, lamb or pork roast | Meat & Fish; 1.5 kg | Potatoes | Produce; 500 g | Kumara | Produce; 500 g | Pumpkin | Produce; 3 | Carrots | Produce; 1 | Onion | Produce; 1 bag | Frozen peas | Frozen; 1 sachet | Gravy mix | Pantry; * 2 tbsp | Olive oil | Pantry; * 2 sprigs | Rosemary | Produce"],
  [/sandwich/, "1 loaf | Bread | Bakery; 200 g | Sliced ham or chicken | Meat & Fish; 1 | Lettuce | Produce; 2 | Tomatoes | Produce; 1 | Cucumber | Produce; 1 pack | Cheese slices | Dairy & Eggs; * 2 tbsp | Butter | Dairy & Eggs; * 2 tbsp | Mayonnaise | Pantry"],
  [/gnocchi/, "1 kg | Potato gnocchi | Pantry; 200 g | Bacon | Meat & Fish; 2 cloves | Garlic | Produce; 300 ml | Cream | Dairy & Eggs; 1 bag | Baby spinach | Produce; 1 punnet | Mushrooms | Produce; 1 wedge | Parmesan | Dairy & Eggs"],
  [/tortellini|ravioli/, "2 packs | Fresh tortellini | Dairy & Eggs; 1 jar | Tomato pasta sauce | Pantry; 2 cloves | Garlic | Produce; 1 bag | Baby spinach | Produce; 1 wedge | Parmesan | Dairy & Eggs; 1 bunch | Basil | Produce"],
  [/eggplant|aubergine/, "600 g | Chicken thighs | Meat & Fish; 2 | Eggplant | Produce; 1 | Onion | Produce; 3 cloves | Garlic | Produce; 1 tin | Chopped tomatoes | Pantry; 1 cup | Grated mozzarella | Dairy & Eggs; 1 wedge | Parmesan | Dairy & Eggs; 1 bunch | Basil | Produce; * 2 tbsp | Olive oil | Pantry"],
  [/garbanzo|garabanzo|chickpea/, "2 tins | Chickpeas | Pantry; 1 | Onion | Produce; 3 cloves | Garlic | Produce; 1 tbsp | Ginger | Produce; 1 tin | Chopped tomatoes | Pantry; 1 tin | Coconut milk | Pantry; 1 bag | Baby spinach | Produce; * 2 tsp | Garam masala | Pantry; * 1 tsp | Ground cumin | Pantry; * 2 cups | Rice | Pantry"],
  [/risott|regretto/, "1.5 cups | Arborio rice | Pantry; 1.2 L | Chicken stock | Pantry; 1 | Onion | Produce; 2 cloves | Garlic | Produce; 1 punnet | Mushrooms | Produce; 300 g | Chicken breast | Meat & Fish; 0.5 cup | White wine | Snacks & Drinks; 1 wedge | Parmesan | Dairy & Eggs; * 2 tbsp | Butter | Dairy & Eggs; 1 bag | Frozen peas | Frozen"],
  [/marry\s*me/, "4 | Chicken breasts | Meat & Fish; 3 cloves | Garlic | Produce; 0.5 cup | Sun-dried tomatoes | Pantry; 300 ml | Cream | Dairy & Eggs; 1 cup | Chicken stock | Pantry; 0.5 cup | Grated Parmesan | Dairy & Eggs; 1 bag | Baby spinach | Produce; * 1 tsp | Dried Italian herbs | Pantry; 500 g | Pasta or rice | Pantry"],
  [/lasagne|lasagna/, "1 kg | Beef mince | Meat & Fish; 1 | Onion | Produce; 2 cloves | Garlic | Produce; 2 tins | Chopped tomatoes | Pantry; 1 pack | Lasagne sheets | Pantry; 600 ml | Milk | Dairy & Eggs; 2 cups | Grated cheese | Dairy & Eggs; * 50 g | Butter | Dairy & Eggs; * 0.25 cup | Flour | Pantry"],
  [/pizza/, "2 | Pizza bases | Bakery; 0.5 cup | Pizza sauce | Pantry; 2 cups | Grated mozzarella | Dairy & Eggs; 150 g | Ham or pepperoni | Meat & Fish; 1 | Capsicum | Produce; 1 punnet | Mushrooms | Produce"],
  [/burger/, "500 g | Beef mince | Meat & Fish; 4 | Burger buns | Bakery; 1 pack | Cheese slices | Dairy & Eggs; 1 | Lettuce | Produce; 2 | Tomatoes | Produce; 1 | Red onion | Produce; * 2 tbsp | Tomato sauce | Pantry"],
  [/pie/, "2 sheets | Puff pastry | Frozen; 500 g | Beef mince | Meat & Fish; 1 | Onion | Produce; 1 sachet | Gravy mix | Pantry; 1 bag | Frozen mixed veg | Frozen; 1 | Egg | Dairy & Eggs"],
  [/soup/, "1 L | Stock | Pantry; 1 | Onion | Produce; 2 | Carrots | Produce; 2 sticks | Celery | Produce; 2 cloves | Garlic | Produce; 1 tin | Chopped tomatoes | Pantry; 1 | Crusty bread | Bakery"],
  [/noodle|pad\s*thai|ramen/, "400 g | Noodles | Pantry; 400 g | Chicken or pork | Meat & Fish; 1 bag | Stir fry vegetables | Produce; 2 cloves | Garlic | Produce; * 3 tbsp | Soy sauce | Pantry; 1 bunch | Spring onion | Produce; 1 | Lime | Produce"],
  [/pasta|penne|fettuccine|macaroni/, "500 g | Pasta | Pantry; 1 jar | Pasta sauce | Pantry; 2 cloves | Garlic | Produce; 1 | Onion | Produce; 1 bag | Baby spinach | Produce; 1 wedge | Parmesan | Dairy & Eggs"],
  [/salad/, "1 bag | Salad leaves | Produce; 1 | Cucumber | Produce; 1 punnet | Cherry tomatoes | Produce; 1 | Avocado | Produce; 1 block | Feta | Dairy & Eggs; * 2 tbsp | Olive oil | Pantry"],
];
function suggestFor(name) {
  const n = String(name || "").toLowerCase().replace(/&/g, " and ");
  if (!n.trim()) return null;
  const hit = SUGGEST.find(([re]) => re.test(n)); if (!hit) return null;
  return hit[1].split(";").map((l) => {
    l = l.trim(); let staple = false;
    if (l.startsWith("*")) { staple = true; l = l.slice(1).trim(); }
    const [qty, nm, aisle] = l.split("|").map((x) => x.trim());
    return { qty, name: nm, aisle: aisle || guessAisle(nm), staple };
  });
}

const PLACEHOLDER_MEALS = [
  { name: "Spaghetti Bolognese", emoji: "🍝", tags: ["Pasta", "Family"], serves: "4", mins: "40", ingredients: [
    ["500 g", "Beef mince", "Meat & Fish"], ["1", "Brown onion", "Produce"], ["2 cloves", "Garlic", "Produce"], ["1", "Carrot", "Produce"],
    ["700 g", "Passata", "Pantry"], ["500 g", "Spaghetti", "Pantry"], ["50 g", "Parmesan", "Dairy & Eggs"], ["*2 tbsp", "Olive oil", "Pantry"], ["*1 tsp", "Dried oregano", "Pantry"]],
    notes: "Placeholder meal. Simmer the sauce for at least 20 minutes." },
  { name: "Butter Chicken", emoji: "🍛", tags: ["Curry", "Family"], serves: "4", mins: "45", ingredients: [
    ["800 g", "Chicken thighs", "Meat & Fish"], ["1 jar", "Butter chicken sauce", "Pantry"], ["300 ml", "Cream", "Dairy & Eggs"],
    ["2 cups", "Basmati rice", "Pantry"], ["4", "Naan bread", "Bakery"], ["1 bunch", "Coriander", "Produce"]], notes: "Placeholder meal." },
  { name: "Beef Tacos", emoji: "🌮", tags: ["Mexican", "Quick"], serves: "4", mins: "25", ingredients: [
    ["500 g", "Beef mince", "Meat & Fish"], ["1", "Taco kit", "Pantry"], ["1", "Iceberg lettuce", "Produce"], ["2", "Tomato", "Produce"],
    ["1", "Avocado", "Produce"], ["200 g", "Grated cheese", "Dairy & Eggs"], ["250 g", "Sour cream", "Dairy & Eggs"]], notes: "Placeholder meal." },
  { name: "Roast Chicken & Veg", emoji: "🍗", tags: ["Roast", "Sunday"], serves: "5", mins: "90", ingredients: [
    ["1.6 kg", "Whole chicken", "Meat & Fish"], ["1 kg", "Potatoes", "Produce"], ["500 g", "Pumpkin", "Produce"], ["2", "Kumara", "Produce"],
    ["1 bag", "Frozen peas", "Frozen"], ["*1 tbsp", "Gravy granules", "Pantry"]], notes: "Placeholder meal." },
  { name: "Homemade Pizza", emoji: "🍕", tags: ["Family", "Fun"], serves: "4", mins: "35", ingredients: [
    ["2", "Pizza bases", "Bakery"], ["1 jar", "Pizza sauce", "Pantry"], ["300 g", "Mozzarella", "Dairy & Eggs"], ["150 g", "Pepperoni", "Meat & Fish"],
    ["1", "Capsicum", "Produce"], ["100 g", "Mushrooms", "Produce"]], notes: "Placeholder meal." },
  { name: "Salmon Poke Bowls", emoji: "🍣", tags: ["Healthy", "Quick"], serves: "2", mins: "20", ingredients: [
    ["300 g", "Salmon fillet", "Meat & Fish"], ["1 cup", "Sushi rice", "Pantry"], ["1", "Cucumber", "Produce"], ["1", "Avocado", "Produce"],
    ["1 bag", "Edamame", "Frozen"], ["*2 tbsp", "Soy sauce", "Pantry"]], notes: "Placeholder meal." },
  { name: "Chicken Stir-fry", emoji: "🥡", tags: ["Asian", "Quick"], serves: "4", mins: "20", ingredients: [
    ["500 g", "Chicken breast", "Meat & Fish"], ["1 pack", "Stir-fry vegetables", "Produce"], ["2 packs", "Hokkien noodles", "Pantry"],
    ["1 knob", "Ginger", "Produce"], ["*3 tbsp", "Oyster sauce", "Pantry"]], notes: "Placeholder meal." },
  { name: "Shepherd's Pie", emoji: "🥧", tags: ["Comfort"], serves: "6", mins: "70", ingredients: [
    ["500 g", "Lamb mince", "Meat & Fish"], ["1 kg", "Potatoes", "Produce"], ["1", "Brown onion", "Produce"], ["2", "Carrot", "Produce"],
    ["1 bag", "Frozen peas", "Frozen"], ["50 g", "Butter", "Dairy & Eggs"], ["*1 tbsp", "Worcestershire sauce", "Pantry"]], notes: "Placeholder meal." },
  { name: "Fish & Chips Friday", emoji: "🐟", tags: ["Treat"], serves: "4", mins: "30", ingredients: [
    ["600 g", "Tarakihi fillets", "Meat & Fish"], ["1 kg", "Frozen chips", "Frozen"], ["2", "Lemon", "Produce"], ["1 bag", "Coleslaw mix", "Produce"],
    ["*1 jar", "Tartare sauce", "Pantry"]], notes: "Placeholder meal." },
  { name: "Smash Burgers", emoji: "🍔", tags: ["BBQ", "Family"], serves: "4", mins: "25", ingredients: [
    ["500 g", "Beef mince", "Meat & Fish"], ["4", "Burger buns", "Bakery"], ["8", "Cheese slices", "Dairy & Eggs"], ["1", "Tomato", "Produce"],
    ["1", "Iceberg lettuce", "Produce"], ["1", "Red onion", "Produce"], ["*1 bottle", "Tomato sauce", "Pantry"]], notes: "Placeholder meal." },
  { name: "Pumpkin Soup", emoji: "🎃", tags: ["Vegetarian", "Comfort"], serves: "6", mins: "50", ingredients: [
    ["1.5 kg", "Pumpkin", "Produce"], ["1", "Brown onion", "Produce"], ["1 L", "Vegetable stock", "Pantry"], ["200 ml", "Cream", "Dairy & Eggs"],
    ["1 loaf", "Crusty bread", "Bakery"]], notes: "Placeholder meal." },
  { name: "Pancake Sunday", emoji: "🥞", tags: ["Breakfast", "Fun"], serves: "4", mins: "25", ingredients: [
    ["2 cups", "Flour", "Pantry"], ["2", "Eggs", "Dairy & Eggs"], ["500 ml", "Milk", "Dairy & Eggs"], ["1 punnet", "Blueberries", "Produce"],
    ["*1 bottle", "Maple syrup", "Pantry"]], notes: "Placeholder meal." },
];
function placeholderMeal(p) {
  return {
    name: p.name, emoji: p.emoji, img: "", tags: p.tags, serves: p.serves, mins: p.mins, plan: [], cooked: "", notes: p.notes || "",
    ingredients: p.ingredients.map(([q, n, a]) => ({ qty: q.replace(/^\*/, ""), name: n, aisle: a, staple: q.startsWith("*") })),
  };
}

function ago(d, t) {
  if (!d) return "Not had yet";
  const n = daysBetween(d, t);
  if (n <= 0) return "Had today";
  if (n === 1) return "Had yesterday";
  if (n < 14) return "Had " + n + " days ago";
  if (n < 60) return "Had " + Math.round(n / 7) + " weeks ago";
  return "Had " + Math.round(n / 30) + " months ago";
}

class MealPlannerCard extends MPBase {
  setConfig(config) {
    if (!config || !config.meals_entity) throw new Error("meal-planner-card: meals_entity is required (a todo.* list)");
    this._cfg = Object.assign({ title: "Meals", shopping_entity: null, busy_calendars: ["calendar.cherisha_work"], busy_label: "Cherisha working",
      busy_from: "16:00", busy_to: "19:30", quick_mins: 30, defrost_time: "06:00" }, config);
    if (Array.isArray(config.aisles) && config.aisles.length) this._aisles = config.aisles;
    this._meals = null; this._shop = []; this._q = ""; this._tag = "All"; this._wk = 0;
  }
  getCardSize() { return 14; }
  getGridOptions() { return { columns: "full", rows: "auto" }; }

  _start() {
    this._started = true;
    this._feeds = [];
    this._mf = new TodoFeed(this._cfg.meals_entity, (items, err) => {
      this._err = err || null;
      this._meals = items ? items.map(parseMeal).sort((a, b) => a.name.localeCompare(b.name)) : (this._meals || []);
      this._paint();
      if (this._sheet && this._sheet.kind === "meal") this._sheetMeal(this._sheet.uid, true);
    });
    this._feeds.push(this._mf);
    if (this._cfg.shopping_entity) {
      this._sf = new TodoFeed(this._cfg.shopping_entity, (items) => {
        this._shop = items ? items.map(parseShop) : this._shop;
        if (this._sheet && this._sheet.kind === "meal") this._sheetMeal(this._sheet.uid, true);
      });
      this._feeds.push(this._sf);
    }
    for (const f of this._feeds) f.start(this._hass);
    if (!this._timer) this._timer = setInterval(() => { if (today() !== this._t) this._paint(); }, 60000);
    this._build();
  }

  _build() {
    if (this._built) return;
    this._built = true;
    this.shadowRoot.innerHTML = `<style>${PL_STYLE}</style><ha-card><div id="body"></div></ha-card>`;
    const card = this.shadowRoot.querySelector("ha-card");
    card.addEventListener("click", (e) => {
      if (this._noClick) { this._noClick = false; e.stopPropagation(); return; }
      const b = e.target.closest("[data-a]"); if (b) this._act(b.dataset.a, b);
    });
    card.addEventListener("input", (e) => { if (e.target.id === "q") { this._q = e.target.value; this._paintLib(); } });
    this._dragSetup(card);
    this._paint();
  }

  // ---------- drag a meal idea onto a night ----------
  // Pointer events rather than HTML5 drag and drop, which does nothing on a touchscreen.

  _dragSetup(card) {
    card.addEventListener("pointerdown", (e) => {
      if (e.button > 0 || this._drag) return;
      const tile = e.target.closest(".lib .ml[data-uid]"); if (!tile) return;
      const touch = e.pointerType !== "mouse";
      const g = this._drag = { uid: tile.dataset.uid, tile, id: e.pointerId, x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, on: false };
      if (touch) g.timer = setTimeout(() => { if (this._drag === g) this._dragStart(); }, 280);
    });
    window.addEventListener("pointermove", (e) => {
      const g = this._drag; if (!g || e.pointerId !== g.id) return;
      g.x = e.clientX; g.y = e.clientY;
      const far = Math.hypot(g.x - g.x0, g.y - g.y0) > 8;
      if (!g.on) {
        if (!far) return;
        if (e.pointerType === "mouse") this._dragStart(); else { this._dragEnd(); return; }  // a swipe before the hold: let it scroll
      }
      this._dragMove();
    });
    window.addEventListener("pointerup", (e) => { const g = this._drag; if (g && e.pointerId === g.id) this._dragEnd(true); });
    window.addEventListener("pointercancel", (e) => { const g = this._drag; if (g && e.pointerId === g.id) this._dragEnd(); });
    // Once a held tile is lifted, stop the finger from scrolling the page.
    card.addEventListener("touchmove", (e) => { if (this._drag && this._drag.on) e.preventDefault(); }, { passive: false });
    card.addEventListener("contextmenu", (e) => { if (this._drag) e.preventDefault(); });
  }

  _dragStart() {
    const g = this._drag; const m = this._meal(g.uid); if (!m) { this._dragEnd(); return; }
    g.on = true;
    g.tile.classList.add("lift");
    this.shadowRoot.querySelector("ha-card").classList.add("dragging");
    const gh = g.ghost = document.createElement("div"); gh.className = "ghost";
    gh.innerHTML = thumb(m) + `<div class="n">${esc(m.name)}</div>`;
    this.shadowRoot.appendChild(gh);
    if (navigator.vibrate) try { navigator.vibrate(15); } catch (e) { /* not allowed */ }
    this._dragMove();
  }

  _dragMove() {
    const g = this._drag; if (!g || !g.on) return;
    g.ghost.style.left = g.x + "px"; g.ghost.style.top = g.y + "px";
    const el = this.shadowRoot.elementFromPoint(g.x, g.y);
    const dy = el && el.closest(".dy");
    const over = dy && !dy.classList.contains("past") ? dy : null;
    if (over !== g.over) { if (g.over) g.over.classList.remove("over"); if (over) over.classList.add("over"); g.over = over; }
    // Near the top or bottom of the screen, scroll so the week strip can be reached from far down the library.
    const edge = 70, h = window.innerHeight;
    const v = g.y < edge ? -(edge - g.y) / 4 : g.y > h - edge ? (g.y - (h - edge)) / 4 : 0;
    if (v && !g.raf) {
      const step = () => {
        const d = this._drag; if (!d || !d.on) return;
        const vv = d.y < edge ? -(edge - d.y) / 4 : d.y > h - edge ? (d.y - (h - edge)) / 4 : 0;
        if (!vv) { d.raf = 0; return; }
        this._scroller().scrollBy(0, vv); this._dragMoveNoScroll(); d.raf = requestAnimationFrame(step);
      };
      g.raf = requestAnimationFrame(step);
    }
    // On a phone the week strip scrolls sideways; nudge it when the tile is near either end.
    const wk = this.shadowRoot.querySelector(".narrow .wk");
    if (wk) { const r = wk.getBoundingClientRect(); if (g.y > r.top && g.y < r.bottom) { if (g.x < r.left + 40) wk.scrollLeft -= 12; else if (g.x > r.right - 40) wk.scrollLeft += 12; } }
  }
  _dragMoveNoScroll() {
    const g = this._drag; const el = this.shadowRoot.elementFromPoint(g.x, g.y); const dy = el && el.closest(".dy");
    const over = dy && !dy.classList.contains("past") ? dy : null;
    if (over !== g.over) { if (g.over) g.over.classList.remove("over"); if (over) over.classList.add("over"); g.over = over; }
  }

  // The nearest ancestor that actually scrolls, crossing shadow roots (HA scrolls a view container, not always the window).
  _scroller() {
    let n = this;
    while (n) {
      n = n.parentNode || n.host;
      if (n && n.nodeType === 1) { const cs = getComputedStyle(n); if (/(auto|scroll)/.test(cs.overflowY) && n.scrollHeight > n.clientHeight) return n; }
      if (n === document) break;
    }
    return document.scrollingElement || document.documentElement;
  }

  async _dragEnd(drop) {
    const g = this._drag; if (!g) return;
    this._drag = null;
    clearTimeout(g.timer); if (g.raf) cancelAnimationFrame(g.raf);
    if (!g.on) return;
    this._noClick = true; setTimeout(() => { this._noClick = false; }, 400);
    g.tile.classList.remove("lift");
    if (g.ghost) g.ghost.remove();
    if (g.over) g.over.classList.remove("over");
    const card = this.shadowRoot.querySelector("ha-card"); if (card) card.classList.remove("dragging");
    if (!drop || !g.over) return;
    const d = g.over.dataset.d; const m = this._meal(g.uid); if (!m || !d) return;
    if (m.plan.includes(d)) { this._toast(`${m.name} is already on ${d === today() ? "tonight" : DOW_LONG[dowIdx(d)]}`); return; }
    await this._togglePlan(g.uid, d);
  }

  // ---------- painting ----------

  _paint() {
    if (!this._built) return;
    const t = this._t = today();
    const body = this.shadowRoot.getElementById("body");
    if (this._meals === null) { body.innerHTML = `<div class="mut">Loading meals…</div>`; return; }
    const ws = addDays(weekStart(t), this._wk * 7);
    const planned = (d) => this._meals.filter((m) => m.plan.includes(d));
    const tonight = planned(t);
    let nPlanned = 0;
    for (let i = 0; i < 7; i++) if (planned(addDays(ws, i)).length) nPlanned++;

    let tn;
    if (tonight.length) {
      const m = tonight[0];
      tn = `<div class="tn">${thumb(m).replace('class="th "', `class="th" data-a="open" data-uid="${esc(m.uid)}"`)}
        <div class="bd"><div class="k">Tonight · ${DOW_LONG[dowIdx(t)]}</div><div class="n">${esc(m.name)}</div>
        <div class="mt">${m.mins ? `<span class="chip">⏱ ${esc(m.mins)} min</span>` : ""}<span class="chip${factor(m, t) !== 1 ? " on" : ""}" data-a="day" data-d="${t}" style="cursor:pointer" title="Tap to change how many people">👥 For ${nightServes(m, t)} tonight</span>
        ${noIngs(m) ? `<span class="chip noi" data-a="open" data-uid="${esc(m.uid)}" style="cursor:pointer">⚠️ No ingredients</span>` : ""}${m.tags.map((x) => `<span class="chip">${esc(x)}</span>`).join("")}</div>
        ${tonight.length > 1 ? `<div class="mut" style="font-size:13px">Also: ${tonight.slice(1).map((x) => esc(x.name)).join(", ")}</div>` : ""}
        <div class="act">${m.cooked === t ? `<span class="chip" style="background:#43a04722;color:#43a047">✓ Cooked</span>` : `<button class="btn pri" data-a="cooked" data-uid="${esc(m.uid)}">✓ We had this</button>`}
        <button class="btn" data-a="open" data-uid="${esc(m.uid)}">Ingredients</button><button class="btn" data-a="day" data-d="${t}">Swap</button></div></div></div>`;
    } else {
      tn = `<div class="tn empty"><div class="bd"><div class="k">Tonight · ${DOW_LONG[dowIdx(t)]}</div><div class="n">Nothing planned yet</div>
        <div class="act"><button class="btn pri" data-a="day" data-d="${t}">Pick a meal</button><button class="btn" data-a="surprise">🎲 Surprise me</button></div></div></div>`;
    }

    let wk = "";
    for (let i = 0; i < 7; i++) {
      const d = addDays(ws, i); const ms = planned(d);
      const cls = "dy" + (d === t ? " td" : "") + (d < t ? " past" : "");
      const fz = d >= t && ms.some((m) => m.ingredients.some((x) => x.frozen));
      // The count for the meal shown on the tile; filled in when it isn't the usual number.
      const sv = ms[0];
      const head = `<div class="dh"><span class="dn">${d === t ? "Today" : DOW[i]}</span><span class="dd">${dayNum(d)} ${monShort(d)}</span>${fz ? `<span class="fz" title="Something to defrost">❄️</span>` : ""}</div>`;
      const svb = sv ? `<span class="svb${factor(sv, d) !== 1 ? " ch" : ""}" title="${esc(sv.name)} for ${nightServes(sv, d)}${factor(sv, d) !== 1 ? ` (usually ${servesN(sv)})` : ""}">👥 ${nightServes(sv, d)}</span>` : "";
      if (ms.length) {
        wk += `<div class="${cls}" data-a="day" data-d="${d}">${head}${thumb(ms[0])}${svb}<div class="mn">${hpill(ms[0])}${noIngs(ms[0]) ? `<span class="noi" title="No ingredients: nothing for it on the shopping list">⚠️ </span>` : ""}${esc(ms[0].name)}</div>${ms.length > 1 ? `<div class="more">+${ms.length - 1} more</div>` : ""}</div>`;
      } else {
        wk += `<div class="${cls}" data-a="day" data-d="${d}">${head}<div class="add">+</div></div>`;
      }
    }
    const nFill = this._fillDays().length;
    // The week's average health: every planned meal with a rating (yours or the estimate), each night's meals all counted.
    const wkH = []; for (let i = 0; i < 7; i++) for (const m of planned(addDays(ws, i))) { const h = healthOf(m); if (h) wkH.push(h.score); }
    const wkAvg = wkH.length ? wkH.reduce((a, b) => a + b, 0) / wkH.length : null;
    const wkB = wkAvg != null ? healthBand(Math.round(wkAvg)) : null;
    const wkLabel = this._wk === 0 ? "This week" : this._wk === 1 ? "Next week" : this._wk === -1 ? "Last week" : `Week of ${dayNum(ws)} ${monShort(ws)}`;

    const tags = ["All", ...new Set(this._meals.flatMap((m) => m.tags))];
    // Meals with nothing to shop for get their own filter, so they're easy to find and fill in.
    const nNoi = this._meals.filter(noIngs).length;
    if (this._tag === NOI && !nNoi) this._tag = "All";
    const shut = this._ideasShut();
    body.innerHTML = `
      ${this._err ? `<div class="warn">${esc(this._err)} Create a Local To-do list called “Meals” (Settings → Integrations → Local To-do).</div>` : ""}
      ${this._sf && this._hass.states[this._cfg.shopping_entity] && !this._sf.canDescribe() ? `<div class="warn">${esc(this._cfg.shopping_entity)} can’t store quantities or aisles. Point shopping_entity at a Local To-do list.</div>` : ""}
      ${tn}
      ${this._defrostHtml()}
      <div class="sec"><span class="l">${wkLabel}</span><span class="chip">${nPlanned}<span class="wl"> of 7 nights planned</span><span class="ws">/7</span></span>${wkB ? `<span class="chip hav" style="--hc:${wkB[2]}" title="Average health rating of the ${wkH.length} rated meal${wkH.length === 1 ? "" : "s"} planned this week (estimates, or your own rating where you set one)">🩺<span class="wl"> Avg</span> <b>${wkAvg.toFixed(1)}</b> · ${wkB[1]}</span>` : ""}<span class="sp"></span>
        ${nFill ? `<button class="btn sm fillb" data-a="fill" title="Draft dinners for the empty nights">✨ Fill my week</button>` : ""}
        <button class="btn sm ico" data-a="wk" data-k="-1" aria-label="Previous week">‹</button>
        ${this._wk ? `<button class="btn sm" data-a="wk" data-k="0">Today</button>` : ""}
        <button class="btn sm ico" data-a="wk" data-k="1" aria-label="Next week">›</button></div>
      <div class="wk">${wk}</div>
      ${nFill ? `<button class="btn fillb fillb2" data-a="fill">✨ Fill my week · ${nFill} empty night${nFill === 1 ? "" : "s"}</button>` : ""}
      <div class="sec"><span class="l fold" data-a="ideas" role="button" aria-expanded="${!shut}">${shut ? "▸" : "▾"} Meal ideas</span><span class="chip" data-a="ideas" style="cursor:pointer">${this._meals.length}</span><span class="sp"></span>
        ${shut ? "" : `<span class="hint">Drag one onto a night to plan it</span>`}<button class="btn sm" data-a="new">＋ New meal</button></div>
      ${shut ? `<div class="shut mut" data-a="ideas">Meal ideas are folded away. Tap to show all ${this._meals.length}.</div>` : `<div class="fl"><input class="i" id="q" placeholder="Search meals or ingredients" value="${esc(this._q)}">
        <div class="tgw">${this._rowHtml("tg", tags.map((x) => `<span class="chip${x === this._tag ? " on" : ""}" data-a="tag" data-t="${esc(x)}">${esc(x)}</span>`).join("")
          + (nNoi ? `<span class="chip noi${this._tag === NOI ? " on" : ""}" data-a="tag" data-t="${NOI}" title="Meals with no ingredients: planning them adds nothing to the shopping list">⚠️ No ingredients · ${nNoi}</span>` : ""), "tg")}</div></div>
      <div id="lib"></div>`}`;
    this._paintLib();
    this._resize();
    this._scrollToday();
  }

  // On a phone the week scrolls sideways; start it at today rather than Monday.
  _scrollToday() {
    const wk = this.shadowRoot.querySelector(".narrow .wk"); if (!wk) return;
    const td = wk.querySelector(".dy.td"); if (td) wk.scrollLeft = Math.max(0, td.offsetLeft - 16);
  }
  _resize() { super._resize(); this._scrollToday(); this._rows(); }

  _paintLib() {
    const el = this.shadowRoot.getElementById("lib"); if (!el) return;
    const t = this._t || today();
    if (!this._meals.length) {
      el.innerHTML = `<div class="empty-lib"><div style="font-size:40px">🍽️</div><p>No meals saved yet.</p>
        <button class="btn pri" data-a="new">＋ Add a meal</button> <button class="btn" data-a="seed">Load ${PLACEHOLDER_MEALS.length} example meals</button></div>`;
      return;
    }
    const q = this._q.trim().toLowerCase();
    const ws = weekStart(t);
    // Least recently had first, so meals we haven't had for a while are the ones on show; meals already planned ahead go last.
    const ahead = (m) => m.plan.some((d) => d > t) ? 1 : 0;
    const list = this._meals.filter((m) => (this._tag === "All" || (this._tag === NOI ? noIngs(m) : m.tags.includes(this._tag))) &&
      (!q || m.name.toLowerCase().includes(q) || m.ingredients.some((i) => i.name.toLowerCase().includes(q)) || m.tags.some((x) => x.toLowerCase().includes(q))))
      .sort((a, b) => ahead(a) - ahead(b) || lastHad(a, t).localeCompare(lastHad(b, t)) || a.name.localeCompare(b.name));
    el.innerHTML = `<div class="lib">${list.map((m) => {
      const next = m.plan.filter((d) => d >= t).sort()[0];
      const pin = next ? (next === t ? "Tonight" : daysBetween(ws, next) < 7 ? DOW[dowIdx(next)] : `${dayNum(next)} ${monShort(next)}`) : "";
      return `<div class="ml" data-a="open" data-uid="${esc(m.uid)}">${pin ? `<span class="pin">📅 ${pin}</span>` : ""}${popular(m, t) ? `<span class="pop" title="Popular in our house">🔥</span>` : ""}${thumb(m)}
        <div class="b"><div class="n">${esc(m.name)}</div><div class="m">${hpill(m)}${m.mins ? esc(m.mins) + " min · " : ""}${esc(ago(lastHad(m, t), t))}</div>${noIngs(m) ? `<div class="m noi">⚠️ No ingredients</div>` : ""}</div></div>`;
    }).join("")}<div class="ml new" data-a="new"><span class="plus">＋</span><span>New meal</span></div></div>
    ${list.length ? "" : `<p class="mut">No meals match.</p>`}`;
  }

  // ---------- actions ----------

  _meal(uid) { return (this._meals || []).find((m) => m.uid === uid); }

  // Folding Meal ideas is remembered on this screen, so the panel and a phone can differ.
  _ideasShut() { try { return localStorage.getItem("meal-planner-ideas-shut") === "1"; } catch (e) { return false; } }
  _ideasToggle() { const v = !this._ideasShut(); try { localStorage.setItem("meal-planner-ideas-shut", v ? "1" : "0"); } catch (e) { /* storage off */ } this._paint(); }

  // Today's frozen ingredients, until someone taps Taken out (remembered on this screen for today).
  _defrostList(d) {
    return this._meals.filter((m) => m.plan.includes(d)).flatMap((m) => m.ingredients.filter((x) => x.frozen).map((x) => ({ m, x: Object.assign({}, x, { qty: scaleQty(x.qty, factor(m, d)) }) })));
  }
  _defrostHtml() {
    const t = today(), list = this._defrostList(t);
    let off = false; try { off = localStorage.getItem("meal-planner-defrost") === t; } catch (e) { /* storage off */ }
    if (!list.length || off) return "";
    return `<div class="dfz"><span class="t">❄️ <b>Take out of the freezer:</b> ${list.map(({ m, x }) => `${esc(x.qty ? x.qty + " " : "")}${esc(x.name)} <span class="mut">(${esc(m.name)})</span>`).join(", ")}</span>
      <button class="btn sm" data-a="dfzok">✓ Taken out</button></div>`;
  }

  _act(a, b) {
    const uid = b.dataset.uid;
    if (a === "dfzok") { try { localStorage.setItem("meal-planner-defrost", today()); } catch (e) { /* storage off */ } this._paint(); return; }
    if (a === "open") this._sheetMeal(uid);
    else if (a === "srl" || a === "srr") this._rowScroll(b, a === "srr" ? 1 : -1);
    else if (a === "day") this._sheetPick(b.dataset.d);
    else if (a === "wk") { this._wk = b.dataset.k === "0" ? 0 : this._wk + Number(b.dataset.k); this._paint(); }
    else if (a === "tag") { this._tag = b.dataset.t; this._paint(); }
    else if (a === "new") this._sheetEdit(null);
    else if (a === "ideas") this._ideasToggle();
    else if (a === "fill") this._fillWeek();
    else if (a === "seed") this._seed();
    else if (a === "cooked") this._cooked(uid);
    else if (a === "surprise") {
      const t = today(); const ws = weekStart(t);
      const pool = this._meals.filter((m) => !m.plan.some((d) => d >= ws && d < addDays(ws, 7)));
      if (!pool.length) return;
      pool.sort((x, y) => lastHad(x, t).localeCompare(lastHad(y, t)));
      const pick = pool[Math.floor(Math.random() * Math.min(3, pool.length))];
      this._sheetMeal(pick.uid, false, "Haven’t had this for a while");
    }
  }

  async _seed() {
    for (const p of PLACEHOLDER_MEALS) {
      const m = placeholderMeal(p);
      await this._mf.call("add_item", { item: m.name, description: composeMeal(m) });
    }
    this._toast("Added " + PLACEHOLDER_MEALS.length + " example meals");
  }

  async _saveMeal(m) { await this._mf.call("update_item", { item: m.uid, rename: m.name, description: composeMeal(m) }); }

  async _cooked(uid) {
    const m = this._meal(uid); if (!m) return;
    m.cooked = today(); m.had = [...new Set([...(m.had || []), m.cooked])]; await this._saveMeal(m); this._toast("Enjoy! " + (m.emoji || ""));
  }

  // Plan or un-plan one night, and move that meal's share of the shopping list with it.
  async _togglePlan(uid, d, quiet) {
    const m = this._meal(uid); if (!m) return 0;
    const t = today();
    const on = !m.plan.includes(d);
    m.plan = on ? [...m.plan, d] : m.plan.filter((x) => x !== d);
    // had: keeps the history once old plans drop off, for Popular and the ideas order.
    m.had = [...new Set([...(m.had || []), ...m.plan])].filter((x) => (on || x !== d) && x >= addDays(t, -365));
    m.plan = m.plan.filter((x) => x >= addDays(t, -14));
    await this._saveMeal(m);
    if (!this._sf) return 0;
    const n = on ? await this._addShare(m, d, m.ingredients.filter((i) => !isPantry(i))) : await this._dropShare(m.name, d);
    if (quiet) return n;
    if (on) this._toast(`${m.emoji || ""} ${m.name} on ${d === t ? "tonight" : DOW_LONG[dowIdx(d)]} · ${n} item${n === 1 ? "" : "s"} added to the list`);
    else this._toast(`${m.name} taken off ${DOW_LONG[dowIdx(d)]}` + (n ? ` · ${n} item${n === 1 ? "" : "s"} removed` : ""));
    return n;
  }

  // One at a time, each starting from a fresh read of the list, so quick plans in a row can't add the same thing twice.
  // force: a tap on ＋ in the meal sheet. It goes on even if this night's line was ticked or taken off as "we have it".
  _addShare(m, d, ings, force) {
    const run = () => this._addShareNow(m, d, ings, force);
    this._shareQ = (this._shareQ || Promise.resolve()).then(run, run);
    return this._shareQ;
  }
  async _addShareNow(m, d, ings, force) {
    const fresh = await this._sf.fetch(); if (fresh) this._shop = fresh.map(parseShop);
    const open = this._shop.filter((s) => !s.done);
    const merged = new Map();
    for (const i of ings) {
      const k = normName(i.name);
      if (merged.has(k)) merged.get(k).qtys.push(i.qty); else merged.set(k, { i, qtys: [i.qty] });
    }
    let n = 0;
    const mine = (f) => f.meal === m.name && f.date === d, fx = factor(m, d);
    for (const [k, { i, qtys }] of merged) {
      const qty = sumQty(qtys.filter(Boolean).map((q) => scaleQty(q, fx))) || "1";
      if (!force && this._shop.some((s) => s.done && normName(s.name) === k && s.for.some(mine))) continue;
      // Taken off as "we have it" for this night: planning or saving the meal again doesn't put it back.
      if (!force && ISO.test(d) && this._shop.some((s) => !s.done && normName(s.name) === k && (s.have || []).some(mine))) continue;
      if (force) for (const s of open.filter((x) => normName(x.name) === k && (x.have || []).some(mine))) {
        s.have = s.have.filter((f) => !mine(f));
        if (s !== open.find((x) => normName(x.name) === k)) await this._sf.call("update_item", { item: s.uid, description: composeShop(s) });
      }
      const ex = open.find((s) => normName(s.name) === k);
      if (ex) {
        if (ex.for.some(mine)) continue;
        ex.for.push({ meal: m.name, date: d, qty });
        ex.have = (ex.have || []).filter((f) => !mine(f));
        await this._sf.call("update_item", { item: ex.uid, description: composeShop(ex) });
      } else {
        const nm = shopName(i.name);
        const s = { name: nm, qty: "", aisle: i.aisle || guessAisle(nm), for: [{ meal: m.name, date: d, qty }], have: [], notes: "" };
        await this._sf.call("add_item", { item: nm, description: composeShop(s) });
        open.push(Object.assign(s, { uid: null, done: false }));
      }
      n++;
    }
    return n;
  }

  async _dropShare(meal, d) {
    let n = 0;
    const mine = (f) => f.meal === meal && f.date === d;
    for (const s of this._shop.filter((x) => !x.done && (x.for.some(mine) || (x.have || []).some(mine)))) {
      const was = s.for.length;
      s.for = s.for.filter((f) => !mine(f)); s.have = (s.have || []).filter((f) => !mine(f));
      if (!s.for.length && !s.qty && !s.have.length) await this._sf.call("remove_item", { item: s.uid });
      else await this._sf.call("update_item", { item: s.uid, description: composeShop(s) });
      if (was > s.for.length) n++;
    }
    return n;
  }

  // ---------- sheets ----------

  _weekDays() { const ws = addDays(weekStart(today()), this._wk * 7); return Array.from({ length: 7 }, (_, i) => addDays(ws, i)); }

  _sheetMeal(uid, refresh, note) {
    const m = this._meal(uid);
    if (!m) { if (refresh) this._closeSheet(); return; }
    if (refresh && (!this._sheet || this._sheet.kind !== "meal")) return;
    const t = today();
    // A line counts as this meal's only when it carries a share for this meal; another meal's line for the same thing is shown, not ticked.
    const lines = (i) => this._shop.filter((s) => !s.done && !isGhost(s) && normName(s.name) === normName(i.name));
    const onList = (i) => lines(i).find((s) => s.for.some((f) => f.meal === m.name));
    const haveIt = (i) => this._shop.some((s) => !s.done && normName(s.name) === normName(i.name) && (s.have || []).some((f) => f.meal === m.name && f.date >= t));
    const others = (i) => [...new Set(lines(i).flatMap((s) => s.for.length ? s.for.filter((f) => f.meal !== m.name).map((f) => f.meal) : ["by hand"]))];
    const days = this._weekDays();
    const html = `
      <div class="hero"><button class="btn ico x" data-a="close" aria-label="Close">✕</button>${thumb(m)}</div>
      <div class="pad">
        ${note ? `<div class="chip" style="margin-bottom:8px">🎲 ${esc(note)}</div>` : ""}
        <h2>${esc(m.name)}</h2>
        <div class="mt2">${m.mins ? `<span class="chip">⏱ ${esc(m.mins)} min</span>` : ""}<span class="chip">👥 Serves ${servesN(m)}</span>
          ${m.tags.map((x) => `<span class="chip">${esc(x)}</span>`).join("")}<span class="chip">${esc(ago(lastHad(m, t), t))}</span>${popular(m, t) ? `<span class="chip pop2">🔥 Popular · ${eaten(m, t).filter((d) => d >= addDays(t, -POPULAR_DAYS)).length} times lately</span>` : ""}</div>
        ${this._nutHtml(m)}
        <h3>Plan it</h3>
        <div class="wkn"><span class="mut">Tap a night. Its ingredients go on the shopping list.</span><span class="sp"></span>
          <button class="btn sm ico" data-a="swk" data-k="-1">‹</button><button class="btn sm ico" data-a="swk" data-k="1">›</button></div>
        <div class="days">${days.map((d, i) => `<button class="dc${m.plan.includes(d) ? " on" : ""}${d === t ? " td" : ""}" data-a="plan" data-d="${d}" ${d < t && !m.plan.includes(d) ? "disabled" : ""}>
          <b>${d === t ? "Today" : DOW[i]}</b><span>${dayNum(d)} ${monShort(d)}</span></button>`).join("")}</div>
        ${(() => { const other = m.plan.filter((d) => d >= t && !days.includes(d)).sort(); return other.length ? `<div class="mut" style="font-size:13px;margin-top:8px">Also planned: ${other.map((d) => DOW[dowIdx(d)] + " " + dayNum(d) + " " + monShort(d)).join(", ")}</div>` : ""; })()}
        <h3>Ingredients${m.ingredients.length ? ` · ${m.ingredients.length}` : ""}</h3>
        ${m.ingredients.length ? `<div class="ings">${m.ingredients.map((i, k) => {
          const a = this._aisle(i.aisle); const on = onList(i);
          return `<div class="ig"><span class="ai" style="background:${a.colour}26">${a.icon}</span><span class="q">${esc(i.qty)}</span>
            <span class="nm">${esc(i.name)}<small>${esc(i.aisle)}${i.frozen ? " · ❄️ defrost" : ""}${isPantry(i) ? " · check the pantry" : ""}${on ? " · on the list" : (() => { const o = others(i); return o.length ? " · on the list for " + esc(o.join(", ")) : haveIt(i) ? " · we have it" : ""; })()}</small></span>
            ${this._sf ? `<button class="tgl${on ? " on" : ""}" data-a="ing" data-k="${k}" aria-label="${on ? "On the list" : "Add to list"}">${on ? "✓" : "＋"}</button>` : ""}</div>`;
        }).join("")}</div>` : `<div class="warn">⚠️ <b>No ingredients yet.</b> Planning this meal puts nothing on the shopping list until some are added.</div>
          ${suggestFor(m.name) ? `<button class="btn" data-a="suggest">💡 Suggest ingredients</button> ` : ""}<button class="btn" data-a="edit">✎ Add ingredients</button>`}
        ${m.notes ? `<h3>Notes</h3><div class="notes">${esc(m.notes)}</div>` : ""}
      </div>
      <div class="foot"><button class="btn" data-a="edit">✎ Edit</button>
        ${m.cooked === t ? "" : `<button class="btn" data-a="cooked">✓ Had it today</button>`}
        <span class="sp"></span><button class="btn pri" data-a="close">Done</button></div>`;
    if (refresh && this._ov) {
      const sh = this._ov.querySelector(".sh"); const st = sh.scrollTop; sh.innerHTML = html; sh.scrollTop = st; return;
    }
    this._openSheet(html, (a, b) => {
      const mm = this._meal(uid); if (!mm) return;
      if (a === "close") this._closeSheet();
      else if (a === "plan") this._togglePlan(uid, b.dataset.d);
      else if (a === "swk") { this._wk += Number(b.dataset.k); this._paint(); this._sheetMeal(uid, true, note); }
      else if (a === "edit") this._sheetEdit(uid);
      else if (a === "suggest") this._sheetEdit(uid, true);
      else if (a === "cooked") this._cooked(uid);
      else if (a === "hrate") { const p = this._ov && this._ov.querySelector(".hpick"); if (p) p.hidden = !p.hidden; }
      else if (a === "hset" || a === "hclr") {
        mm.health = a === "hset" ? String(b.dataset.k) : "";
        this._saveMeal(mm); this._sheetMeal(uid, true, note);
        this._toast(a === "hset" ? `${mm.name} rated ${mm.health}/10` : `${mm.name} back to the estimate`);
      }
      else if (a === "ing") {
        const i = mm.ingredients[Number(b.dataset.k)]; const on = onList(i);
        if (on) {
          // Untick takes off only this meal's share; other meals keep theirs.
          // Remembered as "we have it", so the shop's ＋ doesn't offer it again for these nights.
          const gone = on.for.filter((f) => f.meal === mm.name);
          on.for = on.for.filter((f) => f.meal !== mm.name);
          on.have = [...(on.have || []), ...gone.filter((f) => ISO.test(f.date))];
          if (!on.for.length && !on.qty && !on.have.length) this._sf.call("remove_item", { item: on.uid }); else this._sf.call("update_item", { item: on.uid, description: composeShop(on) });
          this._toast(i.name + " off the list for " + mm.name);
        } else {
          // For the next night it's planned, at that night's head count; "extra" only when it isn't planned.
          const nd = mm.plan.filter((d) => d >= today()).sort()[0];
          this._addShare(mm, nd || "extra", [i], true);
          this._toast(i.name + " added" + (nd ? ` for ${nd === today() ? "tonight" : DOW_LONG[dowIdx(nd)]} (${nightServes(mm, nd)} people)` : ""));
        }
      }
    });
    this._sheet = { kind: "meal", uid };
  }

  // The meal sheet's health rating (with the reason for each point) and macro ring. Both are estimates.
  _nutHtml(m) {
    const r = nutrition(m), h = healthOf(m);
    const ok = !!(r && r.ok);
    const tot = !ok ? 1 : r.p * 4 + r.c * 4 + r.f * 9 || 1, pc = (v) => Math.round(v * 100 / tot);
    const leg = !ok ? "" : [["c", "Carbs", r.c, r.c * 4], ["f", "Fat", r.f, r.f * 9], ["p", "Protein", r.p, r.p * 4]].map(([k, l, g, kc]) =>
      `<div><i style="background:${MACRO_COL[k]}"></i>${l}<b>${Math.round(g)} g · ${pc(kc)}%</b></div>`).join("") + `<div class="mut">Fibre<b>${Math.round(r.fib)} g</b></div>`;
    const band = h ? healthBand(h.score) : [0, "Not rated", "#8fa3ad"];
    const why = ok && r.health ? r.health.why : [];
    const dcol = (d) => d > 0 ? "#2e9d57" : d < 0 ? "#d64541" : "var(--secondary-text-color)";
    const hc = `<div class="hc" style="--hc:${band[2]}">
        <div class="hh"><span class="hs">${h ? h.score : "?"}</span><span class="hl"><b>${band[1]}</b><span>${!h ? (r ? "Not enough known ingredients to estimate" : "No ingredients to estimate from") : h.own ? `Your rating${h.est ? ` · estimate ${h.est}/10` : ""}` : "Health estimate, out of 10"}</span></span>
          <button class="btn sm" data-a="hrate">✎ Rate it myself</button></div>
        ${!ok ? "" : why.length ? `<ul class="why">${why.map((w) => `<li><span class="d" style="--dc:${dcol(w.d)}">${w.d > 0 ? "+" + w.d : w.d < 0 ? "−" + -w.d : "·"}</span><span>${esc(w.t)}</span></li>`).join("")}</ul>` : `<div class="mut" style="font-size:13px;margin-top:8px">An ordinary home-cooked dinner: nothing pushes it up or down.</div>`}
        <div class="hpick" hidden>${Array.from({ length: 10 }, (_, k) => k + 1).map((n) => `<button style="--hc:${healthBand(n)[2]}" class="${h && h.own && h.score === n ? "on" : ""}" data-a="hset" data-k="${n}" aria-label="Rate ${n} out of 10">${n}</button>`).join("")}
          ${h && h.own ? `<button class="btn sm" style="width:auto;border-radius:999px;border-width:1px" data-a="hclr">${h.est ? `↺ Use the estimate (${h.est})` : "↺ Clear my rating"}</button>` : ""}</div></div>`;
    if (!r) return `<div class="nut">${hc}</div>`;
    const est = `Estimate for one serve (serves ${r.serves}), worked out from the ingredient list with typical values. It isn't measured, so treat it as a rough guide.${r.unknown.length ? ` Not recognised, so not counted: ${esc(r.unknown.join(", "))}.` : ""}${r.guessed ? ` ${r.guessed} amount${r.guessed === 1 ? "" : "s"} guessed (no quantity given).` : ""}`;
    return `<div class="nut">${ok ? `<div class="rg">${macroRing(r, 112)}</div><div class="lg">${leg}</div>` : ""}${hc}<div class="est">${est}</div></div>`;
  }

  // The people stepper on a planned meal in the night sheet.
  _svHtml(m, d) {
    const base = servesN(m);
    const n = nightServes(m, d);
    return `<div class="svs" data-a="nop"><button data-a="ppl" data-uid="${esc(m.uid)}" data-k="-1" aria-label="Fewer people" ${n <= 1 ? "disabled" : ""}>−</button><b>${n}</b>
      <button data-a="ppl" data-uid="${esc(m.uid)}" data-k="1" aria-label="More people" ${n >= 30 ? "disabled" : ""}>+</button><span>${n === 1 ? "person" : "people"}${n !== base ? ` <span class="ch">· usually ${base}</span>` : ""}</span></div>`;
  }

  // Changes one night's head count straight away on screen; the save and the list update follow once the taps stop.
  _stepServes(uid, d, k) {
    const m = this._meal(uid); if (!m) return;
    // The head count before this run of taps: the list changes by the difference once they stop.
    this._pplFrom = this._pplFrom || {};
    if (!((uid + "@" + d) in this._pplFrom)) this._pplFrom[uid + "@" + d] = nightServes(m, d);
    const n = Math.max(1, Math.min(30, nightServes(m, d) + k));
    m.ppl = Object.assign({}, m.ppl || {});
    if (n === servesN(m)) delete m.ppl[d]; else m.ppl[d] = n;
    this._pplWant = this._pplWant || {};
    this._pplWant[uid + "@" + d] = m.ppl[d] || 0;
    this._paint();
    this._pplT = this._pplT || {};
    clearTimeout(this._pplT[uid + "@" + d]);
    this._pplT[uid + "@" + d] = setTimeout(() => {
      const run = () => this._saveServes(uid, d);
      this._shareQ = (this._shareQ || Promise.resolve()).then(run, run);
    }, 900);
  }
  async _saveServes(uid, d) {
    const m = this._meal(uid); if (!m) return;
    const key = uid + "@" + d, want = (this._pplWant || {})[key];
    const from = (this._pplFrom || {})[key]; if (this._pplFrom) delete this._pplFrom[key];
    m.ppl = Object.assign({}, m.ppl || {});
    if (want) m.ppl[d] = want; else delete m.ppl[d];
    // A meal with no Serves set was counted as 4: write that down, so the 4 it scales from stays put.
    if (!(parseFloat(m.serves) > 0)) m.serves = String(DEFAULT_SERVES);
    try { await this._saveMeal(m); } catch (e) { this._toast("Couldn't save that: " + ((e && e.message) || e)); return; }
    const to = nightServes(m, d);
    let n = 0;
    if (this._sf && from && from !== to) try { n = await this._rescale(m, d, from, to); } catch (e) { this._toast("Saved, but the list didn't update: " + ((e && e.message) || e)); return; }
    this._toast(`👥 ${m.name} for ${to} on ${d === today() ? "tonight" : DOW_LONG[dowIdx(d)]}` + (n ? ` · ${n} item${n === 1 ? "" : "s"} on the list updated` : ""));
  }
  // Changes the list by the difference between the old and new head count, ingredient by ingredient.
  // More people: the extra goes on the list, even for a night the last shop covered (it shows as a top-up).
  // Fewer: it comes off this night's share of open lines; anything already ticked was bought.
  // "We have it" covered the old count: more people still puts the extra on the list.
  async _rescale(m, d, from, to) {
    const fresh = await this._sf.fetch(); if (fresh) this._shop = fresh.map(parseShop);
    const base = servesN(m), mine = (f) => f.meal === m.name && f.date === d, ext = (f) => f.meal === m.name && f.date === "extra";
    const ings = m.ingredients.filter((i) => i.name && !isPantry(i));
    const keys = [...new Set(ings.map((i) => normName(i.name)))];
    let n = 0;
    for (const k of keys) {
      const own = ings.filter((i) => normName(i.name) === k), qs = own.map((i) => i.qty).filter(Boolean);
      if (!qs.length) continue;
      const a = qtyMap(qs.map((q) => scaleQty(q, from / base))).by, b = qtyMap(qs.map((q) => scaleQty(q, to / base))).by;
      const up = new Map(), down = new Map();
      for (const u of new Set([...a.keys(), ...b.keys()])) {
        const x = (b.get(u) || { n: 0 }).n - (a.get(u) || { n: 0 }).n, e = b.get(u) || a.get(u);
        if (x > 1e-6) up.set(u, { n: x, u: e.u }); else if (x < -1e-6) down.set(u, { n: -x, u: e.u });
      }
      if (!up.size && !down.size) continue;
      const open = this._shop.filter((s) => !s.done && normName(s.name) === k), changed = new Set();
      {
        if (down.size) {
          for (const pick of [mine, ext]) for (const s of open) for (const f of s.for.filter(pick)) {
            const q = qtyMap([f.qty]); let hit = false;
            for (const [u, need] of down) {
              const e = q.by.get(u); if (!e || need.n < 1e-6) continue;
              const take = Math.min(e.n, need.n); e.n -= take; need.n -= take; hit = true;
            }
            if (!hit) continue;
            changed.add(s);
            const left = mapQty(q);
            if (left) f.qty = left; else s.for = s.for.filter((x) => x !== f);
          }
        }
        if (up.size) {
          const add = mapQty({ by: up, loose: [] });
          const s = open.find((x) => x.for.some(mine)) || open.find((x) => x.for.some(ext)) || open.find((x) => !isGhost(x)) || open[0];
          if (s) {
            const f = s.for.find(mine);
            if (f) { const q = qtyMap([f.qty]); for (const [u, e] of up) { const g = q.by.get(u); if (g) g.n += e.n; else q.by.set(u, { n: e.n, u: e.u }); } f.qty = mapQty(q); }
            else s.for.push({ meal: m.name, date: d, qty: add });
            changed.add(s);
          } else {
            const i = own[0], nm = shopName(i.name);
            const ns = { name: nm, qty: "", aisle: i.aisle || guessAisle(nm), for: [{ meal: m.name, date: d, qty: add }], have: [], notes: "" };
            await this._sf.call("add_item", { item: nm, description: composeShop(ns) });
            this._shop.push(Object.assign(ns, { uid: null, done: false })); n++;
          }
        }
      }
      for (const s of changed) {
        try {
          if (!s.for.length && !s.qty && !(s.have || []).length) await this._sf.call("remove_item", { item: s.uid });
          else await this._sf.call("update_item", { item: s.uid, description: composeShop(s) });
          n++;
        } catch (e) { /* changed elsewhere first */ }
      }
    }
    return n;
  }

  _sheetPick(d) {
    const t = today();
    const cur = this._meals.filter((m) => m.plan.includes(d));
    const html = `<div class="pad" style="position:relative"><button class="btn ico x" data-a="close" aria-label="Close" style="background:none;color:inherit;border:1px solid var(--divider-color)">✕</button>
      <h2>${d === t ? "Tonight" : DOW_LONG[dowIdx(d)]} <span class="mut" style="font-weight:500;font-size:16px">${dayNum(d)} ${monShort(d)}</span></h2>
      ${cur.length ? `<h3>Planned</h3><div class="pick">${cur.map((m) => `<div class="ml" data-a="open" data-uid="${esc(m.uid)}"><button class="rmb" data-a="rm" data-uid="${esc(m.uid)}" aria-label="Remove ${esc(m.name)} from this night">✕ Remove</button>${thumb(m)}<div class="b"><div class="n">${esc(m.name)}</div>${noIngs(m) ? `<div class="m noi">⚠️ No ingredients: nothing goes on the list</div>` : ""}${this._svHtml(m, d)}</div></div>`).join("")}</div>` : ""}
      <h3>${cur.length ? "Add another" : "Pick a meal"}</h3>
      <div class="pick">${this._meals.filter((m) => !cur.includes(m)).sort((x, y) => lastHad(x, t).localeCompare(lastHad(y, t)) || x.name.localeCompare(y.name)).map((m) =>
        `<div class="ml" data-a="pick" data-uid="${esc(m.uid)}">${popular(m, t) ? `<span class="pop" title="Popular in our house">🔥</span>` : ""}${thumb(m)}<div class="b"><div class="n">${esc(m.name)}</div><div class="m">${hpill(m)}${esc(ago(lastHad(m, t), t))}</div>${noIngs(m) ? `<div class="m noi">⚠️ No ingredients</div>` : ""}</div></div>`).join("")}
        <div class="ml new" data-a="new"><span class="plus">＋</span><span>New meal</span></div></div></div>`;
    this._openSheet(html, async (a, b) => {
      if (a === "close") this._closeSheet();
      else if (a === "pick") { this._closeSheet(); await this._togglePlan(b.dataset.uid, d); }
      else if (a === "rm") { await this._togglePlan(b.dataset.uid, d); this._sheetPick(d); }
      else if (a === "ppl") { this._stepServes(b.dataset.uid, d, +b.dataset.k); this._sheetPick(d); }
      else if (a === "nop") { /* the count itself: not a tap to open */ }
      else if (a === "open") { this._closeSheet(); this._sheetMeal(b.dataset.uid); }
      else if (a === "new") this._sheetEdit(null);
    });
    this._sheet = { kind: "pick" };
  }

  // ---------- ✨ Fill my week ----------
  // Drafts dinners for the shown week's empty nights; nothing is planned until "Plan N nights".

  // The empty nights of the shown week, from tonight on.
  _fillDays() {
    const t = today();
    return this._weekDays().filter((d) => d >= t && !(this._meals || []).some((m) => m.plan.includes(d)));
  }
  _hm(s, dflt) { const mm = String(s || "").match(/^(\d{1,2}):(\d{2})/); return mm ? +mm[1] * 60 + +mm[2] : dflt; }
  _isQuick(m) {
    const n = parseFloat(String(m.mins || "").replace(",", "."));
    return (n > 0 && n <= (+this._cfg.quick_mins || 30)) || m.tags.some((x) => /^(quick|fast|easy|speedy)/i.test(x));
  }
  _hasFrozen(m) { return m.ingredients.some((x) => x.frozen); }
  // A ❄️ meal needs the morning defrost reminder still to come: any later night, or tonight before the reminder time.
  _defrostOk(d) {
    const t = today(); if (d > t) return true; if (d < t) return false;
    const now = new Date(); return now.getHours() * 60 + now.getMinutes() < this._hm(this._cfg.defrost_time, 360);
  }

  // Evenings someone is at work, from the busy calendars: an all-day event, or a timed one overlapping busy_from to busy_to.
  async _busyNights(days) {
    const busy = {}, errs = [];
    const cals = [].concat(this._cfg.busy_calendars || []).filter(Boolean);
    if (!days.length || !cals.length) return { busy, errs };
    const from = this._hm(this._cfg.busy_from, 960), to = this._hm(this._cfg.busy_to, 1170);
    const at = (iso, min) => { const [y, m, d] = parts(iso); return new Date(y, m - 1, d, 0, min); };
    const lo = at(days[0], 0).toISOString(), hi = at(addDays(days[days.length - 1], 1), 0).toISOString();
    for (const c of cals) {
      if (!this._hass.states[c]) { errs.push(c); continue; }
      let evs;
      try { evs = await this._hass.callApi("GET", `calendars/${c}?start=${encodeURIComponent(lo)}&end=${encodeURIComponent(hi)}`); }
      catch (e) { errs.push(c); continue; }
      for (const ev of evs || []) {
        const s = ev.start || {}, e = ev.end || {};
        for (const d of days) {
          let hit = false, till = null;
          if (s.date && !s.dateTime) hit = s.date <= d && (e.date || addDays(s.date, 1)) > d;   // all-day; the end date is exclusive
          else if (s.dateTime) {
            const a = new Date(s.dateTime), b = new Date(e.dateTime || s.dateTime);
            hit = a < at(d, to) && b > at(d, from);
            if (hit) till = b >= at(d, 24 * 60) ? 24 * 60 : b.getHours() * 60 + b.getMinutes();
          }
          if (!hit) continue;
          const o = busy[d] || (busy[d] = { till: null });
          if (till != null && (o.till == null || till > o.till)) o.till = till;
        }
      }
    }
    return { busy, errs };
  }
  _clock(min) {
    if (min >= 24 * 60) return "late";
    const h = Math.floor(min / 60), mm = min % 60;
    return (h % 12 || 12) + (mm ? ":" + P2(mm) : "") + (h < 12 ? "am" : "pm");
  }

  // Meals had or planned from the week before the drafted week to the week after it: kept out unless nothing else fits.
  _fillBlock(ws) {
    const lo = addDays(ws, -7), hi = addDays(ws, 13);
    return new Set(this._meals.filter((m) => [...(m.had || []), ...m.plan, m.cooked].some((d) => d && d >= lo && d <= hi)).map((m) => m.uid));
  }

  // Meals for one night, best first. used: meals already on other nights of the draft. all: every meal (the chooser).
  _fillRank(d, used, all) {
    const f = this._fill, t = today(), busy = !!f.busy[d];
    const base = this._meals.filter((m) => (all || !used.has(m.uid)) && (!this._hasFrozen(m) || this._defrostOk(d)));
    const fresh = base.filter((m) => !f.block.has(m.uid));
    const pool = all || !fresh.length ? base : fresh;
    const score = (m) => {
      const last = lastHad(m, t), gap = last ? Math.min(daysBetween(last, t), 120) : 100;
      return gap + (f.jit[m.uid] || 0) + (popular(m, t) ? 8 : 0) - (noIngs(m) ? 25 : 0) - (f.block.has(m.uid) ? 500 : 0) + (busy && this._isQuick(m) ? 1000 : 0);
    };
    return pool.map((m) => ({ m, s: score(m) })).sort((a, b) => b.s - a.s || a.m.name.localeCompare(b.m.name)).map((x) => x.m);
  }

  _fillUsed(except) { const f = this._fill; return new Set(f.days.filter((d) => d !== except && !f.skip[d] && f.pick[d]).map((d) => f.pick[d])); }

  // Busy nights first, so the quick meals go where they are needed. keep: nights to leave as they are.
  _fillDraft(keep) {
    const f = this._fill;
    const used = keep ? new Set(f.days.filter((d) => keep.has(d) && !f.skip[d] && f.pick[d]).map((d) => f.pick[d])) : new Set();
    const order = [...f.days].sort((a, b) => (f.busy[b] ? 1 : 0) - (f.busy[a] ? 1 : 0) || a.localeCompare(b));
    for (const d of order) {
      if (keep && keep.has(d)) continue;
      if (f.skip[d]) continue;
      const m = this._fillRank(d, used)[0];
      f.pick[d] = m ? m.uid : null; if (m) used.add(m.uid);
    }
  }
  _fillJitter() { const j = {}; for (const m of this._meals) j[m.uid] = Math.random() * 30; return j; }

  async _fillWeek() {
    const days = this._fillDays();
    if (!days.length) { this._toast("Every night this week is already planned"); return; }
    if (!this._meals.length) { this._toast("Add some meals first"); return; }
    const ws = addDays(weekStart(today()), this._wk * 7);
    this._fill = { ws, days, busy: {}, errs: [], loading: true, pick: {}, skip: {}, jit: this._fillJitter(), block: this._fillBlock(ws) };
    this._fillPaint();
    const r = await this._busyNights(days);
    if (!this._fill || this._fill.ws !== ws) return;
    Object.assign(this._fill, r, { loading: false });
    this._fillDraft();
    this._fillPaint();
  }

  _fillRow(d) {
    const f = this._fill, t = today(), b = f.busy[d];
    const day = `<div class="fd"><b>${d === t ? "Tonight" : DOW[dowIdx(d)]}</b><span>${dayNum(d)} ${monShort(d)}</span></div>`;
    const busyChip = b ? `<span class="chip fbz">💼 ${esc(this._cfg.busy_label)}${b.till != null ? " till " + this._clock(b.till) : ""}</span>` : "";
    if (f.skip[d]) {
      return `<div class="fr off">${day}<div class="fb"><div class="n mut">Left empty</div><div class="fc">${busyChip}</div></div>
        <div class="fa"><button class="btn sm" data-a="fon" data-d="${d}">↺ Fill</button></div></div>`;
    }
    const m = f.pick[d] && this._meal(f.pick[d]);
    if (!m) {
      return `<div class="fr">${day}<div class="fb"><div class="n mut">No meal fits this night</div><div class="fc">${busyChip}</div></div>
        <div class="fa"><button class="btn sm ico" data-a="fskip" data-d="${d}" title="Leave this night empty" aria-label="Leave this night empty">✕</button></div></div>`;
    }
    const used = this._fillUsed(d);
    const where = (uid) => f.days.filter((x) => x !== d && !f.skip[x] && f.pick[x] === uid).map((x) => (x === t ? "tonight" : DOW[dowIdx(x)]));
    const opts = this._fillRank(d, used, true).map((x) => {
      const w = where(x.uid);
      return `<option value="${esc(x.uid)}"${x.uid === m.uid ? " selected" : ""}>${esc(x.name)}${x.mins ? " · " + esc(x.mins) + " min" : ""}${w.length ? " · also " + w.join(", ") : ""}</option>`;
    }).join("") + this._meals.filter((x) => this._hasFrozen(x) && !this._defrostOk(d)).map((x) => `<option disabled>${esc(x.name)} · ❄️ too late to defrost</option>`).join("");
    const quick = this._isQuick(m), last = lastHad(m, t);
    const chips = [
      busyChip,
      b && !quick ? `<span class="chip noi">⚠️ No quick meal left</span>` : "",
      m.mins ? `<span class="chip${b && quick ? " fq" : ""}">⏱ ${esc(m.mins)} min</span>` : (b && quick ? `<span class="chip fq">⏱ Quick</span>` : ""),
      this._hasFrozen(m) ? `<span class="chip ffz" title="The ${esc(this._cfg.defrost_time)} reminder puts it on Highlights that morning">❄️ Defrost reminder ${d === t ? "this morning" : DOW[dowIdx(d)] + " " + esc(this._cfg.defrost_time)}</span>` : "",
      f.block.has(m.uid) ? `<span class="chip noi">🔁 Had or planned recently</span>` : `<span class="chip">${esc(ago(last, t))}</span>`,
      popular(m, t) ? `<span class="chip">🔥 Popular</span>` : "",
      noIngs(m) ? `<span class="chip noi">⚠️ No ingredients</span>` : "",
    ].filter(Boolean).join("");
    return `<div class="fr">${day}${thumb(m, "fth")}
      <div class="fb"><label class="fsw" title="Choose a different meal"><span class="fn">${esc(m.name)}</span><span class="car">▾</span><select class="fs" data-d="${d}" aria-label="Meal for ${DOW_LONG[dowIdx(d)]}">${opts}</select></label>
        <div class="fc">${chips}</div></div>
      <div class="fa"><button class="btn sm ico" data-a="fswap" data-d="${d}" title="Another meal" aria-label="Another meal">🔄</button>
        <button class="btn sm ico" data-a="fskip" data-d="${d}" title="Leave this night empty" aria-label="Leave this night empty">✕</button></div></div>`;
  }

  _fillPaint() {
    const f = this._fill; if (!f) return;
    const n = f.days.filter((d) => !f.skip[d] && f.pick[d]).length;
    const nBusy = Object.keys(f.busy).length;
    const wkWord = this._wk === 0 ? "This week" : this._wk === 1 ? "Next week" : `Week of ${dayNum(f.ws)} ${monShort(f.ws)}`;
    const html = `<div class="pad" style="position:relative"><button class="btn ico x" data-a="close" aria-label="Close" style="background:none;color:inherit;border:1px solid var(--divider-color)">✕</button>
      <h2>✨ Fill my week</h2>
      <p class="mut fsub">${wkWord} · ${f.days.length} empty night${f.days.length === 1 ? "" : "s"}${f.loading ? "" : nBusy ? ` · ${nBusy} busy evening${nBusy === 1 ? "" : "s"} get quick meals` : " · no busy evenings"}. Change anything, then plan. Nothing is planned until you do.</p>
      ${f.errs.length ? `<div class="warn">Couldn’t read ${f.errs.map(esc).join(", ")}, so no evenings are marked busy.</div>` : ""}
      ${f.loading ? `<div class="mut" style="padding:24px 0;text-align:center">Checking the calendar…</div>` : `<div class="fw">${f.days.map((d) => this._fillRow(d)).join("")}</div>`}</div>
      <div class="foot"><button class="btn" data-a="freroll"${f.loading ? " disabled" : ""}>🎲 Shuffle</button><span class="sp"></span>
        <button class="btn" data-a="cancel">Cancel</button>
        <button class="btn pri" data-a="fgo"${f.loading || !n ? " disabled" : ""}>✓ Plan ${n} night${n === 1 ? "" : "s"}</button></div>`;
    const sh = this._ov && this._sheet && this._sheet.kind === "fill" && this._ov.querySelector(".sh");
    if (sh) { const y = sh.scrollTop; sh.innerHTML = html; sh.scrollTop = y; return; }
    this._openSheet(html, (a, b) => this._fillAct(a, b), (e) => {
      const s = e.target.closest && e.target.closest("select.fs"); if (!s || !this._fill) return;
      this._fill.pick[s.dataset.d] = s.value;
      // The meal was on another night: that night gets the next best instead, so nothing is cooked twice.
      for (const d of this._fill.days) if (d !== s.dataset.d && this._fill.pick[d] === s.value && !this._fill.skip[d]) { this._fill.pick[d] = null; this._fillDraft(new Set(this._fill.days.filter((x) => x !== d))); }
      this._fillPaint();
    }, { guard: true, guardMsg: "Tap Plan to keep this draft, or Cancel to throw it away." });
    this._sheet = { kind: "fill" };
  }

  async _fillAct(a, b) {
    const f = this._fill; if (!f) { this._closeSheet(); return; }
    const d = b.dataset.d;
    if (a === "close" || a === "cancel") { this._fill = null; this._closeSheet(); return; }
    if (f.loading) return;
    if (a === "fswap") {
      const list = this._fillRank(d, this._fillUsed(d));
      if (list.length < 2 && list[0] && list[0].uid === f.pick[d]) { this._toast("No other meal fits this night"); return; }
      const i = list.findIndex((m) => m.uid === f.pick[d]);
      const next = list[(i + 1) % list.length]; if (next) f.pick[d] = next.uid;
    } else if (a === "fskip") { f.skip[d] = true; f.pick[d] = null; }
    else if (a === "fon") { f.skip[d] = false; this._fillDraft(new Set(f.days.filter((x) => x !== d))); }
    else if (a === "freroll") { f.jit = this._fillJitter(); this._fillDraft(new Set(f.days.filter((x) => f.skip[x]))); }
    else if (a === "fgo") { await this._fillGo(); return; }
    this._fillPaint();
  }

  async _fillGo() {
    const f = this._fill; this._fill = null; this._closeSheet();
    const todo = f.days.filter((d) => !f.skip[d] && f.pick[d]);
    this._toast(`Planning ${todo.length} night${todo.length === 1 ? "" : "s"}…`);
    let nights = 0, items = 0, taken = 0;
    for (const d of todo) {
      // Another screen may have planned this night meanwhile; leave it alone.
      if (this._meals.some((m) => m.plan.includes(d))) { taken++; continue; }
      try { items += await this._togglePlan(f.pick[d], d, true) || 0; nights++; }
      catch (e) { this._toast("Couldn’t plan " + DOW_LONG[dowIdx(d)] + ": " + ((e && e.message) || e)); return; }
    }
    this._toast(`✨ Planned ${nights} night${nights === 1 ? "" : "s"}` + (this._sf ? ` · ${items} item${items === 1 ? "" : "s"} on the list` : "") + (taken ? ` · ${taken} already planned elsewhere` : ""));
  }


  _sheetEdit(uid, useSuggest) {
    const src = uid ? this._meal(uid) : null;
    const dkey = uid || "new", dr = draftGet(dkey);
    const blank = { uid: null, name: "", emoji: "🍽️", img: "", tags: [], serves: "4", mins: "", plan: [], cooked: "", ingredients: [{ qty: "", name: "", aisle: "Produce", staple: false }], notes: "" };
    const m = dr ? dr : src ? JSON.parse(JSON.stringify(src)) : blank;
    const keep = () => draftPut(dkey, m);
    const empty = () => !m.ingredients.some((i) => String(i.name || "").trim());
    let sug = empty() ? suggestFor(m.name) : null;
    const applySug = () => { m.ingredients = sug.map((i) => ({ ...i, _aisleSet: true })); sug = null; };
    // Ingredients already used anywhere, one spelling each (a capitalised one wins), for the
    // type-ahead list and so "butter" saves as the "Butter" the other meals already use.
    const known = new Map();
    for (const x of [...(this._meals || []).flatMap((mm) => mm.ingredients), ...(this._shop || [])]) {
      const nm = String(x.name || "").trim(), k = nm.toLowerCase(); if (!nm) continue;
      const had = known.get(k);
      if (!had || (had.name[0] !== had.name[0].toUpperCase() && nm[0] === nm[0].toUpperCase())) known.set(k, { name: nm, aisle: (had && had.aisle) || x.aisle });
    }
    const knownOpts = [...known.values()].sort((a, b) => a.name.localeCompare(b.name)).map((x) => `<option value="${esc(x.name)}"></option>`).join("");
    if (useSuggest && sug) applySug();
    const sugBox = () => sug ? `💡 Suggested ingredients for this meal (${sug.length}). Check them and change anything before you save.<span class="sp"></span><button class="btn sm pri" data-a="usesug">Use these</button>` : "";
    const aisleOpts = (sel) => this._aisles.map((a) => `<option value="${esc(a.name)}"${a.name === sel ? " selected" : ""}>${a.icon} ${esc(a.name)}</option>`).join("");
    const rows = () => m.ingredients.map((i, k) => `<div class="er" data-k="${k}">
        <input class="i" data-f="qty" value="${esc(i.qty)}" placeholder="500 g" autocapitalize="none" autocorrect="off">
        <input class="i" data-f="name" list="ingk" value="${esc(i.name)}" placeholder="Ingredient" autocapitalize="none" autocorrect="off" spellcheck="false" autocomplete="off">
        <select class="i" data-f="aisle" aria-label="Aisle">${aisleOpts(i.aisle)}</select>
        <button class="st${isPantry(i) ? " on" : ""}" data-a="staple" data-k="${k}" title="Pantry staple: not added to the list automatically">⭐</button>
        <button class="st fz${i.frozen ? " on" : ""}" data-a="frz" data-k="${k}" title="Frozen: remind us to take it out the morning it's planned">❄️</button>
        <button class="rm" data-a="rmi" data-k="${k}" aria-label="Remove">✕</button></div>`).join("");
    const html = `<div class="pad">
      <h2>${src ? "Edit meal" : "New meal"}</h2>
      ${dr ? `<div class="draftn">📝 Brought back your unsaved changes<span class="sp"></span><button class="btn sm" data-a="undraft">Start over</button></div>` : ""}
      <label class="f">Name</label><input class="i" data-f="m.name" value="${esc(m.name)}" placeholder="e.g. Lamb shanks">
      <label class="f">Picture</label><div class="emo">${[...new Set(EMOJI)].map((e) => `<button class="${e === m.emoji ? "on" : ""}" data-a="emo" data-e="${e}">${e}</button>`).join("")}</div>
      <div class="emoc"><input class="i" id="emoin" maxlength="16" value="${EMOJI.includes(m.emoji) ? "" : esc(m.emoji)}" placeholder="🙂" aria-label="Any emoji"><span class="mut">or type or paste any emoji here</span></div>
      <label class="f">Photo URL (optional, e.g. /local/meals/lamb.jpg)</label><input class="i" data-f="m.img" value="${esc(m.img)}" placeholder="Leave blank to use the picture above">
      <div class="row2"><div><label class="f">Serves</label><input class="i" data-f="m.serves" value="${esc(m.serves)}" placeholder="${DEFAULT_SERVES}" inputmode="numeric"></div>
        <div><label class="f">Minutes</label><input class="i" data-f="m.mins" value="${esc(m.mins)}" inputmode="numeric"></div>
        <div><label class="f">Tags</label><input class="i" data-f="m.tags" value="${esc(m.tags.join(", "))}" placeholder="Quick, Family"></div></div>
      <h3>Ingredients</h3>
      ${useSuggest && !sug ? `<div class="draftn">💡 Suggested ingredients filled in. Change, add or remove anything, then Save.</div>` : ""}
      <div class="draftn sugg"${sug ? "" : " hidden"}>${sugBox()}</div>
      <div class="erh"><span>Qty</span><span>Name</span><span class="ha">Aisle</span><span title="Pantry staple">⭐</span><span title="Needs defrosting">❄️</span><span></span></div>
      <datalist id="ingk">${knownOpts}</datalist>
      <div id="rows">${rows()}</div>
      <button class="btn sm" data-a="addi">＋ Ingredient</button>
      <span class="mut" style="font-size:12px;margin-left:8px">⭐ = pantry staple. Staples and anything in the Pantry aisle aren't added to the list; they show under Check the pantry. ❄️ = needs defrosting: you get a reminder the morning it's planned.</span>
      <label class="f">Notes</label><textarea class="i" data-f="m.notes" placeholder="Method, where the recipe lives…">${esc(m.notes)}</textarea>
      </div>
      <div class="foot">${src ? `<button class="btn del" data-a="del">Delete</button>` : ""}<span class="sp"></span>
        <button class="btn" data-a="cancel">Cancel</button><button class="btn pri" data-a="save">Save</button></div>`;
    const ov = this._openSheet(html, async (a, b) => {
      if (a === "cancel") { draftDel(dkey); if (src) this._sheetMeal(uid); else this._closeSheet(); return; }
      if (a === "undraft") { draftDel(dkey); this._sheetEdit(uid); return; }
      if (a === "usesug") { if (!sug) return; applySug(); ov.querySelector("#rows").innerHTML = rows(); const sb = ov.querySelector(".sugg"); sb.hidden = true; sb.innerHTML = ""; }
      else if (a === "emo") { m.emoji = b.dataset.e; ov.querySelector("#emoin").value = ""; ov.querySelectorAll(".emo button").forEach((x) => x.classList.toggle("on", x === b)); }
      else if (a === "staple") { const i = m.ingredients[Number(b.dataset.k)], on = !isPantry(i); i.staple = on; i.list = !on && PANTRY_AISLES.includes(i.aisle); b.classList.toggle("on", on); }
      else if (a === "frz") { const i = m.ingredients[Number(b.dataset.k)]; i.frozen = !i.frozen; b.classList.toggle("on", i.frozen); keep(); }
      else if (a === "rmi") { m.ingredients.splice(Number(b.dataset.k), 1); ov.querySelector("#rows").innerHTML = rows(); }
      else if (a === "addi") { m.ingredients.push({ qty: "", name: "", aisle: "Produce", staple: false }); ov.querySelector("#rows").innerHTML = rows(); const n = ov.querySelectorAll('#rows [data-f="qty"]'); n[n.length - 1].focus(); }
      else if (a === "del") {
        if (!b.dataset.sure) { b.dataset.sure = "1"; b.textContent = "Tap again to delete"; return; }
        await this._mf.call("remove_item", { item: uid }); draftDel(dkey); this._closeSheet(); this._toast("Deleted " + m.name); return;
      } else if (a === "save") {
        m.name = m.name.trim();
        if (!m.name) { ov.querySelector('[data-f="m.name"]').focus(); return; }
        m.ingredients = m.ingredients.filter((i) => i.name.trim());
        for (const i of m.ingredients) { const kn = known.get(i.name.trim().toLowerCase()); i.name = kn ? kn.name : i.name.trim(); }
        if (src) {
          if (src.name !== m.name) await this._renameShares(src.name, m.name);
          await this._mf.call("update_item", { item: uid, rename: m.name, description: composeMeal(m) });
          draftDel(dkey); this._sheet = { kind: "meal", uid }; this._sheetMeal(uid);
          await this._syncAisles(m);
          // Nights already planned pick up any ingredients added here.
          if (this._sf) {
            let n = 0;
            for (const d of m.plan.filter((x) => x >= today())) n += await this._addShare(m, d, m.ingredients.filter((i) => !isPantry(i)));
            if (n) this._toast(`${n} new ingredient${n === 1 ? "" : "s"} added to the shopping list`);
          }
        } else {
          await this._mf.call("add_item", { item: m.name, description: composeMeal(m) });
          await this._syncAisles(m);
          draftDel(dkey); this._closeSheet(); this._toast("Saved " + m.name);
        }
        return;
      }
      keep();
    }, (e) => {
      if (e.target.id === "emoin") {
        const v = e.target.value.trim();
        if (v) { m.emoji = v; ov.querySelectorAll(".emo button").forEach((x) => x.classList.toggle("on", x.dataset.e === v)); }
        keep(); return;
      }
      const f = e.target.dataset.f; if (!f) return;
      if (f.startsWith("m.")) {
        const k = f.slice(2); m[k] = k === "tags" ? e.target.value.split(",").map((x) => x.trim()).filter(Boolean) : e.target.value;
        if (k === "name") { sug = empty() ? suggestFor(m.name) : null; const sb = ov.querySelector(".sugg"); sb.innerHTML = sugBox(); sb.hidden = !sug; }
        keep(); return;
      }
      const r = e.target.closest(".er"); if (!r) return;
      const i = m.ingredients[Number(r.dataset.k)];
      i[f] = e.target.value;
      const kn = f === "name" && known.get(String(i.name).trim().toLowerCase());
      if (kn && kn.aisle && !i._aisleSet) { i.aisle = kn.aisle; r.querySelector('[data-f="aisle"]').value = kn.aisle; }
      else if (f === "name") { const g = guessAisle(i.name); if (g !== "Other" && !i._aisleSet) { i.aisle = g; r.querySelector('[data-f="aisle"]').value = g; } }
      if (f === "aisle") { i._aisleSet = true; i._aisleUser = true; }
      if (f === "name" && sug && !empty()) { sug = null; const sb = ov.querySelector(".sugg"); sb.hidden = true; sb.innerHTML = ""; }
      keep();
    }, { guard: true });
    if (dr || useSuggest) ov._dirty = true;
    ov.addEventListener("change", (e) => { if (e.target.dataset.f === "aisle") { const r = e.target.closest(".er"); const i = m.ingredients[Number(r.dataset.k)]; i.aisle = e.target.value; i._aisleSet = true; i._aisleUser = true; keep(); } });
    this._sheet = { kind: "edit" };
  }

  // An aisle picked by hand in the editor belongs to the ingredient, not just this meal: other meals using it
  // and its shopping list lines move too (a line otherwise keeps the aisle of the meal that first added it).
  async _syncAisles(m) {
    const ch = m.ingredients.filter((i) => i._aisleUser && i.aisle);
    if (!ch.length) return;
    const pick = (name) => ch.find((x) => normName(x.name) === normName(name));
    for (const o of this._meals || []) {
      if (o.uid === m.uid) continue;
      let hit = false;
      for (const i of o.ingredients) { const c = pick(i.name); if (c && i.aisle !== c.aisle) { i.aisle = c.aisle; hit = true; } }
      if (hit) await this._saveMeal(o);
    }
    if (this._sf) for (const s of this._shop || []) {
      const c = pick(s.name);
      if (c && s.aisle !== c.aisle) { s.aisle = c.aisle; await this._sf.call("update_item", { item: s.uid, description: composeShop(s) }); }
    }
  }

  async _renameShares(from, to) {
    if (!this._sf) return;
    for (const s of this._shop.filter((x) => x.for.some((f) => f.meal === from))) {
      s.for.forEach((f) => { if (f.meal === from) f.meal = to; });
      await this._sf.call("update_item", { item: s.uid, description: composeShop(s) });
    }
  }
}

// =====================================================================
// shopping-list-card
// =====================================================================

const SL_STYLE = BASE + `
.wbr { padding:10px 0; border-bottom:1px solid var(--divider-color); }
.wbr.skip { opacity:.55; }
.wbt { font-size:14.5px; }
.wbm { display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-top:6px; font-size:13.5px; }
.wbp { flex:1 1 200px; cursor:pointer; text-decoration:underline dotted; text-underline-offset:3px; }
.wbs { font-size:12px; font-weight:700; margin-left:6px; }
.wbs.ok { color:#43a047; } .wbs.bad { color:var(--error-color, #d64541); }
.svs { display:flex; align-items:center; gap:6px; font-size:13px; }
.svs button { width:34px; height:34px; border-radius:50%; border:1px solid var(--divider-color); background:var(--secondary-background-color); color:var(--primary-text-color); font-size:18px; font-weight:700; cursor:pointer; line-height:1; padding:0; }
.svs b { text-align:center; font-size:15px; }
.svs.wq { margin-top:0; }
.svs.wq b { min-width:44px; }
.wbk { display:inline-flex; align-items:center; gap:6px; font-size:13px; color:var(--secondary-text-color); }
.wbl { display:flex; flex-direction:column; gap:6px; }
.wbo { display:flex; align-items:center; gap:10px; padding:10px 12px; border:1px solid var(--divider-color); border-radius:12px; cursor:pointer; font-size:14px; }
.wbo > div:first-child { flex:1; min-width:0; }
.wbo.on { border-color:var(--primary-color); background:color-mix(in srgb, var(--primary-color) 12%, transparent); }
.wbpr { font-weight:700; white-space:nowrap; }
.wbpr .sp2 { color:#e53935; }
.top { display:flex; align-items:flex-end; gap:12px; margin-bottom:12px; }
.top .big { font-size:40px; font-weight:800; line-height:1; letter-spacing:-1px; }
.top .lbl { font-size:13px; color:var(--secondary-text-color); line-height:1.35; }
.top .sp { flex:1; }
.bar { height:6px; border-radius:3px; background:color-mix(in srgb, var(--primary-text-color) 8%, transparent); overflow:hidden; margin-bottom:14px; }
.bar i { display:block; height:100%; background:#43a047; border-radius:3px; transition:width .4s ease; }
.qa { display:flex; gap:8px; margin-bottom:8px; }
.qa input.i { flex:1; height:46px; border-radius:999px; padding-left:18px; font-size:16px; }
.qa .btn { height:46px; width:46px; padding:0; justify-content:center; font-size:22px; }
.qk .chip { cursor:pointer; height:32px; border:1px solid var(--divider-color); background:none; color:var(--primary-text-color); font-weight:600; }
.qk .chip.got { opacity:.45; }
.qk .chip.ed { border-style:dashed; color:var(--secondary-text-color); }
.stl { border:1px solid var(--divider-color); border-radius:14px; overflow:hidden; }
.str { display:flex; align-items:center; gap:10px; padding:0 6px 0 14px; min-height:48px; border-top:1px solid var(--divider-color); font-size:15px; font-weight:600; }
.str:first-child { border-top:none; }
.str .nm { flex:1; min-width:0; }
.str .rm { width:38px; height:38px; border:none; background:none; cursor:pointer; font-size:18px; color:var(--secondary-text-color); border-radius:50%; }
.str .rm:hover { color:var(--error-color, #d64541); }
.sta { display:flex; gap:8px; margin-top:12px; }
.sta input.i { flex:1; }
.top .btn + .btn { margin-left:6px; }
.xs .top .bt { display:none; }
textarea.snd { min-height:260px; font-size:14px; line-height:1.5; font-family:inherit; }
.grp { margin-bottom:12px; border-radius:14px; border:1px solid var(--divider-color); overflow:hidden; }
.gh { display:flex; align-items:center; gap:8px; padding:8px 12px; font-size:13px; font-weight:750; letter-spacing:.3px;
  background:color-mix(in srgb, var(--gc) 13%, transparent); border-bottom:1px solid color-mix(in srgb, var(--gc) 25%, transparent); }
.gh .gi { font-size:17px; }
.gh .gn { flex:1; }
.gh .gc { font-weight:600; color:var(--secondary-text-color); }
.it { display:flex; align-items:center; gap:12px; padding:0 8px 0 10px; min-height:54px; border-top:1px solid var(--divider-color); -webkit-tap-highlight-color:transparent; }
.it:first-of-type { border-top:none; }
.gh + .it { border-top:none; }
.ck { flex:none; width:32px; height:32px; border-radius:50%; border:2px solid color-mix(in srgb, var(--gc, #888) 70%, var(--divider-color)); background:none; cursor:pointer;
  display:grid; place-items:center; color:#fff; font-size:16px; font-weight:800; transition:all .15s; }
.ck.on { background:#43a047; border-color:#43a047; }
.it .tx { flex:1; min-width:0; cursor:pointer; padding:7px 0; }
.it .nm { font-size:16px; font-weight:600; line-height:1.25; }
.it .sb { display:flex; gap:4px; flex-wrap:wrap; margin-top:3px; }
.it .sb .chip { height:21px; padding:0 7px; font-size:11.5px; }
.it .qt { flex:none; font-size:14px; font-weight:700; padding:4px 10px; border-radius:999px; background:color-mix(in srgb, var(--gc, #888) 16%, transparent); max-width:42%; text-align:right; }
.it.done .nm { text-decoration:line-through; color:var(--secondary-text-color); }
.it.done .qt, .it.done .sb { opacity:.5; }
.trolley .gh { --gc:#43a047; }
.it .hv { flex:none; width:34px; height:34px; border-radius:50%; border:none; background:none; cursor:pointer; font-size:15px; color:var(--secondary-text-color); margin-left:-6px; }
.it .hv:hover { color:var(--error-color, #d64541); background:color-mix(in srgb, var(--error-color, #d64541) 10%, transparent); }
.empty { text-align:center; padding:26px 10px; color:var(--secondary-text-color); }
.empty .e { font-size:44px; }
.cols { columns:2 300px; column-gap:12px; }
.cols .grp { break-inside:avoid; display:inline-block; width:100%; }
.narrow .cols { columns:1; }
.ais { display:flex; flex-wrap:wrap; gap:6px; }
.ais .chip { cursor:pointer; height:34px; padding:0 12px; font-size:13px; border:1.5px solid transparent; }
.ais .chip.on { border-color:var(--ac); background:color-mix(in srgb, var(--ac) 20%, transparent); color:var(--primary-text-color); }
.fromm { font-size:13px; margin-top:8px; line-height:1.6; }
.pantry .phint { font-size:12.5px; padding:8px 12px 2px; }
.pantry .it .btn { flex:none; }
.shp { display:flex; align-items:center; gap:8px; margin:-2px 0 10px; font-size:14.5px; }
.shp .t { flex:1; min-width:0; }
.nts { display:flex; align-items:center; gap:6px; overflow-x:auto; scrollbar-width:none; margin:0 0 14px; }
.nts .chip.got { opacity:.55; }
.tg { display:flex; gap:6px; flex-wrap:wrap; }
.tg .chip { cursor:pointer; height:34px; border:1.5px solid transparent; }
.tg .chip.on { border-color:var(--primary-color); background:color-mix(in srgb, var(--primary-color) 18%, transparent); color:var(--primary-text-color); }
.it .sb .chip.tu { border:1px dashed var(--primary-color); }
.nts::-webkit-scrollbar { display:none; }
.nts .nl { flex:none; font-size:12.5px; font-weight:700; color:var(--secondary-text-color); }
.nts .chip { flex:none; cursor:pointer; height:32px; border:1.5px solid transparent; }
.nts .chip.on { border-color:var(--primary-color); background:color-mix(in srgb, var(--primary-color) 18%, transparent); }
.nts .chip.past { border:1.5px dashed #e0a030; background:color-mix(in srgb, #e0a030 14%, transparent); }
.nts .chip.past.on { border-style:solid; }
.nts .chip.miss:not(.on) { border:1.5px dashed var(--primary-color); }
.nts .chip .mi { color:var(--primary-color); margin-left:2px; }
.nf { display:flex; align-items:center; flex-wrap:wrap; gap:8px; padding:10px 12px; margin-bottom:12px; border-radius:12px; font-size:13.5px; line-height:1.4;
  background:color-mix(in srgb, var(--primary-color) 10%, transparent); }
.nf.past { background:color-mix(in srgb, #e0a030 16%, transparent); }
.nf .t { flex:1; min-width:180px; }
.nh { font-size:12px; margin:-10px 0 12px; }
.it .sb .chip.off { opacity:.4; }
.qkw { margin-bottom:14px; }
/* the nights row fades at the end that has more */
.nts.e-r { -webkit-mask-image:linear-gradient(to right, #000 calc(100% - 56px), transparent); mask-image:linear-gradient(to right, #000 calc(100% - 56px), transparent); }
.nts.e-l { -webkit-mask-image:linear-gradient(to right, transparent, #000 32px); mask-image:linear-gradient(to right, transparent, #000 32px); }
.nts.e-l.e-r { -webkit-mask-image:linear-gradient(to right, transparent, #000 32px, #000 calc(100% - 56px), transparent); mask-image:linear-gradient(to right, transparent, #000 32px, #000 calc(100% - 56px), transparent); }
`;
const PANTRY_KEY = "meal-planner-pantry-have";

class ShoppingListCard extends MPBase {
  setConfig(config) {
    if (!config || !config.entity) throw new Error("shopping-list-card: entity is required (a todo.* list)");
    this._cfg = Object.assign({ title: "Shopping", meals_entity: null, staples_entity: "todo.staples", shop_entity: "input_text.meals_shop", quick_add: ["Milk", "Bread", "Eggs", "Bananas", "Butter", "Cheese", "Apples", "Toilet paper", "Coffee", "Yoghurt"] }, config);
    if (Array.isArray(config.aisles) && config.aisles.length) this._aisles = config.aisles;
    this._items = null; this._meals = []; this._showDone = true; this._staples = null; this._pOpen = true; this._sel = new Set(); this._past = new Set();
  }
  getCardSize() { return 12; }
  getGridOptions() { return { columns: "full", rows: "auto" }; }

  _start() {
    this._started = true;
    this._feeds = [];
    this._f = new TodoFeed(this._cfg.entity, (items, err) => {
      this._err = err || null; this._items = items ? items.map(parseShop) : (this._items || []); this._paint();
      // A short random wait, so two screens showing the list don't both merge the same double-up.
      clearTimeout(this._mt); this._mt = setTimeout(() => this._mergeDupes().then(() => this._tidy()), 700 + Math.random() * 1500);
    });
    this._feeds.push(this._f);
    if (this._cfg.meals_entity) {
      this._feeds.push(this._mf = new TodoFeed(this._cfg.meals_entity, (items) => {
        if (!items) return;
        this._meals = items.map(parseMeal); this._paint();
        clearTimeout(this._tt); this._tt = setTimeout(() => this._tidy(), 1500 + Math.random() * 1500);
      }));
    }
    if (this._cfg.staples_entity && this._hass.states[this._cfg.staples_entity]) {
      this._stf = new TodoFeed(this._cfg.staples_entity, (items) => {
        if (!items) return;
        this._staples = items.map((i) => ({ uid: i.uid, name: i.summary }));
        this._paint(); if (this._sheet === "staples") this._sheetStaples(true);
      });
      this._feeds.push(this._stf);
    }
    for (const f of this._feeds) f.start(this._hass);
    this._build();
  }

  _build() {
    if (this._built) return;
    this._built = true;
    this.shadowRoot.innerHTML = `<style>${SL_STYLE}</style><ha-card>
      <div id="top"></div>
      <div class="qa"><input class="i" id="add" placeholder="Add an item, e.g. 2 kg potatoes" enterkeyhint="done" autocomplete="off">
        <button class="btn pri" data-a="add" aria-label="Add">＋</button></div>
      <div class="qkw">${this._rowHtml("qk", "", "qk", "qk")}</div>
      <div id="list"></div></ha-card>`;
    const card = this.shadowRoot.querySelector("ha-card");
    card.addEventListener("click", (e) => { const b = e.target.closest("[data-a]"); if (b) this._act(b.dataset.a, b); });
    this.shadowRoot.getElementById("add").addEventListener("keydown", (e) => { if (e.key === "Enter") this._quickAdd(); });
    this._paint();
  }

  _resize() { super._resize(); if (this.shadowRoot) { this._rows(); this._edges(this.shadowRoot.querySelector(".nts")); } }

  set hass(h) {
    super.hass = h;
    const st = this._cfg && h.states[this._cfg.shop_entity], v = st ? st.state : "";
    if (v !== this._shopS) { const first = this._shopS === undefined; this._shopS = v; this._shopW = null; if (!first) this._paint(); }
  }

  // The shop: { s, n } = next shop start and end (unset = worked out), { l, f, u } = last shop day and the nights it covered.
  // Kept in an input_text helper so every screen agrees; this screen's storage stands in if there is none.
  _shop() {
    if (this._shopW) return this._shopW;
    const st = this._hass && this._hass.states[this._cfg.shop_entity];
    let raw = st ? st.state : ""; if (!st) { try { raw = localStorage.getItem("meal-planner-shop"); } catch (e) { /* storage off */ } }
    try { const o = JSON.parse(raw || "{}"); return o && typeof o === "object" ? o : {}; } catch (e) { return {}; }
  }
  _shopPut(patch) {
    const o = Object.assign({}, this._shop(), patch), v = JSON.stringify(o);
    this._shopW = o;
    if (this._hass.states[this._cfg.shop_entity]) this._hass.callService("input_text", "set_value", { entity_id: this._cfg.shop_entity, value: v });
    else try { localStorage.setItem("meal-planner-shop", v); } catch (e) { /* storage off */ }
    this._paint();
  }
  _rngTxt() { const { s, e } = this._rng || {}; return !s ? "" : s === e ? dayWord(s) : dayWord(s) + " → " + dayWord(e); }
  // A share for a night the last shop covered, still open: missed, or added since. It goes on the next shop.
  _topUp(d) { const c = this._cov; return !!c && d >= today() && d >= c.f && d <= c.u && !this._sel.has(d); }
  _want(d) { return !ISO.test(d) || this._sel.has(d) || this._topUp(d); }
  // An item counts if it is for a night of the next shop, a top-up, or was added by hand or from a meal sheet.
  _inSel(s) { return !this._sel.size || !s.for.length || !!s.qty || s.for.some((f) => this._want(f.date)); }
  _tot(s) { return this._sel.size ? sumQty([s.qty, ...s.for.filter((f) => this._want(f.date)).map((f) => f.qty)].filter(Boolean)) : s.total; }

  _emojiFor(meal) { const m = this._meals.find((x) => x.name === meal); return m ? (m.emoji || "🍽️") : "🍽️"; }

  _paint() {
    if (!this._built) return;
    const top = this.shadowRoot.getElementById("top"), list = this.shadowRoot.getElementById("list"), qk = this.shadowRoot.getElementById("qk");
    if (this._items === null) { list.innerHTML = `<div class="mut">Loading…</div>`; return; }
    const all = this._items.filter((s) => !s.done && !isGhost(s)), done = this._items.filter((s) => s.done);
    const nightsHtml = this._nightsHtml(all);
    const open = all.filter((s) => this._inSel(s));
    const meals = new Set(open.flatMap((s) => s.for.filter((f) => !this._sel.size || this._want(f.date)).map((f) => f.meal)));
    const extras = open.filter((s) => !s.for.length).length;
    const pct = all.length + done.length ? Math.round((done.length / (all.length + done.length)) * 100) : 0;
    top.innerHTML = `${this._err ? `<div class="warn">${esc(this._err)} Create a Local To-do list called “Shopping”.</div>` : ""}
      ${!this._err && this._f.hass && this._hass.states[this._cfg.entity] && !this._f.canDescribe() ? `<div class="warn">This list can’t store quantities or aisles, so everything lands in Other. A Local To-do list can.</div>` : ""}
      <div class="top"><div class="big">${open.length}</div><div class="lbl"><b style="color:var(--primary-text-color);font-size:15px">${esc(this._cfg.title)}</b><br>
        ${open.length ? `to get${meals.size ? ` · for ${meals.size} meal${meals.size === 1 ? "" : "s"}` : ""}${extras ? ` · ${extras} extra${extras === 1 ? "" : "s"}` : ""}` : "nothing to get"}</div>
        <span class="sp"></span>${open.length && this._wbOn() ? `<button class="btn sm" data-a="trolley" aria-label="Fill the Woolworths trolley">🛒<span class="bt"> Trolley</span></button>` : ""}${open.length ? `<button class="btn sm" data-a="send" aria-label="Send the list">📤<span class="bt"> Send</span></button>` : ""}${done.length ? `<button class="btn sm" data-a="clear">Clear ${done.length}<span class="bt"> ticked</span></button>` : ""}</div>
      <div class="bar"><i style="width:${pct}%"></i></div>${nightsHtml}`;
    const nts = top.querySelector(".nts"); if (nts) nts.addEventListener("scroll", () => this._edges(nts), { passive: true });
    const have = new Set(all.map((s) => normName(s.name)));
    const quick = this._staples ? this._staples.map((x) => x.name) : this._cfg.quick_add;
    qk.innerHTML = quick.map((q) => `<span class="chip${have.has(normName(q)) ? " got" : ""}" data-a="qk" data-n="${esc(q)}">${have.has(normName(q)) ? "✓" : "＋"} ${esc(q)}</span>`).join("")
      + (this._stf ? `<span class="chip ed" data-a="qkedit" aria-label="Edit quick-add items">✎ Edit</span>` : "");

    if (!all.length && !done.length) { list.innerHTML = `<div class="empty"><div class="e">🛒</div><p>The list is empty. Plan a meal or add something above.</p></div>`; this._resize(); return; }
    const row = (s) => {
      const a = this._aisle(s.aisle);
      // One chip per meal that needs it, named, with its night(s) in the tooltip.
      const days = [...new Set(s.for.map((f) => f.meal))].map((meal) => {
        const ds = s.for.filter((f) => f.meal === meal).map((f) => f.date), iso = ds.filter((d) => ISO.test(d));
        const tu = iso.some((d) => this._topUp(d)), off = this._sel.size && !ds.some((d) => this._want(d));
        return `<span class="chip${off ? " off" : ""}${tu ? " tu" : ""}" title="${esc(iso.map(longDay).join(", ") || "Added from the meal")}${tu ? " · since the last shop" : ""}">${this._emojiFor(meal)} ${esc(meal)}</span>`;
      }).join("") + (s.qty && s.for.length ? `<span class="chip" title="Added by hand, on top of the meals">✍️ ${esc(s.qty)} extra</span>` : "");
      return `<div class="it${s.done ? " done" : ""}" style="--gc:${a.colour}"><button class="ck${s.done ? " on" : ""}" data-a="tick" data-uid="${esc(s.uid)}" aria-label="${s.done ? "Untick" : "Tick"} ${esc(s.name)}">${s.done ? "✓" : ""}</button>
        <div class="tx" data-a="edit" data-uid="${esc(s.uid)}"><div class="nm">${esc(s.name)}</div>${days || s.notes ? `<div class="sb">${days}${s.notes ? `<span class="chip">📝 ${esc(s.notes.split("\n")[0])}</span>` : ""}</div>` : ""}</div>
        ${this._tot(s) ? `<span class="qt">${esc(this._tot(s))}</span>` : ""}
        ${s.done ? "" : `<button class="hv" data-a="have" data-uid="${esc(s.uid)}" title="We already have it: take it off the list" aria-label="We have ${esc(s.name)}, take it off">✕</button>`}</div>`;
    };
    // The next shop decides what is shown (open is already filtered to it).
    const sel = this._sel, nt = sel.size > 0 || this._past.size > 0, shown = open;
    let html = "";
    for (const a of this._aisles) {
      const its = shown.filter((s) => this._aisle(s.aisle).name === a.name).sort((x, y) => x.name.localeCompare(y.name));
      if (!its.length) continue;
      html += `<div class="grp" style="--gc:${a.colour}"><div class="gh"><span class="gi">${a.icon}</span><span class="gn">${esc(a.name)}</span><span class="gc">${its.length}</span></div>${its.map(row).join("")}</div>`;
    }
    if (!open.length) html += `<div class="empty"><div class="e">🎉</div><p>All done. Everything is in the trolley.</p></div>`;
    let trolley = "";
    if (done.length) {
      trolley = `<div class="grp trolley"><div class="gh" data-a="fold" style="cursor:pointer"><span class="gi">🛒</span><span class="gn">In the trolley</span><span class="gc">${done.length} ${this._showDone ? "▾" : "▸"}</span></div>
        ${this._showDone ? done.sort((x, y) => x.name.localeCompare(y.name)).map(row).join("") : ""}</div>`;
    }
    list.innerHTML = `${nt ? this._nightBanner(sel, shown) : ""}<div class="cols">${html}</div>${this._pantryHtml(all)}${trolley}`;
    this._resize();
  }

  _item(uid) { return (this._items || []).find((s) => s.uid === uid); }

  // Nights the list is for, oldest first: those open items are for, plus every night planned from today on.
  // miss lists planned meals whose shoppable ingredients have no line on the list yet (ticked lines, and nights the last shop covered, count as got).
  _nights(open) {
    const out = new Map(), t = today(), all = this._items || [], sh = this._shop();
    const got = (d) => sh.u && sh.u >= t && d >= sh.f && d <= sh.u; // the last shop covered it, so nothing is missing
    const night = (d) => { if (!out.has(d)) out.set(d, { d, meals: new Set(), miss: [] }); return out.get(d); };
    for (const s of open) for (const f of s.for) if (ISO.test(f.date)) night(f.date).meals.add(f.meal);
    for (const m of this._meals) for (const d of m.plan) {
      if (d < t) continue;
      const n = night(d); n.meals.add(m.name);
      const mine = (f) => f.meal === m.name && f.date === d;
      const ings = m.ingredients.filter((i) => i.name && !isPantry(i) && !all.some((s) => (s.for.some(mine) || (s.have || []).some(mine)) && normName(s.name) === normName(i.name)));
      if (ings.length && !got(d)) n.miss.push({ m, ings });
    }
    return [...out.values()].sort((a, b) => a.d.localeCompare(b.d)).map((n) => Object.assign(n, { meals: [...n.meals] }));
  }

  // Works out the next shop (into this._rng and this._sel, every night in it) and draws the shop rows.
  _nightsHtml(open) {
    const ns = this._nights(open), t = today(), sh = this._shop();
    const cov = this._cov = sh.u && sh.u >= t && ISO.test(sh.f) ? { f: sh.f, u: sh.u } : null;
    const s = ISO.test(sh.s || "") && sh.s >= t ? sh.s : cov ? addDays(cov.u, 1) : t;
    const after = ns.filter((n) => n.d >= s);
    const e = ISO.test(sh.n || "") && sh.n >= s ? sh.n : after.length ? after[after.length - 1].d : s;
    this._rng = { s, e };
    const sel = this._sel = new Set();
    for (let d = s, i = 0; d <= e && i < 60; d = addDays(d, 1), i++) sel.add(d);
    for (const d of this._past) if (d < t && ns.some((n) => n.d === d)) sel.add(d); else this._past.delete(d);
    const chips = ns.map((n) => {
      const past = n.d < t, on = sel.has(n.d), got = !on && cov && n.d >= cov.f && n.d <= cov.u;
      const lbl = past ? "⌛ " + dayNum(n.d) + " " + monShort(n.d) : dayWord(n.d);
      return `<span class="chip${past ? " past" : ""}${n.miss.length ? " miss" : ""}${on ? " on" : ""}${got ? " got" : ""}" data-a="night" aria-pressed="${on}" data-d="${n.d}" title="${esc(n.meals.join(", "))}">${got ? "✓ " : ""}${n.meals.map((m) => this._emojiFor(m)).join("")} ${lbl}${n.miss.length ? `<b class="mi">＋</b>` : ""}</span>`;
    }).join("");
    const miss = ns.some((n) => n.miss.length);
    const last = sh.l && ISO.test(sh.l) ? `Last shop ${longDay(sh.l)}${cov ? `, got ✓ ${dayWord(cov.f)}${cov.f === cov.u ? "" : " – " + dayWord(cov.u)}` : ""}. ` : "";
    return `<div class="shp"><span class="t">🛒 <b>Next shop</b> · ${this._rngTxt()}</span><button class="btn sm pri" data-a="shopdone">✓ Done<span class="bt"> shopping</span></button></div>
      ${ns.length ? `<div class="nts" aria-label="Nights">${chips}</div>` : ""}
      <div class="nh mut">${last}${ns.length ? `Tap a night to stretch the shop to it; tap its first night to leave that out${miss ? `. <b>＋</b> = ingredients not on the list yet` : ""}.` : ""}</div>`;
  }

  // Tapping a night: outside the shop stretches it to there, inside sets the end, the first night trims it off. Gone nights toggle for Take off.
  _tapNight(d) {
    const t = today(), { s, e } = this._rng;
    if (d < t) { if (this._past.has(d)) this._past.delete(d); else this._past.add(d); this._paint(); return; }
    let ns = s, ne = e;
    if (d < s) ns = d;
    else if (d > e) ne = d;
    else if (d === s && s < e) ns = this._nights((this._items || []).filter((x) => !x.done)).map((n) => n.d).find((x) => x > d) || addDays(d, 1);
    else ne = d;
    if (ns > ne) ne = ns;
    this._shopPut({ s: ns, n: ne });
  }

  _sheetDone() {
    const items = this._items || [], ticked = items.filter((x) => x.done).length, left = items.filter((x) => !x.done && !isGhost(x) && this._inSel(x)).length;
    let when = today(), all = false;
    const html = `<div class="pad"><h2>Done shopping?</h2>
      <p class="mut" style="margin:6px 0 12px;font-size:14px;line-height:1.5">This shop covers <b>${esc(this._rngTxt())}</b>.${ticked ? ` The ${ticked} ticked item${ticked === 1 ? " comes" : "s come"} off the list.` : ""} Meals you add to these nights later come back as top-ups.</p>
      <label class="f">Shopped</label><div class="tg"><span class="chip on" data-a="when" data-k="0">Today</span><span class="chip" data-a="when" data-k="-1">Yesterday</span></div>
      ${left ? `<label class="f">The ${left} not ticked</label><div class="tg"><span class="chip on" data-a="rest" data-k="0">Keep for next time</span><span class="chip" data-a="rest" data-k="1">Got them all</span></div>` : ""}</div>
      <div class="foot"><button class="btn" data-a="close">Cancel</button><span class="sp"></span><button class="btn pri" data-a="ok">✓ Done shopping</button></div>`;
    const ov = this._openSheet(html, async (a, b) => {
      if (a === "close") this._closeSheet();
      else if (a === "when") { when = addDays(today(), Number(b.dataset.k)); ov.querySelectorAll("[data-a=when]").forEach((c) => c.classList.toggle("on", c === b)); }
      else if (a === "rest") { all = b.dataset.k === "1"; ov.querySelectorAll("[data-a=rest]").forEach((c) => c.classList.toggle("on", c === b)); }
      else if (a === "ok") { this._closeSheet(); await this._shopDone(when, all); }
    });
  }

  // Records the next shop as the last one (joined onto the last one when they meet) and clears the ticked items.
  // With all, the unticked items were bought too: their shares for this shop go, and a line with nothing else left goes.
  async _shopDone(when, all) {
    const { s, e } = this._rng, c = this._cov, join = c && s <= addDays(c.u, 1);
    const txt = this._rngTxt();
    if (all) for (const x of (this._items || []).filter((i) => !i.done && !isGhost(i) && this._inSel(i))) {
      const keep = x.for.filter((f) => ISO.test(f.date) && !this._want(f.date));
      if (!keep.length) await this._f.call("remove_item", { item: x.uid });
      else if (keep.length < x.for.length || x.qty) { x.for = keep; x.qty = ""; await this._f.call("update_item", { item: x.uid, description: composeShop(x) }); }
    }
    this._shopPut({ l: when, f: join && c.f < s ? c.f : s, u: join && c.u > e ? c.u : e, s: null, n: null });
    if ((this._items || []).some((x) => x.done)) await this._f.call("remove_completed_items", {});
    this._toast("Shop saved: " + txt);
  }

  _nightBanner(sel, shown) {
    const t = today(), past = [...this._past].sort();
    const ns = this._nights((this._items || []).filter((s) => !s.done)).filter((x) => sel.has(x.d) && x.d >= t);
    const miss = ns.flatMap((n) => n.miss), nMiss = miss.reduce((a, x) => a + x.ings.length, 0);
    if (!miss.length && !past.length) return "";
    const missTxt = miss.length ? `＋ Not on the list yet: ${miss.map((x) => `${esc(x.m.emoji || "🍽️")} ${esc(x.m.name)} (${x.ings.length})`).join(", ")}.` : "";
    const pastTxt = past.length ? `⌛ ${past.map((d) => dayNum(d) + " " + monShort(d)).join(", ")} ${past.length === 1 ? "has" : "have"} been and gone. Got ${past.length === 1 ? "it" : "them"} already? Take ${past.length === 1 ? "it" : "them"} off the list.` : "";
    return `<div class="nf${miss.length ? "" : " past"}"><span class="t">${[missTxt, pastTxt].filter(Boolean).join("<br>")}</span>
      ${miss.length ? `<button class="btn sm pri" data-a="nfill">＋ Add ${nMiss} ingredient${nMiss === 1 ? "" : "s"}</button>` : ""}${past.length ? `<button class="btn sm" data-a="ndrop">Take off</button>` : ""}</div>`;
  }

  // Puts the missing ingredients of the selected nights' meals on the list, one share per meal and night.
  async _fillNights(ds) {
    if (this._filling) return;
    this._filling = true;
    let n = 0;
    try {
      const fresh = await this._f.fetch(); if (fresh) this._items = fresh.map(parseShop);
      let open = this._items.filter((s) => !s.done);
      for (const nt of this._nights(open).filter((x) => ds.includes(x.d))) for (const { m, ings } of nt.miss) {
        const merged = new Map();
        for (const i of ings) { const k = normName(i.name); if (merged.has(k)) merged.get(k).q.push(i.qty); else merged.set(k, { i, q: [i.qty] }); }
        for (const [k, { i, q }] of merged) {
          const share = { meal: m.name, date: nt.d, qty: sumQty(q.filter(Boolean).map((x) => scaleQty(x, factor(m, nt.d)))) || "1" };
          const ex = open.find((s) => normName(s.name) === k);
          if (ex && ex.uid) { ex.for.push(share); await this._f.call("update_item", { item: ex.uid, description: composeShop(ex) }); }
          else {
            const nm = shopName(i.name);
            const s = { name: nm, qty: "", aisle: i.aisle || guessAisle(nm), for: [share], have: [], notes: "" };
            await this._f.call("add_item", { item: nm, description: composeShop(s) });
            // Read it back, so a later meal needing the same thing joins this line rather than making another.
            const again = await this._f.fetch();
            if (again) open = again.map(parseShop).filter((x) => !x.done); else open.push(Object.assign(s, { uid: null, done: false }));
          }
          n++;
        }
      }
    } finally { this._filling = false; }
    this._toast(`Added ${n} ingredient${n === 1 ? "" : "s"} to the list`);
  }

  // Drops a night's share from every open item; an item that was only for that night goes.
  async _dropNights(ds) {
    let n = 0;
    for (const s of (this._items || []).filter((x) => !x.done && x.for.some((f) => ds.includes(f.date)))) {
      s.for = s.for.filter((f) => !ds.includes(f.date));
      if (!s.for.length && !s.qty) await this._f.call("remove_item", { item: s.uid });
      else await this._f.call("update_item", { item: s.uid, description: composeShop(s) });
      n++;
    }
    for (const d of ds) this._past.delete(d);
    this._paint();
    this._toast(`Took ${ds.length === 1 ? longDay(ds[0]) : ds.length + " nights"} off · ${n} item${n === 1 ? "" : "s"}`);
  }

  // Pantry ingredients of meals planned from today on: kept off the list, but listed to check the cupboard against.
  // A tick is keyed on the meals and nights that need the item, so planning another meal that needs it asks again.
  _pantryChecks() {
    const t = today(), out = new Map(), cov = this._cov;
    for (const m of this._meals) for (const d of m.plan) {
      if (d < t || (this._sel.size && !this._sel.has(d))) continue;
      if (!this._sel.size && cov && d >= cov.f && d <= cov.u) continue; // the last shop covered it
      for (const i of m.ingredients) {
        if (!isPantry(i) || !i.name) continue;
        const k = normName(i.name);
        if (!out.has(k)) out.set(k, { name: i.name, for: [] });
        out.get(k).for.push({ meal: m.name, date: d, qty: scaleQty(i.qty, factor(m, d)) || "1" });
      }
    }
    return [...out.values()].map((p) => Object.assign(p, { key: normName(p.name) + "|" + p.for.map((f) => f.meal + "@" + f.date).sort().join(",") }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }
  _pantryHave() { try { return JSON.parse(localStorage.getItem(PANTRY_KEY) || "{}") || {}; } catch (e) { return {}; } }
  _pantrySet(all) { try { localStorage.setItem(PANTRY_KEY, JSON.stringify(all)); } catch (e) { /* storage off */ } }

  _pantryHtml(open) {
    const pc = this._pc = this._pantryChecks();
    if (!pc.length) return "";
    const have = this._pantryHave();
    // A line for it, open or already ticked into the trolley, means it is sorted; a "we have it" line counts as checked.
    const lines = (p) => (this._items || []).filter((s) => normName(s.name) === normName(p.name));
    const where = (p) => { const ls = lines(p); return ls.some((s) => !s.done && !isGhost(s)) ? "list" : ls.some((s) => s.done) ? "trolley" : ""; };
    const ghost = (p) => lines(p).some((s) => isGhost(s));
    const state = (p) => where(p) ? 2 : have[p.key] || ghost(p) ? 1 : 0;
    const left = pc.filter((p) => !state(p)).length;
    const rows = [...pc].sort((a, b) => state(a) - state(b)).map((p) => {
      const st = state(p), k = pc.indexOf(p);
      const days = [...new Set(p.for.map((f) => f.meal))].map((meal) => `<span class="chip" title="${esc(p.for.filter((f) => f.meal === meal).map((f) => longDay(f.date)).join(", "))}">${this._emojiFor(meal)} ${esc(meal)}</span>`).join("");
      return `<div class="it${st ? " done" : ""}" style="--gc:#ee8455">
        <button class="ck${st === 1 ? " on" : ""}" data-a="phave" data-k="${k}" aria-label="${st === 1 ? "Not sure I have" : "Have"} ${esc(p.name)}" ${st === 2 ? "disabled" : ""}>${st === 1 ? "✓" : ""}</button>
        <div class="tx" data-a="pedit" data-k="${k}"><div class="nm">${esc(p.name)}</div><div class="sb">${days}</div></div>
        <span class="qt">${esc(sumQty(p.for.map((f) => f.qty)))}</span>
        ${st === 2 ? `<span class="chip">${where(p) === "trolley" ? "🛒 In the trolley" : "On the list"}</span>` : `<button class="btn sm" data-a="padd" data-k="${k}">＋ List</button>`}</div>`;
    }).join("");
    return `<div class="grp pantry" style="--gc:#ee8455"><div class="gh" data-a="pfold" style="cursor:pointer"><span class="gi">🫙</span><span class="gn">Check the pantry</span>
      <span class="gc">${left ? left + " to check" : "All checked"} ${this._pOpen ? "▾" : "▸"}</span></div>
      ${this._pOpen ? `<div class="phint mut">For ${this._sel.size ? "the next shop" : "meals planned from today"}. Tick what's in the cupboard; ＋ List adds what you need.</div>${rows}` : ""}</div>`;
  }

  _aisleOfIng(name) { const k = normName(name); for (const m of this._meals || []) for (const i of m.ingredients) if (normName(i.name) === k && i.aisle) return i.aisle; return ""; }
  async _pantryAdd(p) {
    const ex = (this._items || []).find((s) => !s.done && normName(s.name) === normName(p.name));
    if (ex) {
      for (const f of p.for) if (!ex.for.some((x) => x.meal === f.meal && x.date === f.date)) ex.for.push(f);
      await this._f.call("update_item", { item: ex.uid, description: composeShop(ex) });
    } else {
      const nm = shopName(p.name);
      const s = { name: nm, qty: "", aisle: this._aisleOfIng(p.name) || "Pantry", for: p.for.map((f) => Object.assign({}, f)), have: [], notes: "" };
      await this._f.call("add_item", { item: nm, description: composeShop(s) });
    }
    this._toast("Added " + p.name);
  }

  // Two open lines for the same thing become one: the older line keeps the meals, quantities and notes of both.
  async _mergeDupes() {
    if (this._merging || !this._items || !this._f.canDescribe()) return;
    const groups = new Map();
    for (const s of this._items.filter((x) => !x.done)) { const k = normName(s.name); if (!groups.has(k)) groups.set(k, []); groups.get(k).push(s); }
    const dupes = [...groups.values()].filter((g) => g.length > 1);
    if (!dupes.length) return;
    this._merging = true;
    try {
      for (const [keep, ...rest] of dupes) {
        for (const s of rest) {
          for (const f of s.for) if (!keep.for.some((x) => x.meal === f.meal && x.date === f.date)) keep.for.push(f);
          for (const f of s.have || []) if (!keep.have.some((x) => x.meal === f.meal && x.date === f.date)) keep.have.push(f);
          keep.qty = sumQty([keep.qty, s.qty].filter(Boolean));
          if (s.notes && !keep.notes.includes(s.notes)) keep.notes = [keep.notes, s.notes].filter(Boolean).join("\n");
        }
        await this._f.call("update_item", { item: keep.uid, description: composeShop(keep) });
        for (const s of rest) { try { await this._f.call("remove_item", { item: s.uid }); } catch (e) { /* the other screen got there first */ } }
      }
      this._toast(dupes.length === 1 ? "Merged a double-up: " + dupes[0][0].name : "Merged " + dupes.length + " double-ups");
    } finally { this._merging = false; }
  }

  _act(a, b) {
    if (a === "add") this._quickAdd();
    else if (a === "qk") this._addName(b.dataset.n, "");
    else if (a === "tick") { const s = this._item(b.dataset.uid); if (s) this._f.call("update_item", { item: s.uid, status: s.done ? "needs_action" : "completed" }); }
    else if (a === "clear") this._f.call("remove_completed_items", {});
    else if (a === "fold") { this._showDone = !this._showDone; this._paint(); }
    else if (a === "edit") this._sheetEdit(b.dataset.uid);
    else if (a === "have") { const s = this._item(b.dataset.uid); if (s) this._haveIt(s); }
    else if (a === "qkedit") this._sheetStaples();
    else if (a === "send") this._sheetSend();
    else if (a === "trolley") this._sheetTrolley();
    else if (a === "night") this._tapNight(b.dataset.d);
    else if (a === "shopdone") this._sheetDone();
    else if (a === "srl" || a === "srr") this._rowScroll(b, a === "srr" ? 1 : -1);
    else if (a === "nfill") this._fillNights([...this._sel]);
    else if (a === "ndrop") { if (this._past.size) this._dropNights([...this._past]); }
    else if (a === "pfold") { this._pOpen = !this._pOpen; this._paint(); }
    else if (a === "pedit") { const p = (this._pc || [])[Number(b.dataset.k)]; if (p) this._sheetPantry(p); }
    else if (a === "padd") { const p = (this._pc || [])[Number(b.dataset.k)]; if (p) this._pantryAdd(p); }
    else if (a === "phave") {
      const p = (this._pc || [])[Number(b.dataset.k)]; if (!p) return;
      const all = this._pantryHave();
      // A "we have it" line (left when ✕ took it off the list) also ticks it, so unticking clears that too.
      const ghosts = (this._items || []).filter((s) => isGhost(s) && normName(s.name) === normName(p.name));
      if (all[p.key] || ghosts.length) {
        delete all[p.key];
        for (const g of ghosts) { this._items = this._items.filter((s) => s !== g); this._f.call("remove_item", { item: g.uid }).catch(() => {}); }
      } else all[p.key] = Date.now();
      for (const k of Object.keys(all)) if (Date.now() - all[k] > 30 * 864e5) delete all[k];
      this._pantrySet(all); this._paint();
    }
  }

  // The open items as plain text, aisle by aisle, for pasting anywhere.
  _listText() {
    const open = (this._items || []).filter((s) => !s.done && !isGhost(s) && this._inSel(s));
    const t = today();
    const out = [`Shopping list, ${dayNum(t)} ${monShort(t)}` + (this._rng ? " · for " + this._rngTxt() : "")];
    for (const a of this._aisles) {
      const its = open.filter((s) => this._aisle(s.aisle).name === a.name).sort((x, y) => x.name.localeCompare(y.name));
      if (!its.length) continue;
      out.push("", a.name);
      for (const s of its) out.push("- " + s.name + (this._tot(s) ? " (" + this._tot(s) + ")" : "") + (s.notes ? " - " + s.notes.split("\n")[0] : ""));
    }
    return out.join("\n");
  }

  _sheetSend() {
    const text = this._listText();
    const n = (this._items || []).filter((s) => !s.done && !isGhost(s) && this._inSel(s)).length;
    const canShare = !!navigator.share;
    const html = `<div class="pad">
      <h2>Send the list</h2>
      <p class="mut" style="margin:6px 0 12px;font-size:13px">${n} item${n === 1 ? "" : "s"} in aisle order. ${canShare ? "Share it straight to an app, or copy it" : "Copy it"} and paste it into the supermarket app, a message or notes.</p>
      <textarea class="i snd" readonly>${esc(text)}</textarea>
      </div>
      <div class="foot"><button class="btn" data-a="close">Close</button><span class="sp"></span>
        <button class="btn" data-a="done">✓ Done shopping…</button>${canShare ? `<button class="btn" data-a="share">📤 Share…</button>` : ""}<button class="btn pri" data-a="copy">📋 Copy</button></div>`;
    const ov = this._openSheet(html, async (a) => {
      if (a === "close") this._closeSheet();
      else if (a === "done") this._sheetDone();
      else if (a === "share") { try { await navigator.share({ title: "Shopping list", text }); } catch (e) { /* cancelled */ } }
      else if (a === "copy") this._toast(await this._copy(text, ov.querySelector("textarea")) ? "Copied. Paste it wherever you like." : "Couldn't copy here. Select the text and copy it.");
    });
    ov.querySelector("textarea").addEventListener("focus", (e) => e.target.select());
  }

  // navigator.clipboard needs https; on a plain-http panel fall back to selecting the text and execCommand.
  async _copy(text, ta) {
    try { if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(text); return true; } } catch (e) { /* fall through */ }
    try { ta.focus(); ta.select(); ta.setSelectionRange(0, text.length); return document.execCommand("copy"); } catch (e) { return false; }
  }

  // The quick-add chips, one item each in the staples list.
  _sheetStaples(refresh) {
    const list = this._staples || [];
    const rows = list.length ? `<div class="stl">${list.map((x) => `<div class="str"><span class="nm">${esc(x.name)}</span>
      <button class="rm" data-a="srm" data-uid="${esc(x.uid)}" aria-label="Remove ${esc(x.name)}">✕</button></div>`).join("")}</div>` : `<p class="mut">No quick-add items yet.</p>`;
    if (refresh && this._ov) { const el = this._ov.querySelector("#strows"); if (el) el.innerHTML = rows; return; }
    const html = `<div class="pad">
      <h2>Quick-add items</h2>
      <p class="mut" style="margin:6px 0 12px;font-size:13px">One tap on the list adds these. Add the things you buy most weeks.</p>
      <div id="strows">${rows}</div>
      <div class="sta"><input class="i" id="stnew" placeholder="e.g. Sourdough" enterkeyhint="done" autocomplete="off"><button class="btn pri" data-a="sadd">＋ Add</button></div>
      </div>
      <div class="foot"><span class="sp"></span><button class="btn pri" data-a="close">Done</button></div>`;
    const add = async () => {
      const el = this._ov && this._ov.querySelector("#stnew"); if (!el) return;
      let v = el.value.trim(); if (!v) return;
      v = v.charAt(0).toUpperCase() + v.slice(1);
      el.value = ""; el.focus();
      if ((this._staples || []).some((x) => normName(x.name) === normName(v))) { this._toast(v + " is already there"); return; }
      await this._stf.call("add_item", { item: v });
    };
    const ov = this._openSheet(html, async (a, b) => {
      if (a === "close") this._closeSheet();
      else if (a === "sadd") add();
      else if (a === "srm") await this._stf.call("remove_item", { item: b.dataset.uid });
    });
    ov.querySelector("#stnew").addEventListener("keydown", (e) => { if (e.key === "Enter") add(); });
    this._sheet = "staples";
  }

  _quickAdd() {
    const el = this.shadowRoot.getElementById("add");
    const v = el.value.trim(); if (!v) return;
    const m = v.match(/^(\d+(?:[.,/]\d+)?\s*(?:kg|g|ml|l|L|x|×|pk|packs?|bags?|jars?|tins?|cans?|bottles?|dozen)?)\s+(.+)$/i);
    let qty = m ? m[1].replace(/\s*[x×]$/i, "").trim() : "", name = m ? m[2] : v;
    name = name.charAt(0).toUpperCase() + name.slice(1);
    this._addName(name, qty);
    el.value = ""; el.focus();
  }

  // Typing something already on the list adds to it as an extra of its own (1 if no amount is given),
  // on top of what the meals need: the meals' shares are untouched, so it stays when a meal is unplanned.
  async _addName(name, qty) {
    const same = (s) => !s.done && normName(s.name) === normName(name);
    const ex = (this._items || []).find((s) => same(s) && !isGhost(s)) || (this._items || []).find((s) => same(s) && this._f.canDescribe());
    if (ex && this._f.canDescribe()) {
      const before = ex.qty;
      ex.qty = sumQty([ex.qty || (ex.for.length || isGhost(ex) ? "" : "1"), qty || "1"].filter(Boolean)) || qty || "1";
      await this._f.call("update_item", { item: ex.uid, description: composeShop(ex) });
      const tot = sumQty([ex.qty, ...ex.for.map((f) => f.qty)].filter(Boolean));
      this._toast(ex.for.length ? `${shopName(ex.name)} · ${ex.qty} extra on top of the meals · ${tot} in all` : `${shopName(ex.name)} · now ${tot}`);
      return;
    }
    const s = { name, qty, aisle: guessAisle(name), for: [], have: [], notes: "" };
    if (this._f.canDescribe()) await this._f.call("add_item", { item: name, description: composeShop(s) });
    else await this._f.call("add_item", { item: name + (qty ? " (" + qty + ")" : "") });
    this._toast("Added " + name);
  }

  // "We have it": off the list now. Its planned nights are remembered under have:, so the shop's ＋ and
  // re-saving the meal don't bring it back; a line added by hand just goes.
  async _haveIt(s) {
    const keep = s.for.filter((f) => ISO.test(f.date));
    s.have = [...(s.have || []), ...keep.filter((f) => !(s.have || []).some((x) => x.meal === f.meal && x.date === f.date))];
    s.for = []; s.qty = "";
    if (!s.have.length) await this._f.call("remove_item", { item: s.uid });
    else await this._f.call("update_item", { item: s.uid, description: composeShop(s) });
    this._toast(shopName(s.name) + " taken off the list");
  }

  // Keeps the list in step with the meals: a meal's share goes when the meal no longer uses that ingredient
  // (or the night was unplanned), brackets come off names, and old "we have it" notes expire.
  async _tidy() {
    if (this._tidying || !this._items || !this._meals.length || !this._f.canDescribe()) return;
    this._tidying = true;
    const t = today();
    let n = 0;
    try {
      for (const s of this._items.filter((x) => !x.done)) {
        const k = normName(s.name);
        const ok = (f, have) => {
          const m = this._meals.find((x) => x.name === f.meal); if (!m) return true; // a meal we can't see (renamed mid-save): leave it
          const ings = m.ingredients.filter((i) => normName(i.name) === k);
          if (!ings.length) return false;
          if (!ISO.test(f.date)) return !have || m.plan.some((d) => d >= t);
          if (f.date < t) return !have;
          return m.plan.includes(f.date);
        };
        const nf = s.for.filter((f) => ok(f, false)), nh = (s.have || []).filter((f) => ok(f, true)), nm = shopName(s.name);
        if (nf.length === s.for.length && nh.length === (s.have || []).length && nm === s.name) continue;
        // Never empty a line that had shares here and still has a hand-added quantity: just drop the shares.
        const was = s.for.length + (s.have || []).length;
        s.for = nf; s.have = nh;
        try {
          if (was && !s.for.length && !s.qty && !s.have.length) await this._f.call("remove_item", { item: s.uid });
          else await this._f.call("update_item", { item: s.uid, rename: nm, description: composeShop(Object.assign(s, { name: nm })) });
          n++;
        } catch (e) { /* another screen changed it first */ }
      }
    } finally { this._tidying = false; }
    return n;
  }

  // Whether the meals that use this treat it as a pantry staple; null when no meal uses it.
  _stapleOf(name) {
    const k = normName(name), hits = this._meals.flatMap((m) => m.ingredients.filter((i) => normName(i.name) === k));
    return hits.length ? hits.some((i) => isPantry(i)) : null;
  }
  _stapleHtml(name) {
    const st = this._stapleOf(name), n = this._meals.filter((m) => m.ingredients.some((i) => normName(i.name) === normName(name))).length;
    if (st === null || !this._mf) return "";
    return `<label class="f">In ${n} meal${n === 1 ? "" : "s"}</label><div class="tg"><span class="chip${st ? " on" : ""}" data-a="pst" data-k="1">⭐ Pantry staple</span><span class="chip${st ? "" : " on"}" data-a="pst" data-k="0">Always on the list</span></div>
      <div class="mut" style="font-size:12.5px;margin-top:6px">A staple stays off the list and shows under Check the pantry, so you only add it when you're out.</div>
      <div class="tg" style="margin-top:10px"><span class="chip${this._frozenOf(name) ? " on" : ""}" data-a="frz">❄️ Needs defrosting</span></div>
      <div class="mut" style="font-size:12.5px;margin-top:6px">Frozen things get a reminder the morning their meal is planned.</div>`;
  }
  _frozenOf(name) { const k = normName(name); return this._meals.some((m) => m.ingredients.some((i) => normName(i.name) === k && i.frozen)); }
  async _frozenTap(name) {
    this._closeSheet();
    const k = normName(name), on = !this._frozenOf(name);
    for (const m of this._meals) {
      const ings = m.ingredients.filter((i) => normName(i.name) === k); if (!ings.length) continue;
      for (const i of ings) i.frozen = on;
      await this._mf.call("update_item", { item: m.uid, rename: m.name, description: composeMeal(m) });
    }
    this._toast(on ? `❄️ ${name} needs defrosting now` : `${name} no longer needs defrosting`);
  }
  async _stapleTap(name, on) {
    this._closeSheet();
    if (this._stapleOf(name) === on) return;
    await this._setStaple(name, on);
    this._toast(on ? `⭐ ${name} is a pantry staple now` : `${name} will go on the list for its meals`);
  }

  // Makes an ingredient a staple (or not) in every meal that uses it, then moves its planned shares off (or onto) the list.
  async _setStaple(name, on) {
    const k = normName(name), t = today(), back = [];
    let aisle = "";
    for (const m of this._meals) {
      const ings = m.ingredients.filter((i) => normName(i.name) === k); if (!ings.length) continue;
      for (const i of ings) { i.staple = on; i.list = !on && PANTRY_AISLES.includes(i.aisle); aisle = aisle || i.aisle; }
      await this._mf.call("update_item", { item: m.uid, rename: m.name, description: composeMeal(m) });
      if (!on) for (const d of m.plan) if (d >= t) back.push({ meal: m.name, date: d, qty: sumQty(ings.map((i) => scaleQty(i.qty, factor(m, d))).filter(Boolean)) || "1" });
    }
    const ex = (this._items || []).find((x) => !x.done && normName(x.name) === k);
    if (on) {
      if (!ex) return;
      // Shares for planned nights come off; anything added by hand or from a meal sheet stays.
      ex.for = ex.for.filter((f) => !ISO.test(f.date));
      if (!ex.for.length && !ex.qty) await this._f.call("remove_item", { item: ex.uid });
      else await this._f.call("update_item", { item: ex.uid, description: composeShop(ex) });
    } else if (back.length) {
      if (ex) {
        for (const f of back) if (!ex.for.some((x) => x.meal === f.meal && x.date === f.date)) ex.for.push(f);
        await this._f.call("update_item", { item: ex.uid, description: composeShop(ex) });
      } else await this._f.call("add_item", { item: shopName(name), description: composeShop({ name: shopName(name), qty: "", aisle: aisle || guessAisle(name), for: back, have: [], notes: "" }) });
    }
  }

  _sheetPantry(p) {
    const html = `<div class="pad"><h2>${esc(p.name)}</h2>
      <p class="mut" style="margin:6px 0 0;font-size:14px">For ${[...new Set(p.for.map((f) => this._emojiFor(f.meal) + " " + f.meal + " (" + dayWord(f.date) + ")"))].map(esc).join(", ")}</p>
      ${this._stapleHtml(p.name)}</div>
      <div class="foot"><span class="sp"></span><button class="btn pri" data-a="close">Close</button></div>`;
    this._openSheet(html, (a, b) => { if (a === "close") this._closeSheet(); else if (a === "pst") this._stapleTap(p.name, b.dataset.k === "1"); else if (a === "frz") this._frozenTap(p.name); });
  }

  _sheetEdit(uid) {
    const s0 = this._item(uid); if (!s0) return;
    const s = JSON.parse(JSON.stringify(s0));
    const html = `<div class="pad">
      <h2>Edit item</h2>
      <label class="f">Name</label><input class="i" data-f="name" value="${esc(s.name)}">
      <label class="f">${s.for.length ? "Extra quantity (on top of the meals below)" : "Quantity"}</label><input class="i" data-f="qty" value="${esc(s.qty)}" placeholder="e.g. 2 L">
      ${s.for.length ? `<div class="fromm mut">From meals: ${s.for.map((f) => `${this._emojiFor(f.meal)} ${esc(f.meal)}${ISO.test(f.date) ? " (" + dayWord(f.date) + ")" : ""} ${esc(f.qty)}`).join(" · ")}</div>` : ""}
      <label class="f">Aisle</label>
      <div class="ais">${this._aisles.map((a) => `<span class="chip${a.name === this._aisle(s.aisle).name ? " on" : ""}" style="--ac:${a.colour}" data-a="ais" data-n="${esc(a.name)}">${a.icon} ${esc(a.name)}</span>`).join("")}</div>
      <label class="f">Note</label><input class="i" data-f="notes" value="${esc(s.notes)}" placeholder="Brand, size, “only if on special”…">
      ${this._stapleHtml(s0.name)}
      </div>
      <div class="foot"><button class="btn del" data-a="del">✕ Take off the list</button>
        ${this._stf && !(this._staples || []).some((x) => normName(x.name) === normName(s.name)) ? `<button class="btn" data-a="staple">＋ Quick-add</button>` : ""}
        <span class="sp"></span><button class="btn" data-a="cancel">Cancel</button><button class="btn pri" data-a="save">Save</button></div>`;
    const ov = this._openSheet(html, async (a, b) => {
      if (a === "cancel") this._closeSheet();
      else if (a === "staple") { await this._stf.call("add_item", { item: s.name.trim() || s0.name }); b.remove(); this._toast((s.name.trim() || s0.name) + " added to quick-add"); }
      else if (a === "pst") this._stapleTap(s0.name, b.dataset.k === "1");
      else if (a === "frz") this._frozenTap(s0.name);
      else if (a === "ais") { s.aisle = b.dataset.n; ov.querySelectorAll(".ais .chip").forEach((x) => x.classList.toggle("on", x === b)); }
      else if (a === "del") { this._closeSheet(); await this._haveIt(s0); }
      else if (a === "save") {
        s.name = s.name.trim() || s0.name;
        await this._f.call("update_item", { item: uid, rename: s.name, description: composeShop(s) });
        this._closeSheet();
      }
    }, (e) => { const f = e.target.dataset.f; if (f) s[f] = e.target.value; }, { guard: true });
  }
}

// 🛒 Woolworths trolley, part of the shopping list card (needs the Woolies Bridge add-on; admins only).
// Kept in its own file and mixed into the class, so the shopping list file stays readable.
Object.assign(ShoppingListCard.prototype, {
  _wbOn() { const h = this._hass; return !!(h && h.states["sensor.woolies_bridge"] && h.user && h.user.is_admin); },
  // One request to the add-on: fire woolies_request, wait for the woolies_result with the same id.
  async _wb(op, data = {}, ms = 90000) {
    if (!this._wbSub) {
      this._wbWait = {};
      this._wbSub = this._hass.connection.subscribeEvents((ev) => {
        const d = ev.data || {}, w = this._wbWait[d.id]; if (!w) return;
        delete this._wbWait[d.id]; clearTimeout(w.t);
        d.ok ? w.res(d.data) : w.rej(new Error(d.error || "Woolies Bridge failed"));
      }, "woolies_result").catch((e) => { this._wbSub = null; throw e; });
    }
    await this._wbSub;
    const id = Math.random().toString(36).slice(2);
    const p = new Promise((res, rej) => { this._wbWait[id] = { res, rej, t: setTimeout(() => { delete this._wbWait[id]; rej(new Error("No answer from the Woolies Bridge add-on. Is it running?")); }, ms) }; });
    await this._hass.callWS({ type: "fire_event", event_type: "woolies_request", event_data: Object.assign({ id, op }, data) });
    return p;
  },
  _wbItems() { return (this._items || []).filter((s) => (!s.done || (this._wres || {})[s.uid]) && !isGhost(s) && this._inSel(s)).sort((a, b) => this._aisles.indexOf(this._aisle(a.aisle)) - this._aisles.indexOf(this._aisle(b.aisle)) || a.name.localeCompare(b.name)); },
  // How many to put in the trolley: counts stay counts; grams and millilitres are worked out from the pack size;
  // loose produce sold by weight goes in by the kilo.
  _wbQty(s, mt) {
    const tot = qtyMap([this._tot(s) || s.qty || "1"]), by = [...tot.by.entries()];
    const meas = by.find(([k]) => k === "g" || k === "ml"), cnt = by.find(([k]) => k !== "g" && k !== "ml");
    if (mt.dual && meas && meas[0] === "g" && !cnt) return { qty: Math.max(0.1, Math.round(meas[1].n / 100) / 10), unit: "Kilogram" };
    if (cnt && !meas) return { qty: Math.max(1, Math.ceil(cnt[1].n - 1e-9)), unit: "Each" };
    if (meas) {
      const pk = parseQty(String(mt.size || "").replace(/(\d)([a-z])/i, "$1 $2"));
      if (pk && pk.n && pk.u === meas[0]) return { qty: Math.max(1, Math.ceil(meas[1].n / pk.n - 0.05)), unit: "Each" };
    }
    return { qty: 1, unit: "Each" };
  },
  _wbRow(s) {
    const k = normName(s.name), mt = (this._wmap || {})[k], q = this._wq[s.uid] || (mt && !mt.skip ? this._wbQty(s, mt) : null);
    const st = this._wres[s.uid];
    return `<div class="wbr${mt && mt.skip ? " skip" : ""}"><div class="wbt"><b>${esc(s.name)}</b> <span class="mut">${esc(this._tot(s) || "")}</span>
        ${st ? `<span class="wbs ${st.ok ? "ok" : "bad"}">${st.ok ? "✓ in trolley" : "⚠️ " + esc(st.error)}</span>` : ""}</div>
      <div class="wbm">${!mt ? `<button class="btn sm pri" data-a="wbpick" data-uid="${esc(s.uid)}">🔎 Choose product</button>`
        : mt.skip ? `<span class="mut">Not buying online</span><button class="btn sm" data-a="wbpick" data-uid="${esc(s.uid)}">Choose product</button>`
        : `<span class="wbp" data-a="wbpick" data-uid="${esc(s.uid)}" title="Tap to change">${esc(mt.name)}${mt.size ? ` <span class="mut">${esc(mt.size)}</span>` : ""}${mt.price ? ` <span class="mut">$${Number(mt.price).toFixed(2)}</span>` : ""}</span>
          <span class="svs wq"><button data-a="wbq" data-uid="${esc(s.uid)}" data-k="-1" aria-label="Fewer">−</button><b>${q.unit === "Kilogram" ? q.qty + " kg" : q.qty}</b><button data-a="wbq" data-uid="${esc(s.uid)}" data-k="1" aria-label="More">+</button></span>`}</div></div>`;
  },
  async _sheetTrolley(refresh) {
    this._wq = this._wq || {}; this._wres = this._wres || {};
    if (!refresh) { this._wmap = null; this._wres = {}; }
    const its = this._wbItems();
    const sen = this._hass.states["sensor.woolies_bridge"] || { state: "unknown", attributes: {} };
    const ready = (this._wmap ? its.filter((s) => { const m = this._wmap[normName(s.name)]; return m && !m.skip && !(this._wres[s.uid] || {}).ok; }) : []);
    const todo = this._wmap ? its.filter((s) => !this._wmap[normName(s.name)]).length : 0;
    const body = !this._wmap ? `<p class="mut">Loading your product matches…</p>` : !its.length ? `<p class="mut">Nothing on the next shop.</p>` : its.map((s) => this._wbRow(s)).join("");
    const html = `<div class="pad"><h2>🛒 Fill the Woolworths trolley</h2>
      <p class="mut" style="margin:6px 0 10px;font-size:13px">Pick the product for each item once and it's remembered. Then one tap adds them all. Book the slot and check out in the Woolworths app.
      ${sen.state === "error" || sen.state === "signed_out" ? `<br><span class="noi">⚠️ ${esc(sen.attributes.last_error || "Woolies Bridge needs attention.")}</span>` : ""}</p>
      ${todo ? `<div class="nh mut" style="margin:0 0 8px">${todo} item${todo === 1 ? "" : "s"} still to match.</div>` : ""}
      <div id="wbrows">${body}</div></div>
      <div class="foot"><button class="btn" data-a="close">Close</button><span class="sp"></span>
        <label class="wbk"><input type="checkbox" id="wbtick" ${this._wtick === false ? "" : "checked"}> Tick off</label>
        <button class="btn pri" data-a="wbadd" ${ready.length && !this._wbusy ? "" : "disabled"}>${this._wbusy ? "Adding…" : `Add ${ready.length} to trolley`}</button></div>`;
    if (refresh && this._ov && this._sheet === "trolley") { const sh = this._ov.querySelector(".sh"), y = sh.scrollTop; sh.innerHTML = html; sh.scrollTop = y; }
    else {
      this._openSheet(html, async (a, b) => {
        if (a === "close") this._closeSheet();
        else if (a === "wbpick") { const s = this._item(b.dataset.uid); if (s) this._sheetWSearch(s); }
        else if (a === "wbq") {
          const s = this._item(b.dataset.uid), mt = s && this._wmap[normName(s.name)]; if (!mt) return;
          const q = Object.assign({}, this._wq[s.uid] || this._wbQty(s, mt)), step = q.unit === "Kilogram" ? 0.1 : 1;
          q.qty = Math.max(step, Math.round((q.qty + step * Number(b.dataset.k)) * 10) / 10); this._wq[s.uid] = q; this._sheetTrolley(true);
        } else if (a === "wbadd") this._wbAdd();
      });
      this._ov.addEventListener("change", (e) => { if (e.target.id === "wbtick") this._wtick = e.target.checked; });
      this._sheet = "trolley";
    }
    if (!this._wmap) {
      try { this._wmap = await this._wb("map_get", {}, 30000); } catch (e) { this._wmap = {}; this._toast(e.message); }
      if (this._sheet === "trolley") this._sheetTrolley(true);
    }
  },
  async _wbAdd() {
    const its = this._wbItems().filter((s) => { const m = this._wmap[normName(s.name)]; return m && !m.skip && !(this._wres[s.uid] || {}).ok; });
    if (!its.length || this._wbusy) return;
    this._wbusy = true; this._sheetTrolley(true);
    const items = its.map((s) => { const mt = this._wmap[normName(s.name)], q = this._wq[s.uid] || this._wbQty(s, mt); return { ref: s.uid, sku: mt.sku, qty: q.qty, unit: q.unit, name: s.name }; });
    try {
      const r = await this._wb("add", { items }, 60000 + items.length * 15000);
      for (const u of r.added || []) this._wres[u] = { ok: true };
      for (const f of r.failed || []) this._wres[f.ref] = { ok: false, error: f.error };
      if (this._wtick !== false) for (const u of r.added || []) this._f.call("update_item", { item: u, status: "completed" }).catch(() => {});
      this._toast(`🛒 ${(r.added || []).length} added to the trolley` + ((r.failed || []).length ? ` · ${r.failed.length} didn't go in` : ""));
    } catch (e) { this._toast(e.message); }
    this._wbusy = false; this._sheetTrolley(true);
  },
  // Search Woolworths for one list item and remember the product picked for it.
  _sheetWSearch(s, results, q) {
    q = q == null ? shopName(s.name) : q;
    const mt = (this._wmap || {})[normName(s.name)];
    const list = results === undefined ? `<p class="mut">Searching…</p>` : !results.length ? `<p class="mut">Nothing found. Try other words.</p>`
      : `<div class="wbl">${results.map((p, i) => `<div class="wbo${mt && mt.sku === p.sku ? " on" : ""}" data-a="wbset" data-k="${i}"><div><b>${esc(p.name)}</b>${p.brand ? ` <span class="mut">${esc(p.brand)}</span>` : ""}<div class="mut" style="font-size:12.5px">${esc(p.size || "")}${p.supports_dual_pricing ? " · sold by weight or each" : ""}${p.in_stock === false ? " · out of stock" : ""}</div></div>
          <div class="wbpr">${p.is_special && p.sale_price ? `<b class="sp2">$${Number(p.sale_price).toFixed(2)}</b>` : `$${Number(p.price || 0).toFixed(2)}`}</div></div>`).join("")}</div>`;
    const html = `<div class="pad"><h2>${esc(s.name)} <span class="mut" style="font-weight:500;font-size:15px">${esc(this._tot(s) || "")}</span></h2>
      <div class="sta" style="margin:8px 0 12px"><input class="i" id="wbq" value="${esc(q)}" enterkeyhint="search" autocomplete="off"><button class="btn pri" data-a="wbgo">🔎 Search</button></div>
      ${list}</div>
      <div class="foot"><button class="btn" data-a="back">‹ Back</button><span class="sp"></span>
        ${mt ? `<button class="btn" data-a="wbforget">Forget match</button>` : ""}<button class="btn" data-a="wbskip">Don't buy online</button></div>`;
    const go = async (text) => {
      this._sheetWSearch(s, undefined, text);
      try { const r = await this._wb("search", { q: text, limit: 20 }, 120000); if (this._sheet === "wsearch") this._sheetWSearch(s, r, text); }
      catch (e) { this._toast(e.message); if (this._sheet === "wsearch") this._sheetWSearch(s, [], text); }
    };
    const save = async (match) => {
      const key = normName(s.name);
      try { await this._wb("map_set", { key, match }, 30000); } catch (e) { this._toast(e.message); return; }
      if (match) this._wmap[key] = match; else delete this._wmap[key];
      delete this._wq[s.uid]; this._closeSheet(); this._sheetTrolley(true);
    };
    const ov = this._openSheet(html, async (a, b) => {
      if (a === "back") { this._closeSheet(); this._sheetTrolley(true); }
      else if (a === "wbgo") { const v = ov.querySelector("#wbq").value.trim(); if (v) go(v); }
      else if (a === "wbset") { const p = results[Number(b.dataset.k)]; if (p) save({ sku: p.sku, name: p.name, brand: p.brand || "", size: p.size || "", price: p.is_special && p.sale_price ? p.sale_price : p.price, dual: !!p.supports_dual_pricing }); }
      else if (a === "wbskip") save({ skip: true });
      else if (a === "wbforget") save(null);
    });
    ov.querySelector("#wbq").addEventListener("keydown", (e) => { if (e.key === "Enter") { const v = e.target.value.trim(); if (v) go(v); } });
    this._sheet = "wsearch";
    if (results === undefined && q && !this._wbSearching) { this._wbSearching = true; go(q).finally(() => { this._wbSearching = false; }); }
  }

});
customElements.define("meal-planner-card", MealPlannerCard);
customElements.define("shopping-list-card", ShoppingListCard);
window.customCards = window.customCards || [];
window.customCards.push(
  { type: "meal-planner-card", name: "Meal planner", description: "Tonight, this week's dinners and the meal library, on a Local To-do list." },
  { type: "shopping-list-card", name: "Shopping list (aisles)", description: "Shopping list grouped by aisle, filled from planned meals." }
);
console.info("%c meal-planner-card %c v" + MP_VERSION + " ", "background:#ee8455;color:#fff;border-radius:3px 0 0 3px", "background:#444;color:#fff;border-radius:0 3px 3px 0");
