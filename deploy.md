# 🚀 Backend Deployment Guide (Non-Docker)

## 📋 Prerequisites
- Node.js 18+ installed on server
- MongoDB database (local or cloud like MongoDB Atlas)
- Domain with SSL certificate

## 🔧 Deployment Steps

### 1. **Prepare Server Environment**
```bash
# Install Node.js (if not installed)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
npm install -g pm2
```

### 2. **Upload Backend Files**
Upload these files to your server:
- `server.js`
- `package.json`
- All seed files (`seed-*.js`)
- Environment configuration

### 3. **Install Dependencies**
```bash
npm install --production
```

### 4. **Create Environment File**
Create `.env` file with:
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/liquidata
JWT_SECRET=your-super-secret-jwt-key-change-this
ADMIN_EMAIL=admin@liquidata.com
ADMIN_PASSWORD=your-secure-admin-password
```

### 5. **Setup Database**
```bash
# Seed the complete calculator
node seed-complete-calculator.js

# Create admin user
node seed-admin.js
```

### 6. **Start with PM2**
```bash
# Start the application
pm2 start server.js --name "liquidata-backend"

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

### 7. **Configure Nginx (Reverse Proxy)**
Create `/etc/nginx/sites-available/liquidata.rangaone.finance`:
```nginx
server {
    listen 80;
    server_name liquidata.rangaone.finance;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name liquidata.rangaone.finance;
    
    # SSL Configuration
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    
    # Proxy to Node.js app
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
    }
}
```

### 8. **Enable Site & Restart Nginx**
```bash
sudo ln -s /etc/nginx/sites-available/liquidata.rangaone.finance /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 🔍 Troubleshooting

### Check if Node.js app is running:
```bash
pm2 status
pm2 logs liquidata-backend
```

### Check if port 5000 is listening:
```bash
sudo netstat -tlnp | grep :5000
```

### Test local connection:
```bash
curl http://localhost:5000/api/health
```

### Check Nginx configuration:
```bash
sudo nginx -t
sudo systemctl status nginx
```

## 🔐 SSL Certificate Issues

If you're getting SSL errors, you need to:

1. **Get SSL Certificate** (Let's Encrypt recommended):
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d liquidata.rangaone.finance
```

2. **Or use Cloudflare** for SSL termination

## 📊 Monitoring

### Check application status:
```bash
pm2 monit
```

### View logs:
```bash
pm2 logs liquidata-backend --lines 100
```

### Restart if needed:
```bash
pm2 restart liquidata-backend
```

## 🚨 Common Issues

1. **ERR_EMPTY_RESPONSE**: App not running or wrong port
2. **SSL Certificate Error**: Invalid/missing SSL certificate
3. **Connection Refused**: Firewall blocking port or app crashed

## 📞 Quick Fixes

If your backend is not responding:

1. **Check if app is running:**
   ```bash
   pm2 status
   ```

2. **Start the app:**
   ```bash
   pm2 start server.js --name liquidata-backend
   ```

3. **Check logs for errors:**
   ```bash
   pm2 logs liquidata-backend
   ```

4. **Test locally:**
   ```bash
   curl http://localhost:5000/api/health
   ```
