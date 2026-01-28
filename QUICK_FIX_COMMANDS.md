# Quick Fix Commands

## For Local Development (if using local database)

```bash
# Navigate to backend
cd backend

# Apply migrations
npx prisma migrate deploy

# Seed database with test data
npx prisma db seed

# View database in Prisma Studio
npx prisma studio
```

## For Production on Render

### Option A: Fresh Database (RECOMMENDED)

1. **Delete old database on Render:**
   - Go to Render Dashboard
   - Find PostgreSQL database
   - Click "Delete Database"
   - Confirm

2. **Create new database:**
   - Render Dashboard → Create New → PostgreSQL
   - Name: `real_estate_matching`
   - Region: Same as backend
   - Create

3. **Update environment variables:**
   - Copy new DATABASE_URL from Render
   - Go to Backend Service → Environment
   - Update `DATABASE_URL` with new value
   - Save and redeploy

4. **Run migrations (via Render Shell or local):**
   ```bash
   cd backend
   npx prisma migrate deploy
   npx prisma db seed
   ```

### Option B: Manual Migration on Existing Database

1. **Connect to production database:**
   ```bash
   psql postgresql://user:password@host:port/real_estate_matching
   ```

2. **Run migration SQL:**
   - Copy contents of `backend/prisma/migrations/20260128_update_schema/migration.sql`
   - Paste and execute in psql

3. **Seed database:**
   ```bash
   cd backend
   npx prisma db seed
   ```

## Test Endpoints After Migration

```bash
# Get summary
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/dashboard/summary

# Get top brokers
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/dashboard/top-brokers

# Get top areas
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/dashboard/top-areas

# Get all offers
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/offers

# Create new offer
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "LAND",
    "usage": "RESIDENTIAL",
    "landStatus": "RAW",
    "city": "Cairo",
    "district": "New Cairo",
    "areaFrom": 1000,
    "areaTo": 2000,
    "priceFrom": 5000000,
    "priceTo": 10000000,
    "exclusivity": "EXCLUSIVE"
  }' \
  http://localhost:3000/api/offers

# Export offers as PDF
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/reports/export/pdf?type=offers \
  -o offers.pdf

# Export offers as Excel
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/reports/export/excel?type=offers \
  -o offers.xlsx
```

## Test Credentials (After Seeding)

```
Admin User:
Email: admin@example.com
Password: 123456

Broker User:
Email: broker@example.com
Password: 123456
```

## Troubleshooting

### Error: "column does not exist"
- Database hasn't been migrated yet
- Run: `npx prisma migrate deploy`

### Error: "No users found"
- Database hasn't been seeded yet
- Run: `npx prisma db seed`

### Error: "Connection refused"
- Check DATABASE_URL in `.env`
- Verify PostgreSQL is running
- Verify database exists

### Error: "Authentication failed"
- Check JWT_SECRET in `.env`
- Verify token is valid
- Try logging in again

## Verify Everything Works

1. **Frontend loads without errors:**
   - Dashboard displays charts
   - Offers page displays table
   - Export buttons are visible

2. **Backend endpoints respond:**
   - All endpoints return 200 status
   - Data is returned in correct format
   - No 500 errors

3. **Database is synced:**
   - All tables exist
   - All columns exist
   - Test data is present

## Files to Reference

- `DATABASE_MIGRATION_GUIDE.md` - Detailed migration instructions
- `CURRENT_STATUS_AND_NEXT_STEPS.md` - Complete status overview
- `backend/prisma/schema.prisma` - Current database schema
- `backend/prisma/migrations/20260128_update_schema/migration.sql` - Migration to apply
- `backend/prisma/seed.js` - Seed data script
