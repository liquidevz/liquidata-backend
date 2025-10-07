#!/bin/bash

# Liquidata Backend Deployment Script
# This script helps deploy the backend to a VPS

set -e

echo "🚀 Starting Liquidata Backend Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
CONTAINER_NAME="liquidata-backend"
IMAGE_NAME="liquidata-backend"
PORT=5001

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    print_warning ".env.production not found. Creating from template..."
    cp env.production.example .env.production
    print_warning "Please edit .env.production with your production values before continuing!"
    print_warning "Especially change JWT_SECRET and ADMIN_PASSWORD!"
    exit 1
fi

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p public/uploads/logos
mkdir -p logs

# Stop existing container if running
print_status "Stopping existing container..."
docker-compose down || true

# Build and start the container
print_status "Building and starting the container..."
docker-compose up --build -d

# Wait for container to be healthy
print_status "Waiting for container to be healthy..."
timeout=60
counter=0
while [ $counter -lt $timeout ]; do
    if docker-compose ps | grep -q "healthy"; then
        print_status "Container is healthy!"
        break
    fi
    if [ $counter -eq $((timeout-1)) ]; then
        print_error "Container failed to become healthy within $timeout seconds"
        docker-compose logs
        exit 1
    fi
    sleep 1
    counter=$((counter+1))
done

# Show container status
print_status "Container status:"
docker-compose ps

# Show logs
print_status "Recent logs:"
docker-compose logs --tail=20

print_status "✅ Deployment completed successfully!"
print_status "Backend is running on port $PORT"
print_status "API Documentation: http://your-server-ip:$PORT/api-docs"
print_status "Health Check: http://your-server-ip:$PORT/health"

echo ""
print_warning "🔒 Security Reminders:"
print_warning "1. Change JWT_SECRET in .env.production"
print_warning "2. Change ADMIN_PASSWORD in .env.production"
print_warning "3. Configure firewall to allow only necessary ports"
print_warning "4. Set up SSL/TLS certificate for production"
print_warning "5. Configure proper backup for MongoDB"

echo ""
print_status "📝 Useful commands:"
echo "  View logs: docker-compose logs -f"
echo "  Restart: docker-compose restart"
echo "  Stop: docker-compose down"
echo "  Update: ./deploy.sh"
