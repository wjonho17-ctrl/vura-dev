# 🚀 VSDC Workspace - Quick Links & Access

**Created**: 2026-07-11  
**Project**: VSDC Pharmacy POS System (Rwanda)  
**Status**: Ready to develop ✅

---

## 📦 Repository

**GitHub**: https://github.com/Mihigojordan/ybgroupvsdc.git

```bash
# Clone (already done)
git clone https://github.com/Mihigojordan/ybgroupvsdc.git

# Local path
C:\Users\user\ybgroupvsdc
```

---

## 🖥️ Workspace Files

### **VSCode Workspace**
📄 **File**: `ybgroupvsdc.code-workspace`

**Open with**:
```bash
code C:\Users\user\ybgroupvsdc\ybgroupvsdc.code-workspace
```

Or in VSCode:
- File → Open Workspace from File → Navigate to `ybgroupvsdc.code-workspace`

---

## 🌐 Live Access (When Servers Running)

| Service | URL | Port |
|---------|-----|------|
| **Frontend** | http://localhost:5173 | 5173 |
| **API** | http://localhost:8000 | 8000 |
| **API Docs** | http://localhost:8000/api/docs | 8000 |

---

## 📁 Folder Structure

```
ybgroupvsdc/                          ← Root workspace folder
├── ybgroupvsdc.code-workspace        ← Open THIS in VSCode
├── 
├── frontend/                         ← React 19 Frontend
│   ├── src/
│   ├── package.json
│   ├── vite.config.ts
│   └── .env
│
├── yb-vsdc-api/                      ← AdonisJS 6 Backend
│   ├── app/
│   ├── database/
│   ├── package.json
│   └── .env
│
├── ybvsdcwar/                        ← Deployment artifacts
│
├── WORKSPACE_SETUP.md                ← Setup guide
├── VSCODE_WORKSPACE_GUIDE.md         ← VSCode tips
├── WORKSPACE_LINKS.md                ← This file
├── QUICK_START_VERIFICATION.md       ← Feature checklist
├── FEATURE_COMPLETE_GUIDE.md         ← All features
├── VERIFICATION_BY_CATEGORY.md       ← Testing guide
└── IMPLEMENTATION_ROADMAP.md         ← Remaining work
```

---

## 🚀 Quick Start Commands

### **1. Open Workspace in VSCode**
```bash
code C:\Users\user\ybgroupvsdc\ybgroupvsdc.code-workspace
```

### **2. Install Dependencies** (Already done ✅)
```bash
cd C:\Users\user\ybgroupvsdc\yb-vsdc-api && npm install
cd C:\Users\user\ybgroupvsdc\frontend && npm install
```

### **3. Start Servers**

**Option A**: Press `F5` in VSCode (Debug → Run All)

**Option B**: Manual in terminals
```bash
# Terminal 1 - API
cd yb-vsdc-api
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### **4. Initialize Database**
```bash
cd yb-vsdc-api
npm run db:fr  # Fresh migration + seed
```

### **5. Access Application**
Open browser → **http://localhost:5173**

---

## 📚 Documentation Guide

### **Quick Reads** (5-10 min)
1. This file (WORKSPACE_LINKS.md) - Overview
2. VSCODE_WORKSPACE_GUIDE.md - How to use VSCode workspace

### **Setup** (15-30 min)
3. WORKSPACE_SETUP.md - Technical setup details

### **Development** (30 min - ongoing)
4. QUICK_START_VERIFICATION.md - Feature verification
5. FEATURE_COMPLETE_GUIDE.md - All 58 features

### **Testing** (2-3 hours)
6. VERIFICATION_BY_CATEGORY.md - Organized test plan
7. IMPLEMENTATION_ROADMAP.md - Remaining work

### **Specifications** (Reference)
- VSDCSPECIFICATIONDOCUMENT.pdf - Complete spec
- CISforVSDC_technical_specsnew.pdf - Technical details
- Various RRA/EBM PDFs - Compliance docs

---

## ⚙️ Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | React | 19.2.5 |
| **Frontend Build** | Vite | 8.0.10 |
| **Frontend Routing** | React Router | 7.14.2 |
| **Backend** | AdonisJS | 6.17.2 |
| **Backend Language** | TypeScript | 5.7 |
| **Database** | PostgreSQL | (local) |
| **ORM** | Lucid | 21.6.0 |
| **Search** | Meilisearch | (local) |
| **Auth** | @adonisjs/auth | 9.3.1 |
| **Storage** | AWS S3 | (optional) |

---

## 🔐 Default Credentials

### **Admin User**
```
Email: admin@test.com
Password: admin
```

### **Database**
```
Host: localhost
Port: 5432
User: mihig
Password: post
Database: vsdc_api
```

### **EBM (Rwanda)**
```
Sandbox TIN: 999909100
Software ID: ybgroupvsdc
Mode: Sandbox (testing)
```

### **Meilisearch**
```
Host: localhost:7700
API Key: xbqhi4HYpnHHsnCqthtByr5KLT3Ag6Q7s8mkEVnJqh8
```

---

## 📋 Feature Status

- ✅ **Fully Complete**: 53 features
- ⚠️ **Partial**: 5 features (UI refinement needed)
- 🛑 **Blocked**: 1 feature (F-36 refund method)

**Total**: 91% complete

See `QUICK_START_VERIFICATION.md` for detailed breakdown.

---

## 🆘 Common Tasks

### **View Server Logs**
- **API**: Open VSCode Integrated Terminal → Terminal for API task
- **Frontend**: Open VSCode Integrated Terminal → Terminal for Frontend task

### **Run Tests**
```bash
cd yb-vsdc-api
npm test
```

### **Type Check**
```bash
cd yb-vsdc-api
npm run typecheck
```

### **Format Code**
```bash
cd yb-vsdc-api
npm run format
```

### **Lint Code**
```bash
cd yb-vsdc-api
npm run lint
```

### **Build for Production**
```bash
# Frontend
cd frontend
npm run build

# API
cd yb-vsdc-api
npm run build
npm run start
```

---

## 🔗 Related Links

- **GitHub Repo**: https://github.com/Mihigojordan/ybgroupvsdc
- **AdonisJS Docs**: https://docs.adonisjs.com
- **React Docs**: https://react.dev
- **Vite Docs**: https://vitejs.dev
- **TypeScript Docs**: https://www.typescriptlang.org
- **PostgreSQL Docs**: https://www.postgresql.org/docs
- **Meilisearch Docs**: https://docs.meilisearch.com

---

## 📞 Support

### **Issues in VSCode**
1. Check `.vscode/settings.json` for workspace settings
2. Install recommended extensions
3. Restart TypeScript server: `Ctrl+Shift+P` → "TypeScript: Restart TS Server"

### **Database Issues**
1. Ensure PostgreSQL running on localhost:5432
2. Run `npm run db:fr` to reset database
3. Check `.env` for DB credentials

### **Port Conflicts**
Change ports in:
- API: `PORT=8000` in `yb-vsdc-api/.env`
- Frontend: Vite config in `frontend/vite.config.ts`

---

## ✨ Workspace Features

✅ Multi-folder workspace (root + frontend + API)  
✅ Debugging configuration for both servers  
✅ Task definitions for all npm commands  
✅ ESLint + Prettier auto-formatting  
✅ Recommended extensions list  
✅ TypeScript paths configured  
✅ HMR (Hot Module Reload) enabled  
✅ Source maps for debugging  

---

## 🎯 Next Steps

1. ✅ Clone repo → Done
2. ✅ Install dependencies → Done
3. 🔲 Open workspace in VSCode → `ybgroupvsdc.code-workspace`
4. 🔲 Install recommended extensions
5. 🔲 Press `F5` to run both servers
6. 🔲 Open http://localhost:5173
7. 🔲 Follow QUICK_START_VERIFICATION.md

---

**Created with ❤️ for the VSDC Pharmacy POS Project**

---

## 📄 File Checklist

- ✅ `ybgroupvsdc.code-workspace` - VSCode workspace file
- ✅ `WORKSPACE_SETUP.md` - Setup instructions
- ✅ `VSCODE_WORKSPACE_GUIDE.md` - VSCode guide
- ✅ `WORKSPACE_LINKS.md` - This file
- ✅ Original repo files (docs, specs, etc.)

**All set! Ready to develop. 🚀**
