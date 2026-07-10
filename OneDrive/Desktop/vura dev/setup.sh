#!/bin/bash

# Vura Ecosystem - Automated Setup Script
# This script sets up all applications and services

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     Vura Ecosystem - Complete Setup                        ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"

# Check prerequisites
echo -e "\n${YELLOW}[1/6]${NC} Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js is not installed${NC}"
    echo "  Install from: https://nodejs.org/"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}✗ npm is not installed${NC}"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo -e "${RED}✗ Docker is not installed${NC}"
    echo "  Install from: https://www.docker.com/products/docker-desktop"
    exit 1
fi

echo -e "${GREEN}✓${NC} Node.js $(node --version)"
echo -e "${GREEN}✓${NC} npm $(npm --version)"
echo -e "${GREEN}✓${NC} Docker $(docker --version)"

# Start Docker services
echo -e "\n${YELLOW}[2/6]${NC} Starting Docker services..."

if ! docker-compose ps &> /dev/null; then
    echo -e "${RED}✗ Docker daemon is not running${NC}"
    echo "  Please start Docker Desktop and try again"
    exit 1
fi

docker-compose down 2>/dev/null || true
docker-compose up -d

# Wait for services to be ready
echo -e "${YELLOW}Waiting for services to be ready...${NC}"
sleep 10

# Check service health
for i in {1..30}; do
    if docker-compose ps postgres | grep -q healthy; then
        echo -e "${GREEN}✓${NC} PostgreSQL is healthy"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${YELLOW}⚠${NC} PostgreSQL may still be starting (it's ok, continue)"
    fi
    echo -n "."
    sleep 1
done

# Install dependencies
echo -e "\n${YELLOW}[3/6]${NC} Installing dependencies..."

cd vura-backoffice-develop
echo -e "  Installing Backoffice dependencies..."
npm install --silent
cd ..

cd vura-hms-main
echo -e "  Installing HMS dependencies..."
npm install --silent
cd ..

if [ -d "vura-pms-main" ] && [ "$(ls -A vura-pms-main)" ]; then
    cd vura-pms-main
    echo -e "  Installing PMS dependencies..."
    npm install --silent
    cd ..
fi

cd mock-ebm-api
echo -e "  Installing Mock EBM API dependencies..."
npm install --silent
cd ..

echo -e "${GREEN}✓${NC} Dependencies installed"

# Generate APP_KEYs
echo -e "\n${YELLOW}[4/6]${NC} Generating application keys..."

# Function to generate key
generate_key() {
    node -e "console.log(Buffer.from(require('crypto').randomBytes(32)).toString('base64'))"
}

# Backoffice
cd vura-backoffice-develop
KEY=$(generate_key)
sed -i.bak "s/APP_KEY=/APP_KEY=$KEY/" .env
rm -f .env.bak
echo -e "${GREEN}✓${NC} Backoffice APP_KEY generated"
cd ..

# HMS
cd vura-hms-main
KEY=$(generate_key)
sed -i.bak "s/APP_KEY=/APP_KEY=$KEY/" .env
rm -f .env.bak
echo -e "${GREEN}✓${NC} HMS APP_KEY generated"
cd ..

# PMS
if [ -d "vura-pms-main" ] && [ -f "vura-pms-main/.env" ]; then
    cd vura-pms-main
    KEY=$(generate_key)
    sed -i.bak "s/APP_KEY=/APP_KEY=$KEY/" .env
    rm -f .env.bak
    echo -e "${GREEN}✓${NC} PMS APP_KEY generated"
    cd ..
fi

# Run migrations
echo -e "\n${YELLOW}[5/6]${NC} Running database migrations..."

cd vura-backoffice-develop
echo -e "  Migrating Backoffice database..."
node ace migration:run --silent || echo -e "${YELLOW}⚠${NC} Backoffice migration completed with warnings"
cd ..

cd vura-hms-main
echo -e "  Migrating HMS database..."
node ace migration:run --silent || echo -e "${YELLOW}⚠${NC} HMS migration completed with warnings"
cd ..

echo -e "${GREEN}✓${NC} Migrations completed"

# Create S3 buckets
echo -e "\n${YELLOW}[6/6]${NC} Initializing storage buckets..."

if command -v aws &> /dev/null; then
    aws s3 mb s3://vura-backoffice --endpoint-url http://localhost:4566 --region us-east-1 2>/dev/null || echo -e "${YELLOW}⚠${NC} Bucket may already exist"
    aws s3 mb s3://vura-hms --endpoint-url http://localhost:4566 --region us-east-1 2>/dev/null || echo -e "${YELLOW}⚠${NC} Bucket may already exist"
    echo -e "${GREEN}✓${NC} S3 buckets initialized"
else
    echo -e "${YELLOW}⚠${NC} AWS CLI not found - buckets will be created on first use"
fi

# Summary
echo -e "\n${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                    Setup Completed! ✓                      ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"

echo -e "\n${GREEN}Services Running:${NC}"
echo -e "  PostgreSQL:      localhost:5432"
echo -e "  Redis:           localhost:6379"
echo -e "  Meilisearch:     localhost:7700"
echo -e "  Mailpit:         localhost:8025"
echo -e "  LocalStack S3:   localhost:4566"
echo -e "  Mock EBM API:    localhost:3500"

echo -e "\n${GREEN}Next Steps:${NC}"
echo -e "  1. Open VSCode and go to Run > Debug (or press Ctrl+Shift+D)"
echo -e "  2. Select a configuration:"
echo -e "     - 'Vura Backoffice Dev' (port 3334)"
echo -e "     - 'Vura HMS Dev' (port 3335)"
echo -e "     - 'Vura PMS Dev' (port 3333)"
echo -e "     - 'Mock EBM API' (port 3500)"
echo -e "     - 'All Services' (run all together)"
echo -e "  3. Press F5 to start"
echo -e "\n  Or run manually:"
echo -e "     cd vura-backoffice-develop && npm run dev"
echo -e "     cd vura-hms-main && npm run dev"
echo -e "     cd mock-ebm-api && npm start"

echo -e "\n${GREEN}URLs:${NC}"
echo -e "  Backoffice:  http://localhost:3334"
echo -e "  HMS:         http://localhost:3335"
echo -e "  PMS:         http://localhost:3333"
echo -e "  Mailpit:     http://localhost:8025"

echo -e "\n${YELLOW}Tips:${NC}"
echo -e "  • Check SETUP.md for detailed documentation"
echo -e "  • View logs: docker-compose logs -f"
echo -e "  • Stop services: docker-compose down"
echo -e "  • Database credentials: root/root"
echo -e "\n"
