# VSDC Workspace Setup Guide

**Project**: VSDC (Pharmacy POS System for Rwanda)  
**Status**: 91% Complete (53/58 features)  
**Date Created**: 2026-07-11

---

## 📁 Project Structure

```
ybgroupvsdc/
├── frontend/                    # React 19 + Vite frontend
│   ├── src/                    # React components and pages
│   ├── package.json            # Dependencies
│   ├── .env                    # Environment config
│   └── vite.config.ts          # Build configuration
│
├── yb-vsdc-api/                # AdonisJS 6 backend API
│   ├── app/                    # Application code
│   │   ├── controllers/        # Request handlers
│   │   ├── models/             # Database models
│   │   ├── actions/            # Business logic
│   │   ├── services/           # Utilities & services
│   │   ├── middleware/         # HTTP middleware
│   │   ├── validators/         # Request validators
│   │   └── exceptions/         # Custom exceptions
│   ├── database/               # Migrations & seeders
│   ├── start/                  # App initialization
│   ├── .env                    # Configuration (copy of .env.example)
│   ├── .env.example            # Template with all options
│   ├── package.json            # Dependencies
│   └── adonisrc.ts             # AdonisJS config
│
├── ybvsdcwar/                  # Deployment artifacts
├── documentation/              # Specifications & guides
│   ├── FEATURE_COMPLETE_GUIDE.md
│   ├── QUICK_START_VERIFICATION.md
│   ├── VERIFICATION_BY_CATEGORY.md
│   ├── IMPLEMENTATION_ROADMAP.md
│   └── VSDCSPECIFICATIONDOCUMENT.pdf
└── .claude/                    # Claude Code settings

```

---

## 🚀 Quick Start

### 1. **Environment Setup**

Both the API and frontend use environment files:

**API (.env)** - Already configured with:
- PostgreSQL connection (localhost:5432)
- Admin credentials (admin/admin)
- EBM integration (sandbox mode)
- Tax rates (Category B: 18%)
- Meilisearch (localhost:7700)

**Frontend (.env)** - Contains:
- API port: 8000

### 2. **Install Dependencies**

```bash
# API dependencies (AdonisJS, TypeScript, etc.)
cd yb-vsdc-api
npm install

# Frontend dependencies (React, Vite, Router)
cd ../frontend
npm install
```

**Status**: Installing in background... ⏳

### 3. **Database Setup**

Before running the API, initialize the database:

```bash
cd yb-vsdc-api
npm run db:fr        # Fresh migration + seeding
npm run dev          # Start development server
```

### 4. **Start Development Servers**

**Terminal 1 - API Server** (runs on :8000):
```bash
cd yb-vsdc-api
npm run dev
```

**Terminal 2 - Frontend** (runs on :5173):
```bash
cd frontend
npm run dev
```

---

## 📋 Available Commands

### **API (yb-vsdc-api)**
| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run db:fr` | Fresh migration + seed database |
| `npm test` | Run test suite |
| `npm run lint` | Check code quality |
| `npm run format` | Auto-format code with Prettier |
| `npm run typecheck` | Check TypeScript types |

### **Frontend**
| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server (Vite on :5173) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Check code quality |

---

## 🔧 Technology Stack

### **Backend**
- **Framework**: AdonisJS 6.17.2
- **Database**: PostgreSQL (configured)
- **ORM**: Lucid
- **Auth**: @adonisjs/auth
- **Search**: Meilisearch
- **Storage**: AWS S3 (optional)
- **Language**: TypeScript 5.7

### **Frontend**
- **Framework**: React 19.2.5
- **Build Tool**: Vite 8
- **Routing**: React Router DOM 7.14
- **Language**: TypeScript
- **Testing**: Vitest + Testing Library

---

## 🔌 Integration Points

### **EBM (Rwanda Electronic Billing Machine)**
The system integrates with Rwanda's EBM standard:
- **Sandbox URL**: `http://localhost:8080/vsdc_2_1_2_3_3/`
- **TIN**: 999909100
- **Software Dev ID**: ybgroupvsdc
- **Tax Rates**: A=0%, B=18%, C=0%, D=0%

### **RRA (Rwanda Revenue Authority)**
Customer TIN lookup via:
- Dev: `https://myrratest.rra.gov.rw/main/service/indexPurchaseInitiation`
- Prod: `http://test.com/prod`

### **Meilisearch**
Full-text search engine running on `localhost:7700`
- API Key: `xbqhi4HYpnHHsnCqthtByr5KLT3Ag6Q7s8mkEVnJqh8`

---

## 📊 Feature Status

### ✅ **Fully Complete (53 features)**
Item Management, Invoicing (core), Purchases, Stock Operations, Tax Management, Customers, Branch Management, Insurance, Reports, System Infrastructure

### ⚠️ **Partial (5 features)**
- F-12: Composition UI refinement
- F-27: Multi-currency verification
- F-28: Mixed payment UI
- F-29: Credit sales UI
- F-32: Export validation

### 🛑 **Blocked (1 feature)**
- F-36: Purchase refund service method — needs implementation

See `QUICK_START_VERIFICATION.md` for detailed breakdown.

---

## 🧪 Testing & Verification

### **Run Tests**
```bash
cd yb-vsdc-api
npm test
```

### **Type Checking**
```bash
npm run typecheck
```

### **Code Quality**
```bash
npm run lint
npm run format
```

---

## 📚 Important Files

| File | Purpose |
|------|---------|
| `QUICK_START_VERIFICATION.md` | Phase-by-phase verification checklist (START HERE) |
| `FEATURE_COMPLETE_GUIDE.md` | Complete feature list with status |
| `VERIFICATION_BY_CATEGORY.md` | Organized by business category |
| `IMPLEMENTATION_ROADMAP.md` | Detailed roadmap for remaining work |
| `.env.example` | API environment template |

---

## 🐛 Troubleshooting

### **Database Connection Error**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
→ PostgreSQL not running. Install/start PostgreSQL on localhost:5432

### **Meilisearch Error**
```
Error: connect ECONNREFUSED 127.0.0.1:7700
```
→ Meilisearch not running. Install/start Meilisearch or disable in config

### **Port Already in Use**
```
Error: listen EADDRINUSE :::8000
```
→ Change PORT in `.env` or kill process: `lsof -ti:8000 | xargs kill -9`

### **Node Module Issues**
```
npm ERR! ERESOLVE unable to resolve dependency tree
```
→ Clear and reinstall: `rm -r node_modules package-lock.json && npm install`

---

## 🎯 Next Steps

1. ✅ **Dependencies installed** (in progress)
2. 🔄 **Database initialized** → Run `npm run db:fr` in API folder
3. 🚀 **Start servers** → Follow "Start Development Servers" above
4. ✔️ **Verify foundation** → Use `QUICK_START_VERIFICATION.md` checklist
5. 📝 **Implement F-36** → Purchase refund service method
6. 🧪 **Full verification** → 24-30 hours of QA testing

---

## 💡 Tips

- **HMR Enabled**: Both servers support hot module replacement — changes reflect instantly
- **API Docs**: OpenAPI documentation available at `/api/docs` when API is running
- **Database Shell**: Connect to DB: `psql postgres -U mihig -h 127.0.0.1`
- **Seed Data**: Fresh DB includes admin user + test data for all features

---

**Ready to code!** 🚀 Start with the API and frontend dev servers, then follow the verification checklist.
