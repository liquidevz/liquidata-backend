# Swagger UI Troubleshooting Guide

## Issue: Admin Login Fails in Swagger UI

### ✅ Root Cause Identified
The Swagger UI at `https://api.liquidata.dev/api-docs` has a **textarea accumulation bug** where the request body field appends JSON instead of replacing it, causing malformed requests like:
```json
{"username":"admin","password":"admin123"}{"username":"admin","password":"admin123"}
```

### ✅ Confirmed: API is Working
The backend API itself is **fully functional**. Testing with PowerShell confirmed successful login:
```powershell
Invoke-RestMethod -Uri "https://api.liquidata.dev/api/admin/login" -Method Post -ContentType "application/json" -Body '{"username":"admin","password":"admin123"}'
```
**Result**: ✅ Returns valid JWT token

## Workarounds (Until Server Restart)

### Option 1: Use Postman
1. Create new POST request to `https://api.liquidata.dev/api/admin/login`
2. Set header: `Content-Type: application/json`
3. Body (raw JSON):
   ```json
   {
     "username": "admin",
     "password": "admin123"
   }
   ```
4. Send request
5. Copy token from response
6. Use in Authorization header: `Bearer YOUR_TOKEN`

### Option 2: Use PowerShell
```powershell
# Login and get token
$response = Invoke-RestMethod -Uri "https://api.liquidata.dev/api/admin/login" -Method Post -ContentType "application/json" -Body '{"username":"admin","password":"admin123"}'
$token = $response.token

# Use token for authenticated requests
Invoke-RestMethod -Uri "https://api.liquidata.dev/api/admin/me" -Method Get -Headers @{Authorization="Bearer $token"}
```

### Option 3: Use curl (Git Bash or WSL)
```bash
# Login
curl -X POST https://api.liquidata.dev/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Use token
curl -X GET https://api.liquidata.dev/api/admin/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Option 4: Refresh Swagger Page
Sometimes refreshing the Swagger page with Ctrl+F5 (hard refresh) can temporarily fix the issue.

## Permanent Fix Applied

I've updated `server.js` with enhanced Swagger UI configuration:
- Request interceptor to validate JSON
- Persistent authorization
- Better error handling
- Custom styling

### To Apply the Fix:
```bash
# Commit and push changes
git add server.js
git commit -m "Fix Swagger UI configuration"
git push origin main

# On production server, pull and restart
git pull origin main
pm2 restart liquidata-backend
```

## Admin Credentials

**Username:** `admin`  
**Password:** `admin123`  
**Email:** `admin@liquidata.com`  
**Role:** `super_admin`

⚠️ **Remember to change the password after first login!**

## Testing After Fix

Once the server is restarted with the new configuration:

1. Go to https://api.liquidata.dev/api-docs
2. Find `POST /api/admin/login`
3. Click "Try it out"
4. Enter credentials
5. Click "Execute"
6. Should see token in response
7. Click "Authorize" button (🔒)
8. Enter: `Bearer YOUR_TOKEN`
9. Test protected endpoints

## Verification Commands

```powershell
# Test health
Invoke-RestMethod -Uri "https://api.liquidata.dev/health"

# Test admin setup check
Invoke-RestMethod -Uri "https://api.liquidata.dev/api/admin/setup/check"

# Test login
Invoke-RestMethod -Uri "https://api.liquidata.dev/api/admin/login" -Method Post -ContentType "application/json" -Body '{"username":"admin","password":"admin123"}'
```

All should return successful responses.
