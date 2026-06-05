# Cannon Cards TCG Ecommerce Store

Full-stack ecommerce app for sealed Pokémon products and Pokémon single cards.

## Stack

- React + Vite frontend
- Node.js + Express backend
- MySQL database
- Stripe Checkout for real payments
- Shippo for real rates, labels, tracking, and QR code URLs when the selected carrier returns them
- PokeWallet autocomplete through backend-only API calls

## Setup

1. Install dependencies:

```bash
npm run install:all
```

2. Create a MySQL database:

```sql
CREATE DATABASE pokemon_store;
```

3. Import the schema and seed data:

```bash
mysql -u root -p pokemon_store < backend/src/db/schema.sql
mysql -u root -p pokemon_store < backend/src/db/seed.sql
```

4. Copy `.env.example` to `.env` at the project root and fill in real values:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

5. Create the admin user:

```bash
npm run create-admin --prefix backend
```

6. Start the app:

```bash
npm run dev
```

Frontend: `http://localhost:5173`

Backend: `http://localhost:4000/api`

## Required Environment Variables

The backend intentionally returns clear configuration errors when required keys are missing. It does not fall back to mock payment, shipping, or autocomplete data.

Stripe:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `CLIENT_SUCCESS_URL`
- `CLIENT_CANCEL_URL`

Shippo:

- `SHIPPO_API_TOKEN`
- `SHIP_FROM_*` sender address values
- This store is configured for UK shipping only. Use `SHIP_FROM_COUNTRY=GB`.

PokeWallet:

- `POKEWALLET_API_KEY`

Auth:

- `JWT_SECRET`

MySQL:

- `MYSQL_HOST`
- `MYSQL_PORT`
- `MYSQL_USER`
- `MYSQL_PASSWORD`
- `MYSQL_DATABASE`

## Stripe Webhooks Locally

For local development, do not create a webhook endpoint in the Stripe Dashboard. Use the Stripe CLI to forward Stripe events to your local backend.

1. Install the Stripe CLI.
2. Log in:

```bash
stripe login
```

3. Forward events to the backend:

```bash
stripe listen --forward-to localhost:4000/api/stripe/webhook
```

4. The CLI prints a webhook signing secret that starts with `whsec_`. Copy that value into `.env`:

```env
STRIPE_WEBHOOK_SECRET=whsec_your_local_cli_secret
```

5. The important event is:

```text
checkout.session.completed
```

When Stripe sends that event, the backend verifies the signature, prevents duplicate webhook processing, marks the order paid, stores Stripe IDs, and reduces stock.

## Shippo Setup

1. Create a Shippo account.
2. Add `SHIPPO_API_TOKEN` to `.env`.
3. Fill in the `SHIP_FROM_*` sender address fields using your UK dispatch address.
4. Set `SHIP_FROM_COUNTRY=GB`.
5. During checkout, `/api/shipping/rates` creates a real Shippo shipment and stores returned rates.
6. The backend rejects non-UK delivery addresses before requesting Shippo rates.
7. After payment, the admin order page can create a real Shippo label from the selected rate.

## PokeWallet Setup

Add `POKEWALLET_API_KEY` to `.env`.

The frontend calls only:

```text
GET /api/admin/pokewallet/search?q=...
GET /api/pokewallet/images/:id
```

The backend attaches the PokeWallet API key server-side.

## Admin Flow

1. Sign in with the admin account created by `npm run create-admin --prefix backend`.
2. Go to `/admin`.
3. Create sealed products manually from `/admin/products/new`.
4. Create Pokémon singles with autocomplete from `/admin/singles/new`.
5. Manage inventory and product status from `/admin/products`.
6. View paid orders and generate Shippo labels from `/admin/orders`.

## Customer Flow

1. Browse `/products`.
2. Search and filter singles or sealed products.
3. Add products to basket.
4. Enter delivery address at checkout.
5. Select a real UK Shippo shipping rate.
6. Pay through Stripe Checkout.
7. Return to the order confirmation page.
8. Logged-in customers can view order history at `/orders`.

## Legal Pages

The footer links to Terms of Sale, Privacy Policy, Cookies and Browser Storage, Returns and Refunds, Shipping Policy, Product Warnings, and Contact pages.

Before launch, update the real trader details in:

```text
frontend/src/config/legal.js
```

At minimum, set the legal entity, UK trading address, support email, VAT status/VAT number if applicable, and response times. The current config is set as not VAT registered.

## Notes

- The frontend never receives Stripe, Shippo, or PokeWallet API keys.
- The backend never trusts frontend prices.
- Stock is reduced only after a verified Stripe webhook confirms payment.
- Duplicate Stripe webhook events are ignored using the `webhook_events` table.
