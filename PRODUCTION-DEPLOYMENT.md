# 🚀 Production Deployment Guide - Liquidata Backend

This comprehensive guide will help you deploy the Liquidata Backend to production with proper security, monitoring, and reliability.

## 📋 Prerequisites

### System Requirements
- **OS**: Ubuntu 20.04+ or CentOS 8+
- **Node.js**: 18.x or higher
- **Memory**: Minimum 2GB RAM (4GB recommended)
- **Storage**: Minimum 20GB free space
- **Network**: Stable internet connection

### Required Software
- Node.js 18+
- npm or yarn
- PM2 (Process Manager)
- Git
- curl
- ufw (firewall)

## 🔧 Quick Setup

### 1. Run the Automated Setup
```bash
# Make scripts executable
chmod +x *.sh

# Run the production deployment script
sudo ./deploy-production.sh
```

### 2. Manual Setup (Alternative)

#### Step 1: Install Dependencies
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install other dependencies
sudo apt install -y git curl ufw htop
```

#### Step 2: Setup Application
```bash
# Create application directory
sudo mkdir -p /opt/liquidata-backend
cd /opt/liquidata-backend

# Clone or upload your code
# git clone <your-repo> .
# or upload files via scp

# Install dependencies
npm ci --production

# Set proper permissions
sudo chown -R $USER:$USER /opt/liquidata-backend
```

#### Step 3: Configure Environment
```bash
# Copy environment template
cp .env.production.template .env

# Edit environment variables
nano .env
```

**Required Environment Variables:**
```env
NODE_ENV=production
PORT=5001
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-super-secret-jwt-key-change-this-2024
ADMIN_EMAIL=admin@devflow.com
ADMIN_PASSWORD=your-secure-password
CORS_ORIGIN=https://your-domain.com
```

#### Step 4: Setup Database
```bash
# Setup admin user
node seed-admin.js

# Setup calculator configuration
node seed-complete-calculator.js
```

#### Step 5: Start Application
```bash
# Start with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

## 🔒 Security Configuration

### Firewall Setup
```bash
# Enable firewall
sudo ufw enable

# Allow necessary ports
sudo ufw allow ssh
sudo ufw allow 5001/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Check status
sudo ufw status
```

### SSL Certificate (Recommended)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com
```

### Nginx Reverse Proxy (Recommended)
```bash
# Install Nginx
sudo apt install nginx

# Create configuration
sudo nano /etc/nginx/sites-available/liquidata-backend
```

**Nginx Configuration:**
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
        
        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/liquidata-backend /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

## 📊 Monitoring & Logging

### Application Monitoring
```bash
# Setup monitoring cron job
crontab -e

# Add this line to run monitoring every 5 minutes
*/5 * * * * /opt/liquidata-backend/monitor.sh
```

### Log Management
```bash
# View application logs
pm2 logs liquidata-backend

# View system logs
journalctl -u liquidata-backend -f

# View custom logs
tail -f /opt/liquidata-backend/logs/application-$(date +%Y-%m-%d).log
```

### Health Checks
```bash
# Manual health check
curl http://localhost:5001/health

# Automated health monitoring is included in monitor.sh
```

## 🚀 Deployment Commands

### Start Application
```bash
pm2 start ecosystem.config.js --env production
```

### Stop Application
```bash
pm2 stop liquidata-backend
```

### Restart Application
```bash
pm2 restart liquidata-backend
```

### View Status
```bash
pm2 status
pm2 monit
```

### Update Application
```bash
# Pull latest changes
git pull origin main

# Install dependencies
npm ci --production

# Restart application
pm2 restart liquidata-backend
```

## 🔧 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Check what's using the port
sudo netstat -tulpn | grep 5001

# Kill the process
sudo kill -9 <PID>
```

#### MongoDB Connection Issues
```bash
# Test MongoDB connection
node -e "
const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
  .then(() => console.log('✓ Connected'))
  .catch(err => console.log('✗ Failed:', err.message));
"
```

#### Application Won't Start
```bash
# Check PM2 logs
pm2 logs liquidata-backend --lines 50

# Check system resources
htop
df -h
free -h

# Restart with fresh configuration
pm2 delete liquidata-backend
pm2 start ecosystem.config.js --env production
```

#### High Memory Usage
```bash
# Restart application
pm2 restart liquidata-backend

# Check for memory leaks in logs
grep -i "memory\|heap" /opt/liquidata-backend/logs/*.log
```

### Emergency Recovery
```bash
# Complete application reset
pm2 delete all
rm -rf node_modules package-lock.json
npm install --production
pm2 start ecosystem.config.js --env production
```

## 📈 Performance Optimization

### PM2 Cluster Mode
```bash
# Start in cluster mode (uses all CPU cores)
pm2 start ecosystem.config.js --env production -i max
```

### Database Optimization
- Enable MongoDB connection pooling
- Use database indexes for frequently queried fields
- Implement query result caching

### Application Optimization
- Enable gzip compression (included in production server)
- Use CDN for static assets
- Implement API response caching
- Monitor and optimize slow queries

## 🔄 Backup & Recovery

### Database Backup
```bash
# Create backup script
cat > /opt/liquidata-backend/backup-db.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --uri="$MONGODB_URI" --out="/opt/backups/mongodb_$DATE"
find /opt/backups -name "mongodb_*" -mtime +7 -exec rm -rf {} \;
EOF

chmod +x /opt/liquidata-backend/backup-db.sh

# Add to crontab for daily backups
echo "0 2 * * * /opt/liquidata-backend/backup-db.sh" | crontab -
```

### Application Backup
```bash
# Backup application files
tar -czf /opt/backups/liquidata-backend-$(date +%Y%m%d).tar.gz /opt/liquidata-backend
```

## 📞 Support & Maintenance

### Regular Maintenance Tasks
1. **Daily**: Check application logs and health
2. **Weekly**: Review system resources and performance
3. **Monthly**: Update dependencies and security patches
4. **Quarterly**: Review and rotate secrets/passwords

### Monitoring Checklist
- [ ] Application is responding to health checks
- [ ] Database connections are stable
- [ ] System resources are within normal limits
- [ ] Logs don't show critical errors
- [ ] SSL certificates are valid
- [ ] Backups are running successfully

### Emergency Contacts
- **System Administrator**: [Your contact]
- **Database Administrator**: [Your contact]
- **DevOps Team**: [Your contact]

## 🎯 Production URLs

After successful deployment, your application will be available at:
- **API Base URL**: `https://your-domain.com`
- **Health Check**: `https://your-domain.com/health`
- **API Documentation**: `https://your-domain.com/api-docs`

## 📝 Additional Notes

- Always test deployments in a staging environment first
- Keep environment variables secure and never commit them to version control
- Regularly update dependencies for security patches
- Monitor application performance and scale as needed
- Implement proper error tracking and alerting

---

**🎉 Congratulations!** Your Liquidata Backend is now running in production with enterprise-grade reliability, security, and monitoring.

For additional support or questions, please refer to the troubleshooting section or contact your system administrator.
