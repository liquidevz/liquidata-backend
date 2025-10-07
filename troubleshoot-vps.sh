#!/bin/bash

# VPS Troubleshooting Script for Liquidata Backend
# This script diagnoses common issues when the project won't run on VPS

set -e

echo "🔍 Liquidata Backend VPS Troubleshooting..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[⚠]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[ℹ]${NC} $1"
}

print_header() {
    echo -e "\n${BLUE}=== $1 ===${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check system information
print_header "System Information"
echo "OS: $(cat /etc/os-release | grep PRETTY_NAME | cut -d'"' -f2)"
echo "Kernel: $(uname -r)"
echo "Architecture: $(uname -m)"
echo "Memory: $(free -h | awk '/^Mem:/ {print $2}')"
echo "Disk Space: $(df -h / | awk 'NR==2 {print $4}')"
echo "Current User: $(whoami)"
echo "Current Directory: $(pwd)"

# Check Node.js installation
print_header "Node.js Environment"
if command_exists node; then
    NODE_VERSION=$(node --version)
    print_status "Node.js installed: $NODE_VERSION"
    
    # Check if Node version is compatible
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
    if [ "$NODE_MAJOR" -ge 16 ]; then
        print_status "Node.js version is compatible (>= 16)"
    else
        print_error "Node.js version is too old. Need >= 16, got $NODE_VERSION"
        echo "Install newer Node.js:"
        echo "curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -"
        echo "sudo apt-get install -y nodejs"
    fi
else
    print_error "Node.js not installed"
    echo "Install Node.js:"
    echo "curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -"
    echo "sudo apt-get install -y nodejs"
fi

if command_exists npm; then
    NPM_VERSION=$(npm --version)
    print_status "npm installed: $NPM_VERSION"
else
    print_error "npm not installed"
fi

# Check Python (required for some npm packages)
print_header "Python Environment"
if command_exists python3; then
    PYTHON_VERSION=$(python3 --version)
    print_status "Python3 installed: $PYTHON_VERSION"
else
    print_error "Python3 not installed (required for some npm packages)"
    echo "Install Python3: sudo apt-get install -y python3 python3-pip"
fi

# Check build tools
print_header "Build Tools"
if command_exists gcc; then
    print_status "GCC compiler available"
else
    print_error "GCC compiler not found (required for native modules)"
    echo "Install build tools: sudo apt-get install -y build-essential"
fi

if command_exists make; then
    print_status "Make utility available"
else
    print_error "Make utility not found"
    echo "Install build tools: sudo apt-get install -y build-essential"
fi

# Check project files
print_header "Project Files"
if [ -f "package.json" ]; then
    print_status "package.json found"
else
    print_error "package.json not found - are you in the right directory?"
    exit 1
fi

if [ -f "server.js" ]; then
    print_status "server.js found"
else
    print_error "server.js not found"
    exit 1
fi

if [ -d "node_modules" ]; then
    print_status "node_modules directory exists"
else
    print_warning "node_modules directory not found - need to run npm install"
fi

# Check environment files
print_header "Environment Configuration"
if [ -f ".env" ]; then
    print_status ".env file found"
    echo "Environment variables:"
    grep -E "^[A-Z_]+" .env | head -10
elif [ -f ".env.production" ]; then
    print_status ".env.production file found"
    echo "Environment variables:"
    grep -E "^[A-Z_]+" .env.production | head -10
else
    print_error "No environment file found (.env or .env.production)"
    echo "Create .env file with required variables:"
    echo "NODE_ENV=production"
    echo "PORT=5001"
    echo "MONGODB_URI=your-mongodb-connection-string"
    echo "JWT_SECRET=your-jwt-secret"
fi

# Check port availability
print_header "Port Availability"
PORT=5001
if command_exists netstat; then
    if netstat -tuln | grep -q ":$PORT "; then
        print_error "Port $PORT is already in use"
        echo "Processes using port $PORT:"
        netstat -tulpn | grep ":$PORT "
    else
        print_status "Port $PORT is available"
    fi
elif command_exists ss; then
    if ss -tuln | grep -q ":$PORT "; then
        print_error "Port $PORT is already in use"
        echo "Processes using port $PORT:"
        ss -tulpn | grep ":$PORT "
    else
        print_status "Port $PORT is available"
    fi
else
    print_warning "Cannot check port availability (netstat/ss not found)"
fi

# Check firewall
print_header "Firewall Configuration"
if command_exists ufw; then
    UFW_STATUS=$(ufw status | head -1)
    echo "UFW Status: $UFW_STATUS"
    
    if ufw status | grep -q "$PORT"; then
        print_status "Port $PORT is allowed in firewall"
    else
        print_warning "Port $PORT not explicitly allowed in firewall"
        echo "Allow port: sudo ufw allow $PORT"
    fi
elif command_exists iptables; then
    print_info "Using iptables (check manually if port $PORT is allowed)"
else
    print_warning "No firewall tool detected"
fi

# Check MongoDB connectivity
print_header "MongoDB Connectivity"
if [ -f ".env" ]; then
    MONGODB_URI=$(grep "MONGODB_URI" .env | cut -d'=' -f2-)
elif [ -f ".env.production" ]; then
    MONGODB_URI=$(grep "MONGODB_URI" .env.production | cut -d'=' -f2-)
fi

if [ -n "$MONGODB_URI" ]; then
    print_info "Testing MongoDB connection..."
    if command_exists node; then
        node -e "
        const mongoose = require('mongoose');
        mongoose.connect('$MONGODB_URI', { serverSelectionTimeoutMS: 5000 })
          .then(() => {
            console.log('✓ MongoDB connection successful');
            process.exit(0);
          })
          .catch(err => {
            console.log('✗ MongoDB connection failed:', err.message);
            process.exit(1);
          });
        " 2>/dev/null && print_status "MongoDB connection successful" || print_error "MongoDB connection failed"
    fi
else
    print_warning "No MongoDB URI found in environment"
fi

# Check dependencies
print_header "Dependencies Check"
if [ -f "package.json" ] && [ -d "node_modules" ]; then
    print_info "Checking for missing dependencies..."
    if npm ls >/dev/null 2>&1; then
        print_status "All dependencies are installed"
    else
        print_error "Some dependencies are missing or have issues"
        echo "Run: npm install"
    fi
fi

# Try to start the server (dry run)
print_header "Server Startup Test"
if [ -f "server.js" ] && command_exists node; then
    print_info "Testing server startup (will timeout after 5 seconds)..."
    timeout 5s node server.js 2>&1 | head -10 &
    sleep 2
    if pgrep -f "node server.js" > /dev/null; then
        print_status "Server starts successfully"
        pkill -f "node server.js"
    else
        print_error "Server failed to start"
        echo "Check the error messages above"
    fi
fi

# Check system resources
print_header "System Resources"
echo "CPU Usage: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)%"
echo "Memory Usage: $(free | awk '/Mem:/ {printf "%.1f%%", $3/$2 * 100.0}')"
echo "Disk Usage: $(df / | awk 'NR==2 {print $5}')"

LOAD_AVG=$(uptime | awk -F'load average:' '{print $2}')
echo "Load Average:$LOAD_AVG"

# Check for common issues
print_header "Common Issues Check"

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_warning "Running as root - consider using a non-root user for security"
fi

# Check available memory
AVAILABLE_MB=$(free -m | awk '/^Mem:/ {print $7}')
if [ "$AVAILABLE_MB" -lt 512 ]; then
    print_warning "Low available memory ($AVAILABLE_MB MB) - may cause issues"
fi

# Check disk space
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 90 ]; then
    print_warning "Disk usage is high ($DISK_USAGE%) - may cause issues"
fi

# Recommendations
print_header "Recommendations"
echo "1. Ensure Node.js >= 16 is installed"
echo "2. Install build tools: sudo apt-get install -y build-essential python3"
echo "3. Create proper .env file with all required variables"
echo "4. Run 'npm install' to install dependencies"
echo "5. Check MongoDB connection string"
echo "6. Ensure port 5001 is open in firewall"
echo "7. Check server logs for specific error messages"
echo "8. Consider using PM2 for process management"

print_header "Quick Fix Commands"
echo "# Install Node.js 18:"
echo "curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -"
echo "sudo apt-get install -y nodejs"
echo ""
echo "# Install build tools:"
echo "sudo apt-get update"
echo "sudo apt-get install -y build-essential python3 python3-pip"
echo ""
echo "# Install dependencies:"
echo "npm install"
echo ""
echo "# Allow port in firewall:"
echo "sudo ufw allow 5001"
echo ""
echo "# Start server:"
echo "NODE_ENV=production PORT=5001 node server.js"

echo -e "\n${GREEN}Troubleshooting complete!${NC}"
echo "If issues persist, check the specific error messages when starting the server."
