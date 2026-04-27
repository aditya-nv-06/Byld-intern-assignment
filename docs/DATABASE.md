# Database Schema & Management

Complete database documentation and Prisma ORM commands.

---

## Schema Overview

### Entity Relationship Diagram

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

---

## Models

### Portfolio

Stores client portfolios with risk profiles.

```prisma
model Portfolio {
  id String @id @default(uuid())
  portfolio_name String
  portfolio_risk RISK
  portfolio_hold Holdings[]
  transactions Transaction[]
  alerts PriceAlert[]
}
```

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key, auto-generated |
| `portfolio_name` | String | Client name |
| `portfolio_risk` | RISK enum | LOW, MODERATE, or AGGRESSIVE |

**Relations:**
- `portfolio_hold`: One-to-many Holdings
- `transactions`: One-to-many Transactions
- `alerts`: One-to-many Price Alerts

---

### Holdings

Tracks current positions per portfolio.

```prisma
model Holdings {
  id String @id @default(uuid())
  holding_name String
  holding_units Int
  holding_value BigInt
  exchange EXCHANGE
  asset_category ASSET_CATEGORY
  portfolioUser Portfolio @relation(fields: [portfolioId], references: [id])
  portfolioId String

  @@unique([portfolioId, holding_name, exchange, asset_category])
}
```

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `holding_name` | String | Stock symbol (e.g., RELIANCE) |
| `holding_units` | Int | Number of shares held |
| `holding_value` | BigInt | Total value in paise |
| `exchange` | EXCHANGE | NSE or BSE |
| `asset_category` | ASSET_CATEGORY | ETF, MTF, BONDS, SHARES, STOCKS |
| `portfolioId` | UUID | Foreign key to Portfolio |

**Constraints:**
- Unique on: (portfolioId, holding_name, exchange, asset_category)
- Ensures one record per symbol per portfolio

**Relations:**
- `portfolioUser`: Many-to-one Portfolio

---

### Transaction

Logs all buy and sell activities.

```prisma
model Transaction {
  id String @id @default(uuid())
  symbol String
  quantity Int
  price BigInt
  type TRANSACTION_TYPE
  exchange EXCHANGE
  asset_category ASSET_CATEGORY
  createdAt DateTime @default(now())
  portfolio Portfolio @relation(fields: [portfolioId], references: [id])
  portfolioId String
}
```

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `symbol` | String | Stock symbol |
| `quantity` | Int | Number of shares |
| `price` | BigInt | Price per share in paise |
| `type` | TRANSACTION_TYPE | BUY or SELL |
| `exchange` | EXCHANGE | NSE or BSE |
| `asset_category` | ASSET_CATEGORY | Asset type |
| `createdAt` | DateTime | Transaction timestamp |
| `portfolioId` | UUID | Foreign key to Portfolio |

**Relations:**
- `portfolio`: Many-to-one Portfolio

---

### PriceAlert

Tracks webhook-based price alerts.

```prisma
model PriceAlert {
  id String @id @default(uuid())
  symbol String
  kind ALERT_KIND
  targetPrice BigInt
  webhookUrl String
  status ALERT_STATUS @default(ACTIVE)
  firedAt DateTime?
  createdAt DateTime @default(now())
  portfolio Portfolio @relation(fields: [portfolioId], references: [id])
  portfolioId String
}
```

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `symbol` | String | Stock symbol |
| `kind` | ALERT_KIND | ABOVE or BELOW |
| `targetPrice` | BigInt | Target price in paise |
| `webhookUrl` | String | URL to POST to |
| `status` | ALERT_STATUS | ACTIVE or INACTIVE |
| `firedAt` | DateTime | When alert fired (null if not fired) |
| `createdAt` | DateTime | Alert creation timestamp |
| `portfolioId` | UUID | Foreign key to Portfolio |

**Relations:**
- `portfolio`: Many-to-one Portfolio

---

## Enums

### RISK

Portfolio risk profile:
- `LOW` - Conservative
- `MODERATE` - Balanced
- `AGGRESSIVE` - Growth-focused

### EXCHANGE

Indian stock exchanges:
- `NSE` - National Stock Exchange
- `BSE` - Bombay Stock Exchange

### ASSET_CATEGORY

Types of tradeable assets:
- `ETF` - Exchange-Traded Funds
- `MTF` - Mutual Funds
- `BONDS` - Bonds/Fixed Income
- `SHARES` - Individual shares
- `STOCKS` - Stock/equity instruments

### TRANSACTION_TYPE

Trade direction:
- `BUY` - Purchase
- `SELL` - Sale

### ALERT_KIND

Alert condition:
- `ABOVE` - Fire when price ≥ target
- `BELOW` - Fire when price ≤ target

### ALERT_STATUS

Alert state:
- `ACTIVE` - Monitoring price, not yet fired
- `INACTIVE` - Fired or manually dismissed

---

## Prisma Commands

### View Database UI

```bash
npx prisma studio
```

**Features:**
- Browse all tables
- Inspect records
- Add/edit/delete data
- Visual schema explorer

**Access:** `http://localhost:5555`

---

### Create Migration

```bash
npx prisma migrate dev --name <migration_name>
```

**Examples:**
```bash
npx prisma migrate dev --name init
npx prisma migrate dev --name add_price_alerts
npx prisma migrate dev --name update_holdings_constraint
```

**Process:**
1. Saves migration file to `prisma/migrations/`
2. Applies to development database
3. Regenerates Prisma Client

---

### Apply Pending Migrations

```bash
npx prisma migrate deploy
```

**Use:** Production deployments  
**Does not:** Create new migrations  
**Safety:** Idempotent - safe to run multiple times

---

### Reset Database (Dev Only)

```bash
npx prisma migrate reset
```

⚠️ **WARNING:** Deletes all data!

**Process:**
1. Drops database/schema
2. Creates new database
3. Applies all migrations
4. Runs seed scripts (if any)

**Use:** Local development, fixing stuck migrations

---

### Generate Prisma Client

```bash
npx prisma generate
```

**Creates:** Updated type definitions and client  
**Use:** After schema changes, before compilation

---

### Validate Schema

```bash
npx prisma validate
```

**Checks:** Schema syntax errors  
**Output:** Errors with line numbers

---

### Pull Database Schema

```bash
npx prisma db pull
```

**Generates** schema.prisma from existing database  
**Use:** Working with existing database

---

### Format Schema

```bash
npx prisma format
```

**Auto-formats:** prisma/schema.prisma  
**Consistency:** Enforces style rules

---

## Database Migrations

### Migration File Structure

```
prisma/migrations/
├── migration_lock.toml                # Lock file (don't edit)
├── 20260424155249_init/              # First migration
│   └── migration.sql
├── 20260425050814_add_exchange_and_asset_categories/
│   └── migration.sql
└── 20260425063010_add_price_alerts/
    └── migration.sql
```

### Sample Migration

```sql
-- prisma/migrations/20260425063010_add_price_alerts/migration.sql

-- CreateEnum
CREATE TYPE "ALERT_KIND" AS ENUM ('ABOVE', 'BELOW');

-- CreateEnum
CREATE TYPE "ALERT_STATUS" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateTable
CREATE TABLE "PriceAlert" (
  "id" TEXT NOT NULL,
  "symbol" TEXT NOT NULL,
  "kind" "ALERT_KIND" NOT NULL,
  "targetPrice" BIGINT NOT NULL,
  "webhookUrl" TEXT NOT NULL,
  "status" "ALERT_STATUS" NOT NULL DEFAULT 'ACTIVE',
  "firedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "portfolioId" TEXT NOT NULL,

  CONSTRAINT "PriceAlert_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PriceAlert" ADD CONSTRAINT "PriceAlert_portfolioId_fkey" 
  FOREIGN KEY ("portfolioId") REFERENCES "Portfolio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
```

---

## Data Types

### Prices (BigInt in Paise)

All monetary values stored as `BigInt` representing paise (1 Rupee = 100 paise):

```
Rupees  →  Paise
₹1      →  100
₹10     →  1,000
₹100    →  10,000
₹1,000  →  100,000
₹10,000 →  1,000,000
```

**Why BigInt?**
- Eliminates floating-point precision errors
- Deterministic arithmetic
- No rounding issues

---

## Query Examples

### Create Portfolio

```typescript
const portfolio = await prisma.portfolio.create({
  data: {
    portfolio_name: 'John Doe',
    portfolio_risk: 'MODERATE'
  }
});
```

### Get Portfolio with Holdings

```typescript
const portfolio = await prisma.portfolio.findUnique({
  where: { id: portfolioId },
  include: {
    portfolio_hold: true,
    transactions: true,
    alerts: true
  }
});
```

### Create Holding

```typescript
const holding = await prisma.holdings.upsert({
  where: {
    portfolioId_holding_name_exchange_asset_category: {
      portfolioId: id,
      holding_name: symbol,
      exchange: EXCHANGE.NSE,
      asset_category: ASSET_CATEGORY.STOCKS
    }
  },
  update: {
    holding_units: { increment: quantity },
    holding_value: { increment: totalValue }
  },
  create: {
    portfolioId: id,
    holding_name: symbol,
    exchange: EXCHANGE.NSE,
    asset_category: ASSET_CATEGORY.STOCKS,
    holding_units: quantity,
    holding_value: totalValue
  }
});
```

### List Active Alerts

```typescript
const alerts = await prisma.priceAlert.findMany({
  where: {
    portfolioId: id,
    status: 'ACTIVE'
  }
});
```

---

## Backup & Restore

### Backup (Docker)

```bash
# Backup database to file
docker exec byld-intern-server-db-1 pg_dump \
  -U Byld -d Byld-intern > backup.sql

# With compression
docker exec byld-intern-server-db-1 pg_dump \
  -U Byld -d Byld-intern | gzip > backup.sql.gz
```

### Restore (Docker)

```bash
# Restore from backup
docker exec -i byld-intern-server-db-1 psql \
  -U Byld -d Byld-intern < backup.sql

# From compressed backup
gunzip -c backup.sql.gz | docker exec -i byld-intern-server-db-1 psql \
  -U Byld -d Byld-intern
```

---

## Performance Optimization

### Database Indexes

Current indexes (from schema):
- `Portfolio.id` (Primary Key)
- `Holdings.id` (Primary Key)
- `Holdings.(portfolioId, holding_name, exchange, asset_category)` (Unique)
- `Transaction.id` (Primary Key)
- `PriceAlert.id` (Primary Key)

### Query Optimization Tips

```typescript
// ❌ Bad: N+1 queries
const portfolios = await prisma.portfolio.findMany();
for (const p of portfolios) {
  const holdings = await prisma.holdings.findMany({
    where: { portfolioId: p.id }
  });
}

// ✅ Good: Single query with include
const portfolios = await prisma.portfolio.findMany({
  include: { portfolio_hold: true }
});
```

---

## Connection Pooling

### Environment Variables

```env
# For connection pooling
DATABASE_URL="postgresql://Byld:root@localhost:5432/Byld-intern?schema=public&connection_limit=5"

# For Prisma Accelerate (if using)
PRISMA_ACCELERATE_URL="..."
```

---

## Troubleshooting

### Database Connection Error

```bash
# Test connection
npx prisma db execute --stdin < /dev/null

# Or with psql (if installed)
psql -U Byld -d Byld-intern -c "SELECT NOW();"
```

### Schema Drift Detected

```bash
# Fix by resetting (DEV ONLY)
npx prisma migrate reset

# Or manually reconcile
npx prisma migrate resolve --rolled-back <migration-name>
```

### Slow Queries

```bash
# Enable query logging (development)
DATABASE_LOGGING=true npm run dev

# Check query performance
npx prisma studio  # Browse and analyze queries
```

---

## Next Steps

- [Development](DEVELOPMENT.md)
- [Troubleshooting](TROUBLESHOOTING.md)
