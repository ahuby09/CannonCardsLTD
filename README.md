# Cannon Cards TCG Ecommerce Store

Full-stack ecommerce app for sealed Pokémon products and Pokémon single cards.

## Stack

- React + Vite frontend
- Node.js + Express backend
- MySQL database
- Stripe Checkout for real payments
- Shippo for real rates, labels, tracking, and QR code URLs when the selected carrier returns them
- PokeWallet autocomplete through backend-only API calls

## Render Backend Deployment

The repository includes a `render.yaml` Blueprint for the Express API.

1. In Render, select **New > Blueprint** and connect this repository.
2. Select the `main` branch and confirm the `render.yaml` Blueprint.
3. Enter every environment variable that Render prompts for.
4. After the first deployment, set `API_BASE_URL` to the generated Render service URL.
5. Set `CLIENT_ORIGIN`, `CLIENT_SUCCESS_URL`, and `CLIENT_CANCEL_URL` to the deployed frontend URLs.
6. Configure Stripe to send `checkout.session.completed` events to:

   `https://YOUR-RENDER-SERVICE.onrender.com/api/stripe/webhook`

The API health check is available at `/api/health`.

Render's free web service filesystem is temporary. Product images uploaded through the admin interface must use external object storage before production use.

