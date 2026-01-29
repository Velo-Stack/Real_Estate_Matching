# Quick Fix for 500 API Errors

## What's Happening
Your frontend is getting 500 errors because:
1. Database is set up correctly ✓
2. Migrations are applied ✓
3. You need to log in to get an authentication token
4. The API endpoints require a valid JWT token

## Test Credentials (from seeded data)

### Admin Account
- Email: `admin@example.com`
- Password: `password123`

### Broker Account
- Email: `broker@example.com`
- Password: `password123`

## Quick Steps to Fix

### 1. Make Sure Services Are Running
```powershell
# Check PostgreSQL is running
Get-Service | ? {$_.Name -like "*postgres*"}

# Backend should be running on port 3000
# Frontend should be running on port 5173 (or shown in your terminal)
```

### 2. Clear Browser Cache
1. Open browser DevTools (F12)
2. Right-click the reload button and select "Empty cache and hard reload"
3. Or press Ctrl+Shift+Delete to clear cache completely

### 3. Log In with Test Account
1. Go to http://localhost:5173 (or your frontend URL)
2. Click "Log In"
3. Enter:
   - Email: `admin@example.com`
   - Password: `password123`
4. Click Login

### 4. Verify Token is Stored
1. Open browser DevTools (F12)
2. Go to "Application" or "Storage" tab
3. Check "Local Storage" for the `token` key
4. It should have a long JWT string starting with "eyJ..."

### 5. API Should Now Work
Once logged in, the 500 errors should disappear and you should see:
- Notifications loaded
- Matches loaded
- Other API endpoints working

## If Still Getting 500 Errors

### Check Backend Logs
Look at the terminal where you ran `npm run dev` for the backend. You should see console.error messages that show the actual error.

### Check Network Tab
1. Open DevTools (F12)
2. Go to "Network" tab
3. Make an API call (navigate to a page that uses the API)
4. Click on the failed request
5. Look at "Response" tab to see the actual error message

## Database Inspection
If you want to check the database directly:

```powershell
cd backend

# Open Prisma Studio (visual database browser)
npx prisma studio

# This opens http://localhost:5555 in your browser
# You can see all your data here
```

## Default Test Account Passwords
All test accounts use the password: `password123`

## Important Files
- Backend API: runs on http://localhost:3000
- Frontend: runs on http://localhost:5173
- Prisma Studio: http://localhost:5555 (when running)
- PostgreSQL: localhost:5432

## Next Steps After Login
1. Explore the dashboard
2. Create offers and requests
3. View matches
4. Check notifications
5. Review audit logs

If you encounter any specific error messages, share them and I can help debug further!
