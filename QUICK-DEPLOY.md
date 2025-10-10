# 🚀 Quick Production Deployment - Liquidata Backend

## 📋 Pre-Deployment Checklist

- [ ] VPS with Ubuntu 20.04+ or CentOS 8+
- [ ] Domain name pointed to your VPS IP
- [ ] MongoDB Atlas connection string ready
- [ ] SSL certificate (Let's Encrypt recommended)

## ⚡ One-Command Deployment

### Option 1: Automated Deployment
```bash
# Upload your code to VPS and run:
sudo ./deploy-production.sh
```

### Option 2: Manual Step-by-Step

#### 1. Upload Code to VPS
```bash
# From your local machine
scp -r liquidata-backend/ user@your-vps-ip:/opt/liquidata-backend/
```

#### 2. SSH to VPS and Setup
```bash
ssh user@your-vps-ip
cd /opt/liquidata-backend

# Make scripts executable
chmod +x *.sh

# Run setup
sudo ./setup-vps.sh
```

#### 3. Configure Environment
```bash
# Copy environment template
cp .env.production.template .env

# Edit with your settings
nano .env
```

**Critical Environment Variables:**
```env
NODE_ENV=production
PORT=5001
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your-super-secret-jwt-key-change-this-2024
ADMIN_EMAIL=admin@devflow.com
ADMIN_PASSWORD=YourSecurePassword123!
CORS_ORIGIN=https://your-domain.com
```

#### 4. Start Application
```bash
# Install dependencies and start
./start-production.sh
```

## 🔧 Post-Deployment

### Verify Deployment
```bash
# Check application status
pm2 status

# Test health endpoint
curl http://localhost:5001/health

# View logs
pm2 logs liquidata-backend
```

### Setup SSL (Recommended)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com
```

### Setup Nginx Reverse Proxy
```bash
# Install Nginx
sudo apt install nginx

# Create configuration
sudo nano /etc/nginx/sites-available/liquidata-backend
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/liquidata-backend /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

## 📊 Monitoring Setup

### Automated Monitoring
```bash
# Setup monitoring (runs every 5 minutes)
crontab -e

# Add this line:
*/5 * * * * /opt/liquidata-backend/monitor.sh
```

### Manual Monitoring Commands
```bash
# Application status
pm2 status
pm2 monit

# System resources
htop
df -h
free -h

# Application logs
pm2 logs liquidata-backend
tail -f logs/application-$(date +%Y-%m-%d).log
```

## 🚨 Troubleshooting

### Application Won't Start
```bash
# Check logs
pm2 logs liquidata-backend --lines 50

# Restart application
pm2 restart liquidata-backend

# Full reset
pm2 delete liquidata-backend
./start-production.sh
```

### Database Connection Issues
```bash
# Test connection
node -e "
const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
  .then(() => console.log('✓ Connected'))
  .catch(err => console.log('✗ Failed:', err.message));
"
```

### Port Issues
```bash
# Check what's using port 5001
sudo netstat -tulpn | grep 5001

# Kill process if needed
sudo kill -9 <PID>
```

### High Resource Usage
```bash
# Restart application
pm2 restart liquidata-backend

# Check system resources
htop
```

## 🔄 Updates & Maintenance

### Update Application
```bash
# Pull latest changes
git pull origin main

# Install dependencies
npm ci --production

# Restart application
pm2 restart liquidata-backend
```

### Database Backup
```bash
# Manual backup
mongodump --uri="$MONGODB_URI" --out="/opt/backups/mongodb_$(date +%Y%m%d)"

# Setup automated daily backups
echo "0 2 * * * mongodump --uri=\"$MONGODB_URI\" --out=\"/opt/backups/mongodb_\$(date +%Y%m%d)\"" | crontab -
```

## 📞 Support Commands

### Essential Commands
```bash
# Application management
pm2 start liquidata-backend
pm2 stop liquidata-backend
pm2 restart liquidata-backend
pm2 delete liquidata-backend

# Logs and monitoring
pm2 logs liquidata-backend
pm2 monit
pm2 status

# System management
sudo systemctl status nginx
sudo systemctl restart nginx
sudo ufw status
```

### Health Checks
```bash
# Application health
curl http://localhost:5001/health

# Database health
curl http://localhost:5001/api/calculator

# System health
./monitor.sh
```

## 🎯 Production URLs

After successful deployment:
- **API Base**: `https://your-domain.com`
- **Health Check**: `https://your-domain.com/health`
- **API Docs**: `https://your-domain.com/api-docs`
- **Admin Login**: `https://your-domain.com/api/admin/login`

## ✅ Success Indicators

Your deployment is successful when:
- [ ] `pm2 status` shows application as "online"
- [ ] Health check returns 200 OK
- [ ] API documentation is accessible
- [ ] Admin login works
- [ ] Calculator API responds correctly
- [ ] Logs show no critical errors

## 🔒 Security Checklist

- [ ] Environment variables are secure
- [ ] Firewall is configured (ports 22, 80, 443, 5001)
- [ ] SSL certificate is installed
- [ ] Admin password is strong
- [ ] JWT secret is unique and secure
- [ ] Database connection is encrypted
- [ ] Regular backups are configured
- [ ] Monitoring is active

---

**🎉 Your Liquidata Backend is now production-ready!**

For detailed documentation, see `PRODUCTION-DEPLOYMENT.md`
