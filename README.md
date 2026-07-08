# JJ Bake's — Home Bakery 🍰
CodeAlpha Full Stack Development Internship — Task 1 (Simple E-commerce Store)

---

## 1. What this website is

This is a cake-ordering website for JJ Bake's Home Bakery (Cheranmahadevi, Tirunelveli).
A customer can browse the menu, add items to a cart, and place a pre-order for home
delivery or store pickup. The bakery owner receives the order both as a saved record
on the server and as a ready-to-send WhatsApp message.

**Frontend:** plain HTML, CSS, and JavaScript (no frameworks).
**Backend:** Express.js (Node.js), with JSON files used as a simple database instead
of MongoDB or MySQL — enough for this project without adding extra complexity.

### Pages and features
- **Menu** — every cake, brownie, cookie, and jar item, each with its own photo,
  price, and unit (1/2 kg, jar, piece, etc.). Items without a fixed price (Bento Cake,
  Any Flavour Jar Cake, Tea Cakes, Bulk Orders) show "Contact us" instead, with an
  **Enquire** button that opens WhatsApp directly.
- **Category filters** — All, Cakes, Bento Cakes, Brownies, Cookies & Jars, Custom & Bulk.
- **Cart** — a slide-in drawer on the right; add, increase/decrease quantity, see the
  running total, saved in the browser so it isn't lost on refresh.
- **Checkout** — collects the customer's name, phone, delivery date (pre-order),
  delivery or pickup choice, address, and any notes (e.g. a birthday message on the cake).
- **Login / Register** — a simple account system (name, email, phone, password).
  Not required to place an order, but lets a returning customer be recognised.
- **Light / Dark theme toggle** — top-right button, remembered on the next visit.
- **Contact section** — phone, WhatsApp, Instagram (@home_baking29), and location.

## 2. Folder structure

```
jjbakes/
├── server.js              Express backend — all routes in one file
├── package.json
├── data/
│   ├── products.json      the menu (edit this to add/remove/change items)
│   ├── users.json         auto-created, stores registered accounts
│   └── orders.json        auto-created, stores every order placed
└── public/                 everything the browser loads
    ├── index.html
    ├── css/style.css
    ├── js/
    │   ├── theme.js         light/dark toggle
    │   └── app.js           menu rendering, cart, checkout, login/register
    └── images/              all the bakery's own cake photos
```

## 3. Running it on your laptop

Open a terminal inside the `jjbakes` folder and run:

```bash
npm install
npm start
```

Then open **http://localhost:3000** in your browser. Express serves the HTML, CSS,
and JS directly — there's no separate frontend server to run.

To have the server auto-restart while editing files, use `npm run dev` instead
(this uses nodemon, already listed in `package.json`).

## 4. How a customer's order reaches you

When someone clicks "Place order", two things happen:

1. **It's saved on the server** — the full order (items, name, phone, address, date)
   is written into `data/orders.json`, kept as a permanent record.
2. **A WhatsApp message opens automatically** — a pre-filled WhatsApp chat opens to
   your number (93444 21237) with the complete order already typed out: customer
   name, phone, items, total, delivery date, address, and notes. The customer only
   has to tap **Send**, and it lands directly in your WhatsApp — the same way you
   already take orders today, just faster and with no typos.

This number is set in `public/js/app.js`, in the line:
```js
const BAKERY_WHATSAPP = "919344421237";
```
If you ever change your business number, update it here.

## 5. Editing the menu

Everything on the menu comes from `data/products.json`. Each item looks like this:

```json
{
  "id": "cake-vanilla",
  "category": "Cakes",
  "name": "Vanilla Cake",
  "unit": "1/2 kg",
  "price": 300,
  "customizable": true,
  "image": "images/vanilla-cake.jpg"
}
```

- `price`: a number, or `null` to show "Contact us" instead (used for items without
  a fixed rate, like Bulk Orders).
- `customizable`: set to `true` to show a small "Custom design available" badge.
- `image`: path to a photo inside `public/images/`. To change a photo, drop the new
  file into that folder and update this path.
- To add a brand-new item, copy one of the existing entries and change the values —
  just make sure the `id` is unique.

## 6. How each Task-1 requirement is covered

| Requirement | Where |
|---|---|
| Product listing | `data/products.json` + `GET /api/products` + the menu grid |
| Product details (price, unit, custom design) | each product card |
| Shopping cart | cart logic in `app.js` + the slide-in drawer |
| Order processing | `POST /api/orders` → saved to `data/orders.json` |
| User registration/login | `/api/register`, `/api/login`, `/api/logout`, `/api/me` |
| Database | JSON files (`products.json`, `users.json`, `orders.json`) |

Note: login sessions use `express-session`'s default in-memory store, which works
well for a demo but resets when the server restarts. Worth mentioning as a "future
improvement (move to a real database with persistent sessions)" if asked about it.

## 7. Uploading to GitHub (per CodeAlpha's naming rule)

```bash
git init
git add .
git commit -m "JJ Bake's - CodeAlpha Task 1 e-commerce store"
git branch -M main
git remote add origin https://github.com/<your-username>/CodeAlpha_CakeStore.git
git push -u origin main
```
(The repository name must start with `CodeAlpha_`, per the internship instructions.)

## 8. Possible next steps

- An admin page to mark orders as "Confirmed" or "Delivered".
- Send the WhatsApp message automatically using the WhatsApp Business API, instead
  of relying on the customer to tap Send.
- Move from JSON files to a real database (MongoDB or SQLite) once comfortable —
  only the `readJSON`/`writeJSON` helper functions in `server.js` would need to
  change, not the route logic itself.
