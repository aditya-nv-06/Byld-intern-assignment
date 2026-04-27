# Development Guide

Development workflow, folder structure, and best practices.

---

## Folder Structure

```
server/
├── src/
│   ├── app.ts                    # Express app setup
│   ├── index.ts                  # Server entry point
│   ├── controllers/
│   │   ├── alerts.controller.ts  # Price alert endpoints
│   │   └── portfolio/
│   │       ├── buy.controller.ts       # Buy transaction logic
│   │       ├── sell.controller.ts      # Sell transaction logic
│   │       ├── holdings.controller.ts  # Get holdings logic
│   │       ├── portfolio.controller.ts # Get portfolio summary
│   │       └── shared.ts        # Shared utilities (validation, etc)
│   ├── routes/
│   │   └── route.ts              # All route definitions
│   ├── jobs/
│   │   └── webhookScheduler.ts   # 30s alert scheduler
│   ├── utils/
│   │   ├── money.ts              # Decimal.js money utilities
│   │   ├── http.ts               # Response formatting
│   │   ├── priceFeed.ts          # Mock price generator
│   │   └── types.ts              # Shared TypeScript types
│   ├── config/
│   │   └── logger.ts             # Pino logger setup
│   ├── constants/
│   │   └── messages.ts           # Centralized error messages
│   ├── database/
│   │   └── primaClient.ts        # Prisma Client export
│   ├── docs/
│   │   └── swagger.ts            # Swagger/OpenAPI definition
│   └── generated/
│       └── prisma/               # Auto-generated Prisma types
├── prisma/
│   ├── schema.prisma             # Prisma ORM schema
│   └── migrations/               # Database migration files
├── tests/
│   ├── backend/                  # Route & API tests
│   │   └── backend.routes.test.ts
│   ├── integration/              # Full workflow tests
│   │   └── portfolio.routes.test.ts
│   ├── unit/                     # Utility function tests
│   │   └── money.test.ts
│   └── webhook/                  # Scheduler tests
│       └── webhook.scheduler.test.ts
├── dist/                         # Compiled JS files (after npm run build)
├── docs/                         # Documentation (this folder)
│   ├── ARCHITECTURE.md
│   ├── INSTALLATION.md
│   ├── RUNNING.md
│   ├── API.md
│   ├── TESTING.md
│   ├── DATABASE.md
│   ├── DEVELOPMENT.md
│   ├── TROUBLESHOOTING.md
│   └── CONTRIBUTING.md
├── README.md                     # Main documentation index
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
├── vitest.config.ts              # Test runner config
├── docker-compose.yml            # Docker services
├── Dockerfile                    # Backend image
└── .env                          # Environment variables (not in git)
```

---

## Build & Compilation

### TypeScript Compilation

```bash
npm run build
```

**Process:**
1. Compiles TypeScript to JavaScript
2. Validates types
3. Outputs to `dist/` directory
4. Generates source maps for debugging

**Configuration:** `tsconfig.json`
- Target: ES2020
- Module: CommonJS
- Strict type checking: enabled

### Viewing Compiled Output

```bash
# See compiled JavaScript
cat dist/index.js

# Tree of all compiled files
find dist -name "*.js" | head -20
```

---

## Logging

### Pino Logger Setup

**File:** `src/config/logger.ts`

```typescript
import pino from 'pino';

const logger = pino(
  {
    level: process.env.LOG_LEVEL || 'info',
    // Pretty printing in development
    transport: process.env.NODE_ENV === 'development' 
      ? { target: 'pino-pretty' }
      : undefined
  }
);

export default logger;
```

### Log Levels

| Level | Usage |
|-------|-------|
| `debug` | Detailed troubleshooting info |
| `info` | General operations, route hits |
| `warn` | Warnings (low quantity, etc) |
| `error` | Errors with stack traces |
| `fatal` | Critical server failures |

### Using Logger

```typescript
import logger from '../config/logger';

// In controllers
logger.info({ symbol: 'RELIANCE', qty: 100 }, 'Buy transaction executed');
logger.warn({ available: 50, requested: 100 }, 'Insufficient quantity');
logger.error(error, 'Failed to process transaction');
```

### Development Output

```bash
npm run dev
```

**Output (Pretty):**
```
[16:30:45.123] INFO (1234): Server running at http://localhost:3000
[16:30:45.456] INFO (1234): POST /v1/portfolios 201 2ms
```

### Production Output

```bash
npm start
```

**Output (JSON):**
```json
{"level":30,"time":1619587245123,"pid":1234,"msg":"Server running at http://localhost:3000"}
{"level":30,"time":1619587245456,"method":"POST","url":"/v1/portfolios","statusCode":201,"responseTime":2}
```

---

## Input Validation

### Zod Schemas

**File:** `src/controllers/portfolio/shared.ts`

```typescript
import { z } from 'zod';

export const CreatePortfolioSchema = z.object({
  clientName: z.string().min(1, 'Client name required'),
  riskProfile: z.enum(['LOW', 'MODERATE', 'AGGRESSIVE'])
});

export const BuyTransactionSchema = z.object({
  symbol: z.string().min(1),
  quantity: z.number().int().positive(),
  price: z.number().positive(),
  exchange: z.enum(['NSE', 'BSE']),
  assetCategory: z.enum(['ETF', 'MTF', 'BONDS', 'SHARES', 'STOCKS'])
});
```

### Validation in Controllers

```typescript
export const buyTransaction = async (req: Request, res: Response) => {
  try {
    // Validate input
    const input = BuyTransactionSchema.parse(req.body);
    
    // Process if valid
    const result = await processBuy(input);
    res.json(success(result));
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Return structured validation errors
      res.status(400).json(error(error, 'VALIDATION_ERROR'));
    } else {
      res.status(500).json(error('Server error'));
    }
  }
};
```

### Error Response

```json
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

---

## Money Arithmetic

### Decimal.js Utilities

**File:** `src/utils/money.ts`

```typescript
import Decimal from 'decimal.js';

// Convert rupees to paise
export const rupeesToPaise = (rupees: number): number => {
  return new Decimal(rupees).times(100).toNumber();
};

// Convert paise to rupees
export const paiseToRupees = (paise: number): string => {
  return new Decimal(paise).div(100).toString();
};

// Calculate weighted average cost
export const calculateWeightedCost = (
  newPrice: number,
  newQty: number,
  oldPrice: number,
  oldQty: number
): number => {
  const totalValue = new Decimal(newPrice)
    .times(newQty)
    .plus(new Decimal(oldPrice).times(oldQty));
  const totalQty = newQty + oldQty;
  return totalValue.div(totalQty).toNumber();
};
```

### Why Decimal.js?

**Problem:** JavaScript floating-point arithmetic
```javascript
// ❌ Wrong
0.1 + 0.2 = 0.30000000000000004
```

**Solution:** Decimal.js
```typescript
import Decimal from 'decimal.js';

// ✅ Correct
new Decimal(0.1).plus(0.2).toString() = "0.3"
```

---

## Error Handling

### Response Utilities

**File:** `src/utils/http.ts`

```typescript
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  errorCode?: string;
  details?: any;
}

export const success = <T>(data: T): ApiResponse<T> => ({
  success: true,
  data
});

export const error = (
  msg: string,
  code: string = 'INTERNAL_SERVER_ERROR',
  details?: any
): ApiResponse<null> => ({
  success: false,
  error: msg,
  errorCode: code,
  details
});
```

### Using in Controllers

```typescript
import { success, error } from '../utils/http';

res.status(201).json(success(portfolio));
res.status(400).json(error('Invalid input', 'VALIDATION_ERROR'));
res.status(404).json(error('Not found', 'NOT_FOUND'));
```

---

## Constants & Messages

### Centralized Messages

**File:** `src/constants/messages.ts`

```typescript
export const MESSAGES = {
  PORTFOLIO_CREATED: 'Portfolio created successfully',
  PORTFOLIO_NOT_FOUND: 'Portfolio not found',
  TRANSACTION_SUCCESS: 'Transaction processed successfully',
  INSUFFICIENT_QUANTITY: 'Insufficient quantity to sell',
  ALERT_CREATED: 'Price alert created successfully',
  VALIDATION_FAILED: 'Input validation failed'
};
```

### Using Messages

```typescript
logger.info(MESSAGES.PORTFOLIO_CREATED);
res.json(error(MESSAGES.PORTFOLIO_NOT_FOUND, 'NOT_FOUND'));
```

---

## Testing Your Code

### Run Tests Locally

```bash
# All tests
npm run test

# Watch mode
npm run test:watch

# Specific test file
npm run test tests/unit/money.test.ts
```

### Type Check

```bash
npx tsc --noEmit
```

### Lint (if configured)

```bash
npx eslint src/
```

---

## Code Style Guidelines

### File Naming

```
Controllers:     featureName.controller.ts
Utils:          featureName.ts
Tests:          featureName.test.ts
Constants:      Add to src/constants/messages.ts
```

### Function Naming

```typescript
// CRUD operations
export const createPortfolio = async () => {};
export const getPortfolio = async () => {};
export const updatePortfolio = async () => {};
export const deletePortfolio = async () => {};

// Handlers
export const buyTransaction = async () => {};
export const sellTransaction = async () => {};

// Utilities
export const calculateWeightedCost = () => {};
export const validateInput = () => {};
```

### Imports Ordering

```typescript
// 1. External packages
import express from 'express';
import { z } from 'zod';

// 2. Internal modules
import logger from '../config/logger';
import { success, error } from '../utils/http';
import { calculateWeightedCost } from '../utils/money';
import { MESSAGES } from '../constants/messages';

// 3. Types
import type { Portfolio, Holdings } from '@prisma/client';
```

---

## Making Changes

### Adding a New Endpoint

1. **Create controller** (or add to existing)
   ```typescript
   // src/controllers/feature.controller.ts
   export const newHandler = async (req: Request, res: Response) => {
     const input = SchemaName.parse(req.body);
     // ... logic
   };
   ```

2. **Add route**
   ```typescript
   // src/routes/route.ts
   app.post('/v1/resource', newHandler);
   ```

3. **Write test**
   ```typescript
   // tests/backend/backend.routes.test.ts
   it('POST /v1/resource should ...', async () => {
     const res = await request(app)
       .post('/v1/resource')
       .send({...});
     expect(res.status).toBe(201);
   });
   ```

4. **Test locally**
   ```bash
   npm run dev
   curl -X POST http://localhost:3000/v1/resource
   ```

### Modifying Database Schema

1. **Update** `prisma/schema.prisma`
2. **Create migration**
   ```bash
   npx prisma migrate dev --name description
   ```
3. **Types auto-generated** in `src/generated/prisma/`

---

## Performance Tips

### Database Queries

```typescript
// ✅ Good: Use include/select to fetch related data in one query
const portfolio = await prisma.portfolio.findUnique({
  where: { id },
  include: { portfolio_hold: true }
});

// ❌ Bad: Separate queries (N+1 problem)
const portfolio = await prisma.portfolio.findUnique({ where: { id } });
const holdings = await prisma.holdings.findMany({ where: { portfolioId } });
```

### Response Size

```typescript
// ✅ Good: Select only needed fields
const holdings = await prisma.holdings.findMany({
  select: { id: true, holding_name: true, holding_units: true }
});

// ❌ Bad: Return all fields
const holdings = await prisma.holdings.findMany();
```

---

## Debugging

### Enable Console Logs

```typescript
// In any file
console.log('Debug:', variable);

// Run development server
npm run dev
```

### VS Code Debugger

Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Launch Program",
      "program": "${workspaceFolder}/src/index.ts",
      "preLaunchTask": "npm: dev",
      "outFiles": ["${workspaceFolder}/dist/**/*.js"]
    }
  ]
}
```

Then press F5 to debug.

### Database Inspection

```bash
# View data in browser UI
npx prisma studio

# Query via CLI
npx prisma db execute --stdin
# Then type SQL queries
```

---

## Git Workflow

### Before Committing

```bash
# 1. Format code
npm run build

# 2. Test
npm run test

# 3. Check for errors
npx tsc --noEmit

# 4. Commit
git add .
git commit -m "feat: add new endpoint"
```

### Branching Strategy

```bash
# Feature
git checkout -b feat/new-feature

# Bugfix
git checkout -b fix/issue-name

# Release
git checkout -b release/v1.0.0
```

---

## Deployment Checklist

- [ ] All tests pass: `npm run test`
- [ ] Build succeeds: `npm run build`
- [ ] No TypeScript errors: `npx tsc --noEmit`
- [ ] Docker config valid: `docker compose config`
- [ ] Environment variables set
- [ ] Database migrations applied
- [ ] Swagger docs updated

---

## Next Steps

- [Troubleshooting](TROUBLESHOOTING.md)
- [Contributing](CONTRIBUTING.md)
