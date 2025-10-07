# Liquidata Backend Docker Deployment

This guide explains how to deploy the Liquidata Backend using Docker on a VPS.

## 🚀 Quick Start

### For VPS Deployment

1. **Setup VPS** (run on your VPS):
```bash
# Download and run the VPS setup script
curl -sSL https://raw.githubusercontent.com/your-repo/liquidata/main/liquidata-backend/setup-vps.sh | sudo bash
```

2. **Upload your code** to `/opt/liquidata-backend/`

3. **Configure environment**:
```bash
cd /opt/liquidata-backend
cp env.production.example .env.production
nano .env.production  # Edit with your values
```

4. **Deploy**:
```bash
./deploy.sh
```

### For Local Development

```bash
# Build and run
docker-compose up --build

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

## 📁 Files Created

- `Dockerfile` - Container definition
- `docker-compose.yml` - Service orchestration
- `.dockerignore` - Files to exclude from build
- `.env.production` - Production environment variables
- `deploy.sh` - Deployment script
- `setup-vps.sh` - VPS setup script

## 🔧 Configuration

### Environment Variables (.env.production)

**Required Changes:**
- `JWT_SECRET` - Change to a secure random string
- `ADMIN_PASSWORD` - Change to a secure password
- `MONGODB_URI` - Your MongoDB connection string

**Optional:**
- `CORS_ORIGIN` - Add your frontend domains
- `RATE_LIMIT_*` - Adjust rate limiting

### Port Configuration

The backend runs on port **5001** by default. This is configured in:
- `Dockerfile` (EXPOSE 5001)
- `docker-compose.yml` (ports: "5001:5001")
- `.env.production` (PORT=5001)

## 🌐 VPS Deployment Steps

### 1. Prepare VPS
```bash
# On your VPS (Ubuntu/Debian)
sudo bash setup-vps.sh
```

This script:
- Installs Docker & Docker Compose
- Configures firewall (allows port 5001)
- Creates application directory
- Sets up systemd service
- Configures log rotation

### 2. Upload Code
```bash
# From your local machine
scp -r liquidata-backend/ user@your-vps-ip:/opt/liquidata-backend/
```

### 3. Configure & Deploy
```bash
# On your VPS
cd /opt/liquidata-backend
cp env.production.example .env.production
nano .env.production  # Edit configuration
./deploy.sh
```

## 🔍 Monitoring & Maintenance

### Check Status
```bash
# Container status
docker-compose ps

# Service status
systemctl status liquidata-backend

# View logs
docker-compose logs -f
```

### Updates
```bash
# Pull latest code and redeploy
git pull origin main
./deploy.sh
```

### Backup
```bash
# Backup uploads
tar -czf uploads-backup-$(date +%Y%m%d).tar.gz public/uploads/

# Backup logs
tar -czf logs-backup-$(date +%Y%m%d).tar.gz logs/
```

## 🔒 Security Considerations

1. **Change default credentials** in `.env.production`
2. **Configure firewall** (done by setup script)
3. **Use HTTPS** in production (set up reverse proxy)
4. **Regular updates** of system and Docker images
5. **Monitor logs** for suspicious activity
6. **Backup database** regularly

## 🌍 Access Points

After deployment, your API will be available at:

- **API Base**: `http://your-vps-ip:5001`
- **Health Check**: `http://your-vps-ip:5001/health`
- **API Docs**: `http://your-vps-ip:5001/api-docs`
- **Calculator**: `http://your-vps-ip:5001/api/calculator`

## 🐛 Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose logs

# Check environment
docker-compose config

# Rebuild
docker-compose down
docker-compose up --build
```

### Port conflicts
```bash
# Check what's using port 5001
sudo netstat -tulpn | grep 5001

# Change port in docker-compose.yml if needed
```

### Database connection issues
```bash
# Test MongoDB connection
docker-compose exec liquidata-backend node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));
"
```

### Memory issues
```bash
# Check system resources
free -h
df -h

# Limit container memory in docker-compose.yml:
# deploy:
#   resources:
#     limits:
#       memory: 512M
```

## 📞 Support

If you encounter issues:

1. Check the logs: `docker-compose logs -f`
2. Verify environment variables: `docker-compose config`
3. Test health endpoint: `curl http://localhost:5001/health`
4. Check system resources: `htop` or `docker stats`

## 🔄 Auto-restart

The systemd service ensures the container restarts automatically:
- On system boot
- If the container crashes
- After system updates

Check service status: `systemctl status liquidata-backend`
