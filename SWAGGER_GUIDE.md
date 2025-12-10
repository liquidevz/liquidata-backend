# Swagger API Documentation - Quick Reference

## Accessing Swagger Docs

### Production
**URL**: https://api.liquidata.dev/api-docs

### Development
**URL**: http://localhost:5000/api-docs

## Features

### 1. Interactive API Testing
- Test all endpoints directly from the browser
- No need for Postman or curl
- Real-time request/response viewing

### 2. Authentication
For protected endpoints (Admin routes):

1. **Login** via `/api/admin/login` endpoint
2. **Copy** the JWT token from the response
3. **Click** the "Authorize" button (🔒 icon) at the top right
4. **Paste** token in the format: `Bearer YOUR_TOKEN_HERE`
5. **Click** "Authorize"

Now you can test all admin endpoints!

### 3. Request Examples
Each endpoint includes:
- Request body schema
- Required/optional fields
- Example values
- Response schemas

## API Categories

### 🔧 Admin Setup
- `GET /api/admin/setup/check` - Check if admin exists
- `POST /api/admin/setup/first` - Create first admin (no auth required)

### 🔐 Admin Authentication
- `POST /api/admin/login` - Login and get JWT token
- `GET /api/admin/me` - Get current admin profile

### 👥 Admin Management
- `GET /api/admin/users` - List all admins (Super Admin only)
- `POST /api/admin/users` - Create new admin (Super Admin only)
- `GET /api/admin/users/{id}` - Get admin by ID
- `PUT /api/admin/users/{id}` - Update admin
- `DELETE /api/admin/users/{id}` - Delete admin (Super Admin only)
- `PUT /api/admin/users/{id}/password` - Change password
- `PATCH /api/admin/users/{id}/toggle-active` - Toggle active status

### 🧮 Calculator (Public)
- `GET /api/calculator` - Get calculator configuration
- `POST /api/calculator/calculate` - Calculate project price
- `POST /api/calculator/steps` - Get conditional steps

### 🧮 Calculator (Admin)
- `PUT /api/admin/calculator` - Update calculator configuration
- `GET /api/admin/pricing` - Get pricing configuration
- `PUT /api/admin/pricing` - Update pricing configuration
- `PUT /api/admin/pricing/{ruleType}` - Update specific pricing rule

### 📊 Analytics (Admin)
- `GET /api/admin/calculator/analytics` - Get calculator usage analytics

## Common Workflows

### First-Time Setup
1. Check if admin exists: `GET /api/admin/setup/check`
2. If no admin, create one: `POST /api/admin/setup/first`
   ```json
   {
     "username": "admin",
     "email": "admin@liquidata.com",
     "password": "YourSecurePassword123"
   }
   ```
3. Copy the token from response
4. Use "Authorize" button to authenticate

### Testing Calculator
1. Get calculator config: `GET /api/calculator`
2. Calculate price: `POST /api/calculator/calculate`
   ```json
   {
     "selections": {
       "projectType": "web-app",
       "selectedIndustries": ["Healthcare"],
       "selectedServices": ["web-development", "ui-ux-design"],
       "selectedFeatures": ["User management"],
       "selectedPlatforms": ["web"],
       "scope": "standard",
       "team": "small",
       "timeline": "standard",
       "support": "standard"
     }
   }
   ```
3. View detailed price breakdown with GST

### Managing Content (Admin)
1. Login to get token
2. Authorize in Swagger
3. Create/Update case studies or blogs
4. Upload images for content

## Response Codes

- **200** - Success
- **201** - Created successfully
- **400** - Bad request (validation error)
- **401** - Unauthorized (invalid/missing token)
- **403** - Forbidden (insufficient permissions)
- **404** - Not found
- **500** - Server error

## Tips

### 1. Try It Out
Click "Try it out" button on any endpoint to test it immediately

### 2. Schema Exploration
Click on schema names to expand and see all available fields

### 3. Download Spec
You can download the OpenAPI spec (JSON) for use in other tools

### 4. Copy as cURL
After executing a request, you can copy it as a cURL command

### 5. Response Examples
Each endpoint shows example responses for different status codes

## Security

### Production
- Only accepts requests from allowed origins:
  - https://liquidata.dev
  - https://www.liquidata.dev
  - https://api.liquidata.dev

### JWT Tokens
- Expire after 24 hours
- Include user ID, username, and role
- Required for all `/api/admin/*` routes (except setup and login)

### Roles
- **admin** - Can manage calculator, content, view own profile
- **super_admin** - Can do everything + manage other admins

## Example: Complete Admin Workflow

### 1. First Login
```bash
POST /api/admin/login
{
  "username": "admin",
  "password": "YourPassword123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": "...",
    "username": "admin",
    "email": "admin@liquidata.com",
    "role": "super_admin"
  }
}
```

### 2. Authorize
Click 🔒 Authorize button, enter:
```
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Update Calculator
```bash
PUT /api/admin/calculator
{
  "title": "DevFlow Project Calculator",
  "description": "Get accurate estimates",
  "basePrice": 50000,
  "currency": "INR",
  ...
}
```

### 4. View Analytics
```bash
GET /api/admin/calculator/analytics?startDate=2024-01-01&endDate=2024-12-31
```

## Troubleshooting

### "Unauthorized" Error
- Ensure you've clicked "Authorize" button
- Check token format: `Bearer YOUR_TOKEN`
- Token may have expired (24h validity)

### "Forbidden" Error
- Your role doesn't have permission
- Super Admin required for some operations

### CORS Error
- Check if your origin is in ALLOWED_ORIGINS
- Verify you're using HTTPS in production

### Schema Validation Error
- Check required fields are provided
- Verify data types match schema
- Review example values in Swagger

## Additional Resources

- **Health Check**: https://api.liquidata.dev/health
- **API Root**: https://api.liquidata.dev/
- **Support**: connect@liquidata.dev

## Version Information

- **API Version**: 2.0.0
- **OpenAPI Version**: 3.0.0
- **Title**: Liquidata API
- **Description**: Enhanced Calculator API with Admin Management and Indian Pricing (INR)
