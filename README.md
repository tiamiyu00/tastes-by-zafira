# Tastes by Zafira 🍽️

> **Home food, the Zafira way** — A full-stack Nigerian food ordering web app with WhatsApp checkout.

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 19 + TypeScript + Vite        |
| Backend   | Node.js + Express                   |
| Database  | JSON flat-file (`server/db.json`)   |
| Styling   | Pure CSS (Playfair Display + Poppins)|
| Routing   | React Router DOM v7                 |

---

## Getting Started

### Prerequisites
- Node.js 18+ installed

### 1. Clone & Install

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server && npm install && cd ..
```

### 2. Add the Logo

Place your logo file in:
```
public/assets/Tastes_by_Zafira_logo_design__1_-removebg-preview.png
```

### 3. Run (Both Together)

```bash
npm run start
```

This starts:
- **Frontend** at `http://localhost:5173`
- **Backend API** at `http://localhost:5000`

### Or Run Separately

```bash
# Terminal 1 — Backend
npm run server

# Terminal 2 — Frontend
npm run dev
```

---

## Project Structure

```
tastes-by-zafira/
├── public/
│   └── assets/               ← Logo goes here
├── server/
│   ├── index.js              ← Express API server
│   ├── db.json               ← JSON database (menu + settings)
│   └── package.json
├── src/
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── FoodCard.tsx
│   │   ├── Cart.tsx          ← Slide-out cart sidebar
│   │   ├── CheckoutModal.tsx ← WhatsApp order form
│   │   ├── Hero.tsx
│   │   └── PromoSection.tsx
│   ├── context/
│   │   ├── CartContext.tsx   ← Cart state (persists to localStorage)
│   │   └── SettingsContext.tsx ← Fetches settings from API
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Menu.tsx
│   │   └── Admin.tsx         ← Password-protected admin panel
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   └── index.css
├── package.json
└── vite.config.ts
```

---

## Pages

| Route    | Description                                         |
|----------|-----------------------------------------------------|
| `/`      | Home page — hero, popular items, promos             |
| `/menu`  | Full menu with category filters and search          |
| `/admin` | Admin panel (password: **zafira2024**)              |

---

## API Endpoints

All endpoints are served at `http://localhost:5000`.

| Method | Endpoint          | Description              |
|--------|-------------------|--------------------------|
| GET    | `/api/menu`       | Get all menu items       |
| POST   | `/api/menu`       | Add new menu item        |
| PUT    | `/api/menu/:id`   | Update a menu item       |
| DELETE | `/api/menu/:id`   | Delete a menu item       |
| GET    | `/api/settings`   | Get store settings       |
| PUT    | `/api/settings`   | Update store settings    |

---

## Admin Panel

Visit `/admin` and enter the password: **`zafira2024`**

From the admin panel you can:
- Add / edit / delete menu items
- Toggle item availability (show/hide on menu)
- Mark items as Popular or Chef's Special
- Update WhatsApp number, delivery fee, and store name

---

## WhatsApp Order Flow

1. Customer adds items to cart
2. Clicks **Place Order** → fills out delivery form
3. Clicks **Send Order via WhatsApp**
4. Browser opens WhatsApp with a pre-formatted order message
5. Customer sends the message to confirm the order

To update the WhatsApp number, go to `/admin` → **Store Settings**.

---

## Customisation

- **Prices & menu**: Edit via the admin panel or directly in `server/db.json`
- **WhatsApp number**: Admin panel → Store Settings
- **Delivery fee**: Admin panel → Store Settings
- **Brand colours**: Change CSS variables in `src/index.css` under `:root`
- **Fonts**: Update Google Fonts link in `index.html`
