#!/bin/bash

# VPS Startup Script for Liquidata Backend
# This script properly starts the application on VPS

set -e

echo "🚀 Starting Liquidata Backend on VPS..."

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

# Check if we're in the right directory
if [ ! -f "server.js" ]; then
    print_error "server.js not found. Please run this script from the liquidata-backend directory."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    echo "Install Node.js 18:"
    echo "curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -"
    echo "sudo apt-get install -y nodejs"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | sed 's/v//' | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    print_error "Node.js version is too old. Need >= 16, got $(node --version)"
    exit 1
fi

print_status "Node.js version: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed."
    exit 1
fi

print_status "npm version: $(npm --version)"

# Install build tools if not present
if ! command -v gcc &> /dev/null; then
    print_warning "Build tools not found. Installing..."
    sudo apt-get update
    sudo apt-get install -y build-essential python3
fi

# Create environment file if it doesn't exist
if [ ! -f ".env" ] && [ ! -f ".env.production" ]; then
    print_warning "No environment file found. Creating .env from template..."
    
    if [ -f "env.production.example" ]; then
        cp env.production.example .env
    else
        cat > .env << EOF
NODE_ENV=production
PORT=5001
MONGODB_URI=mongodb+srv://myliquidata:myliquidata@liquidata-backend.pje93kc.mongodb.net/?retryWrites=true&w=majority&appName=liquidata-backend
JWT_SECRET=your-super-secret-jwt-key-change-this-2024-production
ADMIN_EMAIL=admin@liquidata.com
ADMIN_PASSWORD=change-this-secure-password-123
EOF
    fi
    
    print_warning "Please edit .env file with your production values!"
    print_warning "Especially change JWT_SECRET and ADMIN_PASSWORD!"
fi

# Install dependencies
print_status "Installing dependencies..."
if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules" ]; then
    npm install --production
    print_status "Dependencies installed successfully"
else
    print_status "Dependencies are up to date"
fi

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p public/uploads/logos
mkdir -p logs

# Set proper permissions
chmod 755 public/uploads
chmod 755 logs

# Check if port is available
PORT=${PORT:-5001}
if command -v netstat &> /dev/null; then
    if netstat -tuln | grep -q ":$PORT "; then
        print_error "Port $PORT is already in use"
        netstat -tulpn | grep ":$PORT "
        exit 1
    fi
elif command -v ss &> /dev/null; then
    if ss -tuln | grep -q ":$PORT "; then
        print_error "Port $PORT is already in use"
        ss -tulpn | grep ":$PORT "
        exit 1
    fi
fi

# Test MongoDB connection
print_status "Testing MongoDB connection..."
if ! node -e "
const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log('✓ MongoDB connection successful');
    process.exit(0);
  })
  .catch(err => {
    console.log('✗ MongoDB connection failed:', err.message);
    process.exit(1);
  });
" 2>/dev/null; then
    print_error "MongoDB connection failed. Please check your MONGODB_URI in .env file"
    exit 1
fi

print_status "MongoDB connection successful"

# Check firewall
if command -v ufw &> /dev/null; then
    if ! ufw status | grep -q "$PORT"; then
        print_warning "Port $PORT is not allowed in firewall. Adding rule..."
        sudo ufw allow $PORT
    fi
fi

# Start the server
print_status "Starting the server..."
echo "========================================="

# Option 1: Start with PM2 (recommended for production)
if command -v pm2 &> /dev/null; then
    print_status "Starting with PM2..."
    pm2 start server.js --name "liquidata-backend" --env production
    pm2 save
    pm2 startup
    print_status "Server started with PM2"
    print_status "Use 'pm2 status' to check status"
    print_status "Use 'pm2 logs liquidata-backend' to view logs"
    print_status "Use 'pm2 restart liquidata-backend' to restart"
else
    # Option 2: Start with nohup (fallback)
    print_warning "PM2 not found. Starting with nohup..."
    print_warning "Consider installing PM2 for better process management:"
    print_warning "npm install -g pm2"
    
    # Kill any existing process
    pkill -f "node server.js" || true
    
    # Start in background
    nohup node server.js > logs/server.log 2>&1 &
    SERVER_PID=$!
    
    # Wait a moment and check if server started
    sleep 3
    if kill -0 $SERVER_PID 2>/dev/null; then
        print_status "Server started successfully (PID: $SERVER_PID)"
        echo $SERVER_PID > server.pid
    else
        print_error "Server failed to start. Check logs/server.log for details"
        exit 1
    fi
fi

echo "========================================="
print_status "✅ Liquidata Backend is now running!"
print_status "🌍 Server: http://your-server-ip:$PORT"
print_status "📚 API Docs: http://your-server-ip:$PORT/api-docs"
print_status "❤️  Health: http://your-server-ip:$PORT/health"

if [ ! -f "/usr/bin/pm2" ]; then
    print_status "📋 Useful commands:"
    echo "  View logs: tail -f logs/server.log"
    echo "  Stop server: kill \$(cat server.pid)"
    echo "  Restart: ./start-vps.sh"
fi

print_warning "🔒 Security reminders:"
print_warning "1. Change JWT_SECRET in .env file"
print_warning "2. Change ADMIN_PASSWORD in .env file"
print_warning "3. Set up SSL certificate for production"
print_warning "4. Configure proper backup for MongoDB"
