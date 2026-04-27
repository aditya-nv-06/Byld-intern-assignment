# API Reference

Complete API documentation with request/response examples.

## Overview

| Resource | Endpoints | Status |
|----------|-----------|--------|
| Portfolios | POST, GET | ✅ |
| Holdings | GET | ✅ |
| Transactions | POST (buy/sell) | ✅ |
| Price Alerts | POST, GET, DELETE | ✅ |

**Base URL:** `http://localhost:3000`  
**API Version:** `v1`

---

## Error Handling

All endpoints return standardized error responses.

### Success Response

```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response

```json
{
  "success": false,
  "error": "Human-readable error message",
  "errorCode": "ERROR_CODE",
  "details": { ... }
}
```

### HTTP Status Codes

| Status | Code | Scenario |
|--------|------|----------|
| 200 | OK | Successful GET/HEAD |
| 201 | CREATED | Resource created |
| 204 | NO CONTENT | Successful DELETE |
| 400 | VALIDATION_ERROR | Invalid request |
| 404 | NOT_FOUND | Resource not found |
| 409 | CONFLICT | Insufficient quantity, etc. |
| 500 | INTERNAL_SERVER_ERROR | Server error |

---

## Portfolios

### POST /v1/portfolios — Create Portfolio

**Request:**
```bash
curl -X POST http://localhost:3000/v1/portfolios \
  -H "Content-Type: application/json" \
  -d '{
    "clientName": "John Doe",
    "riskProfile": "MODERATE"
  }'
```

**Parameters:**
- `clientName` (string, required): Client/portfolio name
- `riskProfile` (enum, required): LOW | MODERATE | AGGRESSIVE

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "portfolio_name": "John Doe",
    "portfolio_risk": "MODERATE"
  }
}
```

**Errors:**
- `VALIDATION_ERROR` (400): Missing/invalid fields

---

### GET /v1/portfolios/{id} — Get Portfolio Summary

**Request:**
```bash
curl http://localhost:3000/v1/portfolios/550e8400-e29b-41d4-a716-446655440000
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "portfolio_name": "John Doe",
    "portfolio_risk": "MODERATE",
    "totalValue": 50000000,
    "cashBalance": 10000000,
    "holdings": [
      {
        "id": "...",
        "holding_name": "RELIANCE",
        "holding_units": 100,
        "holding_value": 350000000
      }
    ]
  }
}
```

**Fields:**
- `totalValue`: Total portfolio value in paise
- `cashBalance`: Available cash in paise
- `holdings`: Array of current positions

**Errors:**
- `NOT_FOUND` (404): Portfolio not found

---

## Holdings

### GET /v1/portfolios/{id}/holdings — List Holdings

**Request:**
```bash
curl http://localhost:3000/v1/portfolios/550e8400-e29b-41d4-a716-446655440000/holdings
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-123",
      "holding_name": "RELIANCE",
      "holding_units": 100,
      "holding_value": 350000000,
      "exchange": "NSE",
      "asset_category": "STOCKS",
      "weightedAverageCostBasis": 3500000
    },
    {
      "id": "uuid-456",
      "holding_name": "INFY",
      "holding_units": 50,
      "holding_value": 200000000,
      "exchange": "NSE",
      "asset_category": "STOCKS",
      "weightedAverageCostBasis": 4000000
    }
  ]
}
```

**Fields:**
- `holding_name`: Stock symbol
- `holding_units`: Number of shares held
- `holding_value`: Total value in paise (₹1 = 100 paise)
- `exchange`: NSE or BSE
- `asset_category`: ETF, MTF, BONDS, SHARES, STOCKS
- `weightedAverageCostBasis`: Average cost per unit in paise

**Errors:**
- `NOT_FOUND` (404): Portfolio not found

---

## Transactions

### POST /v1/portfolios/{id}/transactions/buy — Buy Shares

**Request:**
```bash
curl -X POST http://localhost:3000/v1/portfolios/550e8400-e29b-41d4-a716-446655440000/transactions/buy \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "RELIANCE",
    "quantity": 100,
    "price": 3500000,
    "exchange": "NSE",
    "assetCategory": "STOCKS"
  }'
```

**Parameters:**
- `symbol` (string, required): Stock symbol (e.g., RELIANCE, INFY)
- `quantity` (integer, required): Number of shares (> 0)
- `price` (number, required): Price per share in paise
- `exchange` (enum, required): NSE | BSE
- `assetCategory` (enum, required): ETF | MTF | BONDS | SHARES | STOCKS

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "tx-uuid-123",
    "symbol": "RELIANCE",
    "quantity": 100,
    "price": 3500000,
    "type": "BUY",
    "exchange": "NSE",
    "asset_category": "STOCKS",
    "createdAt": "2026-04-27T10:30:00Z"
  }
}
```

**Side Effects:**
- Creates transaction record
- Updates/creates holding
- Updates holding weighted average cost

**Errors:**
- `VALIDATION_ERROR` (400): Invalid parameters
- `NOT_FOUND` (404): Portfolio not found

---

### POST /v1/portfolios/{id}/transactions/sell — Sell Shares

**Request:**
```bash
curl -X POST http://localhost:3000/v1/portfolios/550e8400-e29b-41d4-a716-446655440000/transactions/sell \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "RELIANCE",
    "quantity": 50,
    "price": 3800000,
    "exchange": "NSE",
    "assetCategory": "STOCKS"
  }'
```

**Parameters:**
- `symbol` (string, required): Stock symbol
- `quantity` (integer, required): Number of shares to sell (> 0, <= held quantity)
- `price` (number, required): Price per share in paise
- `exchange` (enum, required): NSE | BSE
- `assetCategory` (enum, required): ETF | MTF | BONDS | SHARES | STOCKS

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "tx-uuid-456",
    "symbol": "RELIANCE",
    "quantity": 50,
    "price": 3800000,
    "type": "SELL",
    "exchange": "NSE",
    "asset_category": "STOCKS",
    "createdAt": "2026-04-27T10:35:00Z"
  }
}
```

**Side Effects:**
- Creates transaction record
- Decreases holding quantity
- If quantity drops to 0, holding is deleted

**Errors:**
- `VALIDATION_ERROR` (400): Invalid parameters
- `NOT_FOUND` (404): Portfolio or holding not found
- `CONFLICT` (409): Insufficient quantity

**Error Example (409):**
```json
{
  "success": false,
  "error": "Insufficient quantity",
  "errorCode": "CONFLICT",
  "details": {
    "requested": 150,
    "available": 100
  }
}
```

---

## Price Alerts (Webhooks)

### POST /v1/portfolios/{id}/alerts — Create Price Alert

**Request:**
```bash
curl -X POST http://localhost:3000/v1/portfolios/550e8400-e29b-41d4-a716-446655440000/alerts \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "RELIANCE",
    "kind": "ABOVE",
    "price": 4000000,
    "webhookUrl": "https://webhook.site/unique-url"
  }'
```

**Parameters:**
- `symbol` (string, required): Stock symbol
- `kind` (enum, required): ABOVE | BELOW
- `price` (number, required): Target price in paise
- `webhookUrl` (string, required): URL to POST webhook to

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "alert-uuid-123",
    "symbol": "RELIANCE",
    "kind": "ABOVE",
    "targetPrice": 4000000,
    "webhookUrl": "https://webhook.site/unique-url",
    "status": "ACTIVE",
    "createdAt": "2026-04-27T10:30:00Z",
    "firedAt": null
  }
}
```

**Behavior:**
- Alert starts in `ACTIVE` status
- Scheduler checks every 30 seconds
- When triggered, webhook is POSTed and alert becomes `INACTIVE`
- Alert fires at most once

**Errors:**
- `VALIDATION_ERROR` (400): Invalid parameters
- `NOT_FOUND` (404): Portfolio not found

---

### GET /v1/portfolios/{id}/alerts — List Alerts

**Request:**
```bash
curl http://localhost:3000/v1/portfolios/550e8400-e29b-41d4-a716-446655440000/alerts
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "alert-uuid-123",
      "symbol": "RELIANCE",
      "kind": "ABOVE",
      "targetPrice": 4000000,
      "status": "ACTIVE",
      "firedAt": null,
      "createdAt": "2026-04-27T10:30:00Z"
    },
    {
      "id": "alert-uuid-456",
      "symbol": "INFY",
      "kind": "BELOW",
      "targetPrice": 1500000,
      "status": "INACTIVE",
      "firedAt": "2026-04-27T10:45:00Z",
      "createdAt": "2026-04-27T10:35:00Z"
    }
  ]
}
```

**Filter Options:**
- All alerts returned (both ACTIVE and INACTIVE)

**Errors:**
- `NOT_FOUND` (404): Portfolio not found

---

### DELETE /v1/portfolios/{id}/alerts/{alertId} — Delete Alert

**Request:**
```bash
curl -X DELETE http://localhost:3000/v1/portfolios/550e8400-e29b-41d4-a716-446655440000/alerts/alert-uuid-123
```

**Response (204 No Content):**
```json
{ }
```

**Behavior:**
- Deletes alert from database
- Alert can be ACTIVE or INACTIVE
- Cannot be undone

**Errors:**
- `NOT_FOUND` (404): Portfolio or alert not found

---

## Webhooks (Incoming)

### Webhook Payload Structure

When an alert fires, a POST is sent to your `webhookUrl`:

```json
{
  "alertId": "alert-uuid-123",
  "symbol": "RELIANCE",
  "kind": "ABOVE",
  "currentPrice": 4100000,
  "targetPrice": 4000000,
  "portfolioId": "550e8400-e29b-41d4-a716-446655440000",
  "firedAt": "2026-04-27T10:35:00Z"
}
```

**Fields:**
- `alertId`: Unique alert identifier
- `symbol`: Stock symbol
- `kind`: Alert type that fired (ABOVE or BELOW)
- `currentPrice`: Current price in paise
- `targetPrice`: Target price in paise
- `portfolioId`: Portfolio ID
- `firedAt`: Timestamp alert fired

**Retry Logic:**
- Up to 3 attempts with exponential backoff
- 1s, 2s, 4s delays
- Logs failures but continues

---

## Testing with webhook.site

1. Go to [webhook.site](https://webhook.site)
2. Copy your unique URL (e.g., `https://webhook.site/550e8400-...`)
3. Create alert with that URL:
```bash
curl -X POST http://localhost:3000/v1/portfolios/{id}/alerts \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "RELIANCE",
    "kind": "ABOVE",
    "price": 4000000,
    "webhookUrl": "https://webhook.site/550e8400-..."
  }'
```
4. Wait up to 30 seconds for scheduler
5. View payload in webhook.site dashboard

---

## Price Units

All prices are in **paise** (1 Rupee = 100 paise):

| Amount | Paise |
|--------|-------|
| ₹1 | 100 |
| ₹10 | 1,000 |
| ₹100 | 10,000 |
| ₹1,000 | 100,000 |
| ₹10,000 | 1,000,000 |
| ₹35,000 | 3,500,000 |

---

## Next Steps

- [Testing](TESTING.md)
- [Troubleshooting](TROUBLESHOOTING.md)
