# 🚀 VPS Deployment Guide for Liquidata Backend

This guide will help you deploy the Liquidata Backend on your VPS when the project won't run.

## 🔍 Common Issues & Solutions

### Issue 1: Node.js Version Problems
**Symptoms:** "node: command not found" or version errors
**Solution:**
```bash
# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version  # Should be >= 16
npm --version
```

### Issue 2: Missing Build Tools
**Symptoms:** "gyp ERR!" or compilation errors during npm install
**Solution:**
```bash
# Install build tools
sudo apt-get update
sudo apt-get install -y build-essential python3 python3-pip
```

### Issue 3: Port Already in Use
**Symptoms:** "EADDRINUSE" error
**Solution:**
```bash
# Check what's using port 5001
sudo netstat -tulpn | grep 5001
# Kill the process if needed
sudo kill -9 <PID>
```

### Issue 4: MongoDB Connection Issues
**Symptoms:** "MongoNetworkError" or authentication failed
**Solution:**
- Verify your MongoDB URI in .env file
- Check if your IP is whitelisted in MongoDB Atlas
- Test connection manually

### Issue 5: Firewall Blocking Port
**Symptoms:** Can't access the API from outside
**Solution:**
```bash
# Allow port 5001 through firewall
sudo ufw allow 5001
sudo ufw status
```

## 📋 Step-by-Step VPS Deployment

### Step 1: Prepare Your VPS
```bash
# Run this on your VPS as root
curl -sSL https://raw.githubusercontent.com/your-repo/liquidata/main/liquidata-backend/install-vps-deps.sh | sudo bash
```

### Step 2: Upload Your Code
```bash
# From your local machine
scp -r liquidata-backend/ user@your-vps-ip:/opt/liquidata-backend/
```

### Step 3: Configure Environment
```bash
# On your VPS
cd /opt/liquidata-backend
cp env.production.example .env

# Edit the .env file
nano .env
```

**Required .env variables:**
```env
NODE_ENV=production
PORT=5001
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-super-secret-jwt-key-change-this-2024
ADMIN_EMAIL=admin@liquidata.com
ADMIN_PASSWORD=change-this-secure-password-123
```

### Step 4: Install Dependencies
```bash
# Install project dependencies
npm install --production

# Or if you get permission errors
sudo npm install --production --unsafe-perm
```

### Step 5: Test the Application
```bash
# Run troubleshooting script first
./troubleshoot-vps.sh

# Test start manually
NODE_ENV=production PORT=5001 node server.js
```

### Step 6: Start with Process Manager
```bash
# Option A: Using PM2 (Recommended)
npm install -g pm2
pm2 start server.js --name liquidata-backend --env production
pm2 save
pm2 startup

# Option B: Using the startup script
./start-vps.sh
```

## 🛠️ Manual Troubleshooting

### Check System Requirements
```bash
# Check Node.js
node --version  # Should be >= 16

# Check npm
npm --version

# Check build tools
gcc --version
python3 --version
```

### Test MongoDB Connection
```bash
node -e "
const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
  .then(() => console.log('✓ MongoDB connected'))
  .catch(err => console.log('✗ MongoDB failed:', err.message));
"
```

### Check Port Availability
```bash
# Check if port 5001 is free
sudo netstat -tulpn | grep 5001
# or
sudo ss -tulpn | grep 5001
```

### Test Server Startup
```bash
# Start server manually to see errors
NODE_ENV=production PORT=5001 node server.js
```

## 🔧 Common Fixes

### Fix 1: Install Missing Dependencies
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install build tools
sudo apt-get install -y build-essential python3 python3-pip

# Install PM2
sudo npm install -g pm2
```

### Fix 2: Fix Permissions
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules

# Fix project permissions
sudo chown -R $(whoami) /opt/liquidata-backend
```

### Fix 3: Clear npm Cache
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Fix 4: Configure Firewall
```bash
# Enable firewall
sudo ufw enable

# Allow necessary ports
sudo ufw allow ssh
sudo ufw allow 5001
sudo ufw allow 80
sudo ufw allow 443

# Check status
sudo ufw status
```

## 🌐 Production Setup

### Using Nginx Reverse Proxy
```bash
# Install Nginx
sudo apt install -y nginx

# Create config file
sudo nano /etc/nginx/sites-available/liquidata-backend
```

**Nginx config:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass https://liquidata.rangaone.finance;
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

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

### SSL Certificate with Certbot
```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com
```

## 📊 Monitoring & Maintenance

### Check Application Status
```bash
# PM2 status
pm2 status
pm2 logs liquidata-backend

# System resources
htop
df -h
free -h
```

### View Logs
```bash
# PM2 logs
pm2 logs liquidata-backend --lines 50

# System logs
journalctl -u liquidata-backend -f

# Application logs (if using file logging)
tail -f logs/server.log
```

### Restart Application
```bash
# PM2 restart
pm2 restart liquidata-backend

# Or using npm script
npm run pm2:restart
```

## 🆘 Emergency Commands

### Quick Restart
```bash
# Kill all node processes
pkill -f node

# Start fresh
cd /opt/liquidata-backend
npm start
```

### Reset Everything
```bash
# Stop all processes
pm2 delete all

# Clean install
rm -rf node_modules package-lock.json
npm install

# Restart
pm2 start server.js --name liquidata-backend
```

### Check Everything
```bash
# Run comprehensive check
./troubleshoot-vps.sh
```

## 📞 Getting Help

If you're still having issues:

1. **Run the troubleshooting script:** `./troubleshoot-vps.sh`
2. **Check the specific error messages** when starting the server
3. **Verify all environment variables** are set correctly
4. **Test MongoDB connection** separately
5. **Check system resources** (memory, disk space)
6. **Review firewall settings**

## 🎯 Quick Start Commands

```bash
# 1. Install dependencies on VPS
sudo bash install-vps-deps.sh

# 2. Upload and configure your code
# (upload via scp, configure .env)

# 3. Run troubleshooting
./troubleshoot-vps.sh

# 4. Start the application
./start-vps.sh

# 5. Check status
pm2 status
curl https://liquidata.rangaone.finance/health
```

Your backend should now be running on `http://your-vps-ip:5001`! 🎉
