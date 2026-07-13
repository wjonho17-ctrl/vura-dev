# VSCode Workspace Guide - VSDC Pharmacy POS

## 🚀 Quick Start

### **Option 1: Open Workspace File (Recommended)**

In VSCode:
1. **File → Open Workspace from File**
2. Navigate to: `C:\Users\user\ybgroupvsdc\ybgroupvsdc.code-workspace`
3. Click "Open"

**Or** from command line:
```bash
code C:\Users\user\ybgroupvsdc\ybgroupvsdc.code-workspace
```

### **Option 2: Open Folder**
```bash
code C:\Users\user\ybgroupvsdc
```

---

## 📁 Workspace Structure

The workspace includes 3 folders:

| Folder | Purpose | Tech Stack |
|--------|---------|-----------|
| **🏥 VSDC (Root)** | Documentation & Config | Markdown, JSON |
| **🎨 Frontend (React)** | Web UI | React 19, TypeScript, Vite |
| **⚙️ API (AdonisJS)** | Backend Server | AdonisJS 6, TypeScript, PostgreSQL |

---

## ⚡ Quick Commands

### **Run Servers**

**Option A: Using Debug Launcher** (Recommended)
1. Press `F5` or go to **Run → Start Debugging**
2. Select: `🚀 Run All (API + Frontend)`

**Option B: Using Tasks**
1. Press `Ctrl+Shift+P` → Type "Run Task"
2. Select one:
   - `🎨 Frontend: Dev`
   - `⚙️ API: Dev`

**Option C: Integrated Terminal**
```bash
# Terminal 1 - API
cd yb-vsdc-api
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### **Database Setup**
```bash
Ctrl+Shift+P → Run Task → ⚙️ API: Database Fresh
```

### **Build for Production**
```bash
Ctrl+Shift+P → Run Task → 🎨 Frontend: Build
Ctrl+Shift+P → Run Task → ⚙️ API: Build
```

### **Run Tests**
```bash
Ctrl+Shift+P → Run Task → 🧪 API Tests
```

---

## 🔧 Recommended Extensions

The workspace includes a list of recommended extensions. Install them:

1. Go to **Extensions** (`Ctrl+Shift+X`)
2. Filter by "Recommended"
3. Install:
   - **Prettier** - Code formatter
   - **ESLint** - Linting
   - **Material Icon Theme** - Better icons
   - **GitHub Copilot** - AI assistance
   - **TailwindCSS IntelliSense** - CSS helper
   - **ES7+ React/Redux/React-Native snippets** - React helpers

---

## 🌐 Access Points

Once servers are running:

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | http://localhost:5173 | Web application |
| **API** | http://localhost:8000 | REST API |
| **API Docs** | http://localhost:8000/api/docs | OpenAPI documentation |

---

## 🐛 Debugging

### **Debug Frontend (React)**
1. Go to **Run → Add Configuration**
2. Select **Chrome** or **Firefox**
3. Set breakpoints in React components
4. Press `F5` to start debugging

### **Debug API (AdonisJS)**
1. Press `F5` → Select `⚙️ API (AdonisJS Dev)`
2. Set breakpoints in TypeScript files
3. Breakpoints work automatically (source maps enabled)

### **Debug Tests**
1. Press `F5` → Select `🧪 API Tests`
2. Set breakpoints in test files
3. Run with debugging enabled

---

## 📝 Workspace Settings

### **Prettier Formatting**
- Automatically formats on save
- Configuration: Frontend uses defaults, API uses `.prettierrc`

### **ESLint**
- Lints TypeScript/JavaScript
- Auto-fixes common issues on save
- Config: `.eslintrc.cjs` in each folder

### **TypeScript**
- Uses workspace TypeScript version
- Path aliases configured in `tsconfig.json` files
- Quick type checking: `Ctrl+Shift+P` → "TypeScript: Restart TS Server"

---

## 💾 File Structure in Editor

### **Frontend Folder**
```
frontend/
├── src/
│   ├── pages/          # Page components
│   ├── components/     # Reusable components
│   ├── App.tsx         # Root component
│   └── main.tsx        # Entry point
├── package.json
├── vite.config.ts
└── tsconfig.json
```

### **API Folder**
```
yb-vsdc-api/
├── app/
│   ├── controllers/    # Request handlers
│   ├── models/         # Database models
│   ├── actions/        # Business logic
│   ├── services/       # Utilities
│   └── middleware/     # HTTP middleware
├── database/
│   ├── migrations/     # Database schemas
│   └── seeders/        # Sample data
├── start/              # App initialization
├── .env                # Environment config
└── package.json
```

---

## 🔐 Environment Variables

### **API (.env)**
Located in `yb-vsdc-api/.env` with:
- Database: PostgreSQL (localhost:5432)
- Admin: admin/admin
- EBM Integration: Sandbox mode
- API Key examples

### **Frontend (.env)**
Located in `frontend/.env` with:
- VITE_API_PORT=8000

⚠️ **Don't commit `.env` files!** They're in `.gitignore`

---

## 🧪 Testing

### **Run API Tests**
```bash
cd yb-vsdc-api
npm test
```

### **Run Specific Test**
```bash
npm test -- tests/unit/models/user.spec.ts
```

### **Watch Mode**
Tests automatically re-run when files change during development.

---

## 📚 Documentation

Quick reference guides in root folder:
- **QUICK_START_VERIFICATION.md** - Feature verification checklist
- **WORKSPACE_SETUP.md** - Setup instructions
- **FEATURE_COMPLETE_GUIDE.md** - All 58 features listed
- **VERIFICATION_BY_CATEGORY.md** - Testing by category
- **IMPLEMENTATION_ROADMAP.md** - Remaining work

---

## 🔗 GitHub Repository

**Repository**: https://github.com/Mihigojordan/ybgroupvsdc.git

### **Common Git Tasks**

```bash
# Check status
git status

# View logs
git log --oneline -10

# Create branch
git checkout -b feature/your-feature

# Commit changes
git add .
git commit -m "feat: your message"

# Push to remote
git push origin feature/your-feature

# Create Pull Request
# Go to: https://github.com/Mihigojordan/ybgroupvsdc/pulls
```

---

## 🆘 Troubleshooting

### **Extension Won't Install**
- Check VSCode version (should be latest)
- Try: `Ctrl+Shift+P` → "Developer: Reload Window"

### **TypeScript Errors**
```bash
Ctrl+Shift+P → TypeScript: Restart TS Server
```

### **Port Already in Use**
```bash
# Find process on port 8000
netstat -ano | findstr :8000

# Kill process (replace PID)
taskkill /PID <PID> /F
```

### **Can't Find Modules**
```bash
# Reinstall node_modules
cd yb-vsdc-api
rm -r node_modules package-lock.json
npm install

cd ../frontend
rm -r node_modules package-lock.json
npm install
```

---

## ✨ Tips & Tricks

### **Multi-Root Editing**
Edit files in all 3 folders simultaneously. Changes in `frontend/` and `yb-vsdc-api/` are separate projects.

### **Search Across Workspace**
- `Ctrl+Shift+F` - Search in all folders
- Use workspace settings to exclude `node_modules`

### **Terminal Shortcuts**
- ``Ctrl+` `` - Toggle terminal
- `Ctrl+Shift+` `` - New terminal
- Select which folder before running commands

### **Keyboard Shortcuts**
- `F5` - Start/stop debugging
- `Ctrl+Shift+D` - Open debug panel
- `Ctrl+Shift+X` - Extensions
- `Ctrl+Shift+P` - Command palette

---

## 🎯 Next Steps

1. ✅ Open workspace file
2. 🔧 Install recommended extensions
3. 📂 Explore folder structure
4. 🚀 Run all servers with `F5`
5. 🌐 Open http://localhost:5173
6. ✔️ Follow QUICK_START_VERIFICATION.md

---

**Happy coding! 🚀**
