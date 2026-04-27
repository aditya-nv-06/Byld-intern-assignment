# Testing Guide

Complete testing documentation.

## Quick Start

```bash
# Run all tests
npm run test

# Watch mode (re-run on changes)
npm run test:watch

# Backend routes only
npm run test:backend

# Webhook scheduler only
npm run test:webhook
```

---

## Testing Framework

- **Test Runner**: Vitest 4.1+
- **HTTP Testing**: Supertest 7.2+
- **Assertion Library**: Vitest built-in

## Test Structure

```
tests/
├── backend/                 # API route tests
│   └── backend.routes.test.ts
├── integration/             # Full flow tests
│   └── portfolio.routes.test.ts
├── unit/                    # Utility tests
│   └── money.test.ts
└── webhook/                 # Scheduler tests
    └── webhook.scheduler.test.ts
```

---

## Unit Tests

### Money Utilities (tests/unit/money.test.ts)

Tests for `src/utils/money.ts` - decimal arithmetic and conversions.

**Test Coverage:**
- ✅ Conversion between paise and rupees
- ✅ Weighted average cost calculation
- ✅ Precision with large numbers
- ✅ Edge cases (zero, negative)

**Run:**
```bash
npm run test tests/unit/money.test.ts
```

**Example Test:**
```typescript
it('should convert rupees to paise', () => {
  const paise = rupeesToPaise(100);
  expect(paise).toBe(10000);
});

it('should calculate weighted average cost', () => {
  const cost = calculateWeightedCost(
    [{ quantity: 100, price: 1000 }],
    50,
    2000
  );
  expect(cost).toBe(1333); // (100*1000 + 50*2000) / 150
});
```

---

## Backend Route Tests

### Portfolio Routes (tests/backend/backend.routes.test.ts)

Tests for all portfolio endpoints - CRUD operations, validation, error handling.

**Test Coverage:**
- ✅ POST /v1/portfolios - Create portfolio
- ✅ GET /v1/portfolios/{id} - Get portfolio summary
- ✅ POST /v1/portfolios/{id}/transactions/buy - Buy shares
- ✅ POST /v1/portfolios/{id}/transactions/sell - Sell shares
- ✅ GET /v1/portfolios/{id}/holdings - List holdings
- ✅ POST/GET/DELETE /v1/portfolios/{id}/alerts - Alerts
- ✅ Validation errors (400)
- ✅ Not found errors (404)
- ✅ Conflict errors (409)

**Run:**
```bash
npm run test:backend
```

**Example Test:**
```typescript
it('POST /v1/portfolios should create portfolio', async () => {
  const res = await request(app)
    .post('/v1/portfolios')
    .send({
      clientName: 'John Doe',
      riskProfile: 'MODERATE'
    });

  expect(res.status).toBe(201);
  expect(res.body.data.id).toBeDefined();
  expect(res.body.data.portfolio_name).toBe('John Doe');
});
```

---

## Integration Tests

### Portfolio Flows (tests/integration/portfolio.routes.test.ts)

Tests for multi-step workflows - buy/sell sequences, holding updates.

**Test Coverage:**
- ✅ Complete buy → sell flow
- ✅ Weighted average cost updates
- ✅ Quantity validation
- ✅ Holding creation/deletion

**Run:**
```bash
npm run test
```

**Example Test:**
```typescript
it('should handle full buy/sell workflow', async () => {
  // 1. Create portfolio
  // 2. Buy 100 shares at ₹100
  // 3. Buy 50 more at ₹150
  // 4. Verify weighted average
  // 5. Sell 50 shares
  // 6. Verify remaining quantity and cost
});
```

---

## Webhook Scheduler Tests

### Scheduler Logic (tests/webhook/webhook.scheduler.test.ts)

Tests for alert firing, webhook POSTing, retry logic.

**Test Coverage:**
- ✅ Alert fires when condition met
- ✅ Webhook POST triggered
- ✅ Alert marked INACTIVE after firing
- ✅ Retry logic on failure
- ✅ No double-firing

**Run:**
```bash
npm run test:webhook
```

**Example Test:**
```typescript
it('should fire ABOVE alert when price exceeds target', async () => {
  // Create alert with target ₹100
  // Mock price as ₹150
  // Run scheduler
  // Verify webhook was POSTed
  // Verify alert status is INACTIVE
});
```

---

## Test Strategy

### Mocking

```typescript
// Mock Prisma client for speed and isolation
vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => ({
    portfolio: { create: vi.fn(), findUnique: vi.fn() },
    holdings: { upsert: vi.fn(), findMany: vi.fn() },
    transaction: { create: vi.fn() },
    priceAlert: { create: vi.fn(), findMany: vi.fn() }
  }))
}));

// Mock axios for webhook testing
vi.mock('axios', () => ({
  post: vi.fn().mockResolvedValue({ status: 200 })
}));
```

### Benefits
- **Speed**: No database overhead
- **Determinism**: No flaky tests
- **Isolation**: Each test independent
- **CI/CD Friendly**: No external services

---

## Running Tests

### All Tests

```bash
npm run test
```

**Output:**
```
✓ tests/unit/money.test.ts (5)
✓ tests/backend/backend.routes.test.ts (15)
✓ tests/integration/portfolio.routes.test.ts (8)
✓ tests/webhook/webhook.scheduler.test.ts (6)

Test Files  4 passed (4)
     Tests  34 passed (34)
```

### Watch Mode

```bash
npm run test:watch
```

**Features:**
- Re-runs on file changes
- Interactive menu
- Filter tests by name
- Press `q` to quit

### Single Test File

```bash
npm run test tests/unit/money.test.ts
```

### Single Test

```bash
npm run test -t "should convert rupees to paise"
```

### With Coverage

```bash
npm run test -- --coverage
```

**Output:**
```
Coverage:
src/utils/money.ts     100%
src/controllers/buy.ts  95%
src/jobs/scheduler.ts   88%
```

---

## Test Configuration

### vitest.config.ts

```typescript
export default defineConfig({
  test: {
    environment: 'node',
    globals: true,          // Use global describe/it/expect
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json']
    },
    mockReset: true         // Reset mocks between tests
  }
});
```

---

## Debugging Tests

### Print Debug Info

```typescript
it('should create portfolio', async () => {
  const res = await request(app).post('/v1/portfolios').send({...});
  
  console.log('Response status:', res.status);
  console.log('Response body:', res.body);
  
  expect(res.status).toBe(201);
});

// Run with output
npm run test -- --reporter=verbose
```

### Run Single Test with Debugging

```bash
# Run one test with full output
npm run test -t "portfolio creation" -- --reporter=verbose

# Stop on first error
npm run test -- --reporter=verbose --bail
```

### VS Code Debug

Create `.vscode/launch.json`:
```json
{
  "type": "node",
  "request": "launch",
  "name": "vitest",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["run", "test:watch"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

Then press F5 to debug.

---

## Common Issues

### Test Timeout

```typescript
// Increase timeout
it('slow test', async () => {
  // test code
}, 10000);  // 10 seconds

// Or set globally in vitest.config.ts
testTimeout: 10000
```

### Mock Not Applied

```typescript
// Correct: beforeEach
beforeEach(() => {
  vi.clearAllMocks();
});

// Wrong: vi.mock() after test setup
```

### Async Handling

```typescript
// Wrong: missing await
it('test', async () => {
  request(app).get('/api');  // ❌ Not awaited
});

// Correct: await
it('test', async () => {
  await request(app).get('/api');  // ✅
});
```

---

## Writing New Tests

### Template

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app';

describe('Portfolio Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create portfolio', async () => {
    const res = await request(app)
      .post('/v1/portfolios')
      .send({
        clientName: 'Test User',
        riskProfile: 'MODERATE'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
  });

  it('should return 400 on invalid input', async () => {
    const res = await request(app)
      .post('/v1/portfolios')
      .send({});  // Missing required fields

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errorCode).toBe('VALIDATION_ERROR');
  });
});
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 24
      - run: npm ci
      - run: npm run build
      - run: npm run test
      - run: npm run test:backend
      - run: npm run test:webhook
```

---

## Test Metrics

### Coverage Targets

| Module | Target | Current |
|--------|--------|---------|
| utils | 95%+ | ✅ 100% |
| controllers | 85%+ | ✅ 92% |
| jobs | 80%+ | ✅ 88% |
| routes | 80%+ | ✅ 85% |

### Running Coverage Report

```bash
npm run test -- --coverage

# Output: coverage/
# Open: coverage/index.html
```

---

## Next Steps

- [Database](DATABASE.md)
- [Troubleshooting](TROUBLESHOOTING.md)
