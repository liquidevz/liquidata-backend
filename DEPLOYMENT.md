# Production Deployment Guide for api.liquidata.dev

## Overview
This guide covers the deployment of the Liquidata backend to production at `api.liquidata.dev`.

## Prerequisites
- VPS/Server with Node.js installed (v18 or higher)
- PM2 installed globally (`npm install -g pm2`)
- MongoDB Atlas connection configured
- Domain `api.liquidata.dev` pointing to your server IP

## Environment Configuration

### Production Environment Variables
The `.env.production` file contains:
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://myliquidata:Consolelog@liquidata-backend.pje93kc.mongodb.net/?retryWrites=true&w=majority&appName=liquidata-backend
JWT_SECRET=835b9ca3d7bb29b1c94758973d483475
GEMINI_API_KEY=AIzaSyDDPUBUuP10q5qv95dIiWYTSwCKabMdFYw
API_URL=https://api.liquidata.dev
FRONTEND_URL=https://liquidata.dev
ALLOWED_ORIGINS=https://liquidata.dev,https://www.liquidata.dev,https://api.liquidata.dev
```

## Deployment Steps

### 1. Server Setup
```bash
# Clone or pull latest code
git pull origin main

# Install dependencies
npm install --production

# Create necessary directories
mkdir -p public/uploads/case-studies
mkdir -p public/uploads/blogs
mkdir -p public/uploads/logos
mkdir -p logs
```

### 2. Start with PM2
```bash
# Start the application in production mode
npm run pm2:start:production

# Or directly with PM2
pm2 start ecosystem.config.js --env production
```

### 3. Verify Deployment
```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs liquidata-backend

# Monitor application
pm2 monit
```

### 4. Test Endpoints
- **Health Check**: https://api.liquidata.dev/health
- **API Documentation**: https://api.liquidata.dev/api-docs
- **API Root**: https://api.liquidata.dev/

## Nginx Configuration

If using Nginx as a reverse proxy, use this configuration:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name api.liquidata.dev;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name api.liquidata.dev;

    # SSL Configuration (use Certbot for Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/api.liquidata.dev/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.liquidata.dev/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Proxy settings
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Increase timeouts for long-running requests
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Serve uploaded files
    location /uploads {
        proxy_pass http://localhost:5000/uploads;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Increase max upload size
    client_max_body_size 10M;
}
```

### Setup SSL with Certbot
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d api.liquidata.dev

# Auto-renewal is configured automatically
sudo certbot renew --dry-run
```

## PM2 Management Commands

```bash
# Start application
npm run pm2:start:production

# Stop application
npm run pm2:stop

# Restart application
npm run pm2:restart

# Delete from PM2
npm run pm2:delete

# View logs
pm2 logs liquidata-backend

# Monitor
pm2 monit

# Save PM2 process list (for auto-restart on reboot)
pm2 save

# Setup PM2 to start on system boot
pm2 startup
```

## API Documentation

Once deployed, Swagger documentation will be available at:
- **Production**: https://api.liquidata.dev/api-docs
- **Local Development**: http://localhost:5000/api-docs

### Swagger Features
- Interactive API testing
- Complete endpoint documentation
- Request/response schemas
- Authentication testing with JWT tokens
- Example requests and responses

## Key Endpoints

### Public Endpoints
- `GET /health` - Health check
- `GET /api/calculator` - Get calculator configuration
- `POST /api/calculator/calculate` - Calculate project price
- `GET /api/case-studies` - Get case studies
- `GET /api/blogs` - Get blog posts
- `POST /api/chat` - Chat with Gemini AI

### Admin Endpoints (Require Authentication)
- `POST /api/admin/login` - Admin login
- `GET /api/admin/me` - Get current admin profile
- `PUT /api/admin/calculator` - Update calculator
- `POST /api/admin/case-studies` - Create case study
- `POST /api/admin/blogs` - Create blog post

## Security Considerations

1. **CORS**: Configured to only allow requests from:
   - https://liquidata.dev
   - https://www.liquidata.dev
   - https://api.liquidata.dev

2. **JWT Secret**: Ensure `JWT_SECRET` is a strong, random string in production

3. **Database**: MongoDB connection uses SSL/TLS by default

4. **File Uploads**: Limited to 10MB and only image files

5. **Rate Limiting**: Consider adding rate limiting for production (can be added to server.js)

## Monitoring & Logs

### PM2 Logs
Logs are stored in:
- Combined: `./logs/combined.log`
- Output: `./logs/out.log`
- Errors: `./logs/error.log`

### View Logs
```bash
# Real-time logs
pm2 logs liquidata-backend

# Last 100 lines
pm2 logs liquidata-backend --lines 100

# Error logs only
pm2 logs liquidata-backend --err

# Clear logs
pm2 flush
```

## Troubleshooting

### Application Won't Start
```bash
# Check PM2 logs
pm2 logs liquidata-backend

# Check if port 5000 is in use
sudo lsof -i :5000

# Restart PM2
pm2 restart liquidata-backend
```

### Database Connection Issues
- Verify MongoDB Atlas IP whitelist includes your server IP
- Check MONGODB_URI in .env.production
- Test connection: `mongo "mongodb+srv://..."`

### CORS Errors
- Verify ALLOWED_ORIGINS in .env.production
- Check that frontend is using correct API URL
- Ensure Nginx proxy headers are set correctly

## Maintenance

### Update Application
```bash
# Pull latest code
git pull origin main

# Install dependencies
npm install --production

# Restart with zero downtime
pm2 reload liquidata-backend
```

### Database Backup
```bash
# MongoDB Atlas provides automatic backups
# Manual backup can be done via Atlas UI or mongodump
```

### Monitor Resource Usage
```bash
# PM2 monitoring
pm2 monit

# System resources
htop
```

## Performance Optimization

The ecosystem.config.js is configured for production with:
- Cluster mode (uses all CPU cores)
- Automatic restarts on crashes
- Memory limit: 1GB per instance
- Daily restart at 2 AM
- Graceful shutdown handling

## Support

For issues or questions:
- Email: connect@liquidata.dev
- Check logs: `pm2 logs liquidata-backend`
- Monitor: `pm2 monit`
