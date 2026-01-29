# Backend API 500 Error Fix Guide

## Problem
The frontend is receiving 500 errors from the backend API endpoints:
- `GET /api/notifications` → 500
- `GET /api/matches` → 500

## Root Cause
The backend cannot connect to the PostgreSQL database or database is not initialized properly.

## Solution Steps

### Step 1: Verify PostgreSQL is Running
**On Windows:**
```powershell
# Check if PostgreSQL service is running
Get-Service | ? {$_.Name -like "*postgres*"}

# If not running, start it
Start-Service postgresql-x64-*
```

**Or using pgAdmin:**
1. Open pgAdmin from Windows Start Menu
2. Navigate to Servers > PostgreSQL (should be connected and running)

### Step 2: Verify Database Exists
```powershell
# Connect to PostgreSQL
psql -U postgres -h localhost

# List all databases
\l

# Should show: real_estate_matching
# If it doesn't exist, exit and create it
```

### Step 3: Create Database (if needed)
```powershell
# From PowerShell
createdb -U postgres -h localhost real_estate_matching
```

### Step 4: Run Prisma Migrations
```powershell
# Navigate to backend directory
cd backend

# Generate Prisma Client (if not done)
npx prisma generate

# Run migrations to create tables
npx prisma migrate deploy

# (Optional) Push schema directly if using development database
# npx prisma db push
```

### Step 5: Verify Database Schema
```powershell
# Check if tables were created
psql -U postgres -h localhost -d real_estate_matching

# List tables
\dt

# You should see tables like: users, offers, requests, matches, notifications, etc.
```

### Step 6: Seed Database (Optional)
```powershell
cd backend
node prisma/seed.js
```

### Step 7: Restart Backend Server
```powershell
# If server is running, stop it (Ctrl+C)
# Then restart it
npm run dev
```

### Step 8: Clear Frontend Cache and Restart
```powershell
# In frontend directory
cd frontend
# Delete node_modules/.vite cache if needed
npm run dev
```

## Alternative: Use Docker (Recommended)
If you have Docker installed, you can spin up a PostgreSQL container:

```powershell
# Start PostgreSQL in Docker
docker run --name postgres-real-estate `
  -e POSTGRES_USER=postgres `
  -e POSTGRES_PASSWORD=1234 `
  -e POSTGRES_DB=real_estate_matching `
  -p 5432:5432 `
  -d postgres:15
```

Then run the Prisma migrations.

## Quick Check Checklist
- [ ] PostgreSQL service is running
- [ ] Database `real_estate_matching` exists
- [ ] Prisma migrations have been applied (`npx prisma migrate deploy`)
- [ ] Backend server is running (port 3000)
- [ ] Frontend `.env` file has `VITE_API_URL=http://localhost:3000/api`
- [ ] Backend `.env` file has correct DATABASE_URL and JWT_SECRET

## Debugging
If issues persist:

1. **Check backend logs** - Look for error messages when making API calls
2. **Verify JWT token** - Make sure you're logged in and have a valid token
3. **Check database connection** - Run `npx prisma studio` to open Prisma Studio
4. **Check PostgreSQL logs** - Look for connection errors

## Command Reference
```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Apply migrations
npx prisma migrate deploy

# Create and apply migrations
npx prisma migrate dev

# Open Prisma Studio (visual database explorer)
npx prisma studio

# View migration status
npx prisma migrate status

# Seed database
node prisma/seed.js

# Start server
npm run dev
```

## Port Configuration
- **Backend**: http://localhost:3000
- **Frontend**: http://localhost:5173 (or shown in terminal)
- **PostgreSQL**: localhost:5432
- **Prisma Studio**: http://localhost:5555 (when running)
