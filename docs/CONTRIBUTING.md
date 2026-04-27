# Contributing Guide

Guidelines for contributing to the Byld Portfolio Backend project.

---

## Getting Started

1. **Fork the repository** (if applicable)
2. **Clone your fork**
   ```bash
   git clone https://github.com/yourusername/byld-intern.git
   cd server
   ```

3. **Create a feature branch**
   ```bash
   git checkout -b feat/your-feature-name
   # or
   git checkout -b fix/bug-name
   ```

4. **Install dependencies**
   ```bash
   npm install
   npx prisma migrate dev
   ```

5. **Start developing!**

---

## Development Workflow

### Before Starting

1. Ensure you're on latest `main` branch
   ```bash
   git checkout main
   git pull origin main
   ```

2. Create feature branch from latest
   ```bash
   git checkout -b feat/descriptive-name
   ```

### During Development

1. **Make your changes**
   - Follow [Code Style](#code-style) guidelines
   - Write focused, single-purpose commits
   - Add tests for new features

2. **Test locally**
   ```bash
   npm run build
   npm run test
   npm run dev
   ```

3. **Type check**
   ```bash
   npx tsc --noEmit
   ```

### Before Committing

1. **Run quality checks**
   ```bash
   npm run build        # Compile TypeScript
   npm run test         # Run all tests
   npx tsc --noEmit     # Type validation
   docker compose config
   ```

2. **Format commit message** (see [Commit Messages](#commit-messages))

3. **Commit changes**
   ```bash
   git add src/
   git commit -m "feat: add new endpoint"
   ```

### Push and Create PR

1. **Push your branch**
   ```bash
   git push origin feat/your-feature-name
   ```

2. **Create Pull Request**
   - Use clear, descriptive title
   - Reference related issues
   - Add screenshots/examples if applicable
   - Ensure all checks pass

---

## Code Style

### File Organization

```
src/
├── controllers/    # Request handlers
├── routes/         # Route definitions
├── utils/          # Shared utilities
├── jobs/           # Scheduled tasks
├── config/         # Configuration
├── constants/      # Centralized constants
├── database/       # ORM exports
└── docs/           # API documentation
```

### Naming Conventions

```typescript
// Files
featureName.controller.ts
featureName.ts
featureName.test.ts

// Functions
export const createPortfolio = async () => {};
export const getPortfolio = async () => {};
export const calculateWeightedCost = () => {};

// Constants/Messages
export const MESSAGES = {
  PORTFOLIO_CREATED: 'Portfolio created successfully'
};

// Enums/Types
type Portfolio = { ... };
interface ApiResponse<T> { ... };
```

### Import Organization

```typescript
// 1. External packages
import express from 'express';
import { z } from 'zod';

// 2. Internal modules
import logger from '../config/logger';
import { success, error } from '../utils/http';

// 3. Types
import type { Portfolio } from '@prisma/client';
```

### Code Formatting

- **Indentation**: 2 spaces
- **Line length**: Max 120 characters
- **Quotes**: Single quotes for strings
- **Trailing commas**: Use ES5 style

```typescript
// ✅ Good
const config = {
  port: 3000,
  env: 'development'
};

// ❌ Avoid
const config = {
  port: 3000,
  env: "development"
};
```

### TypeScript Best Practices

```typescript
// ✅ Use explicit types
const port: number = 3000;
const process = async (data: Portfolio): Promise<Portfolio> => {};

// ❌ Avoid any
const port: any = 3000;
const process = async (data: any) => {};

// ✅ Use interfaces
interface CreatePortfolioRequest {
  clientName: string;
  riskProfile: 'LOW' | 'MODERATE' | 'AGGRESSIVE';
}

// ❌ Use type for objects (less clear)
type CreatePortfolioRequest = {
  clientName: string;
  riskProfile: string;
};
```

---

## Testing

### Writing Tests

**All new features must include tests.**

```typescript
// Template
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app';

describe('Feature Name', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should do something', async () => {
    const res = await request(app)
      .post('/v1/resource')
      .send({ ... });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should handle errors', async () => {
    const res = await request(app)
      .post('/v1/resource')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.errorCode).toBe('VALIDATION_ERROR');
  });
});
```

### Running Tests

```bash
# All tests
npm run test

# Watch mode
npm run test:watch

# Specific file
npm run test tests/backend/backend.routes.test.ts

# Specific test
npm run test -t "should create portfolio"

# With coverage
npm run test -- --coverage
```

### Test Coverage Goals

- **Controllers**: 85%+
- **Utils**: 95%+
- **Jobs**: 80%+
- **Overall**: 85%+

---

## Documentation

### Update Documentation

When making changes that affect users:

1. **API Changes**: Update [docs/API.md](API.md)
2. **Database Changes**: Update [docs/DATABASE.md](DATABASE.md)
3. **Installation**: Update [docs/INSTALLATION.md](INSTALLATION.md)
4. **New Feature**: Update [docs/ARCHITECTURE.md](ARCHITECTURE.md)

### Code Comments

```typescript
// Use comments for WHY, not WHAT

// ❌ Bad
const price = new Decimal(100).times(paise);  // Multiply by paise

// ✅ Good
// Use Decimal for precise money arithmetic to avoid floating-point errors
const price = new Decimal(100).times(paise);
```

### Function Documentation

```typescript
/**
 * Calculate weighted average cost basis for a holding
 * @param newPrice - New purchase price in paise
 * @param newQty - New purchase quantity
 * @param oldPrice - Previous average cost in paise
 * @param oldQty - Previous quantity held
 * @returns Weighted average cost per unit in paise
 */
export const calculateWeightedCost = (
  newPrice: number,
  newQty: number,
  oldPrice: number,
  oldQty: number
): number => {
  // ... implementation
};
```

---

## Commit Messages

### Format

```
<type>: <subject>

<body>

<footer>
```

### Type

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `test`: Adding/updating tests
- `refactor`: Code refactoring
- `perf`: Performance improvement
- `chore`: Dependency updates, config changes

### Subject

- Imperative mood ("add", not "added")
- Don't capitalize first letter
- No period at end
- Max 50 characters

### Body (Optional)

- Explain what and why, not how
- Wrap at 72 characters
- Separate from subject with blank line

### Footer (Optional)

- Reference issues: `Closes #123`
- Reference PRs: `Related-To #456`

### Examples

```
feat: add price alert webhook feature

Implement webhook-based price alerts that fire when
target price is reached. Scheduler runs every 30 seconds
and POSTs to configured URL with alert payload.

Closes #42
Related-To #38
```

```
fix: insufficient quantity validation on sell

Validate that sell quantity doesn't exceed held quantity
before processing transaction. Return 409 conflict error
with details about available vs requested.

Closes #55
```

```
docs: update API reference with alert endpoints

Add complete documentation for POST/GET/DELETE alert
endpoints including request/response examples and
webhook payload structure.
```

---

## Pull Request Guidelines

### PR Title

Clear, descriptive, follows commit message format:
- `feat: Add price alerts`
- `fix: Correct weighted average calculation`
- `docs: Update installation guide`

### PR Description

```markdown
## Description
Brief explanation of what this PR does.

## Related Issues
Closes #123
Related to #456

## Changes
- Change 1
- Change 2
- Change 3

## Testing
- [x] Unit tests added
- [x] Integration tests updated
- [x] Manual testing done

## Screenshots (if UI changes)
Insert screenshots or demo videos.

## Checklist
- [x] Code style follows guidelines
- [x] Tests pass locally
- [x] Documentation updated
- [x] No breaking changes
```

### Review Process

1. Automated checks must pass
   - TypeScript compilation
   - Tests
   - Linting (if configured)

2. Code review by maintainers
   - Check code quality
   - Verify tests coverage
   - Ensure documentation updated

3. Approval and merge

---

## Common Tasks

### Adding a New Endpoint

1. **Create controller**
   ```typescript
   // src/controllers/feature.controller.ts
   import { Request, Response } from 'express';
   import { success, error } from '../utils/http';
   import logger from '../config/logger';

   export const newEndpoint = async (req: Request, res: Response) => {
     try {
       logger.info('Processing new endpoint');
       const result = await doSomething();
       res.status(200).json(success(result));
     } catch (err) {
       logger.error(err);
       res.status(500).json(error('Server error'));
     }
   };
   ```

2. **Add route**
   ```typescript
   // src/routes/route.ts
   import { newEndpoint } from '../controllers/feature.controller';
   app.get('/v1/resource', newEndpoint);
   ```

3. **Write test**
   ```typescript
   // tests/backend/backend.routes.test.ts
   it('GET /v1/resource should work', async () => {
     const res = await request(app).get('/v1/resource');
     expect(res.status).toBe(200);
   });
   ```

4. **Update docs**
   - Add to [docs/API.md](API.md)

### Updating Database Schema

1. **Modify** `prisma/schema.prisma`

2. **Create migration**
   ```bash
   npx prisma migrate dev --name description_of_change
   ```

3. **Update** [docs/DATABASE.md](DATABASE.md)

4. **Test migration**
   ```bash
   npm run build
   npm run test
   ```

### Adding Dependencies

1. **Install package**
   ```bash
   npm install package-name
   ```

2. **Or for dev dependencies**
   ```bash
   npm install --save-dev package-name
   ```

3. **Commit both** `package.json` and `package-lock.json`

4. **Update docs** if relevant

---

## Reporting Issues

### Bug Reports

Include:
- **Description**: What's not working?
- **Steps to reproduce**: How to see the bug?
- **Expected behavior**: What should happen?
- **Actual behavior**: What actually happens?
- **Environment**: OS, Node version, etc.
- **Logs/Screenshots**: Error messages, stack traces

```markdown
## Bug: Portfolio creation fails with validation error

### Description
Creating a new portfolio returns 400 error even with valid input.

### Steps to Reproduce
1. Start server: `npm run dev`
2. Call: `POST /v1/portfolios`
3. Body: `{"clientName": "John", "riskProfile": "MODERATE"}`

### Expected
201 Created with portfolio data

### Actual
400 Bad Request with validation error

### Environment
- Node v24.0.0
- npm 10.0.0
- macOS 14.0

### Error
```
{
  "errorCode": "VALIDATION_ERROR",
  "details": [...]
}
```
```

### Feature Requests

Include:
- **Description**: What feature?
- **Rationale**: Why is it needed?
- **Example usage**: How would users use it?

---

## Code Review Checklist

When reviewing PRs, check:

- [ ] Code follows style guidelines
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No console.log/debug code left
- [ ] Error handling proper
- [ ] No N+1 database queries
- [ ] TypeScript types correct
- [ ] Performance considered
- [ ] Security reviewed
- [ ] Backward compatibility

---

## Release Process

1. **Prepare release branch**
   ```bash
   git checkout -b release/v1.0.0
   ```

2. **Update version**
   ```json
   "version": "1.0.0"
   ```

3. **Run quality checks**
   ```bash
   npm run build
   npm run test
   docker compose config
   ```

4. **Create PR and merge**

5. **Tag release**
   ```bash
   git tag -a v1.0.0 -m "Version 1.0.0"
   git push origin v1.0.0
   ```

---

## Questions?

- Check [Troubleshooting](TROUBLESHOOTING.md)
- Review existing [PRs](https://github.com)
- Check [Discussions](https://github.com)

---

## License

By contributing, you agree that your contributions will be licensed under the ISC License.

---

**Thanks for contributing! 🎉**
