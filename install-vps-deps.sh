#!/bin/bash

# Install VPS Dependencies for Liquidata Backend
# This script installs all required dependencies on a fresh VPS

set -e

echo "📦 Installing VPS Dependencies for Liquidata Backend..."

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
    echo -e "\n${BLUE}=== $1 ===${NC}"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "Please run this script as root or with sudo"
    exit 1
fi

# Update system
print_header "Updating System"
apt update && apt upgrade -y

# Install basic tools
print_header "Installing Basic Tools"
apt install -y \
    curl \
    wget \
    git \
    unzip \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release \
    htop \
    nano \
    vim

# Install Node.js 18
print_header "Installing Node.js 18"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
    print_status "Node.js installed: $(node --version)"
else
    NODE_VERSION=$(node --version | sed 's/v//' | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 16 ]; then
        print_warning "Updating Node.js to version 18..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
        apt-get install -y nodejs
    fi
    print_status "Node.js already installed: $(node --version)"
fi

# Install build tools
print_header "Installing Build Tools"
apt install -y \
    build-essential \
    python3 \
    python3-pip \
    python3-dev \
    make \
    g++ \
    libc6-dev

print_status "Build tools installed"

# Install PM2 globally
print_header "Installing PM2 Process Manager"
npm install -g pm2
print_status "PM2 installed: $(pm2 --version)"

# Configure PM2 startup
pm2 startup systemd -u $(logname) --hp /home/$(logname)

# Install and configure firewall
print_header "Configuring Firewall"
if ! command -v ufw &> /dev/null; then
    apt install -y ufw
fi

ufw --force enable
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 5001/tcp  # Backend API port
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS

print_status "Firewall configured"

# Create application user (if not exists)
print_header "Setting up Application User"
APP_USER="liquidata"
if ! id "$APP_USER" &>/dev/null; then
    useradd -m -s /bin/bash $APP_USER
    usermod -aG sudo $APP_USER
    print_status "Created user: $APP_USER"
else
    print_status "User $APP_USER already exists"
fi

# Create application directory
APP_DIR="/opt/liquidata-backend"
mkdir -p $APP_DIR
chown -R $APP_USER:$APP_USER $APP_DIR
print_status "Application directory created: $APP_DIR"

# Install Nginx (optional, for reverse proxy)
print_header "Installing Nginx (Optional)"
read -p "Do you want to install Nginx for reverse proxy? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    apt install -y nginx
    
    # Create basic Nginx config
    cat > /etc/nginx/sites-available/liquidata-backend << EOF
server {
    listen 80;
    server_name your-domain.com;  # Change this to your domain

    location / {
        proxy_pass https://liquidata.rangaone.finance;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

    # Enable the site
    ln -sf /etc/nginx/sites-available/liquidata-backend /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    
    # Test and reload Nginx
    nginx -t && systemctl reload nginx
    systemctl enable nginx
    
    print_status "Nginx installed and configured"
    print_warning "Remember to update server_name in /etc/nginx/sites-available/liquidata-backend"
fi

# Install Certbot for SSL (if Nginx is installed)
if command -v nginx &> /dev/null; then
    print_header "Installing Certbot for SSL"
    read -p "Do you want to install Certbot for SSL certificates? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        apt install -y certbot python3-certbot-nginx
        print_status "Certbot installed"
        print_warning "Run 'certbot --nginx -d your-domain.com' to get SSL certificate"
    fi
fi

# Set up log rotation
print_header "Setting up Log Rotation"
cat > /etc/logrotate.d/liquidata-backend << EOF
$APP_DIR/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    copytruncate
    su $APP_USER $APP_USER
}
EOF

print_status "Log rotation configured"

# Create systemd service
print_header "Creating Systemd Service"
cat > /etc/systemd/system/liquidata-backend.service << EOF
[Unit]
Description=Liquidata Backend API
After=network.target

[Service]
Type=simple
User=$APP_USER
WorkingDirectory=$APP_DIR
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=5001

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable liquidata-backend
print_status "Systemd service created and enabled"

# Install monitoring tools
print_header "Installing Monitoring Tools"
apt install -y htop iotop nethogs

# Show system information
print_header "System Information"
echo "OS: $(lsb_release -d | cut -f2)"
echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"
echo "PM2: $(pm2 --version)"
echo "Memory: $(free -h | awk '/^Mem:/ {print $2}')"
echo "Disk: $(df -h / | awk 'NR==2 {print $4}')"

print_status "✅ VPS Dependencies Installation Complete!"
echo ""
print_warning "📋 Next Steps:"
print_warning "1. Upload your application code to $APP_DIR"
print_warning "2. Switch to $APP_USER user: su - $APP_USER"
print_warning "3. Configure .env file with your settings"
print_warning "4. Run the application startup script"
print_warning "5. If using Nginx, configure your domain name"
print_warning "6. Set up SSL certificate with Certbot"

echo ""
print_status "📝 Useful commands:"
echo "  Switch to app user: su - $APP_USER"
echo "  Check service status: systemctl status liquidata-backend"
echo "  View service logs: journalctl -u liquidata-backend -f"
echo "  Check PM2 processes: pm2 status"
echo "  Monitor system: htop"
echo "  Check firewall: ufw status"
