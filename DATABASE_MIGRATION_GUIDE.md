# Database Migration Guide - CRITICAL

## Problem
The production database schema is completely out of sync with the current Prisma schema. The database still has the old schema with columns like `userId`, `location`, `title`, `price`, `area`, `type` (ListingType), etc., but the application expects the new schema with columns like `createdById`, `city`, `district`, `areaFrom`, `areaTo`, `priceFrom`, `priceTo`, `usage`, `landStatus`, `exclusivity`, etc.

## Solution

### Option A: Recommended - Fresh Database (Fastest)

1. **Delete the old PostgreSQL database on Render:**
   - Go to Render Dashboard → PostgreSQL Database
   - Click "Delete Database"
   - Confirm deletion

2. **Create a new PostgreSQL database:**
   - Go to Render Dashboard → Create New → PostgreSQL
   - Name: `real_estate_matching`
   - Region: Same as your backend
   - Create database

3. **Update environment variables:**
   - Copy the new DATABASE_URL from Render
   - Update `backend/.env` with the new DATABASE_URL
   - Update Render environment variables with the new DATABASE_URL

4. **Run migrations locally (or on Render):**
   ```bash
   cd backend
   npx prisma migrate deploy
   ```

5. **Seed the database:**
   ```bash
   npx prisma db seed
   ```

### Option B: Manual Migration on Existing Database

If you want to keep the existing database:

1. **Connect to production database:**
   ```bash
   psql postgresql://user:password@host:port/real_estate_matching
   ```

2. **Run the migration SQL manually:**
   - Copy contents of `backend/prisma/migrations/20260128_update_schema/migration.sql`
   - Execute in production database

3. **Seed the database:**
   ```bash
   cd backend
   npx prisma db seed
   ```

## Verification Steps

After migration, verify everything works:

1. **Check database schema:**
   ```bash
   npx prisma studio
   ```
   - Verify tables exist: User, Offer, Request, Match, Notification, AuditLog
   - Verify columns are correct

2. **Test backend endpoints:**
   - GET `/api/dashboard/summary` - should return offers, requests, matches counts
   - GET `/api/dashboard/top-brokers` - should return top 5 brokers
   - GET `/api/dashboard/top-areas` - should return top 5 cities
   - GET `/api/offers` - should return all offers
   - POST `/api/offers` - should create new offer with correct schema

3. **Test frontend:**
   - Dashboard should load without 500 errors
   - Charts should display data
   - Offers page should load and display offers
   - Export buttons should work

## Files Involved

- `backend/prisma/schema.prisma` - Current schema (correct)
- `backend/prisma/migrations/20260128_update_schema/migration.sql` - Migration to apply
- `backend/prisma/seed.js` - Seed data
- `backend/.env` - Database URL configuration
- `frontend/src/pages/Dashboard.jsx` - Uses `/dashboard/summary`, `/dashboard/top-brokers`, `/dashboard/top-areas`
- `frontend/src/pages/Offers.jsx` - Uses `/offers` endpoint

## New Schema Summary

### Offer Table
- `id` (PK)
- `type` (PropertyType: LAND, PROJECT, PLAN)
- `usage` (UsageType: RESIDENTIAL, COMMERCIAL, ADMINISTRATIVE, INDUSTRIAL, AGRICULTURAL)
- `landStatus` (LandStatus: RAW, DEVELOPED)
- `city` (String)
- `district` (String)
- `areaFrom` (Float)
- `areaTo` (Float)
- `priceFrom` (Decimal)
- `priceTo` (Decimal)
- `exclusivity` (ExclusivityType: EXCLUSIVE, NON_EXCLUSIVE)
- `coordinates` (String, optional)
- `description` (String, optional)
- `createdById` (FK to User)
- `createdAt`, `updatedAt`

### Request Table
- Similar structure to Offer but with `budgetFrom`, `budgetTo`, `priority` instead of `priceFrom`, `priceTo`, `exclusivity`

### Match Table
- `id` (PK)
- `offerId` (FK)
- `requestId` (FK)
- `score` (Float 0-100)
- `status` (MatchStatus: NEW, CONTACTED, NEGOTIATION, CLOSED, REJECTED)
- `createdAt`, `updatedAt`

### Notification Table
- `id` (PK)
- `userId` (FK)
- `matchId` (FK)
- `status` (NotificationStatus: UNREAD, READ, ARCHIVED)
- `createdAt`

### AuditLog Table
- `id` (PK)
- `userId` (FK)
- `action` (AuditAction: CREATE, UPDATE, DELETE)
- `resource` (String)
- `resourceId` (Int, optional)
- `oldValues` (JSONB, optional)
- `newValues` (JSONB, optional)
- `ipAddress` (String, optional)
- `userAgent` (String, optional)
- `createdAt`
