# Byld Internship Assignment

## API Docs

Swagger UI is available at `/api-docs` when the server is running.

Sample transaction payload (Indian market):

```json
{
  "symbol": "RELIANCE",
  "exchange": "NSE",
  "assetCategory": "STOCKS",
  "quantity": 2,
  "price": 2984.25
}
```

## Price Alerts & Webhooks

Create price alerts that fire webhooks when price conditions are met:

```bash
curl -X POST http://localhost:3000/v1/portfolios/{portfolioId}/alerts \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "RELIANCE",
    "kind": "ABOVE",
    "price": 3000.00,
    "webhookUrl": "https://webhook.site/your-unique-id"
  }'
```

### Testing Webhooks with webhook.site

1. Go to [https://webhook.site](https://webhook.site)
2. Copy your unique URL (e.g., `https://webhook.site/550e8400-e29b-41d4-a716-446655440000`)
3. Use it in the `webhookUrl` field when creating an alert
4. The webhook scheduler runs every 30 seconds and posts to this URL when price conditions are met
5. Alerts fire **at most once** and are then marked `INACTIVE`

### Available Alert Endpoints

- `POST /v1/portfolios/:id/alerts` - Create a new price alert
- `GET /v1/portfolios/:id/alerts` - List all alerts for a portfolio
- `DELETE /v1/portfolios/:id/alerts/:alertId` - Delete a price alert

## Docker

Start the backend and database with:

```bash
docker compose up --build
```

If port 3000 is already in use, run with a custom host port:

```bash
BACKEND_PORT=3001 docker compose up --build
```

The backend waits for the DB healthcheck and runs Prisma migrations on startup.

## Quality Gates

Run these before submission:

```bash
npm run build
npm run test
docker compose config
```

## Trade-Off Notes

- Money math uses `decimal.js` for deterministic paise arithmetic and weighted average cost calculations.
- API errors return a structured contract with `errorCode` and optional `details` for consistent client handling.
- Integration tests mock Prisma for speed and deterministic behavior; this favors reliable route behavior checks over full DB coupling in CI.
- Price feed is deterministic/mock based on symbol and timestamp for reproducible alert testing (varies ±5% per minute window from base prices).
