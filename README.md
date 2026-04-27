# Byld Portfolio Management Backend

A TypeScript/Express backend for portfolio management with holdings tracking, transaction management, and webhook-based price alerts. Built with Prisma ORM, PostgreSQL, Pino logging, and Zod validation.

**Status**: ✅ Production Ready | **Node**: 24+ | **Database**: PostgreSQL 16

---

## 📌 Quick Links

### Getting Started
- **[Installation Guide](docs/INSTALLATION.md)** — Prerequisites, setup steps, verification
- **[Running the App](docs/RUNNING.md)** — Development, production, Docker deployment

### Using the API
- **[API Reference](docs/API.md)** — Complete endpoint documentation with curl examples
- **[System Architecture](docs/ARCHITECTURE.md)** — Design, tech stack, data flow

### For Developers
- **[Development Guide](docs/DEVELOPMENT.md)** — Folder structure, build, logging, money math
- **[Testing Guide](docs/TESTING.md)** — Writing tests, running test suites, coverage
- **[Database Guide](docs/DATABASE.md)** — Schema, Prisma commands, migrations

### Support & Contributing
- **[Troubleshooting](docs/TROUBLESHOOTING.md)** — Common issues and solutions
- **[Contributing Guide](docs/CONTRIBUTING.md)** — How to contribute, workflow, code style

---

## 🚀 Quick Start (One Command)

### Local Development
```bash
npm install && npm run dev
```
**Access**: API at `http://localhost:3000` | Docs at `http://localhost:3000/api-docs`

### Docker Production
```bash
docker compose up -d --build
```
**Access**: API at `http://localhost:3000` | Database: `localhost:5433`

### Run Tests
```bash
npm run test
```

---

## � Full Documentation

### Getting Started
1. [Installation](docs/INSTALLATION.md) — Setup requirements and steps
2. [Running the App](docs/RUNNING.md) — Start development/production server
3. Quick test: `npm run test`

### API & Architecture
4. [API Reference](docs/API.md) — All endpoints with examples
5. [Architecture](docs/ARCHITECTURE.md) — System design and tech stack
6. [Database Schema](docs/DATABASE.md) — Data models and Prisma

### Development
7. [Development Guide](docs/DEVELOPMENT.md) — Code structure and best practices
8. [Testing Guide](docs/TESTING.md) — Writing and running tests
9. [Contributing](docs/CONTRIBUTING.md) — How to contribute

### Troubleshooting & Support
10. [Troubleshooting](docs/TROUBLESHOOTING.md) — Solutions to common issues

---

## Available npm Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Run production build |
| `npm run test` | Run all tests |
| `npm run test:watch` | Tests in watch mode |
| `npm run test:backend` | Backend route tests only |
| `npm run test:webhook` | Webhook scheduler tests only |

---

## Docker Commands

| Command | Purpose |
|---------|---------|
| `docker compose up -d --build` | Start all services |
| `docker compose ps` | Check service status |
| `docker compose logs -f backend` | View backend logs |
| `docker compose down` | Stop all services |
| `BACKEND_PORT=3001 docker compose up -d --build` | Custom port |

---

## Key Files

| File | Purpose |
|------|---------|
| `src/index.ts` | Server entry point |
| `src/app.ts` | Express app setup |
| `src/controllers/` | Request handlers |
| `src/routes/route.ts` | Route definitions |
| `prisma/schema.prisma` | Database schema |
| `docker-compose.yml` | Docker services |
| `.env` | Environment variables |

---

## File Structure

```
server/
├── src/                      # Source code
│   ├── app.ts
│   ├── index.ts
│   ├── controllers/          # Request handlers
│   ├── routes/               # Route definitions
│   ├── utils/                # Shared utilities
│   ├── jobs/                 # Scheduled tasks
│   ├── config/               # Configuration
│   ├── constants/            # Constants & messages
│   ├── database/             # ORM exports
│   └── docs/                 # API docs
├── prisma/                   # Database
│   ├── schema.prisma
│   └── migrations/
├── tests/                    # Test files
├── docs/                     # Documentation (you are here)
├── dist/                     # Compiled output
├── README.md                 # This file
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── docker-compose.yml
└── Dockerfile
```

---

## 🔗 API Endpoints

### Portfolios
- `POST /v1/portfolios` — Create portfolio
- `GET /v1/portfolios/{id}` — Get portfolio summary

### Holdings
- `GET /v1/portfolios/{id}/holdings` — List all holdings

### Transactions
- `POST /v1/portfolios/{id}/transactions/buy` — Buy shares
- `POST /v1/portfolios/{id}/transactions/sell` — Sell shares

### Price Alerts
- `POST /v1/portfolios/{id}/alerts` — Create alert
- `GET /v1/portfolios/{id}/alerts` — List alerts
- `DELETE /v1/portfolios/{id}/alerts/{alertId}` — Delete alert

**See [API Reference](docs/API.md) for complete documentation with examples.

---

## 🆘 Need Help?

### Common Issues
- **Port in use?** → `lsof -ti:3000 | xargs kill -9` or use `PORT=3001 npm run dev`
- **Database errors?** → Check `docker compose ps` and `docker compose logs db`
- **Tests failing?** → Run `npm run build` first, then `npm run test`

➜ **See [Troubleshooting](docs/TROUBLESHOOTING.md) for detailed solutions.**

---

## 📝 Contributing

Want to contribute? Read the [Contributing Guide](docs/CONTRIBUTING.md) for:
- Development workflow
- Code style guidelines
- Testing requirements
- Pull request process

---

## 📋 Tech Stack

**Concise Stack Overview** — See [Architecture](docs/ARCHITECTURE.md) for details:
- **Runtime**: Node.js 24.x
- **Language**: TypeScript 6.0+
- **Framework**: Express 5.2+
- **Database**: PostgreSQL 16 + Prisma 7.8+
- **Logging**: Pino 10.3+
- **Validation**: Zod 4.3+
- **Testing**: Vitest 4.1+ + Supertest

---

## ✨ Features

✅ Complete portfolio CRUD operations  
✅ Buy/sell transaction management  
✅ Weighted average cost calculation  
✅ Webhook-based price alerts  
✅ Deterministic price feed for testing  
✅ Decimal.js for precise money arithmetic  
✅ Comprehensive REST API  
✅ Swagger UI documentation  
✅ Full test coverage  
✅ Docker ready  

---

## 🛠️ Quality Assurance

All contributions must pass:
```bash
npm run build      # TypeScript compilation
npm run test       # All tests
npx tsc --noEmit   # Type checking
docker compose config  # Docker validation
```

---

## 📄 License

ISC License — See [LICENSE](LICENSE) file

---

## 👤 Author

**Aditya N V**  
Email: adityanv4@gmail.com

---

## 🚀 Getting Started

**Fastest way to get up and running:**

```bash
# 1. Clone and setup
git clone <repo-url> && cd server

# 2. Install and run
npm install && npm run dev

# 3. Open in browser
# API: http://localhost:3000
# Docs: http://localhost:3000/api-docs
```

**Or with Docker:**
```bash
docker compose up -d --build
# http://localhost:3000
```

---

**Last Updated**: 27 April 2026  
**Status**: ✅ Production Ready

---

## Running the Application

### Local Development

```bash
npm run dev
```

**Output:**
```
[16:30:45.123] Server running at http://localhost:3000
[16:30:45.456] Swagger available at http://localhost:3000/api-docs
```

### Production Build

```bash
# Build TypeScript to JavaScript
npm run build

# Start production server
npm start
```

### Docker Deployment

#### Basic Usage

```bash
# Start backend + PostgreSQL
docker compose up -d --build

# Check services
docker compose ps

# View logs
docker compose logs -f backend
```

**Expected Output:**
```
backend     | healthy (after ~30s)
db          | healthy
```

#### Custom Configuration

```bash
# Use custom port
BACKEND_PORT=3001 docker compose up -d --build
# API available at http://localhost:3001

# Stop all services
docker compose down

# Stop and remove volumes (reset database)
docker compose down -v
```

**Access Endpoints:**
- API Server: `http://localhost:3000`
- Swagger UI: `http://localhost:3000/api-docs`
- PostgreSQL: `postgresql://Byld:root@localhost:5433/Byld-intern`

---

## API Reference

Complete API documentation with request/response examples.

### Overview

| Resource | Endpoints | Status |
|----------|-----------|--------|
| Portfolios | POST, GET | ✅ |
| Holdings | GET | ✅ |
| Transactions | POST (buy/sell) | ✅ |
| Price Alerts | POST, GET, DELETE | ✅ |

---

### Portfolios

#### POST /v1/portfolios — Create Portfolio

**Request:**
```bash
curl -X POST http://localhost:3000/v1/portfolios \
  -H "Content-Type: application/json" \
  -d '{
    "clientName": "John Doe",
    "riskProfile": "MODERATE"
  }'
```

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

#### GET /v1/portfolios/{id} — Get Portfolio Summary

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
    "holdings": [...]
  }
}
```

---

### Holdings

#### GET /v1/portfolios/{id}/holdings — List Holdings

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
    }
  ]
}
```

**Fields:**
- `holding_name`: Stock symbol
- `holding_units`: Number of shares
- `holding_value`: Total value in paise (₹1 = 100 paise)
- `exchange`: NSE or BSE
- `asset_category`: ETF, MTF, BONDS, SHARES, STOCKS
- `weightedAverageCostBasis`: Average cost per unit in paise

---

### Transactions

#### POST /v1/portfolios/{id}/transactions/buy — Buy Shares

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

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "tx-uuid-456",
    "symbol": "RELIANCE",
    "quantity": 100,
    "price": 3500000,
    "type": "BUY",
    "exchange": "NSE",
    "asset_category": "STOCKS"
  }
}
```

#### POST /v1/portfolios/{id}/transactions/sell — Sell Shares

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

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "tx-uuid-789",
    "symbol": "RELIANCE",
    "quantity": 50,
    "price": 3800000,
    "type": "SELL",
    "exchange": "NSE",
    "asset_category": "STOCKS"
  }
}
```

**Error Response (409 Conflict - Insufficient Quantity):**
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

### Price Alerts

#### POST /v1/portfolios/{id}/alerts — Create Price Alert

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
- `symbol`: Stock symbol (e.g., RELIANCE, INFY)
- `kind`: Alert type — `ABOVE` or `BELOW`
- `price`: Target price in paise
- `webhookUrl`: URL to POST webhook when alert fires

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "alert-uuid-123",
    "symbol": "RELIANCE",
    "kind": "ABOVE",
    "targetPrice": 4000000,
    "status": "ACTIVE",
    "createdAt": "2026-04-27T10:30:00Z"
  }
}
```

#### GET /v1/portfolios/{id}/alerts — List Alerts

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
    }
  ]
}
```

#### DELETE /v1/portfolios/{id}/alerts/{alertId} — Delete Alert

**Request:**
```bash
curl -X DELETE http://localhost:3000/v1/portfolios/550e8400-e29b-41d4-a716-446655440000/alerts/alert-uuid-123
```

**Response (204 No Content):**
```json
{ }
```

#### Webhook Payload (When Alert Fires)

**Paid to your webhookUrl:**
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

#### Testing Webhooks

1. Go to [webhook.site](https://webhook.site)
2. Copy your unique URL
3. Create an alert with that URL
4. Wait up to 30 seconds for the scheduler to trigger
5. View the payload on webhook.site

**Note:** Alerts fire at most once and become `INACTIVE` after firing.

---

## Testing

### Test Commands

```bash
# Run all tests
npm run test

# Watch mode (re-run on file changes)
npm run test:watch

# Backend routes tests only
npm run test:backend

# Webhook scheduler tests only
npm run test:webhook
```

### Test Coverage

| Module | Tests | Status |
|--------|-------|--------|
| Money Utils | ✅ | Decimal arithmetic, conversions |
| Portfolio Routes | ✅ | CRUD, validation, errors |
| Webhook Scheduler | ✅ | Alert firing, retry logic |

---

## Database

### Schema Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Portfolio                            │
│  ├─ id (UUID, PK)                                          │
│  ├─ portfolio_name (String)                                │
│  ├─ portfolio_risk (RISK: LOW|MODERATE|AGGRESSIVE)        │
│  ├─ portfolio_hold (Holdings[])  ──────┐                   │
│  ├─ transactions (Transaction[]) ──────┤                   │
│  └─ alerts (PriceAlert[])         ──────┤                   │
└─────────────────────────────────────────────────────────────┘
                   │
         ┌─────────┴──────────┬───────────────┐
         │                    │               │
    ┌────▼──────────┐  ┌──────▼────────┐  ┌──▼─────────────┐
    │   Holdings    │  │  Transactions │  │  PriceAlert    │
    ├──────────────┤  ├───────────────┤  ├────────────────┤
    │ id (UUID)    │  │ id (UUID)     │  │ id (UUID)      │
    │ symbol       │  │ symbol        │  │ symbol         │
    │ units        │  │ quantity      │  │ kind (ABOVE|   │
    │ value (paise)│  │ price (paise) │  │   BELOW)       │
    │ exchange     │  │ type (BUY|    │  │ targetPrice    │
    │ category     │  │   SELL)       │  │ webhookUrl     │
    │              │  │ createdAt     │  │ status (ACTIVE│
    │ Unique:      │  │               │  │   |INACTIVE)   │
    │ (portfolio,  │  │ Foreign Keys: │  │ firedAt        │
    │  symbol,     │  │ - portfolioId │  │                │
    │  exchange,   │  │               │  │ Foreign Key:   │
    │  category)   │  │               │  │ - portfolioId  │
    └──────────────┘  └───────────────┘  └────────────────┘
```

### Enums

**RISK:**
- LOW
- MODERATE
- AGGRESSIVE

**EXCHANGE:**
- NSE (National Stock Exchange)
- BSE (Bombay Stock Exchange)

**ASSET_CATEGORY:**
- ETF (Exchange-Traded Funds)
- MTF (Mutual Funds)
- BONDS
- SHARES
- STOCKS

**TRANSACTION_TYPE:**
- BUY
- SELL

**ALERT_KIND:**
- ABOVE
- BELOW

**ALERT_STATUS:**
- ACTIVE
- INACTIVE

### Prisma Commands

```bash
# View database UI
npx prisma studio

# Create/apply migration
npx prisma migrate dev --name <description>

# Reset database (dev only)
npx prisma migrate reset

# Validate schema
npx prisma validate

# Generate Prisma Client
npx prisma generate
```

---

## Development

### Folder Structure

```
server/
├── src/
│   ├── app.ts                    # Express app setup
│   ├── index.ts                  # Server entry point
│   ├── controllers/
│   │   ├── alerts.controller.ts  # Price alert logic
│   │   └── portfolio/
│   │       ├── buy.controller.ts
│   │       ├── sell.controller.ts
│   │       ├── holdings.controller.ts
│   │       ├── portfolio.controller.ts
│   │       └── shared.ts
│   ├── routes/
│   │   └── route.ts              # API route definitions
│   ├── jobs/
│   │   └── webhookScheduler.ts   # 30s alert scheduler
│   ├── utils/
│   │   ├── money.ts              # Decimal.js money math
│   │   ├── http.ts               # Response formatting
│   │   ├── priceFeed.ts          # Mock price generator
│   │   └── types.ts              # TypeScript types
│   ├── config/
│   │   └── logger.ts             # Pino logger setup
│   ├── constants/
│   │   └── messages.ts           # Centralized messages
│   ├── database/
│   │   └── primaClient.ts        # Prisma Client export
│   └── docs/
│       └── swagger.ts            # Swagger/OpenAPI docs
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── migrations/               # Migration files
├── tests/
│   ├── backend/                  # Route tests
│   ├── integration/              # Full flow tests
│   ├── unit/                     # Utils tests
│   └── webhook/                  # Scheduler tests
├── dist/                         # Compiled JS (build output)
├── README.md                     # This file
├── package.json
├── tsconfig.json
├── docker-compose.yml
└── Dockerfile
```

### Build & Compile

```bash
# TypeScript to JavaScript
npm run build

# Output: dist/ directory with compiled .js files
```

### Logging

All requests logged with Pino (structured JSON):

**Development (Pretty Format):**
```bash
npm run dev
# Output: colored, human-readable logs
```

**Production (JSON Format):**
```bash
npm start 2>&1 | jq
# Output: structured JSON, parseable by log aggregators
```

### Validation

All inputs validated with Zod before processing:

```json
// Validation Error Response
{
  "success": false,
  "error": "Validation failed",
  "errorCode": "VALIDATION_ERROR",
  "details": [
    {
      "field": "price",
      "message": "Expected number",
      "code": "invalid_type"
    }
  ]
}
```

### Decimal Money Math

All monetary calculations use `decimal.js` for precision:

```typescript
// All prices in paise (1 Rupee = 100 paise)
const price = 3500000;  // ₹35,000
const weighted = calculateWeightedCost(buyPrice, quantity);
```

**Why BigInt & Paise?**
- Eliminates floating-point errors
- Consistent across environments
- Deterministic results

---

## Troubleshooting

### Port Already in Use

```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

### Database Connection Error

```bash
# Verify DATABASE_URL
cat .env | grep DATABASE_URL

# Restart database
docker compose restart db

# Or reset completely
docker compose down -v
docker compose up -d
```

### Prisma Client Generation Failed

```bash
# Regenerate client
npx prisma generate

# Or full reset
npx prisma migrate reset
npx prisma generate
```

### Tests Failing

```bash
# Clear cache
rm -rf node_modules .vitest

# Reinstall and test
npm install
npm run test
```

### Docker Image Build Error

```bash
# Check for syntax errors
docker compose config

# Rebuild from scratch
docker compose down -v
docker compose up -d --build
```

### Webhook Not Firing

1. Verify alert status is `ACTIVE`
2. Wait 30 seconds (scheduler interval)
3. Check webhook URL is accessible
4. View container logs: `docker compose logs -f backend`

---

## Trade-offs & Architecture

### Money Handling
- **Choice**: Decimal.js for all calculations
- **Rationale**: Eliminates floating-point errors; all prices in paise
- **Impact**: Deterministic, precise results

### Webhook Scheduling
- **Choice**: node-cron (in-process)
- **Rationale**: Simple, no external dependencies
- **Trade-off**: Single-instance only; scale with queue (BullMQ, etc.)

### Error Responses
- **Choice**: Structured `ApiResponse` with `errorCode` and `details`
- **Rationale**: Consistent client handling
- **Impact**: Verbose but explicit

### Testing Strategy
- **Choice**: Mock Prisma in unit/integration tests
- **Rationale**: Fast, deterministic, CI/CD friendly
- **Trade-off**: Real DB tested with Docker

---

## Contributing

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes and test: `npm run test`
3. Build: `npm run build`
4. Run quality gates: `npm run build && npm run test && docker compose config`
5. Commit with clear messages
6. Push and create pull request

---

## License

ISC (See LICENSE file)

---

## Contact

**Author**: Aditya N V  
**Email**: adityanv4@gmail.com

---

**Last Updated**: 27 April 2026
