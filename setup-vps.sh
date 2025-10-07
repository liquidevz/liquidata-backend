#!/bin/bash

# VPS Setup Script for Liquidata Backend
# Run this script on your VPS to install Docker and prepare the environment

set -e

echo "🖥️  Setting up VPS for Liquidata Backend..."

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

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_warning "Running as root. Consider creating a non-root user for better security."
fi

# Update system
print_header "Updating system packages..."
apt update && apt upgrade -y

# Install required packages
print_header "Installing required packages..."
apt install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    software-properties-common \
    ufw \
    git \
    htop \
    nano

# Install Docker
print_header "Installing Docker..."
if ! command -v docker &> /dev/null; then
    # Add Docker's official GPG key
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    
    # Add Docker repository
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Install Docker
    apt update
    apt install -y docker-ce docker-ce-cli containerd.io
    
    # Start and enable Docker
    systemctl start docker
    systemctl enable docker
    
    print_status "Docker installed successfully"
else
    print_status "Docker is already installed"
fi

# Install Docker Compose
print_header "Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    print_status "Docker Compose installed successfully"
else
    print_status "Docker Compose is already installed"
fi

# Add current user to docker group (if not root)
if [ "$EUID" -ne 0 ]; then
    print_header "Adding user to docker group..."
    usermod -aG docker $USER
    print_warning "You need to log out and log back in for docker group changes to take effect"
fi

# Configure firewall
print_header "Configuring firewall..."
ufw --force enable
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 5001/tcp  # Backend API port
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS

print_status "Firewall configured"

# Create application directory
print_header "Creating application directory..."
APP_DIR="/opt/liquidata-backend"
mkdir -p $APP_DIR
cd $APP_DIR

print_status "Application directory created at $APP_DIR"

# Create systemd service for auto-restart
print_header "Creating systemd service..."
cat > /etc/systemd/system/liquidata-backend.service << EOF
[Unit]
Description=Liquidata Backend
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$APP_DIR
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable liquidata-backend.service

print_status "Systemd service created and enabled"

# Create log rotation
print_header "Setting up log rotation..."
cat > /etc/logrotate.d/liquidata-backend << EOF
$APP_DIR/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    copytruncate
}
EOF

print_status "Log rotation configured"

# Show system information
print_header "System Information:"
echo "OS: $(lsb_release -d | cut -f2)"
echo "Docker: $(docker --version)"
echo "Docker Compose: $(docker-compose --version)"
echo "Available Memory: $(free -h | awk '/^Mem:/ {print $2}')"
echo "Available Disk: $(df -h / | awk 'NR==2 {print $4}')"

print_status "✅ VPS setup completed successfully!"
echo ""
print_warning "📋 Next Steps:"
print_warning "1. Upload your application code to $APP_DIR"
print_warning "2. Configure .env.production with your settings"
print_warning "3. Run ./deploy.sh to start the application"
print_warning "4. Set up SSL certificate (recommended: Let's Encrypt)"
print_warning "5. Configure domain DNS to point to this server"

echo ""
print_status "📝 Useful commands:"
echo "  Check service status: systemctl status liquidata-backend"
echo "  View logs: journalctl -u liquidata-backend -f"
echo "  Restart service: systemctl restart liquidata-backend"
echo "  Check Docker containers: docker ps"
echo "  View application logs: cd $APP_DIR && docker-compose logs -f"
