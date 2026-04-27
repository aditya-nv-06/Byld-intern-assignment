# Troubleshooting Guide

Solutions to common issues and how to debug problems.

---

## Installation & Setup

### npm install Failed

**Error:**
```
npm ERR! code ELOCKVERIFY
npm ERR! code 403 Forbidden
```

**Solutions:**

1. Clear npm cache
```bash
npm cache clean --force
npm install
```

2. Use npm ci instead (for CI/CD)
```bash
npm ci
```

3. Upgrade npm
```bash
npm install -g npm@latest
npm install
```

---

### Node Version Mismatch

**Error:**
```
The engine "node" is incompatible with this module.
Expected version ">=24.0.0". Got "20.0.0"
```

**Solutions:**

1. Check current version
```bash
node -v
```

2. Upgrade Node.js
```bash
# Using nvm (recommended)
nvm install 24
nvm use 24

# Or download from nodejs.org
```

3. Or downgrade package.json requirement temporarily
```json
"engines": {
  "node": ">=20.0.0"
}
```

---

### TypeScript Compilation Failed

**Error:**
```
error TS2307: Cannot find module '@prisma/client'
```

**Solutions:**

1. Reinstall dependencies
```bash
rm -rf node_modules package-lock.json
npm install
```

2. Generate Prisma Client
```bash
npx prisma generate
```

3. Clear TypeScript cache
```bash
rm -rf dist/ .ts-node/
npm run build
```

---

## Running the Application

### Port Already in Use

**Error:**
```
ERROR: listen EADDRINUSE :::3000
```

**Solutions:**

1. Find and kill process
```bash
# Linux/Mac
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

2. Use different port
```bash
PORT=3001 npm run dev
```

3. Or with Docker
```bash
BACKEND_PORT=3001 docker compose up -d --build
```

---

### Server Crashes on Startup

**Error:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solutions:**

1. Verify PostgreSQL running
```bash
# Check if Docker container is running
docker compose ps

# Or restart
docker compose restart db
```

2. Wait for DB to be ready
```bash
# Check health
docker compose logs db
```

3. Check DATABASE_URL
```bash
cat .env | grep DATABASE_URL
```

4. Manually test connection
```bash
# If psql installed
psql -U Byld -d Byld-intern

# Or via Prisma
npx prisma db pull
```

---

### Server Starts but API Returns 500

**Error:**
```
{"success": false, "error": "Internal server error"}
```

**Solutions:**

1. Check server logs
```bash
npm run dev  # Look for error in console

# Or with Docker
docker compose logs -f backend
```

2. Enable debug logging
```bash
LOG_LEVEL=debug npm run dev
```

3. Check database connection
```bash
npx prisma validate
```

---

## Database Issues

### "Database does not exist"

**Error:**
```
error: database "Byld-intern" does not exist
```

**Solutions:**

1. Create with Docker Compose
```bash
docker compose up -d db
docker compose logs db  # Wait for "ready to accept connections"
```

2. Or reset Prisma
```bash
npx prisma migrate reset
```

---

### "Relation does not exist"

**Error:**
```
unknown relation "Holdings" when querying
```

**Solutions:**

1. Run migrations
```bash
npx prisma migrate dev
```

2. If stuck, reset (dev only)
```bash
npx prisma migrate reset
```

3. Check schema for typos
```bash
cat prisma/schema.prisma | grep "model Holdings"
```

---

### Schema Drift Detected

**Error:**
```
Prisma Schema uses "client" prisma-client-js but you are also using "@prisma/client"
```

**Solutions:**

1. Reset database
```bash
npx prisma migrate reset
```

2. Or manually pull schema
```bash
npx prisma db pull
```

---

### Prisma Client Generation Failed

**Error:**
```
error: @prisma/internals: RawCommandError
```

**Solutions:**

1. Regenerate Prisma Client
```bash
npx prisma generate
```

2. Clear and reinstall
```bash
rm -rf node_modules/.prisma
npm install
npx prisma generate
```

3. Check schema syntax
```bash
npx prisma validate
```

---

## Docker Issues

### Container Won't Start

**Error:**
```
backend exited with code 1
```

**Solutions:**

1. Check logs
```bash
docker compose logs backend
```

2. Check configuration
```bash
docker compose config
```

3. Rebuild
```bash
docker compose down
docker compose up -d --build
```

---

### Database Connection from Container

**Error:**
```
backend cannot connect to db
pg_error: ECONNREFUSED
```

**Solutions:**

1. Ensure db is healthy
```bash
docker compose ps
# Should show "healthy" for db
```

2. Wait longer for startup
```bash
sleep 30  # Wait for DB to initialize
docker compose logs db
```

3. Check container network
```bash
docker network ls
docker network inspect <network-name>
```

---

### Port Mapping Not Working

**Error:**
```
Cannot connect to localhost:3000
```

**Solutions:**

1. Check port mapping
```bash
docker compose ps
# Should show 0.0.0.0:3000->3000/tcp
```

2. Use custom port
```bash
BACKEND_PORT=3001 docker compose up -d --build
curl http://localhost:3001
```

3. Check firewall
```bash
# Linux
sudo ufw allow 3000

# Mac (usually automatic)
```

---

### Docker Build Fails

**Error:**
```
error building image: build failed
```

**Solutions:**

1. Check Dockerfile
```bash
docker compose config
cat Dockerfile
```

2. Build with verbose output
```bash
docker compose build --verbose
```

3. Clear and rebuild
```bash
docker compose down
docker rmi $(docker images -q)
docker compose up -d --build
```

---

## Testing Issues

### Tests Timeout

**Error:**
```
test timeout after 5000ms
```

**Solutions:**

1. Increase timeout
```typescript
it('test name', async () => {
  // test code
}, 10000);  // 10 seconds
```

2. Or in vitest.config.ts
```typescript
testTimeout: 10000
```

---

### Mock Not Working

**Error:**
```
Expected mock function to have been called
```

**Solutions:**

1. Ensure vi.mock() before imports
```typescript
vi.mock('@prisma/client');

import prismaMock from '@prisma/client';
```

2. Clear mocks between tests
```typescript
beforeEach(() => {
  vi.clearAllMocks();
});
```

3. Use mockResolvedValue
```typescript
prismaMock.portfolio.findUnique.mockResolvedValue({...});
```

---

### Tests Fail Locally But Pass in CI

**Solutions:**

1. Clear test cache
```bash
rm -rf node_modules/.vite
npm run test
```

2. Use fresh database
```bash
npx prisma migrate reset
npm run test
```

3. Check environment variables
```bash
cat .env
# Ensure DATABASE_URL is correct
```

---

## API Issues

### Validation Errors

**Error:**
```
400 Bad Request
{
  "errorCode": "VALIDATION_ERROR",
  "details": [{"field": "price", "code": "invalid_type"}]
}
```

**Solutions:**

1. Check request body
```bash
curl -X POST http://localhost:3000/v1/portfolios \
  -H "Content-Type: application/json" \
  -d '{
    "clientName": "John",
    "riskProfile": "INVALID"  # ❌ Wrong
  }'
```

2. Use correct enum values
```bash
curl -X POST http://localhost:3000/v1/portfolios \
  -H "Content-Type: application/json" \
  -d '{
    "clientName": "John",
    "riskProfile": "MODERATE"  # ✅ Correct
  }'
```

3. Check data types
```bash
# Price should be number, not string
"price": 100  # ✅
"price": "100"  # ❌
```

---

### 404 Not Found

**Error:**
```
404 Not Found
{"errorCode": "NOT_FOUND", "error": "Portfolio not found"}
```

**Solutions:**

1. Verify portfolio exists
```bash
curl http://localhost:3000/v1/portfolios/550e8400-e29b-41d4-a716-446655440000
```

2. Create portfolio first
```bash
curl -X POST http://localhost:3000/v1/portfolios \
  -H "Content-Type: application/json" \
  -d '{"clientName": "John", "riskProfile": "MODERATE"}'
```

3. Check portfolio ID
```bash
# From create response
"id": "550e8400-"  # Use this ID in subsequent requests
```

---

### 409 Conflict (Insufficient Quantity)

**Error:**
```
409 Conflict
{"errorCode": "CONFLICT", "error": "Insufficient quantity"}
```

**Solutions:**

1. Buy shares first
```bash
curl -X POST http://localhost:3000/v1/portfolios/{id}/transactions/buy \
  -d '{"symbol": "RELIANCE", "quantity": 100, ...}'
```

2. Sell only what you have
```bash
# Don't sell more than held
curl -X POST http://localhost:3000/v1/portfolios/{id}/transactions/sell \
  -d '{"symbol": "RELIANCE", "quantity": 50, ...}'  # <= 100
```

3. Check current holdings
```bash
curl http://localhost:3000/v1/portfolios/{id}/holdings
# See holding_units for available quantity
```

---

### Webhook Not Firing

**Error:**
```
Alert created but webhook never called
```

**Solutions:**

1. Verify alert status
```bash
curl http://localhost:3000/v1/portfolios/{id}/alerts

# Should show
"status": "ACTIVE"
```

2. Check webhook URL is accessible
```bash
# Test if webhook.site URL works
curl -X POST https://webhook.site/your-url \
  -d '{"test": "data"}'
```

3. Wait for scheduler (30 seconds)
```bash
# Scheduler runs every 30 seconds
docker compose logs -f backend | grep "webhook\|alert"
```

4. Check logs for errors
```bash
docker compose logs backend
# Look for "fireWebhook" errors
```

---

## Performance Issues

### Slow Response Times

**Solutions:**

1. Check database query performance
```bash
npx prisma studio
# Look for query times
```

2. Enable query logging
```bash
LOG_LEVEL=debug npm run dev
```

3. Check for N+1 queries
```typescript
// ❌ Bad
const portfolios = await prisma.portfolio.findMany();
for (const p of portfolios) {
  const holdings = await prisma.holdings.findMany({where: {portfolioId: p.id}});
}

// ✅ Good
const portfolios = await prisma.portfolio.findMany({
  include: { portfolio_hold: true }
});
```

---

### High Memory Usage

**Solutions:**

1. Check for memory leaks
```bash
node --inspect src/index.ts
# Open chrome://inspect
```

2. Limit payload size
```bash
# In app.ts
app.use(express.json({ limit: '10kb' }));
```

3. Monitor with Docker
```bash
docker stats byld-intern-server-backend-1
```

---

## Debugging Tools

### Enable Debug Output

```bash
# Full debug logging
LOG_LEVEL=debug npm run dev

# Prisma queries
DATABASE_LOG_QUERIES=true npm run dev

# Node inspector
node --inspect src/index.ts
# Then open chrome://inspect
```

### Check Application Health

```bash
# API health
curl http://localhost:3000/api-docs.json

# Database health
docker exec byld-intern-server-db-1 pg_isready -U Byld

# Full system
docker compose ps
docker compose logs --tail 20
```

### Database Inspection

```bash
# Interactive UI
npx prisma studio

# Command line
npx prisma db execute --stdin
# Type SQL queries
```

---

## Getting Help

### Collect Information

```bash
# Check versions
node -v
npm -v
docker -v
docker compose -v

# Check configuration
cat .env
cat docker-compose.yml

# Collect logs
docker compose logs > logs.txt
npm run test > test-output.txt
```

### Useful Commands

```bash
# Validate everything
npx tsc --noEmit
npx prisma validate
docker compose config
npm run build

# Full reset
docker compose down -v
rm -rf node_modules
npm install
docker compose up -d --build
```

---

## Quick Reference

| Issue | Command |
|-------|---------|
| Clear cache | `npm cache clean --force` |
| Reset DB | `npx prisma migrate reset` |
| Rebuild Docker | `docker compose up -d --build` |
| Check logs | `docker compose logs -f` |
| Kill port | `lsof -ti:3000 \| xargs kill -9` |
| Test all | `npm run test` |
| Build | `npm run build` |
| Type check | `npx tsc --noEmit` |

---

## Next Steps

- [Contributing](CONTRIBUTING.md)
- [API Reference](API.md)
- [Development Guide](DEVELOPMENT.md)
