# 🚀 Vura Ecosystem - START HERE

Welcome! This is your entry point to the complete Vura development environment.

## What You Have

A fully configured multi-application healthcare platform with:

✅ **4 Applications**
- Vura Backoffice (Central Admin)
- Vura HMS (E-Prescription)
- Vura PMS (Pharmacy Management)
- Mock EBM API (Insurance Integration)

✅ **Complete Infrastructure**
- PostgreSQL Database (3 databases ready)
- Redis Cache
- Meilisearch Full-Text Search
- Mailpit Email Testing
- MinIO S3 Storage
- Docker Compose orchestration

✅ **Development Ready**
- VSCode Debug configurations
- Automated setup scripts
- Environment files configured
- Mock API service
- Comprehensive documentation

---

## 📋 What to Do Next

### First Time? (5 minutes)

1. **Read GETTING_STARTED.md** (this folder)
   - Quick setup guide
   - How to run apps
   - URL access points

2. **Run setup script** (if not done yet)
   ```bash
   # Windows
   .\setup.bat
   
   # macOS/Linux
   bash setup.sh
   ```

3. **Start debugging**
   - Press Ctrl+Shift+D in VSCode
   - Select "Vura Backoffice Dev"
   - Press F5
   - Open http://localhost:3334

### Already Familiar? (2 minutes)

**Quick Start:**
```bash
# Terminal 1: Backoffice
cd vura-backoffice-develop && npm run dev

# Terminal 2: HMS  
cd vura-hms-main && npm run dev

# Terminal 3: Mock EBM API
cd mock-ebm-api && npm start
```

---

## 📚 Documentation Map

Read these in order based on your needs:

### 🟢 Getting Started
| File | Read Time | For | Contains |
|------|-----------|-----|----------|
| **GETTING_STARTED.md** | 10 min | First-time setup | Prerequisites, running apps, accessing URLs |
| **README.md** | 5 min | Quick reference | Commands, URLs, troubleshooting |

### 🔵 Setup & Configuration
| File | Read Time | For | Contains |
|------|-----------|-----|----------|
| **SETUP.md** | 20 min | Detailed setup | Infrastructure, migrations, database setup |
| **docker-compose.yml** | 5 min | Infrastructure | Service definitions, ports, volumes |

### 🟣 Architecture & Development
| File | Read Time | For | Contains |
|------|-----------|-----|----------|
| **ARCHITECTURE.md** | 30 min | Understanding system | Data flow, APIs, databases, integrations |
| **.vscode/launch.json** | 5 min | VSCode debugging | Debug configurations for each app |
| **.vscode/tasks.json** | 5 min | VSCode tasks | Build and utility tasks |

---

## 🎯 Quick Start Options

### Option A: VSCode Debug (Recommended)

**Best for development - hot reload, debugging, logs in one place**

```
1. Open workspace in VSCode
2. Press Ctrl+Shift+D (Run & Debug)
3. Select from dropdown: "Vura Backoffice Dev", "Vura HMS Dev", etc.
4. Press F5
5. Open http://localhost:3334 (or 3335, 3333)
```

**Advantages:**
- ✅ Hot reload (changes auto-refresh)
- ✅ Set breakpoints and debug
- ✅ See logs in terminal
- ✅ Easy to stop/restart
- ✅ Multiple apps at once (compound config)

**Keyboard Shortcuts:**
- `F5` - Start debugging
- `Shift+F5` - Stop
- `F10` - Step over
- `F11` - Step into
- `Ctrl+Shift+B` - Run build task

### Option B: Command Line

**If you prefer terminal**

```bash
# Each in separate terminal
cd vura-backoffice-develop && npm run dev
cd vura-hms-main && npm run dev
cd vura-pms-main && npm run dev
cd mock-ebm-api && npm start
```

### Option C: Docker Production

```bash
# Build and run in containers
docker-compose -f docker-compose.yml up
```

---

## 🌐 After Apps Start

**Open in browser:**

| App | URL | What to expect |
|-----|-----|-----------------|
| Backoffice | http://localhost:3334 | Login page or dashboard |
| HMS | http://localhost:3335 | Login page or dashboard |
| PMS | http://localhost:3333 | Login page or dashboard |
| Mailpit | http://localhost:8025 | Email testing interface |
| Meilisearch | http://localhost:7700 | Search admin panel |

**First login:**
- Check migration output for initial credentials
- Or check `database/seeders` files in each app

---

## 🔑 Key Directories

```
vura dev/
├── 📄 00-START-HERE.md ................ THIS FILE
├── 📄 GETTING_STARTED.md ............. Read this first
├── 📄 README.md ...................... Quick reference
├── 📄 SETUP.md ....................... Detailed setup
├── 📄 ARCHITECTURE.md ................ System design
│
├── 🐳 docker-compose.yml ............ Infrastructure (DB, Redis, etc)
├── ⚙️ setup.sh / setup.bat .......... Auto setup scripts
├── ✓ verify-setup.sh ............... Verify everything works
│
├── 🔧 .vscode/
│   ├── launch.json ................. Debug configs (F5)
│   ├── tasks.json .................. Build tasks
│   ├── settings.json ............... Editor settings
│   └── extensions.json ............. Recommended extensions
│
├── 📦 vura-backoffice-develop/ ...... Central admin app
│   ├── .env ........................ Configuration ⬅️ EDIT IF NEEDED
│   ├── package.json ............... Dependencies
│   ├── app/ ........................ Source code
│   ├── database/ ................... Migrations
│   ├── resources/ .................. Vue components
│   └── start/routes ............... API routes
│
├── 📦 vura-hms-main/ ............... E-prescription app
│   └── (similar structure)
│
├── 📦 vura-pms-main/ ............... Pharmacy app
│   └── (similar structure)
│
└── 📦 mock-ebm-api/ ............... Mock insurance API
    ├── package.json
    ├── server.js
    └── (simple Express server)
```

---

## ⚡ Most Important Commands

### Starting Apps

```bash
# Terminal approach (recommended for learning)
cd vura-backoffice-develop
npm run dev

# Or VSCode: Ctrl+Shift+D → Select → F5
```

### Database Management

```bash
# Run migrations
cd vura-backoffice-develop
node ace migration:run

# Fresh reset (delete + seed)
node ace migration:fresh --seed

# Check status
node ace migration:status
```

### Debugging

```bash
# View logs
docker-compose logs -f postgres    # Database
docker-compose logs -f redis       # Cache

# Connect to database
docker exec -it vura-postgres psql -U postgres
\l                                  # List databases
\c backoffice                       # Connect to database
\dt                                 # List tables
\q                                  # Quit
```

### Stopping

```bash
# Stop Docker services
docker-compose down

# Stop specific service
docker-compose stop postgres

# In VSCode debug: Shift+F5
```

---

## 🆘 If Something Breaks

### Common Issues & Quick Fixes

**"Cannot connect to database"**
```bash
# Check if running
docker-compose ps postgres

# Restart it
docker-compose restart postgres

# Wait 10 seconds and try again
```

**"Port already in use (3334, 3335, etc)"**
```bash
# Edit .env, change PORT value
# Or kill process using that port
```

**"Module not found"**
```bash
# Reinstall dependencies
cd vura-backoffice-develop
rm -rf node_modules
npm install
```

**"Application won't start"**
```bash
# Check logs in terminal
# Look for database errors
# Verify .env configuration
# Check migrations ran: node ace migration:status
```

### For Detailed Help

📖 See **SETUP.md** → Troubleshooting section

---

## 🔄 Typical Development Flow

### 1. Start Everything

```bash
# VSCode: Ctrl+Shift+D → "All Services" → F5
# Or terminals: npm run dev in each app
```

### 2. Make Changes

Edit code in VSCode → app hot-reloads automatically

### 3. Test in Browser

Open http://localhost:3334 (or other port)

### 4. Use DevTools

- F12 for browser dev tools
- VSCode debugger (F5 to pause, F10/F11 to step)

### 5. View Logs

- App logs in terminal
- Email logs in Mailpit (http://localhost:8025)
- Database logs: `docker-compose logs -f postgres`

### 6. Commit Changes

```bash
git checkout -b feature/my-feature
git add .
git commit -m "feat: my feature"
git push origin feature/my-feature
```

---

## 🎓 Learning Path

**Day 1:**
1. Read GETTING_STARTED.md
2. Run setup script
3. Start apps (VSCode debug)
4. Explore Backoffice UI
5. Check Mailpit works

**Day 2:**
1. Read ARCHITECTURE.md
2. Understand 4-app system
3. Look at database structure
4. Test inter-app APIs

**Day 3:**
1. Find a bug/feature
2. Edit code
3. Use debugger
4. Test changes
5. Commit to git

---

## 📊 System Status

Check if everything is running:

```bash
# One-liner check
docker-compose ps

# Expected output:
# postgres      running (healthy)
# redis         running (healthy)
# meilisearch   running (healthy)
# mailpit       running (healthy)
```

Or use:
```bash
bash verify-setup.sh
```

---

## 🔗 URLs & Ports

Save these for quick reference:

```
Applications:
  Backoffice:   http://localhost:3334
  HMS:          http://localhost:3335
  PMS:          http://localhost:3333
  Mock EBM:     http://localhost:3500

Tools:
  Mailpit:      http://localhost:8025 (email)
  Meilisearch:  http://localhost:7700 (search)
  MinIO:        http://localhost:9000 (storage)

Services:
  PostgreSQL:   localhost:5432
  Redis:        localhost:6379
  Meilisearch:  localhost:7700
```

---

## ✅ Verification Checklist

- [ ] Docker installed and running
- [ ] Node.js v22+ installed
- [ ] All .env files created
- [ ] `docker-compose ps` shows all services running
- [ ] VSCode debug configuration works (F5)
- [ ] Can access http://localhost:3334
- [ ] Can set breakpoint and pause execution
- [ ] Mailpit shows test emails
- [ ] Database accessible

---

## 🚀 You're Ready!

Everything is set up and ready to go. 

**Next action:** Open GETTING_STARTED.md or press Ctrl+Shift+D in VSCode.

---

## 📞 Quick Help

### By Problem

**Apps won't start**
→ SETUP.md → Troubleshooting

**Can't connect to database**
→ SETUP.md → Database Connection Error

**VSCode debug not working**
→ SETUP.md → Migrations Won't Run

**Want to understand the system**
→ ARCHITECTURE.md

**Need API documentation**
→ Each app's `start/routes/` folder + ARCHITECTURE.md

---

## 📈 What's Next?

1. **First Run**: Follow GETTING_STARTED.md
2. **Explore**: Poke around the UIs
3. **Understand**: Read ARCHITECTURE.md
4. **Develop**: Make your first change
5. **Integrate**: Test inter-app communication

---

## 📝 File Guide at a Glance

| Read | For |
|------|-----|
| **GETTING_STARTED.md** | How to run, URLs, first steps |
| **README.md** | Quick commands and reference |
| **SETUP.md** | Detailed setup, troubleshooting |
| **ARCHITECTURE.md** | How system works, data flow |
| **.vscode/launch.json** | Debugging configuration |
| **docker-compose.yml** | Infrastructure services |

---

## 🎯 Success = When You Can

- [ ] Run apps with `npm run dev`
- [ ] Access http://localhost:3334 in browser
- [ ] Set breakpoint and pause (VSCode)
- [ ] Send test email and see in Mailpit
- [ ] Connect to database
- [ ] Understand 4-app system

---

**Last Updated**: 2026-07-10  
**Status**: ✅ Ready to Code  
**Questions?** Check docs or see SETUP.md Troubleshooting

---

# Let's Go! 🚀

Pick your next step:
1. **New here?** → Read GETTING_STARTED.md
2. **Ready to code?** → Press Ctrl+Shift+D in VSCode
3. **Need setup help?** → Run setup.bat or bash setup.sh
4. **Just verify?** → Run bash verify-setup.sh

Happy coding! 💻
