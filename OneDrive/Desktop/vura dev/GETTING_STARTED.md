# Vura Ecosystem - Getting Started Guide

Welcome to the Vura Ecosystem! This guide will help you get everything up and running.

## 📋 Quick Checklist

- [x] Docker Desktop installed and running
- [x] Node.js v22+ installed
- [x] All configuration files created
- [x] Docker services ready
- [ ] Run automated setup (first time only)
- [ ] Start applications
- [ ] Test connections
- [ ] Begin development

---

## 🚀 First Time Setup (5 minutes)

### Step 1: Verify Prerequisites

Open Terminal/PowerShell and run:

```bash
# Check Node.js
node --version  # Should be v22.x.x

# Check Docker
docker --version
docker-compose --version
```

**Not installed?**
- Node.js: https://nodejs.org/ (Download LTS)
- Docker: https://www.docker.com/products/docker-desktop

### Step 2: Run Automated Setup

```bash
# Windows (PowerShell)
.\setup.bat

# macOS/Linux
bash setup.sh
```

This will:
✓ Start all Docker services  
✓ Install dependencies  
✓ Generate encryption keys  
✓ Run database migrations  

**Takes ~3-5 minutes. Grab coffee! ☕**

### Step 3: Verify Everything Works

```bash
# Verify setup (new terminal window)
bash verify-setup.sh
```

Expected output:
```
Docker Services: ✓
Database Connections: ✓
Application APIs: ✓
External Services: ✓

✓ All systems operational!
```

---

## 🎯 Running Applications

### Option A: VSCode Debug (Recommended)

**Easiest & best for development**

1. Open workspace in VSCode
2. Press `Ctrl+Shift+D` (Run & Debug)
3. Select configuration from dropdown:
   - `Vura Backoffice Dev` - http://localhost:3334
   - `Vura HMS Dev` - http://localhost:3335
   - `Vura PMS Dev` - http://localhost:3333
   - `Mock EBM API` - http://localhost:3500
   - `All Services` - Run all together

4. Press `F5` to start

**Features:**
- Hot reload (changes auto-refresh)
- Built-in debugging
- See logs in terminal
- Easy to stop/restart

### Option B: Command Line

**For each application, open a new terminal:**

```bash
# Terminal 1: Vura Backoffice
cd vura-backoffice-develop
npm run dev

# Terminal 2: Vura HMS
cd vura-hms-main
npm run dev

# Terminal 3: Vura PMS
cd vura-pms-main
npm run dev

# Terminal 4: Mock EBM API
cd mock-ebm-api
npm start
```

---

## 🌐 Access Applications

Once running, open in browser:

| Application | URL | Port | Purpose |
|-------------|-----|------|---------|
| Vura Backoffice | http://localhost:3334 | 3334 | Admin & Config |
| Vura HMS | http://localhost:3335 | 3335 | E-Prescription |
| Vura PMS | http://localhost:3333 | 3333 | Pharmacy Mgmt |
| Mailpit | http://localhost:8025 | 8025 | Email Testing |
| Meilisearch | http://localhost:7700 | 7700 | Search Admin |

### Default Credentials

Database:
- User: `postgres`
- Password: (system default - no password)
- Host: `localhost:5432`

Applications:
- Credentials created during migration seed
- Check terminal output for initial admin password
- Or look in `database/seeders` files

---

## 📦 Project Files & Structure

```
vura dev/
├── README.md                      # Quick overview
├── SETUP.md                       # Detailed setup guide  
├── GETTING_STARTED.md             # This file
├── ARCHITECTURE.md                # System design & data flow
├── docker-compose.yml             # Infrastructure services
├── setup.sh / setup.bat           # Automated setup script
├── verify-setup.sh                # Verification script
│
├── .vscode/
│   ├── launch.json                # Debug configurations
│   ├── tasks.json                 # Build tasks
│   ├── settings.json              # Editor settings
│   └── extensions.json            # Recommended extensions
│
├── vura-backoffice-develop/       # Central Admin App
│   ├── .env                       # Configuration
│   ├── package.json
│   ├── app/                       # Application code
│   ├── database/migrations/       # Database schema
│   ├── resources/views/           # Vue components
│   └── start/routes/              # API routes
│
├── vura-hms-main/                 # E-Prescription App
│   ├── .env
│   ├── package.json
│   ├── app/
│   ├── database/migrations/
│   ├── resources/views/
│   └── start/routes/
│
├── vura-pms-main/                 # Pharmacy App
│   └── (similar structure)
│
└── mock-ebm-api/                  # Mock Insurance API
    ├── package.json
    ├── server.js
    └── (simple Express server)
```

---

## 🔧 Configuration

### Environment Variables

Each app has `.env` file (already created). Review/update if needed:

**Important Settings:**
```env
# Database (same for all, change DB_DATABASE value)
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=              # (empty)
DB_DATABASE=backoffice    # or hms, or medbook

# Mail
SMTP_HOST=127.0.0.1
SMTP_PORT=1025

# Search
MEILISEARCH_HOST=localhost:7700

# File Storage
DRIVE_DISK=s3
AWS_S3_ENDPOINT=http://localhost:9000  # MinIO/LocalStack
S3_BUCKET=vura-backoffice              # Change per app
```

### Encryption Keys

Generated automatically by `setup.sh/setup.bat`.

If needed to regenerate:
```bash
cd vura-backoffice-develop
node ace generate:key
# Copy output and paste into .env APP_KEY=
```

---

## 🗄️ Database Management

### View Databases

```bash
# Connect to PostgreSQL
docker exec -it vura-postgres psql -U postgres

# List databases
\l

# Connect to backoffice
\c backoffice

# List tables
\dt

# Exit
\q
```

### Run Migrations

```bash
# Backoffice
cd vura-backoffice-develop
node ace migration:run

# HMS  
cd ../vura-hms-main
node ace migration:run
```

### Reset Database (Fresh)

⚠️ **Warning**: Deletes all data!

```bash
# Backoffice (migration:fresh = migration:run + migration:rollback + seed)
cd vura-backoffice-develop
node ace migration:fresh --seed

# HMS
cd ../vura-hms-main
node ace migration:fresh --seed
```

---

## 📧 Email Testing

Mailpit intercepts all emails. No real emails are sent!

**To test:**
1. Open http://localhost:8025
2. Trigger email from application (e.g., user registration)
3. Email appears in Mailpit UI
4. View full email content

---

## 🔍 Debugging

### VSCode Debugging

While debugging (F5):
- **Breakpoints**: Click line number to set
- **Step Over**: F10
- **Step Into**: F11
- **Continue**: F5
- **Stop**: Shift+F5

### View Logs

**Docker services:**
```bash
docker-compose logs -f              # All services
docker-compose logs -f postgres     # Specific service
docker-compose logs -f --tail=50    # Last 50 lines
```

**Applications:**
- Logs appear in terminal where you ran `npm run dev`
- Look for errors and stack traces

### Common Issues

**"Cannot connect to database"**
- Verify `.env` has correct database name
- Check PostgreSQL is running: `docker-compose ps postgres`
- Try manually: `docker exec vura-postgres psql -U postgres -c "SELECT 1"`

**"Meilisearch not responding"**
- Restart: `docker-compose restart meilisearch`
- Wait 10 seconds
- Check: `curl http://localhost:7700/health`

**"Port already in use"**
- Change PORT in `.env`
- Or kill existing process using that port
- Restart app

**"Module not found"**
- Run `npm install` in that app directory
- Clear cache: `rm -rf node_modules && npm install`

See **SETUP.md** for detailed troubleshooting.

---

## 📝 Development Workflow

### 1. Create Feature Branch

```bash
git checkout -b feature/my-feature
```

### 2. Make Changes

Edit code in VSCode, use debug configuration to test.

### 3. Test Locally

```bash
# Run tests (if available)
npm run test

# Type checking
npm run typecheck

# Linting
npm run lint

# Format code
npm run format
```

### 4. Commit & Push

```bash
git add .
git commit -m "feat: add my feature"
git push origin feature/my-feature
```

### 5. Create Pull Request

Push to GitHub, create PR, get review.

---

## 🧪 Testing Applications

### Backoffice Tasks

- [ ] Login with admin account
- [ ] Create new location
- [ ] Add pharmacy to location
- [ ] Update product catalog
- [ ] Send test email (check Mailpit)

### HMS Tasks

- [ ] Login as healthcare provider
- [ ] Create new patient
- [ ] Create prescription
- [ ] Verify insurance (calls Mock EBM API)
- [ ] Check prescription status

### PMS Tasks

- [ ] Login as pharmacy owner
- [ ] View product catalog (from Backoffice)
- [ ] Create sales order
- [ ] Check inventory
- [ ] Process payment

### API Integration

- [ ] Backoffice calls PMS API
- [ ] PMS calls Backoffice API
- [ ] HMS calls Mock EBM API

---

## 📊 Architecture Overview

```
User Browser
    │
    ├─→ Backoffice (3334) ←──┐
    │   Central Admin         │
    │                          │
    ├─→ HMS (3335) ←──────────┤─→ Database (PostgreSQL)
    │   E-Prescription        │    │
    │                          │    ├─ backoffice
    ├─→ PMS (3333) ←──────────┤    ├─ hms
    │   Pharmacy              │    └─ medbook
    │                          │
    └─→ Mock EBM (3500)        └─→ Cache (Redis)
        Insurance API             Search (Meilisearch)
                                   Storage (MinIO/S3)
                                   Email (Mailpit)
```

---

## 🚀 Next Steps

1. **Explore Code**: Open `vura-backoffice-develop`, understand structure
2. **Read Documentation**: Check each app's README
3. **Review API Routes**: Look at `start/routes/` folders
4. **Test Workflows**: Go through testing tasks above
5. **Start Development**: Create features on your branch

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| README.md | Quick overview |
| **GETTING_STARTED.md** | This file - first time guide |
| SETUP.md | Detailed setup & troubleshooting |
| ARCHITECTURE.md | System design & data flow |
| CLAUDE.md | (If exists) Special instructions |

---

## 🤝 Getting Help

### Check Logs First
```bash
# App logs in terminal
# Or Docker logs
docker-compose logs -f <service_name>
```

### Common Commands

```bash
# Start Docker services
docker-compose up -d

# Stop services
docker-compose down

# Restart service
docker-compose restart postgres

# View status
docker-compose ps

# Clean everything (careful!)
docker-compose down -v
```

### Useful URLs

- Node.js docs: https://nodejs.org/docs/
- AdonisJS docs: https://docs.adonisjs.com/
- Vue.js docs: https://vuejs.org/
- PrimeVue docs: https://primevue.org/
- Docker docs: https://docs.docker.com/

---

## ✅ Success Checklist

- [ ] Docker services running: `docker-compose ps` shows all "Up"
- [ ] Applications starting: `npm run dev` runs without errors
- [ ] Database accessible: Can connect with PostgreSQL tools
- [ ] APIs responding: Can curl http://localhost:3334, etc.
- [ ] Email working: Mailpit shows test emails
- [ ] Debug configuration working: Can set breakpoint and pause

---

## 🎉 Ready to Go!

You're all set! Start with:

```bash
# Option 1: VSCode Debug
Open VSCode → Ctrl+Shift+D → Select config → F5

# Option 2: Command line
cd vura-backoffice-develop && npm run dev
```

**Questions?** Check SETUP.md → ARCHITECTURE.md → Logs

**Happy coding!** 🚀

---

**Last Updated**: 2026-07-10  
**Created For**: Vura Ecosystem Development
