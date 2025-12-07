# Marketplace App

Ionic + Angular marketplace front end with a mock JSON API. Browse products, filter and sort them, manage a cart, check out, and (as a vendor) create or edit store inventory. Data persists locally for the cart and via `json-server` for the mock backend.

## Tech stack
- Angular 20 + Ionic 8 (standalone components, router guards, HttpClient)
- Capacitor Preferences for lightweight auth persistence; localStorage for carts
- Mock API via `json-server` (`api/db.json`) behind an Angular proxy at `/api`
- Optional Prisma + SQLite schema in `server/` for a future real API

## Features
- Product catalog with search, category chips, min/max price filters, quick filters (trending, budget, premium, recent), and sort (relevance, price, name).
- Product detail page with gallery, add/remove from cart, and quantity syncing.
- Cart page with quantity controls, price totals, and checkout flow that posts orders to `/api/orders`.
- Auth: register/login/logout, role-based guards, Capacitor-stored session; cart is stored per-user and survives logout.
- Vendor tools: store dashboard listing products, create/edit products (with optional image upload), delete products; guarded for `vendor` role.
- Order history + order detail for authenticated users.

## Getting started
1) Install Node 18+ and npm.  
2) Install dependencies:
```bash
npm install
```
3) Run the mock API (json-server) and the Ionic dev server together:
```bash
npm run dev
```
- `npm run api` runs `json-server` on http://localhost:3333 using `api/db.json`.
- `npm run web` runs `ionic serve` with `proxy.conf.json` so the app calls `/api/...` and hits the mock server.
If you do not have the Ionic CLI, install it or use `npx ionic serve -- --proxy-config proxy.conf.json`.

![alt text](screenshots/b35979418efaa440cb428c286febfb9f.png)


## Useful scripts
- `npm start` / `ng serve` – Angular dev server (no proxy).
- `npm run build` – production build.
- `npm test` – Angular unit tests.
- `npm run lint` – ESLint.

## API & data
- Mock data lives in `api/db.json` (`products`, `orders`, `users`, `stores`). Edit it and restart `npm run api` to change defaults.
- Proxy (`proxy.conf.json`) rewrites `/api` → `http://localhost:3333`.

### Default login accounts
- Vendor: `vendor@example.com` / `vendor123` (store `s1`)
- Customer: `customer@example.com` / `customer123`
Additional demo users are also seeded in `api/db.json`.

## Project structure
- `src/app/pages/` – feature pages (home, auth, cart, checkout, orders, product detail, store tools).
- `src/app/core/services/` – auth, product, order, and cart services.
- `src/app/shared/components/product-card/` – reusable product card.
- `api/db.json` – mock backend data.
- `server/` – Prisma schema + seed (`prisma/seed.ts`) for an eventual Express API (not required for the mock flow).

## Backend (optional)
The `server/` folder contains a Prisma + SQLite schema. To seed the database for experimentation:
```bash
cd server
npm install
npm run seed
```
No Express endpoints are wired up yet; the front end currently relies on `json-server`.

## Notes
- Auth state is saved with Capacitor Preferences; carts are persisted per-user in localStorage.
- Image uploads in the vendor product forms are encoded as base64 and posted to the mock API; adjust to your real backend as needed.
- The home page shows a build timestamp badge for cache/debug visibility.
