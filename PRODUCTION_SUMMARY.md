# Production Configuration Summary for api.liquidata.dev

## Overview
The Liquidata backend has been configured for production deployment at **api.liquidata.dev** with comprehensive Swagger API documentation.

## Changes Made

### 1. Server Configuration (`server.js`)

#### Swagger Server URL Updated
- **Changed from**: `https://liquidata-backend.onrender.com`
- **Changed to**: `https://api.liquidata.dev`
- **Location**: Lines 86-93
- **Impact**: Swagger documentation now shows the correct production URL

#### CORS Configuration Enhanced
- **Previous**: Simple `app.use(cors())` allowing all origins
- **Updated**: Environment-based CORS with specific allowed origins
- **Production Origins**:
  - `https://liquidata.dev`
  - `https://www.liquidata.dev`
  - `https://api.liquidata.dev`
- **Development**: Allows all origins (`*`)
- **Features Added**:
  - Credentials support
  - Specific HTTP methods
  - Custom headers for Authorization

### 2. Environment Configuration (`.env.production`)

#### New Variables Added
```env
# API URL
API_URL=https://api.liquidata.dev

# Enhanced CORS Settings
ALLOWED_ORIGINS=https://liquidata.dev,https://www.liquidata.dev,https://api.liquidata.dev
```

#### Existing Variables
- `NODE_ENV=production`
- `PORT=5000`
- `MONGODB_URI` (MongoDB Atlas connection)
- `JWT_SECRET` (for JWT token signing)
- `GEMINI_API_KEY` (Google Gemini AI)
- `FRONTEND_URL=https://liquidata.dev`

### 3. Documentation Created

#### DEPLOYMENT.md
Comprehensive production deployment guide covering:
- Server setup and prerequisites
- Environment configuration
- PM2 deployment commands
- Nginx reverse proxy configuration
- SSL certificate setup with Certbot
- Monitoring and logging
- Troubleshooting common issues
- Performance optimization

#### SWAGGER_GUIDE.md
Detailed Swagger documentation guide including:
- How to access Swagger UI (production and development)
- Authentication workflow with JWT
- All API endpoint categories
- Common workflows and examples
- Response codes and error handling
- Security information
- Troubleshooting tips

#### PRODUCTION_CHECKLIST.md
Step-by-step deployment checklist with:
- Pre-deployment requirements
- DNS configuration
- Server setup steps
- Post-deployment verification
- Initial data setup
- Monitoring setup
- Security checklist
- Maintenance tasks
- Rollback procedures

#### README.md Updates
- Added production URL information
- Updated Swagger documentation section
- Added references to deployment guides
- Clarified that Swagger is available in all environments

## API Endpoints

### Production URLs
- **Base API**: https://api.liquidata.dev
- **Swagger Docs**: https://api.liquidata.dev/api-docs
- **Health Check**: https://api.liquidata.dev/health
- **API Root**: https://api.liquidata.dev/

### Development URLs
- **Base API**: http://localhost:5000
- **Swagger Docs**: http://localhost:5000/api-docs
- **Health Check**: http://localhost:5000/health

## Swagger Documentation Features

### Available in Production
✅ Swagger UI is fully functional in production at `https://api.liquidata.dev/api-docs`

### Features
- **Interactive Testing**: Test all endpoints directly from browser
- **Authentication**: JWT token authentication with "Authorize" button
- **Complete Documentation**: All endpoints documented with:
  - Request/response schemas
  - Example values
  - Required/optional fields
  - Response codes
- **Categories**:
  - Admin Setup
  - Admin Authentication
  - Admin Management
  - Calculator (Public)
  - Calculator (Admin)
  - Analytics
  - Case Studies
  - Blogs
  - Content Management

## Security Enhancements

### CORS Protection
- Production: Only allows specific origins
- Development: Allows all origins for testing
- Credentials support enabled
- Specific HTTP methods allowed

### Environment-Based Configuration
- Different settings for development/staging/production
- Sensitive data in environment variables
- No hardcoded credentials

### JWT Authentication
- 24-hour token expiration
- Secure token signing with JWT_SECRET
- Role-based access control (admin, super_admin)

## Deployment Methods

### Option 1: PM2 (Recommended)
```bash
npm run pm2:start:production
```

### Option 2: Direct Node
```bash
npm run start:production
```

### Option 3: Docker
```bash
docker-compose up -d
```

## PM2 Configuration

### Features Enabled
- **Cluster Mode**: Uses all CPU cores
- **Auto Restart**: On crashes and errors
- **Memory Limit**: 1GB per instance
- **Log Rotation**: Daily log files
- **Graceful Shutdown**: Proper cleanup on stop
- **Cron Restart**: Daily at 2 AM (production only)
- **Health Monitoring**: Automatic health checks

### PM2 Commands
```bash
# Start
npm run pm2:start:production

# Stop
npm run pm2:stop

# Restart
npm run pm2:restart

# Logs
pm2 logs liquidata-backend

# Monitor
pm2 monit

# Status
pm2 status
```

## Nginx Configuration

### Reverse Proxy
- Proxies requests from port 443 (HTTPS) to port 5000 (Node.js)
- Handles SSL/TLS termination
- Serves static files efficiently
- Proper headers for proxying

### SSL/TLS
- Let's Encrypt certificate via Certbot
- Auto-renewal configured
- TLS 1.2+ only
- Strong cipher suites

### Features
- HTTP to HTTPS redirect
- 10MB upload limit
- Proper timeout settings
- Static file serving for uploads

## Monitoring & Logging

### Application Logs
- **Location**: `./logs/`
- **Files**:
  - `combined.log` - All logs
  - `out.log` - Standard output
  - `error.log` - Errors only
- **Rotation**: Daily with Winston

### PM2 Monitoring
```bash
# Real-time monitoring
pm2 monit

# View logs
pm2 logs liquidata-backend

# Check status
pm2 status
```

### Health Checks
- **Endpoint**: `/health`
- **Response**: `{"status":"OK","timestamp":"..."}`
- **Use**: Monitoring tools, load balancers

## Database Configuration

### MongoDB Atlas
- **Connection**: Via MONGODB_URI
- **Security**: IP whitelist or 0.0.0.0/0
- **SSL/TLS**: Enabled by default
- **Backups**: Automatic in Atlas

### Collections
- `adminusers` - Admin accounts
- `calculators` - Calculator configurations
- `calculatorsubmissions` - User submissions
- `casestudies` - Case study content
- `blogs` - Blog posts
- `components` - UI components

## Next Steps

### 1. DNS Configuration
Point `api.liquidata.dev` A record to your server IP

### 2. Server Setup
Follow the steps in `DEPLOYMENT.md`:
1. Install Node.js, PM2, Nginx
2. Clone repository
3. Install dependencies
4. Configure environment variables
5. Start with PM2

### 3. Nginx Setup
1. Configure reverse proxy
2. Setup SSL with Certbot
3. Test configuration
4. Reload Nginx

### 4. Verification
1. Check health endpoint
2. Access Swagger docs
3. Test API endpoints
4. Verify CORS with frontend
5. Test file uploads

### 5. Initial Data
1. Create first admin user
2. Seed calculator data (optional)
3. Test admin login
4. Configure calculator settings

## Testing Checklist

### ✅ Before Going Live
- [ ] DNS propagated to server IP
- [ ] SSL certificate installed and valid
- [ ] Environment variables configured
- [ ] Database connection working
- [ ] PM2 running and stable
- [ ] Nginx configured and running
- [ ] Health check returns 200 OK
- [ ] Swagger docs accessible
- [ ] CORS working with frontend
- [ ] Admin login functional
- [ ] Calculator API working
- [ ] File uploads working
- [ ] Logs being written
- [ ] PM2 auto-starts on boot

### ✅ After Going Live
- [ ] Monitor logs for errors
- [ ] Check API response times
- [ ] Verify database operations
- [ ] Test all critical endpoints
- [ ] Monitor server resources
- [ ] Check SSL certificate expiry
- [ ] Verify backup systems
- [ ] Test error handling

## Support & Resources

### Documentation
- **Deployment Guide**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Swagger Guide**: [SWAGGER_GUIDE.md](./SWAGGER_GUIDE.md)
- **Production Checklist**: [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md)
- **README**: [README.md](./README.md)

### External Resources
- **PM2 Docs**: https://pm2.keymetrics.io
- **Nginx Docs**: https://nginx.org/en/docs/
- **Certbot**: https://certbot.eff.org
- **MongoDB Atlas**: https://cloud.mongodb.com

### Contact
- **Email**: connect@liquidata.dev
- **API Issues**: Check logs and documentation
- **Emergency**: Follow rollback procedure in PRODUCTION_CHECKLIST.md

## File Changes Summary

### Modified Files
1. **server.js**
   - Updated Swagger server URL (line 89)
   - Enhanced CORS configuration (lines 28-38)

2. **.env.production**
   - Added API_URL variable
   - Added ALLOWED_ORIGINS variable

3. **README.md**
   - Updated API Documentation section
   - Added Production Deployment section

### New Files Created
1. **DEPLOYMENT.md** - Complete deployment guide
2. **SWAGGER_GUIDE.md** - Swagger documentation guide
3. **PRODUCTION_CHECKLIST.md** - Deployment checklist
4. **SUMMARY.md** - This file

## Version Information

- **API Version**: 2.0.0
- **OpenAPI Version**: 3.0.0
- **Node.js**: 18+
- **PM2**: 5.3.0+
- **MongoDB**: 8.0+
- **Nginx**: 1.18+

---

**Configuration Date**: 2025-12-10
**Production URL**: https://api.liquidata.dev
**Environment**: Production
**Status**: Ready for Deployment ✅
