# Database Connection Pool Fix

## Problem
The application was experiencing `PrismaClientInitializationError: Timed out fetching a new connection from the connection pool` errors. This occurs when:
- The database connection pool is exhausted
- Too many concurrent requests competing for limited connections
- Connections not being reused properly

## Root Causes Fixed

### 1. **Broken Singleton Pattern in Production** ✅
**Problem**: The Prisma client was only cached in development mode, creating a new instance on every request in production.

**Fix**: Modified `src/lib/prisma.ts` to always cache the singleton instance in production, preventing connection pool exhaustion.

```typescript
// Now works in both dev and production
(global as any).prisma = prisma;
```

### 2. **Query Optimization** ✅
**Problem**: The company dashboard query used `include: { }` which fetches ALL fields, causing larger payloads and connection strain.

**Fix**: Changed to explicit `select: { }` in `src/actions/company.ts`, fetching only required fields.

**Impact**: Reduces query execution time and memory usage.

### 3. **Connection Pool Configuration** ✅
**Problem**: Default connection pool was too small (5 connections, 10s timeout).

**Fix**: Added `directUrl` configuration in `prisma/schema.prisma` for proper PgBouncer support.

## Required Environment Configuration

Update your `.env` file with proper connection pooling:

```env
# For production with PgBouncer (RECOMMENDED)
DATABASE_URL="postgresql://user:password@pgbouncer-host:6432/dbname?schema=public&connection_limit=20&pool_timeout=10"
DATABASE_URL_DIRECT="postgresql://user:password@postgres-host:5432/dbname?schema=public"

# For development (direct connection)
DATABASE_URL="postgresql://user:password@localhost:5432/dbname?schema=public"
```

## Connection String Parameters Explained

| Parameter | Recommended Value | Purpose |
|-----------|-------------------|---------|
| `connection_limit` | 20 (production) | Max connections per pool |
| `pool_timeout` | 10 | Timeout in seconds |
| `schema` | public | Database schema |

## Best Practices Going Forward

1. **Always use PgBouncer in production** - Acts as connection middleware
2. **Use explicit `select`** - Instead of `include` to minimize data transfer
3. **Enable query logging in development** - Debug slow queries early
4. **Monitor connection pool usage** - Watch for connection saturation
5. **Keep Prisma client as singleton** - Reuse across requests

## Testing the Fix

```bash
# Run with increased pool visibility (development)
NODE_ENV=development npm run dev

# Monitor database connections
# In PostgreSQL: SELECT count(*) FROM pg_stat_activity;
```

## Related Files Modified
- `src/lib/prisma.ts` - Fixed singleton pattern
- `src/actions/company.ts` - Optimized query with explicit select
- `prisma/schema.prisma` - Added directUrl for PgBouncer support
- `.env.example` - Added connection pool configuration reference
