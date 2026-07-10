# Vura PMS (Medbook) - Setup Guide

## 📋 Overview

**Vura PMS** (also known as **Medbook**) is the Pharmacy Management System - a SaaS platform for pharmaceutical supply chain management connecting:
- Pharmacists
- Wholesalers
- Importers
- Medicine delivery management

**Port**: 3333  
**Database**: medbook  
**Status**: Ready for setup

---

## 🏗️ Current Status

✅ Database created: `medbook` (PostgreSQL)  
✅ Infrastructure ready: PostgreSQL, Redis, Meilisearch, Mailpit, MinIO  
✅ Environment file created: `.env`  
✅ Configuration template prepared  

⏳ Application code: Needs to be cloned/populated

---

## 🚀 Setup Instructions

### Option 1: If You Have the Source Code

If you have the Vura PMS repository:

```bash
# Clone or copy the code into vura-pms-main directory
cd vura-pms-main

# Install dependencies
npm install

# Generate APP_KEY (if not already generated)
node ace generate:key

# Run migrations
node ace migration:run

# Start development server
npm run dev
```

### Option 2: Create a Minimal Test Setup

If the code isn't available yet, you can create a placeholder:

```bash
cd vura-pms-main

# Create basic structure
npm init -y
npm install --save express cors

# Create a simple server
echo "
const express = require('express');
const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Vura PMS', port: 3333 });
});

app.listen(3333, '0.0.0.0', () => {
  console.log('Vura PMS running on http://0.0.0.0:3333');
});
" > server.js

# Start it
node server.js
```

---

## 📝 Environment Configuration

The `.env` file is already created at:
```
vura-pms-main/.env
```

**Key Settings**:
```env
PORT=3333
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=medbook
REDIS_HOST=localhost
REDIS_PORT=6379
MEILISEARCH_HOST=localhost:7700
SMTP_HOST=127.0.0.1
SMTP_PORT=1025
```

**Admin Credentials**:
```
Email:    admin@pms.local
Password: Admin@123
```

---

## 🗄️ Database

**Database Name**: `medbook`  
**Host**: localhost  
**Port**: 5432  
**User**: postgres  

**Connection String**:
```
postgresql://postgres@localhost:5432/medbook
```

**Access via Docker**:
```bash
docker exec -it vura-postgres psql -U postgres -d medbook
```

---

## 🌐 Running Vura PMS

### From VSCode Debug

```
1. Ctrl+Shift+D (Run & Debug)
2. Create new configuration for PMS
3. Point to: vura-pms-main
4. Run command: npm run dev
5. Press F5
```

### From Command Line

```bash
cd vura-pms-main
npm run dev
```

This will start on: **http://localhost:3333**

### From Docker

```bash
cd vura-pms-main
docker build -t vura-pms .
docker run -p 3333:3333 --env-file .env vura-pms
```

---

## 📱 API Integration

Vura PMS integrates with:

**Backoffice** (http://localhost:3334):
- Receives product catalog
- Sends notifications
- Syncs orders

**HMS** (http://localhost:3335):
- Receives prescriptions
- Processes fulfillment

**Configuration in .env**:
```env
API_BACKOFFICE_TOKEN=test-backoffice-token
ALLOW_API_URL_LIST=http://localhost:3334,http://localhost:3335
```

---

## 🐛 Troubleshooting

### App Won't Start

1. **Check dependencies**:
   ```bash
   npm install
   ```

2. **Generate APP_KEY**:
   ```bash
   node ace generate:key
   # Update .env APP_KEY= with generated key
   ```

3. **Check database connection**:
   ```bash
   docker exec vura-postgres psql -U postgres -d medbook -c "SELECT 1"
   ```

4. **View logs**:
   ```bash
   # If running with npm run dev
   # Check terminal output
   ```

### Database Issues

```bash
# Reset database
node ace migration:fresh --seed

# Check migrations status
node ace migration:status

# Run specific migration
node ace migration:run
```

### Port Already in Use

Change PORT in `.env`:
```env
PORT=3333  # Change to 3336, 3337, etc if 3333 is taken
```

---

## ✨ Features When Ready

✅ Pharmacy management dashboard  
✅ Inventory tracking  
✅ Order management  
✅ POS integration  
✅ Customer management  
✅ Stock alerts  
✅ Medicine catalog (from Backoffice)  
✅ Prescription fulfillment (from HMS)  

---

## 🔗 API Endpoints (Template)

Once implemented, PMS will provide:

```
GET  /api/products                 - Get product catalog
POST /api/orders                   - Create sales order
GET  /api/inventory                - Check stock levels
POST /api/notifications            - Send to Backoffice
GET  /api/customers                - List customers
POST /api/sales                    - Record sale
GET  /api/prescription-queue       - Pending prescriptions
```

---

## 📚 Related Documentation

- **README.md** - Project overview
- **SETUP.md** - General setup guide
- **ARCHITECTURE.md** - System design
- **GETTING_STARTED.md** - First-time setup

See Backoffice (`vura-backoffice-develop`) or HMS (`vura-hms-main`) for reference implementations.

---

## ⚙️ Development Tools

### Running Tests

```bash
npm run test
```

### Type Checking

```bash
npm run typecheck
```

### Code Linting

```bash
npm run lint
npm run format
```

### Database Migrations

```bash
node ace make:migration create_products_table
node ace migration:run
node ace migration:fresh --seed
```

---

## 🚢 Production Deployment

1. Update `.env` with production values
2. Build application:
   ```bash
   npm run build
   ```
3. Start production server:
   ```bash
   npm start
   ```
4. Or use Docker:
   ```bash
   docker build -t vura-pms:latest .
   docker run -p 3333:3333 -e NODE_ENV=production vura-pms:latest
   ```

---

## 📞 Support

**Issues**?
- Check Backoffice/HMS setup for reference
- Review env.ts for required environment variables
- Check database connection
- View application logs

**Questions**?
- See ARCHITECTURE.md for system design
- Check SETUP.md troubleshooting section
- Review similar apps (Backoffice, HMS)

---

## 🎯 Next Steps

1. **Obtain Source Code**: If you have access to Vura PMS repository, clone it
2. **Install Dependencies**: `npm install`
3. **Configure .env**: Already created, may need adjustments
4. **Run Migrations**: `node ace migration:run`
5. **Start App**: `npm run dev`
6. **Access**: http://localhost:3333

---

## 📊 Quick Status

| Component | Status | Note |
|-----------|--------|------|
| Database | ✅ Ready | medbook database exists |
| .env file | ✅ Ready | Configuration prepared |
| Source code | ⏳ Pending | Awaiting repository |
| Infrastructure | ✅ Ready | All services running |
| Dependencies | ⏳ Pending | Will install on npm install |
| Migrations | ⏳ Pending | Run when code available |
| Running | ⏳ Pending | Awaiting source code |

---

**Last Updated**: 2026-07-10  
**Database**: medbook (PostgreSQL)  
**Port**: 3333  
**Status**: Ready for Population  

When you have the source code, run `npm install` and `npm run dev` to get started!
