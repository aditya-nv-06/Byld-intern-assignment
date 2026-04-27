# Running the Application

## Quick Start

### Local Development (One Command)

```bash
npm install && npm run dev
```

**Accessible at:**
- API: `http://localhost:3000`
- Swagger Docs: `http://localhost:3000/api-docs`

### Docker Production (One Command)

```bash
docker compose up -d --build
```

**Accessible at:**
- API: `http://localhost:3000`
- Swagger Docs: `http://localhost:3000/api-docs`
- Database: `postgresql://Byld:root@localhost:5433/Byld-intern`

---

## Local Development

### Start Development Server

```bash
npm run dev
```

**Expected Output:**
```
[HH:MM:SS.mmm] INFO: Server running at http://localhost:3000
[HH:MM:SS.mmm] INFO: Swagger available at http://localhost:3000/api-docs
[HH:MM:SS.mmm] INFO: Webhook scheduler started
```

**Features:**
- Hot reload on file changes (via nodemon)
- Pretty-printed logs
- Full TypeScript support
- Swagger UI for API exploration

### Stop Development Server

```bash
# Press Ctrl+C in the terminal
```

---

## Production Build & Deploy

### 1. Build TypeScript to JavaScript

```bash
npm run build
```

**Output:**
- Generates `dist/` directory with compiled `.js` files
- TypeScript validation runs automatically
- No runtime errors from type issues

### 2. Start Production Server

```bash
npm start
```

**Features:**
- Optimized for performance
- Structured JSON logging
- No file watching / hot reload
- Ready for deployment

---

## Docker Deployment

### Basic Usage

```bash
# Build and start all services
docker compose up -d --build

# Check status
docker compose ps

# View logs
docker compose logs -f backend

# Stop all services
docker compose down
```

### Docker Compose Services

| Service | Port | Status |
|---------|------|--------|
| backend | 3000 | ✅ Healthy (after ~30s) |
| db | 5432 | ✅ Healthy |

### Custom Configuration

#### Use Different Port

```bash
BACKEND_PORT=3001 docker compose up -d --build
# API available at http://localhost:3001
```

#### View Real-time Logs

```bash
docker compose logs -f backend
```

#### Stop Without Removing Data

```bash
docker compose stop
```

#### Stop and Remove Everything

```bash
docker compose down
```

#### Reset Database (Delete All Data)

```bash
docker compose down -v
docker compose up -d --build
```

### Docker Troubleshooting

#### Check Service Health

```bash
docker compose ps

# Expected output:
# backend     running  (healthy)
# db          running  (healthy)
```

#### View Service Logs

```bash
# Backend logs
docker compose logs backend

# Database logs
docker compose logs db

# Last 50 lines
docker compose logs --tail 50 backend

# Follow in real-time
docker compose logs -f backend
```

#### Rebuild Image

```bash
docker compose build --no-cache
docker compose up -d
```

#### Common Errors

**"Port 3000 already in use"**
```bash
BACKEND_PORT=3001 docker compose up -d --build
```

**"db is unhealthy"**
```bash
docker compose restart db
docker compose logs db
```

**"Backend cannot connect to database"**
```bash
# Wait for DB to be healthy
docker compose ps

# Check if DB is ready
docker exec -it byld-intern-server-db-1 pg_isready -U Byld
```

---

## Available npm Scripts

| Command | Purpose | Environment |
|---------|---------|-------------|
| `npm run dev` | Development server | Local |
| `npm run build` | Build TypeScript | Local |
| `npm start` | Run production build | Local |
| `npm run test` | Run all tests | Local |
| `npm run test:watch` | Tests in watch mode | Local |
| `npm run test:backend` | Backend tests only | Local |
| `npm run test:webhook` | Webhook tests only | Local |

---

## Environment Modes

### Development

```bash
NODE_ENV=development npm run dev
```

**Characteristics:**
- Pretty-printed logs (human-readable)
- Full debug information
- Hot reload enabled
- Database: local or Docker

### Production

```bash
NODE_ENV=production npm start
```

**Characteristics:**
- JSON structured logs
- Performance optimized
- No debug info
- Suitable for deployment

---

## Health Checks

### API Health

```bash
# Check if API is running
curl http://localhost:3000/api-docs.json

# Expected: 200 OK with OpenAPI spec
```

### Database Health

```bash
# From Docker container
docker exec byld-intern-server-db-1 pg_isready -U Byld -d Byld-intern

# Expected: accepting connections
```

### Full System Status

```bash
docker compose ps
docker compose logs --tail 20
```

---

## Performance Monitoring

### View Request Logs

```bash
# Development (pretty format)
npm run dev 2>&1 | grep "POST\|GET\|PUT\|DELETE"

# Production (JSON format)
npm start 2>&1 | jq 'select(.req != null)'
```

### Database Query Performance

```bash
# Log all queries (development)
NODE_ENV=development npm run dev

# Prisma will log query times automatically
```

---

## Graceful Shutdown

### Local Development

```bash
# Press Ctrl+C
# Server will:
# 1. Stop accepting new requests
# 2. Wait for in-flight requests to complete
# 3. Close database connection
# 4. Exit cleanly
```

### Docker

```bash
docker compose down

# Containers will receive SIGTERM
# Services have 10s to shut down gracefully
```

---

## Next Steps

- [API Reference](API.md)
- [Testing](TESTING.md)
- [Troubleshooting](TROUBLESHOOTING.md)
