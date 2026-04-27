# Installation & Setup

## Prerequisites

- **Node.js**: v24+ with npm
- **PostgreSQL**: v14+ (local or Docker)
- **Docker & Docker Compose**: (optional, for containerized setup)
- **Git**: for version control

## Installation Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd server
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the project root:

**Local Setup:**
```env
DATABASE_URL="postgresql://Byld:root@localhost:5432/Byld-intern?schema=public"
PORT=3000
NODE_ENV=development
```

**Docker Setup:**
```env
DATABASE_URL="postgresql://Byld:root@db:5432/Byld-intern?schema=public"
PORT=3000
NODE_ENV=development
```

### 4. Database Initialization

```bash
# Create database and apply migrations
npx prisma migrate dev --name init

# (Optional) Generate Prisma Client
npx prisma generate
```

## Verification

Verify installation completed successfully:

```bash
# Check Node version
node -v        # Should be v24+

# Check npm
npm -v         # Should be 10+

# Check TypeScript compilation
npm run build  # Should complete without errors

# Check database connection
npx prisma db pull  # Should succeed

# Run tests
npm run test   # Should pass all tests
```

## Environment Variables

| Variable | Required | Default | Notes |
|----------|----------|---------|-------|
| `DATABASE_URL` | Yes | - | PostgreSQL connection string |
| `PORT` | No | 3000 | Server port |
| `NODE_ENV` | No | development | Node environment (development, production) |

## Common Setup Issues

### npm install Failed
```bash
# Clear npm cache
npm cache clean --force

# Install again
npm install

# Or use npm ci for CI/CD
npm ci
```

### Database Connection Failed
```bash
# Verify PostgreSQL is running
psql -U Byld -d Byld-intern

# Check connection string in .env
grep DATABASE_URL .env

# Test connection with Prisma
npx prisma validate
```

### Prisma Commands Slow
```bash
# Skip telemetry
PRISMA_SKIP_ENGINE_CHECK=1 npx prisma migrate dev

# Regenerate client
npx prisma generate
```

## Next Steps

- [Running the Application](RUNNING.md)
- [API Reference](API.md)
- [Database Schema](DATABASE.md)
