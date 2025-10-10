#!/bin/bash

# Production Deployment Script for Liquidata Backend
# This script handles the complete deployment process

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Configuration
APP_NAME="liquidata-backend"
APP_DIR="/opt/liquidata-backend"
BACKUP_DIR="/opt/backups/liquidata-backend"
LOG_FILE="/var/log/liquidata-deployment.log"

# Create log file
sudo touch $LOG_FILE
sudo chmod 666 $LOG_FILE

log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a $LOG_FILE
}

print_header "🚀 Starting Production Deployment for $APP_NAME"
log_message "Starting deployment process"

# Check if running as root or with sudo
if [ "$EUID" -eq 0 ]; then
    print_warning "Running as root. This is not recommended for production."
fi

# Pre-deployment checks
print_header "🔍 Running pre-deployment checks..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    print_error "Node.js version $NODE_VERSION is too old. Please upgrade to Node.js 16 or higher."
    exit 1
fi

print_status "Node.js version: $(node --version)"

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    print_warning "PM2 is not installed. Installing PM2..."
    npm install -g pm2
fi

print_status "PM2 version: $(pm2 --version)"

# Check if MongoDB connection is available
print_header "🗄️  Checking database connection..."
if [ -f .env ]; then
    source .env
    if [ -n "$MONGODB_URI" ]; then
        print_status "MongoDB URI configured"
    else
        print_error "MONGODB_URI not found in .env file"
        exit 1
    fi
else
    print_error ".env file not found. Please create it from .env.production.template"
    exit 1
fi

# Create necessary directories
print_header "📁 Creating necessary directories..."
sudo mkdir -p $APP_DIR
sudo mkdir -p $BACKUP_DIR
sudo mkdir -p $APP_DIR/logs
sudo mkdir -p $APP_DIR/public/uploads

# Set proper permissions
sudo chown -R $USER:$USER $APP_DIR
sudo chown -R $USER:$USER $BACKUP_DIR

print_status "Directories created and permissions set"

# Backup current deployment (if exists)
if [ -d "$APP_DIR/node_modules" ]; then
    print_header "💾 Creating backup of current deployment..."
    BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S)"
    sudo cp -r $APP_DIR $BACKUP_DIR/$BACKUP_NAME
    print_status "Backup created: $BACKUP_DIR/$BACKUP_NAME"
    log_message "Backup created: $BACKUP_DIR/$BACKUP_NAME"
fi

# Stop existing application
print_header "🛑 Stopping existing application..."
if pm2 list | grep -q $APP_NAME; then
    pm2 stop $APP_NAME || true
    pm2 delete $APP_NAME || true
    print_status "Existing application stopped"
else
    print_status "No existing application found"
fi

# Install dependencies
print_header "📦 Installing dependencies..."
npm ci --production --silent
print_status "Dependencies installed"

# Run database migrations/seeds if needed
print_header "🌱 Running database setup..."
if [ -f "seed-admin.js" ]; then
    print_status "Setting up admin user..."
    node seed-admin.js || print_warning "Admin setup failed or already exists"
fi

if [ -f "seed-complete-calculator.js" ]; then
    print_status "Setting up calculator configuration..."
    node seed-complete-calculator.js || print_warning "Calculator setup failed or already exists"
fi

# Validate configuration
print_header "✅ Validating configuration..."
node -e "
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log('✓ Database connection successful');
    process.exit(0);
  })
  .catch(err => {
    console.error('✗ Database connection failed:', err.message);
    process.exit(1);
  });
" || {
    print_error "Database connection validation failed"
    exit 1
}

# Start application with PM2
print_header "🚀 Starting application with PM2..."
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup | grep -E '^sudo' | bash || print_warning "PM2 startup configuration may need manual setup"

print_status "Application started successfully"

# Wait for application to be ready
print_header "⏳ Waiting for application to be ready..."
sleep 10

# Health check
print_header "🏥 Running health check..."
HEALTH_URL="http://localhost:${PORT:-5001}/health"
if curl -f -s $HEALTH_URL > /dev/null; then
    print_status "Health check passed"
    log_message "Deployment successful - health check passed"
else
    print_error "Health check failed"
    print_error "Check application logs: pm2 logs $APP_NAME"
    log_message "Deployment failed - health check failed"
    exit 1
fi

# Display application status
print_header "📊 Application Status"
pm2 status
echo ""
pm2 logs $APP_NAME --lines 10

# Setup log rotation
print_header "📝 Setting up log rotation..."
sudo tee /etc/logrotate.d/liquidata-backend > /dev/null << EOF
$APP_DIR/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    copytruncate
    su $USER $USER
}
EOF

print_status "Log rotation configured"

# Setup monitoring cron job
print_header "📈 Setting up monitoring..."
(crontab -l 2>/dev/null; echo "*/5 * * * * $APP_DIR/monitor.sh") | crontab -
print_status "Monitoring cron job added"

# Cleanup old backups (keep last 5)
print_header "🧹 Cleaning up old backups..."
cd $BACKUP_DIR
ls -t | tail -n +6 | xargs -r rm -rf
print_status "Old backups cleaned up"

# Final status
print_header "🎉 Deployment completed successfully!"
echo ""
print_status "Application URL: http://$(curl -s ifconfig.me):${PORT:-5001}"
print_status "Health Check: http://$(curl -s ifconfig.me):${PORT:-5001}/health"
print_status "API Documentation: http://$(curl -s ifconfig.me):${PORT:-5001}/api-docs"
echo ""
print_status "Useful commands:"
echo "  Check status: pm2 status"
echo "  View logs: pm2 logs $APP_NAME"
echo "  Restart: pm2 restart $APP_NAME"
echo "  Stop: pm2 stop $APP_NAME"
echo "  Monitor: pm2 monit"
echo ""
print_status "Deployment log: $LOG_FILE"

log_message "Deployment completed successfully"

# Send notification (if webhook configured)
if [ -n "$DEPLOYMENT_WEBHOOK" ]; then
    curl -X POST "$DEPLOYMENT_WEBHOOK" \
         -H "Content-Type: application/json" \
         -d "{\"text\":\"✅ Liquidata Backend deployed successfully on $(hostname)\"}" \
         2>/dev/null || true
fi

print_status "🚀 Liquidata Backend is now running in production!"
