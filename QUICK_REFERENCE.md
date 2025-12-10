# 🚀 Quick Reference Card - api.liquidata.dev

## 📍 Production URLs

| Service | URL |
|---------|-----|
| **API Base** | https://api.liquidata.dev |
| **Swagger Docs** | https://api.liquidata.dev/api-docs |
| **Health Check** | https://api.liquidata.dev/health |
| **Frontend** | https://liquidata.dev |

## 🔑 Key Commands

### PM2 Management
```bash
# Start production
npm run pm2:start:production

# Check status
pm2 status

# View logs
pm2 logs liquidata-backend

# Monitor
pm2 monit

# Restart
pm2 restart liquidata-backend

# Stop
pm2 stop liquidata-backend
```

### Deployment
```bash
# Pull latest code
git pull origin main

# Install dependencies
npm install --production

# Restart with zero downtime
pm2 reload liquidata-backend
```

### Nginx
```bash
# Test configuration
sudo nginx -t

# Reload
sudo systemctl reload nginx

# Check status
sudo systemctl status nginx
```

### SSL Certificate
```bash
# Check certificate
sudo certbot certificates

# Renew
sudo certbot renew

# Test renewal
sudo certbot renew --dry-run
```

## 🔐 Environment Variables

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
GEMINI_API_KEY=your-api-key
API_URL=https://api.liquidata.dev
FRONTEND_URL=https://liquidata.dev
ALLOWED_ORIGINS=https://liquidata.dev,https://www.liquidata.dev,https://api.liquidata.dev
```

## 📊 Monitoring

### Check Health
```bash
curl https://api.liquidata.dev/health
```

### View Logs
```bash
# PM2 logs
pm2 logs liquidata-backend --lines 100

# Application logs
tail -f logs/error.log
tail -f logs/combined.log

# Nginx logs
sudo tail -f /var/log/nginx/error.log
```

### System Resources
```bash
# Disk space
df -h

# Memory
free -m

# Processes
htop
```

## 🔧 Troubleshooting

### App Won't Start
```bash
pm2 logs liquidata-backend --lines 50
pm2 restart liquidata-backend
```

### Database Connection Failed
- Check MongoDB Atlas IP whitelist
- Verify MONGODB_URI in .env.production
- Test connection string

### CORS Errors
- Verify ALLOWED_ORIGINS in .env.production
- Check Nginx proxy headers
- Ensure frontend uses correct API URL

### SSL Issues
```bash
sudo certbot renew --force-renewal
sudo systemctl reload nginx
```

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| **DEPLOYMENT.md** | Complete deployment guide |
| **SWAGGER_GUIDE.md** | API documentation usage |
| **PRODUCTION_CHECKLIST.md** | Deployment checklist |
| **PRODUCTION_SUMMARY.md** | Configuration summary |

## 🎯 Quick Tests

### Test Health
```bash
curl https://api.liquidata.dev/health
# Expected: {"status":"OK","timestamp":"..."}
```

### Test Swagger
Open in browser: https://api.liquidata.dev/api-docs

### Test Calculator
```bash
curl https://api.liquidata.dev/api/calculator
# Should return calculator configuration
```

### Test Admin Setup
```bash
curl https://api.liquidata.dev/api/admin/setup/check
# Returns: {"hasAdmin":true/false,"needsSetup":true/false}
```

## 🔒 Security Checklist

- ✅ CORS configured for specific origins
- ✅ JWT authentication enabled
- ✅ SSL/TLS certificate active
- ✅ Environment variables secured
- ✅ File upload restrictions (10MB, images only)
- ✅ MongoDB connection encrypted
- ✅ Firewall configured
- ✅ Regular backups enabled

## 📞 Support

**Email**: connect@liquidata.dev

**Emergency Rollback**:
```bash
pm2 stop liquidata-backend
git checkout <previous-commit>
npm install --production
pm2 restart liquidata-backend
```

---

**Last Updated**: 2025-12-10  
**Version**: 2.0.0  
**Status**: ✅ Production Ready
