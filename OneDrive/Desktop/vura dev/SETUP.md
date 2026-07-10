# Vura Ecosystem - Complete Setup Guide

This guide walks you through setting up and running the entire Vura ecosystem including Backoffice, HMS, PMS, and supporting services.

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Project Structure](#project-structure)
3. [Infrastructure Setup](#infrastructure-setup)
4. [Application Setup](#application-setup)
5. [Running Applications](#running-applications)
6. [Database Migrations](#database-migrations)
7. [Testing Connections](#testing-connections)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### System Requirements
- **OS**: Windows 10/11, macOS, or Linux
- **Node.js**: ^22.0.0 (required for all apps)
- **npm**: ^10.0.0
- **Docker Desktop**: Latest version (for database, Redis, Meilisearch, Mailpit, LocalStack)

### Installation

#### 1. Install Node.js
- Download from: https://nodejs.org/
- Verify installation:
  ```bash
  node --version  # Should be v22.x.x
  npm --version   # Should be v10.x.x
  ```

#### 2. Install Docker Desktop
- **Windows/Mac**: Download from https://www.docker.com/products/docker-desktop
- **Linux**: 
  ```bash
  curl -fsSL https://get.docker.com -o get-docker.sh
  sudo sh get-docker.sh
  ```
- Start Docker Desktop (required to run containers)

#### 3. Verify Docker Installation
```bash
docker --version
docker-compose --version
```

---

## Project Structure

```
vura dev/
├── docker-compose.yml          # Main infrastructure orchestration
├── .vscode/
│   ├── launch.json            # Debug configurations for VSCode
│   └── tasks.json             # Custom build/run tasks
├── SETUP.md                   # This file
├── vura-backoffice-develop/   # Central admin platform (AdonisJS)
├── vura-hms-main/             # E-prescription system (AdonisJS)
├── vura-pms-main/             # Pharmacy management system
└── mock-ebm-api/              # Mock EBM API service (Node.js/Express)
```

### Applications Overview

| App | Port | Purpose | Tech Stack |
|-----|------|---------|-----------|
| Vura Backoffice | 3334 | Central admin & configuration | AdonisJS + Vue + Inertia |
| Vura HMS | 3335 | E-prescription management | AdonisJS + Vue + Inertia |
| Vura PMS | 3333 | Pharmacy management system | AdonisJS + Vue + Inertia |
| Mock EBM API | 3500 | Insurance API mock | Node.js + Express |

### Infrastructure Services

| Service | Port | Purpose |
|---------|------|---------|
| PostgreSQL | 5432 | Main database |
| Redis | 6379 | Cache & session store |
| Meilisearch | 7700 | Full-text search engine |
| Mailpit | 8025 | Email testing UI |
| LocalStack | 4566 | S3 bucket emulation |

---

## Infrastructure Setup

### Step 1: Start Docker Containers

```bash
cd "c:\Users\user\OneDrive\Desktop\vura dev"

# Start all services in the background
docker-compose up -d

# Verify all services are running
docker-compose ps

# View logs (optional)
docker-compose logs -f
```

Expected output when all services are healthy:
```
postgres           running  (healthy)
redis              running  (healthy)
meilisearch        running  (healthy)
mailpit            running  (healthy)
localstack         running  (healthy)
```

### Step 2: Initialize S3 Bucket (LocalStack)

The S3 bucket is created automatically, but you can verify it:

```bash
# List buckets in LocalStack
aws s3 ls --endpoint-url http://localhost:4566
```

If buckets don't exist, they'll be created on first use by the applications.

### Step 3: Verify Services Are Running

```bash
# Test PostgreSQL
psql -h localhost -U root -d postgres -c "SELECT version();"

# Test Redis
redis-cli ping

# Test Meilisearch
curl http://localhost:7700/health

# Test Mailpit SMTP
# Mailpit will log when emails arrive

# Test LocalStack
aws s3 ls --endpoint-url http://localhost:4566
```

---

## Application Setup

### Step 1: Install Dependencies for All Applications

```bash
cd "c:\Users\user\OneDrive\Desktop\vura dev"

# Vura Backoffice
cd vura-backoffice-develop
npm install

# Vura HMS
cd ../vura-hms-main
npm install

# Vura PMS (if exists)
cd ../vura-pms-main
npm install 2>/dev/null || echo "PMS not yet initialized"

# Mock EBM API
cd ../mock-ebm-api
npm install
```

### Step 2: Generate Application Keys

Each AdonisJS app needs an encryption key. Generate them:

```bash
# Backoffice
cd vura-backoffice-develop
node ace generate:key
# Copy the generated key and paste into .env APP_KEY

# HMS
cd ../vura-hms-main
node ace generate:key
# Copy the generated key and paste into .env APP_KEY

# PMS (if needed)
cd ../vura-pms-main
node ace generate:key 2>/dev/null || echo "PMS setup later"
```

Or use a script to generate keys automatically:

```bash
# Generate random keys
npm install -g uuid
APP_KEY=$(node -e "console.log(require('crypto').randomBytes(16).toString('base64'))")
echo "Generated key: $APP_KEY"
```

### Step 3: Update Environment Variables

Each application has a `.env` file prepared. Review and update if needed:

- **vura-backoffice-develop/.env** - Backoffice settings
- **vura-hms-main/.env** - HMS settings
- **vura-pms-main/.env** - PMS settings (create if missing)

Key variables to verify:
- Database connection strings (should use localhost)
- Port numbers (3333, 3334, 3335)
- Meilisearch endpoint (localhost:7700)
- Mailpit SMTP (127.0.0.1:1025)
- AWS credentials (test/test for LocalStack)

---

## Running Applications

### Option 1: Using VSCode Debug Configuration (Recommended)

1. Open the workspace in VSCode
2. Go to **Run and Debug** (Ctrl+Shift+D)
3. Select a configuration from the dropdown:
   - **"Vura Backoffice Dev"** - Runs Backoffice on port 3334
   - **"Vura HMS Dev"** - Runs HMS on port 3335
   - **"Vura PMS Dev"** - Runs PMS on port 3333
   - **"Mock EBM API"** - Runs Mock EBM on port 3500
   - **"All Services (Backoffice + HMS + Mock EBM)"** - Runs all at once (Compound)

4. Click **Start Debugging** or press **F5**

### Option 2: Manual Command Line

```bash
# Terminal 1: Vura Backoffice
cd vura-backoffice-develop
npm run dev

# Terminal 2: Vura HMS
cd vura-hms-main
npm run dev

# Terminal 3: Mock EBM API
cd mock-ebm-api
npm start

# Terminal 4: Vura PMS (if available)
cd vura-pms-main
npm run dev
```

### Option 3: Production Mode

```bash
# Build all applications
cd vura-backoffice-develop && npm run build
cd ../vura-hms-main && npm run build

# Start in production
cd vura-backoffice-develop && npm start
cd ../vura-hms-main && npm start
```

---

## Database Migrations

### Create Databases (One-Time)

Each application uses its own database. The databases are created automatically when migrations run, but ensure `.env` files point to correct database names:

- Backoffice: `vura_backoffice`
- HMS: `vura_hms`
- PMS: `vura_pms`

### Run Migrations

```bash
# Backoffice Migrations
cd vura-backoffice-develop
node ace migration:run

# HMS Migrations
cd ../vura-hms-main
node ace migration:run

# Fresh migrations (reset database + seed test data)
cd vura-backoffice-develop
node ace migration:fresh --seed

cd ../vura-hms-main
node ace migration:fresh --seed
```

### View Migrations Status

```bash
# Check which migrations have run
cd vura-backoffice-develop
node ace migration:status
```

---

## Testing Connections

### 1. Test All Services Are Running

```bash
# Check Docker containers
docker-compose ps

# All should show "Up" status
```

### 2. Test Application Health

```bash
# Backoffice (should redirect to login)
curl http://localhost:3334

# HMS (should redirect to login)
curl http://localhost:3335

# Mock EBM API
curl http://localhost:3500/health
```

### 3. Test Database Connections

```bash
# Connect to PostgreSQL
psql -h localhost -U root -d vura_backoffice -c "\dt"

# Should show tables created by migrations
```

### 4. Test External Services

#### Email Testing (Mailpit)
- Open: http://localhost:8025
- Send test email through application
- Should appear in Mailpit UI

#### Search Engine (Meilisearch)
- Open: http://localhost:7700
- Admin panel for managing search indices

#### S3 Storage (LocalStack)
```bash
# List S3 buckets
aws s3 ls --endpoint-url http://localhost:4566

# Upload test file
echo "test" > test.txt
aws s3 cp test.txt s3://vura-backoffice/ --endpoint-url http://localhost:4566
```

#### Redis Cache
```bash
# Connect to Redis
redis-cli

# Test connection
ping  # Should return PONG

# View cache
keys *
```

### 5. Test Inter-App Communication

Applications communicate via API tokens. To test:

1. Generate API tokens in Backoffice
2. Update HMS `.env` with token
3. Test API call from HMS to Backoffice:

```bash
curl -X GET http://localhost:3334/api/endpoint \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json"
```

---

## Troubleshooting

### Issue: Docker Containers Won't Start

**Solution:**
```bash
# Check if Docker is running
docker ps

# If not, start Docker Desktop and wait 30 seconds

# Try again
docker-compose up -d

# View logs
docker-compose logs postgres
```

### Issue: Database Connection Error

**Error:** `could not connect to server: Connection refused`

**Solution:**
1. Ensure PostgreSQL container is running: `docker-compose ps postgres`
2. Wait for PostgreSQL to be healthy: `docker-compose ps` (shows "healthy")
3. Check `.env` file has correct database credentials
4. Verify connection:
   ```bash
   psql -h localhost -U root -d postgres -c "SELECT 1"
   ```

### Issue: Port Already in Use

**Error:** `Error starting userland proxy: Bind for 0.0.0.0:5432 failed`

**Solution:**
```bash
# Find process using port
lsof -i :5432  # macOS/Linux
netstat -ano | findstr :5432  # Windows

# Kill process or change port in docker-compose.yml
docker-compose down
# Edit docker-compose.yml to use different port
docker-compose up -d
```

### Issue: npm install Fails

**Error:** `ERR! code ENOENT`

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Issue: Node Version Mismatch

**Error:** `The engine "node" is incompatible`

**Solution:**
```bash
# Check current Node version
node --version  # Should be ^22.0.0

# Install correct version using nvm
# macOS/Linux:
nvm install 22
nvm use 22

# Windows: Download from nodejs.org and install
```

### Issue: Migrations Won't Run

**Error:** `Error connecting to database`

**Solution:**
1. Ensure Docker postgres is running
2. Wait for it to be healthy
3. Check `.env` database credentials
4. Try connecting manually first:
   ```bash
   psql -h localhost -U root -d postgres
   ```

### Issue: Meilisearch Not Responding

**Error:** `Failed to reach Meilisearch`

**Solution:**
```bash
# Restart Meilisearch
docker-compose restart meilisearch

# Wait 10 seconds for startup
sleep 10

# Verify health
curl http://localhost:7700/health
```

### Issue: LocalStack S3 Not Working

**Error:** `NoCredentialsError` or `Endpoint does not support`

**Solution:**
1. Ensure LocalStack is running: `docker-compose ps localstack`
2. Use correct endpoint in `.env`: `AWS_S3_ENDPOINT=http://localhost:4566`
3. Use test credentials: `AWS_ACCESS_KEY_ID=test` / `AWS_SECRET_ACCESS_KEY=test`

### Issue: App Won't Start in VSCode Debug

**Error:** `Unable to locate executable`

**Solution:**
1. Ensure dependencies are installed: `npm install`
2. Check `cwd` in launch.json points to correct directory
3. Run from integrated terminal instead:
   ```bash
   npm run dev
   ```

---

## Stopping Services

```bash
# Stop all Docker services
docker-compose down

# Stop and remove volumes (careful - deletes data)
docker-compose down -v

# Stop individual service
docker-compose stop postgres

# Stop individual application
# Use Ctrl+C in the terminal where it's running
```

---

## Quick Start Checklist

- [ ] Docker Desktop installed and running
- [ ] Node.js v22+ installed
- [ ] Ran `docker-compose up -d`
- [ ] Ran `npm install` in each app directory
- [ ] Generated APP_KEY for each app
- [ ] Updated `.env` files
- [ ] Ran migrations: `node ace migration:run`
- [ ] Started apps using VSCode debug or `npm run dev`
- [ ] Verified connections in browser

---

## URLs for Testing

After everything is running:

| Service | URL | Credentials |
|---------|-----|-------------|
| Vura Backoffice | http://localhost:3334 | Set during migration seed |
| Vura HMS | http://localhost:3335 | Set during migration seed |
| Vura PMS | http://localhost:3333 | Set during migration seed |
| Mailpit | http://localhost:8025 | (no auth needed) |
| Meilisearch | http://localhost:7700 | (no auth needed) |
| Mock EBM API | http://localhost:3500/health | (no auth needed) |

---

## Next Steps

1. **Review Applications**: Open each app in browser and explore
2. **Configure Integrations**: Set up inter-app communication
3. **Test Workflows**: Create test data and verify features work
4. **API Documentation**: Check each app's API docs
5. **Customize Settings**: Update configuration as needed

---

## Support & Resources

- **AdonisJS Docs**: https://docs.adonisjs.com
- **Vue.js Docs**: https://vuejs.org
- **PrimeVue Components**: https://primevue.org
- **Docker Docs**: https://docs.docker.com

---

**Last Updated**: 2026-07-10
