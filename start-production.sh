#!/bin/bash

# Production Startup Script for Liquidata Backend
# This script starts the application in production mode with all necessary checks

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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
NODE_ENV="production"
PORT="${PORT:-5001}"

print_header "🚀 Starting Liquidata Backend in Production Mode"

# Check if .env file exists
if [ ! -f .env ]; then
    print_error ".env file not found!"
    print_warning "Please create .env file from .env.production.template"
    print_warning "cp .env.production.template .env"
    exit 1
fi

# Load environment variables
source .env

# Validate required environment variables
print_header "🔍 Validating environment configuration..."

required_vars=("MONGODB_URI" "JWT_SECRET" "ADMIN_EMAIL" "ADMIN_PASSWORD")
missing_vars=()

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    print_error "Missing required environment variables:"
    for var in "${missing_vars[@]}"; do
        echo "  - $var"
    done
    exit 1
fi

print_status "Environment configuration validated"

# Check if Node.js is installed and version is correct
print_header "🔍 Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    print_error "Node.js version $NODE_VERSION is too old. Please upgrade to Node.js 16+"
    exit 1
fi

print_status "Node.js $(node --version) is installed"

# Check if PM2 is installed
print_header "🔍 Checking PM2 installation..."
if ! command -v pm2 &> /dev/null; then
    print_warning "PM2 is not installed. Installing PM2..."
    npm install -g pm2
fi

print_status "PM2 $(pm2 --version) is installed"

# Create necessary directories
print_header "📁 Creating necessary directories..."
mkdir -p logs
mkdir -p public/uploads
print_status "Directories created"

# Install/update dependencies
print_header "📦 Installing dependencies..."
if [ ! -d "node_modules" ] || [ package.json -nt node_modules ]; then
    print_status "Installing/updating dependencies..."
    npm ci --production --silent
    print_status "Dependencies installed"
else
    print_status "Dependencies are up to date"
fi

# Test database connection
print_header "🗄️  Testing database connection..."
node -e "
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI, { 
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 5000
})
.then(() => {
  console.log('✓ Database connection successful');
  process.exit(0);
})
.catch(err => {
  console.error('✗ Database connection failed:', err.message);
  process.exit(1);
});
" || {
    print_error "Database connection failed"
    print_warning "Please check your MONGODB_URI in .env file"
    exit 1
}

# Stop existing PM2 process if running
print_header "🛑 Stopping existing processes..."
if pm2 list | grep -q "$APP_NAME"; then
    print_status "Stopping existing $APP_NAME process..."
    pm2 stop "$APP_NAME" || true
    pm2 delete "$APP_NAME" || true
else
    print_status "No existing process found"
fi

# Start the application with PM2
print_header "🚀 Starting application with PM2..."
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 startup script (if not already done)
if ! pm2 startup | grep -q "already"; then
    print_status "Setting up PM2 startup script..."
    pm2 startup | grep -E '^sudo' | bash || print_warning "PM2 startup setup may need manual configuration"
fi

print_status "Application started successfully"

# Wait for application to be ready
print_header "⏳ Waiting for application to be ready..."
sleep 5

# Health check
print_header "🏥 Running health check..."
max_attempts=12
attempt=1

while [ $attempt -le $max_attempts ]; do
    if curl -f -s "http://localhost:$PORT/health" > /dev/null; then
        print_status "Health check passed ✅"
        break
    else
        if [ $attempt -eq $max_attempts ]; then
            print_error "Health check failed after $max_attempts attempts"
            print_error "Check application logs: pm2 logs $APP_NAME"
            exit 1
        fi
        print_warning "Health check attempt $attempt/$max_attempts failed, retrying in 5 seconds..."
        sleep 5
        ((attempt++))
    fi
done

# Display application status
print_header "📊 Application Status"
pm2 status
echo ""

# Show application information
print_header "🎉 Application Started Successfully!"
echo ""
print_status "Application Name: $APP_NAME"
print_status "Environment: $NODE_ENV"
print_status "Port: $PORT"
print_status "Process Manager: PM2"
echo ""
print_status "URLs:"
echo "  Health Check: http://localhost:$PORT/health"
echo "  API Documentation: http://localhost:$PORT/api-docs"
if [ -n "$CORS_ORIGIN" ]; then
    echo "  Public URL: $CORS_ORIGIN"
fi
echo ""
print_status "Useful Commands:"
echo "  View logs: pm2 logs $APP_NAME"
echo "  Monitor: pm2 monit"
echo "  Restart: pm2 restart $APP_NAME"
echo "  Stop: pm2 stop $APP_NAME"
echo "  Status: pm2 status"
echo ""

# Setup monitoring if monitor.sh exists
if [ -f "monitor.sh" ]; then
    print_header "📈 Setting up monitoring..."
    chmod +x monitor.sh
    
    # Add monitoring cron job if not already present
    if ! crontab -l 2>/dev/null | grep -q "monitor.sh"; then
        (crontab -l 2>/dev/null; echo "*/5 * * * * $(pwd)/monitor.sh") | crontab -
        print_status "Monitoring cron job added (runs every 5 minutes)"
    else
        print_status "Monitoring cron job already exists"
    fi
fi

# Final success message
print_status "🚀 Liquidata Backend is now running in production mode!"
print_status "Monitor the application with: pm2 monit"

# Show recent logs
print_header "📝 Recent Application Logs"
pm2 logs "$APP_NAME" --lines 10 --nostream
