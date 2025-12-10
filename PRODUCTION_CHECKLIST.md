# Production Setup Checklist for api.liquidata.dev

## Pre-Deployment Checklist

### ✅ DNS Configuration
- [ ] Point `api.liquidata.dev` A record to server IP
- [ ] Verify DNS propagation: `nslookup api.liquidata.dev`
- [ ] Wait for full DNS propagation (can take up to 48 hours)

### ✅ Server Requirements
- [ ] Node.js v18+ installed: `node --version`
- [ ] PM2 installed globally: `npm install -g pm2`
- [ ] Nginx installed: `nginx -v`
- [ ] Git installed: `git --version`
- [ ] Sufficient disk space (at least 2GB free)
- [ ] Port 5000 available for backend
- [ ] Ports 80 and 443 open for Nginx

### ✅ Environment Configuration
- [ ] `.env.production` file created with correct values:
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=5000`
  - [ ] `MONGODB_URI` (MongoDB Atlas connection string)
  - [ ] `JWT_SECRET` (strong random string)
  - [ ] `GEMINI_API_KEY` (Google Gemini API key)
  - [ ] `API_URL=https://api.liquidata.dev`
  - [ ] `FRONTEND_URL=https://liquidata.dev`
  - [ ] `ALLOWED_ORIGINS` (comma-separated list)

### ✅ Database Setup
- [ ] MongoDB Atlas cluster created
- [ ] Database user created with read/write permissions
- [ ] IP whitelist configured (add server IP or allow all: 0.0.0.0/0)
- [ ] Connection string tested
- [ ] Database name configured

### ✅ Code Deployment
- [ ] Repository cloned to server
- [ ] Correct branch checked out (main/production)
- [ ] Dependencies installed: `npm install --production`
- [ ] Upload directories created:
  ```bash
  mkdir -p public/uploads/case-studies
  mkdir -p public/uploads/blogs
  mkdir -p public/uploads/logos
  mkdir -p logs
  ```

## Deployment Steps

### 1. Initial Setup
```bash
# Clone repository
cd /opt
git clone <your-repo-url> liquidata-backend
cd liquidata-backend

# Install dependencies
npm install --production

# Create directories
mkdir -p public/uploads/{case-studies,blogs,logos}
mkdir -p logs

# Set permissions
chmod -R 755 public/uploads
chmod -R 755 logs
```

### 2. Start Application
```bash
# Start with PM2
npm run pm2:start:production

# Verify it's running
pm2 status
pm2 logs liquidata-backend --lines 50

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the command it outputs
```

### 3. Configure Nginx
```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/api.liquidata.dev

# Paste the configuration from DEPLOYMENT.md

# Enable the site
sudo ln -s /etc/nginx/sites-available/api.liquidata.dev /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 4. Setup SSL Certificate
```bash
# Install Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d api.liquidata.dev

# Test auto-renewal
sudo certbot renew --dry-run
```

## Post-Deployment Verification

### ✅ Application Health
- [ ] Health endpoint responds: `curl https://api.liquidata.dev/health`
- [ ] Expected response: `{"status":"OK","timestamp":"..."}`
- [ ] PM2 shows app as "online": `pm2 status`
- [ ] No errors in logs: `pm2 logs liquidata-backend --lines 100`

### ✅ API Endpoints
- [ ] Root endpoint: https://api.liquidata.dev/
- [ ] Swagger docs: https://api.liquidata.dev/api-docs
- [ ] Calculator endpoint: https://api.liquidata.dev/api/calculator
- [ ] Admin setup check: https://api.liquidata.dev/api/admin/setup/check

### ✅ Database Connection
- [ ] Application connects to MongoDB successfully
- [ ] No database connection errors in logs
- [ ] Can create admin user (if first time)

### ✅ CORS Configuration
- [ ] Frontend can make requests to API
- [ ] No CORS errors in browser console
- [ ] Preflight OPTIONS requests work

### ✅ SSL/HTTPS
- [ ] HTTPS works: https://api.liquidata.dev
- [ ] HTTP redirects to HTTPS
- [ ] SSL certificate is valid
- [ ] No mixed content warnings

### ✅ File Uploads
- [ ] Upload directories exist and are writable
- [ ] Can upload images via admin endpoints
- [ ] Uploaded files are accessible via /uploads/

## Initial Data Setup

### Create First Admin User
```bash
# Option 1: Via API
curl -X POST https://api.liquidata.dev/api/admin/setup/first \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@liquidata.com",
    "password": "YourSecurePassword123"
  }'

# Option 2: Via Swagger
# Go to https://api.liquidata.dev/api-docs
# Use POST /api/admin/setup/first endpoint
```

### Seed Calculator Data (Optional)
```bash
# SSH into server
cd /opt/liquidata-backend

# Seed calculator
npm run seed-calculator

# Or seed individual components
npm run seed-components
npm run seed-pricing
```

## Monitoring Setup

### ✅ PM2 Monitoring
- [ ] PM2 dashboard accessible: `pm2 monit`
- [ ] Logs rotating properly
- [ ] Memory usage within limits
- [ ] CPU usage normal

### ✅ System Monitoring
- [ ] Disk space monitored: `df -h`
- [ ] Memory usage checked: `free -m`
- [ ] CPU usage normal: `top` or `htop`

### ✅ Log Monitoring
```bash
# Watch PM2 logs in real-time
pm2 logs liquidata-backend

# Check application logs
tail -f logs/combined.log
tail -f logs/error.log

# Check Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## Security Checklist

### ✅ Application Security
- [ ] JWT_SECRET is strong and unique
- [ ] CORS properly configured with specific origins
- [ ] File upload size limits in place (10MB)
- [ ] Only image files allowed for uploads
- [ ] Admin endpoints require authentication

### ✅ Server Security
- [ ] Firewall configured (UFW or iptables)
- [ ] Only necessary ports open (22, 80, 443, 5000 for localhost only)
- [ ] SSH key authentication enabled
- [ ] Password authentication disabled for SSH
- [ ] Fail2ban installed and configured
- [ ] Regular security updates enabled

### ✅ Database Security
- [ ] MongoDB Atlas IP whitelist configured
- [ ] Strong database password
- [ ] Connection uses SSL/TLS
- [ ] Regular backups enabled

### ✅ SSL/TLS Security
- [ ] SSL certificate valid and not expired
- [ ] TLS 1.2+ only
- [ ] Strong cipher suites configured
- [ ] HSTS header enabled (optional)

## Maintenance Tasks

### Daily
- [ ] Check PM2 status: `pm2 status`
- [ ] Review error logs: `pm2 logs liquidata-backend --err --lines 50`
- [ ] Monitor disk space: `df -h`

### Weekly
- [ ] Review all logs for anomalies
- [ ] Check SSL certificate expiry: `sudo certbot certificates`
- [ ] Monitor database size in MongoDB Atlas
- [ ] Review API usage and performance

### Monthly
- [ ] Update dependencies: `npm update`
- [ ] Review and rotate logs
- [ ] Check for security updates: `sudo apt update && sudo apt upgrade`
- [ ] Review and optimize database indexes
- [ ] Backup configuration files

## Troubleshooting Quick Reference

### Application Won't Start
```bash
# Check logs
pm2 logs liquidata-backend --lines 100

# Check if port is in use
sudo lsof -i :5000

# Restart application
pm2 restart liquidata-backend

# Delete and restart
pm2 delete liquidata-backend
npm run pm2:start:production
```

### Database Connection Failed
```bash
# Test MongoDB connection
mongo "YOUR_MONGODB_URI"

# Check environment variables
pm2 env 0

# Verify IP whitelist in MongoDB Atlas
# Verify connection string format
```

### Nginx Issues
```bash
# Test configuration
sudo nginx -t

# Check Nginx status
sudo systemctl status nginx

# Restart Nginx
sudo systemctl restart nginx

# Check error logs
sudo tail -f /var/log/nginx/error.log
```

### SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate manually
sudo certbot renew

# Force renewal
sudo certbot renew --force-renewal
```

## Rollback Procedure

If deployment fails:

```bash
# Stop current application
pm2 stop liquidata-backend

# Checkout previous version
git log --oneline -10  # Find previous commit
git checkout <previous-commit-hash>

# Reinstall dependencies
npm install --production

# Restart application
pm2 restart liquidata-backend

# Verify
curl https://api.liquidata.dev/health
```

## Support Contacts

- **Technical Issues**: connect@liquidata.dev
- **MongoDB Atlas**: https://cloud.mongodb.com
- **Certbot/SSL**: https://certbot.eff.org
- **PM2 Documentation**: https://pm2.keymetrics.io

## Success Criteria

Deployment is successful when:
- ✅ https://api.liquidata.dev/health returns 200 OK
- ✅ https://api.liquidata.dev/api-docs loads Swagger UI
- ✅ Admin can login and access protected endpoints
- ✅ Calculator API returns valid price calculations
- ✅ No errors in PM2 logs
- ✅ SSL certificate is valid
- ✅ CORS works with frontend
- ✅ File uploads work correctly
- ✅ Database operations succeed
- ✅ Application auto-restarts on failure
- ✅ PM2 starts on system boot

---

**Last Updated**: 2025-12-10
**Environment**: Production (api.liquidata.dev)
**Node Version**: 18+
**PM2 Version**: 5.3.0+
