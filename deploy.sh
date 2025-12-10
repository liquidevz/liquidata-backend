#!/bin/bash

# Backend Deployment Script
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default environment
ENVIRONMENT=${1:-production}
USE_PM2=${2:-false}

echo -e "${GREEN}🚀 Starting backend deployment for ${ENVIRONMENT} environment${NC}"

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(local|staging|production)$ ]]; then
    echo -e "${RED}❌ Invalid environment. Use: local, staging, or production${NC}"
    exit 1
fi

# Load environment variables
if [ -f ".env.${ENVIRONMENT}" ]; then
    echo -e "${YELLOW}📋 Loading environment variables from .env.${ENVIRONMENT}${NC}"
    export $(cat .env.${ENVIRONMENT} | xargs)
else
    echo -e "${RED}❌ Environment file .env.${ENVIRONMENT} not found${NC}"
    exit 1
fi

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm ci --only=production

# Create necessary directories
echo -e "${YELLOW}📁 Creating directories...${NC}"
mkdir -p logs
mkdir -p public/uploads/blogs
mkdir -p public/uploads/case-studies
mkdir -p public/uploads/logos

# Start the application
if [ "$USE_PM2" = "true" ]; then
    echo -e "${YELLOW}🚀 Starting with PM2...${NC}"
    if [ "$ENVIRONMENT" = "local" ]; then
        npm run dev
    else
        npm run pm2:start:${ENVIRONMENT}
    fi
else
    echo -e "${YELLOW}🚀 Starting application directly...${NC}"
    npm run start:${ENVIRONMENT}
fi

echo -e "${GREEN}✅ Backend deployment completed successfully!${NC}"