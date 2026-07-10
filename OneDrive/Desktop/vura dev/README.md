# Vura Ecosystem - Multi-App Development Environment

A complete setup for developing and running the entire Vura ecosystem including Backoffice, HMS (E-Prescription), PMS, and supporting services.

## 🚀 Quick Start

### Windows
```powershell
.\setup.bat
```

### macOS/Linux
```bash
chmod +x setup.sh
./setup.sh
```

After setup completes, open VSCode and use **Run & Debug** (Ctrl+Shift+D) to start apps.

---

## 📦 What's Included

### Applications
- **Vura Backoffice** (Port 3334) - Central administration platform
- **Vura HMS** (Port 3335) - E-prescription management system
- **Vura PMS** (Port 3333) - Pharmacy management system
- **Mock EBM API** (Port 3500) - Insurance API mock service

### Infrastructure (Docker)
- PostgreSQL 17 (Database)
- Redis (Cache & Session)
- Meilisearch (Search Engine)
- Mailpit (Email Testing)
- LocalStack (S3 Emulation)

---

## 🛠️ Quick Reference

### Start Services
```bash
docker-compose up -d
```

### View Service Status
```bash
docker-compose ps
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f postgres
```

### Stop Services
```bash
docker-compose down
```

### Stop and Clean Everything
```bash
docker-compose down -v
```

---

## 🎯 Running Applications

### VSCode Debug (Recommended)
1. Press `Ctrl+Shift+D` (Run & Debug)
2. Select configuration:
   - `Vura Backoffice Dev`
   - `Vura HMS Dev`
   - `Vura PMS Dev`
   - `Mock EBM API`
   - `All Services (Backoffice + HMS + Mock EBM)` (runs all at once)
3. Press `F5` to start

### Command Line
```bash
# Backoffice
cd vura-backoffice-develop
npm run dev

# HMS
cd vura-hms-main
npm run dev

# PMS
cd vura-pms-main
npm run dev

# Mock EBM API
cd mock-ebm-api
npm start
```

### Production Build
```bash
# Build
npm run build

# Start
npm start
```

---

## 🔗 Service URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Vura Backoffice | http://localhost:3334 | Admin panel |
| Vura HMS | http://localhost:3335 | E-prescription system |
| Vura PMS | http://localhost:3333 | Pharmacy management |
| Mailpit | http://localhost:8025 | Email testing interface |
| Meilisearch | http://localhost:7700 | Search admin |
| Mock EBM API | http://localhost:3500 | API health: `/health` |

---

## 🗄️ Database Management

### Run Migrations
```bash
# Backoffice
cd vura-backoffice-develop
node ace migration:run

# HMS
cd vura-hms-main
node ace migration:run
```

### Fresh Migrations (Reset + Seed)
```bash
cd vura-backoffice-develop
node ace migration:fresh --seed

cd vura-hms-main
node ace migration:fresh --seed
```

### Check Migration Status
```bash
node ace migration:status
```

### Database Credentials
- **Host**: localhost
- **Port**: 5432
- **User**: root
- **Password**: root
- **Backoffice DB**: vura_backoffice
- **HMS DB**: vura_hms
- **PMS DB**: vura_pms

Connect with:
```bash
psql -h localhost -U root -d vura_backoffice
```

---

## 🔑 Generating Application Keys

Each application needs an encryption key. Generate with:

```bash
# Backoffice
cd vura-backoffice-develop
node ace generate:key
# Copy output and paste into .env APP_KEY value

# HMS
cd vura-hms-main
node ace generate:key
# Copy output and paste into .env APP_KEY value
```

Or use the setup script which generates them automatically.

---

## 📧 Email Testing

Mailpit is included for email testing:

1. Open http://localhost:8025
2. Applications send emails via: `SMTP_HOST=127.0.0.1:1025`
3. All emails appear in Mailpit UI (no actual sending)

---

## 🔍 Search Configuration

Meilisearch is configured for full-text search:

- **Admin URL**: http://localhost:7700
- **Search Host**: localhost:7700
- **Master Key**: UXo7WQ9Pys416bawtsYpR2opjCl6JN_Fwh22OmZVqHY (default)

---

## 🪣 File Storage (S3)

LocalStack emulates AWS S3 locally:

```bash
# List buckets
aws s3 ls --endpoint-url http://localhost:4566

# Upload file
aws s3 cp file.txt s3://vura-backoffice/ --endpoint-url http://localhost:4566
```

**Credentials**:
- Access Key: `test`
- Secret Key: `test`
- Region: `us-east-1`
- Endpoint: `http://localhost:4566`

---

## 🔄 Inter-App Communication

Applications communicate via APIs. To enable:

1. Generate API token in source app
2. Add token to destination app's `.env`
3. Update `ALLOW_API_URL_LIST` in `.env`

Example:
```env
ALLOW_API_URL_LIST=http://localhost:3333,http://localhost:3334,http://localhost:3335
```

---

## 📁 Project Structure

```
vura dev/
├── docker-compose.yml          # All infrastructure services
├── setup.sh / setup.bat         # Automated setup scripts
├── SETUP.md                     # Detailed setup guide
├── README.md                    # This file
│
├── .vscode/
│   ├── launch.json              # VSCode debug configurations
│   └── tasks.json               # Build/run tasks
│
├── vura-backoffice-develop/     # Backoffice app (AdonisJS + Vue)
│   ├── .env                     # Environment configuration
│   ├── package.json
│   ├── app/                     # Application code
│   ├── database/                # Migrations & seeders
│   └── resources/               # Vue components
│
├── vura-hms-main/               # HMS app (AdonisJS + Vue)
│   ├── .env
│   ├── package.json
│   ├── app/
│   ├── database/
│   └── resources/
│
├── vura-pms-main/               # PMS app
│   ├── .env
│   └── package.json
│
└── mock-ebm-api/                # Mock EBM API (Express)
    ├── package.json
    └── server.js
```

---

## 🐛 Troubleshooting

### Docker Won't Start
```bash
# Ensure Docker Desktop is running
# Check if containers exist
docker-compose ps

# Force restart
docker-compose down
docker-compose up -d
```

### Database Connection Error
```bash
# Check if postgres is healthy
docker-compose ps postgres

# View postgres logs
docker-compose logs postgres

# Verify connection
psql -h localhost -U root -d postgres -c "SELECT version();"
```

### Port Already in Use
```bash
# Find process using port 5432
# Windows: netstat -ano | findstr :5432
# macOS/Linux: lsof -i :5432

# Change port in docker-compose.yml and restart
docker-compose down
docker-compose up -d
```

### npm install Fails
```bash
# Clear cache
npm cache clean --force

# Remove and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Wrong Node Version
```bash
# Check version (should be ^22.0.0)
node --version

# Install correct version
# Via nvm: nvm install 22 && nvm use 22
# Or download from https://nodejs.org/
```

See **SETUP.md** for detailed troubleshooting.

---

## 📚 Documentation

- **SETUP.md** - Complete setup and configuration guide
- **Tech Stack** - AdonisJS, Vue.js, Inertia, PrimeVue, PostgreSQL
- **API Docs** - Each app has `/api/docs` (if Swagger is configured)

---

## 🔐 Security Notes

### Development Only
- Default database credentials are simple (root/root)
- LocalStack uses test AWS credentials
- Meilisearch master key is shared
- Use real secrets in production

### Environment Variables
- Copy `.env.example` to `.env`
- Never commit `.env` to git
- Sensitive values go in `.env` or environment

---

## 📝 Environment Setup

Each application has an `.env` file with configuration:

```env
# Application
PORT=3334
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=root
DB_PASSWORD=root
DB_DATABASE=vura_backoffice

# Mail
SMTP_HOST=127.0.0.1
SMTP_PORT=1025

# Search
MEILISEARCH_HOST=localhost:7700

# Storage
AWS_S3_ENDPOINT=http://localhost:4566
S3_BUCKET=vura-backoffice
```

---

## 🚢 Production Deployment

### Build for Production
```bash
npm run build
npm start
```

### Environment
Update `.env` with production values:
- Real database credentials
- Real S3 bucket details
- Real email provider
- Production URLs
- Real API keys

### Docker Build
```dockerfile
docker build -t vura-backoffice .
docker run -p 3334:3334 vura-backoffice
```

---

## 🤝 Contributing

1. Create a new branch
2. Make changes in app directory
3. Test locally using debug config
4. Submit PR with description

---

## 📞 Support

For issues:
1. Check **SETUP.md** troubleshooting section
2. View logs: `docker-compose logs -f`
3. Verify all services are running: `docker-compose ps`
4. Check `.env` configuration

---

## 📋 Checklist Before Going Live

- [ ] All Docker services running
- [ ] Databases migrated
- [ ] Applications starting without errors
- [ ] Email testing works (Mailpit)
- [ ] File storage working (LocalStack)
- [ ] Search indexing working (Meilisearch)
- [ ] Inter-app APIs configured
- [ ] .env files updated
- [ ] API tokens generated
- [ ] Test user accounts created

---

**Last Updated**: 2026-07-10

For detailed setup and configuration instructions, see **SETUP.md**.
