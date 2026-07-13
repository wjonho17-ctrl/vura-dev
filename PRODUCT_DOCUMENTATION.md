# VURA VSDC Manager - Product Documentation

**Version:** 1.0.0  
**Application ID:** VURA-2026-001  
**Date:** 2026-07-13  
**Compliance Standard:** RRA EBM 2.1 Technical Specification for CIS for VSDC

---

## 1. PRODUCT BROCHURE

### Overview

VURA VSDC Manager is a comprehensive Cash Accounting System (CIS) designed to meet Rwanda Revenue Authority (RRA) requirements for VSDC (Validated Storage of Data in Cloud) compliance. The system enables businesses to manage receipts, inventory, customer information, and generate compliance reports while maintaining real-time synchronization with RRA's VSDC infrastructure.

### Key Features

- **Multi-Receipt Type Support:** Normal Sale (S), Normal Refund (R), Training (T), Proforma (P), Copy (C)
- **Real-Time VSDC Integration:** Automatic receipt signature and validation
- **Inventory Management:** Stock tracking with automatic VSDC synchronization
- **Tax Configuration:** Support for tax types A, B, C, D with configurable rates
- **Electronic Journal:** Complete audit trail for all transactions
- **Report Generation:** Daily X/Z reports, PLU reports, and detailed analytics
- **Customer Management:** Full CRUD operations for customer profiles
- **Item Classification:** UNSPSC code management for product categorization
- **Multiple Receipt Formats:** A4, A5, and paper roll printing options
- **QR Code Generation:** Automatic QR code generation for receipt verification
- **Payment Method Tracking:** Multiple payment method support (Cash, Card, Check, Mobile, Transfer)

### Technical Architecture

**Frontend Stack:**
- Vue 3 with Composition API
- PrimeVue enterprise components
- Vite build system
- Responsive design (mobile/tablet/desktop)

**Backend Stack:**
- AdonisJS 5 framework
- TypeScript for type safety
- SQLite/PostgreSQL database support
- RESTful API architecture

**DevOps:**
- Docker containerization
- Docker Compose orchestration
- Automated health checks
- Environment-based configuration

---

## 2. PRODUCT WARRANTY STATEMENT

**VURA VSDC Manager Software Warranty**

This product is provided "AS-IS" with the following warranty terms:

### Limited Warranty Period
- **Duration:** 12 months from purchase date
- **Coverage:** Software defects, bugs, and compatibility issues

### Warranty Covers:
1. Software functionality as described in this documentation
2. Bug fixes and patches related to core features
3. Technical support for installation and configuration
4. VSDC API integration assistance

### Warranty Does NOT Cover:
1. Third-party service outages (RRA VSDC, internet connectivity)
2. Data loss due to user error or hardware failure
3. Modifications made by users or unauthorized personnel
4. Misuse or operation outside technical specifications
5. Natural disasters, power failures, or force majeure events

### Support Channels:
- Email: support@ybgroup.rw
- Phone: +250 788 000 000
- Portal: https://support.ybgroup.rw

### Maintenance Updates:
- Critical security patches: Immediate
- Bug fixes: Within 7 business days
- Feature updates: Quarterly releases
- End-of-life notification: 12 months advance notice

---

## 3. USER MANUAL

### Installation & Setup

#### System Requirements

**Server Requirements:**
- OS: Ubuntu 20.04 LTS or later (Linux) / Windows Server 2019+
- RAM: Minimum 4GB (8GB recommended)
- Storage: 20GB free disk space
- CPU: 2+ cores
- Internet: Minimum 5 Mbps connection to VSDC

**Client Requirements:**
- Browser: Chrome 90+, Firefox 88+, Safari 14+
- Resolution: 1024x768 minimum (1920x1080 recommended)
- JavaScript: Enabled
- Cookies: Enabled

#### Installation Steps

1. **Prerequisites Installation**
   ```bash
   sudo apt-get update
   sudo apt-get install nodejs npm git docker docker-compose
   ```

2. **Clone Repository**
   ```bash
   git clone https://github.com/wjonho17-ctrl/vura-dev.git
   cd vura-dev
   ```

3. **Docker Deployment**
   ```bash
   docker-compose up -d
   ```

4. **Manual Installation**
   ```bash
   # Backend setup
   cd yb-vsdc-api
   npm install
   npm run build
   npm start

   # Frontend setup (new terminal)
   cd frontend
   npm install
   npm run dev
   ```

5. **Initial Configuration**
   - Access: http://localhost:3000
   - Default credentials: admin@example.com / password123
   - Configure business TIN, SDC ID, MRC details
   - Sync with VSDC system

### User Interface Guide

#### Navigation Menu
- **Dashboard:** System overview and quick stats
- **Receipts:** Create, view, and manage receipts
- **Stock:** Inventory management and synchronization
- **Customers:** Customer profile management
- **Classifications:** Item classification and UNSPSC codes
- **Reports:** X/Z reports and analytics
- **Settings:** System configuration

#### Creating a Receipt

1. Navigate to **Receipts → New Receipt**
2. Select receipt type (Normal Sale, Refund, etc.)
3. Enter customer information (optional for walk-in customers)
4. Add line items:
   - Click "Add Item"
   - Select item from inventory
   - Enter quantity
   - Discount (optional)
   - Select tax type
5. Verify totals and tax breakdown
6. Select payment method
7. Click "Submit to VSDC"
8. System prints receipt automatically

#### Managing Stock

1. Navigate to **Stock → Inventory**
2. View current stock levels
3. Add stock:
   - Click "Add Stock"
   - Enter item code or select from list
   - Set quantity and action (IN/OUT)
   - Confirm
4. System automatically syncs with VSDC
5. Monitor sync status indicator

#### Generating Reports

1. Navigate to **Reports**
2. Choose report type:
   - **X Report:** Daily non-fiscal report
   - **Z Report:** Daily fiscal closing report
   - **PLU Report:** Item price look-up
3. Select date range
4. Click "Generate"
5. View or export as PDF

### Troubleshooting Guide

**Issue: Cannot connect to VSDC**
- Check internet connection
- Verify VSDC credentials in settings
- Check VSDC service status
- Restart application

**Issue: Receipt not printing**
- Check printer connection
- Verify print settings in configuration
- Check for pending print jobs
- Restart print service

**Issue: Stock sync failed**
- Check VSDC connection
- Verify item classification is complete
- Check for duplicate item codes
- Review error logs

**Issue: Login fails**
- Clear browser cache and cookies
- Reset password if forgotten
- Check user account status in admin panel
- Verify network connectivity

---

## 4. INSTALLATION GUIDE

### Pre-Installation Checklist

- [ ] Server infrastructure prepared
- [ ] Database created and configured
- [ ] VSDC API credentials obtained from RRA
- [ ] SSL certificate configured (for production)
- [ ] Network ports 3000, 3001, 5432 available
- [ ] Printer configured and tested
- [ ] Backup system in place

### Docker Installation (Recommended)

**Step 1: Prepare Environment**
```bash
mkdir -p /opt/vura
cd /opt/vura
cp .env.example .env
nano .env  # Edit configuration
```

**Step 2: Configure Environment Variables**
```
NODE_ENV=production
APP_URL=https://your-domain.com
DB_HOST=postgres
DB_PORT=5432
DB_USER=vura
DB_PASSWORD=secure_password
DB_NAME=vura_db
VSDC_BASE_URL=https://vsdc.rra.gov.rw/api
VSDC_API_KEY=your_api_key
VSDC_TIN=1234567890
VSDC_BHF_ID=001
VSDC_DEVICE_SERIAL=VURA-001
```

**Step 3: Deploy**
```bash
docker-compose up -d
docker-compose logs -f  # Monitor startup
```

**Step 4: Initial Setup**
```bash
docker-compose exec api npm run migrations
docker-compose exec api npm run seed
```

### Manual Installation

**Step 1: Install Dependencies**
```bash
# System packages
sudo apt-get install -y \
  build-essential \
  python3 \
  postgresql \
  postgresql-contrib \
  redis-server \
  git

# Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Step 2: Create Application User**
```bash
sudo useradd -m -s /bin/bash vura
sudo su - vura
```

**Step 3: Clone and Setup Backend**
```bash
git clone https://github.com/wjonho17-ctrl/vura-dev.git
cd vura-dev/yb-vsdc-api
npm install
cp .env.example .env
nano .env  # Configure
npm run migrations
npm run seed
npm run build
pm2 start start.ts --name vura-api
```

**Step 4: Setup Frontend**
```bash
cd ../frontend
npm install
npm run build
# Serve with nginx or other web server
```

**Step 5: Configure Nginx**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location /api {
        proxy_pass http://localhost:3001;
    }
    
    location / {
        root /opt/vura/frontend/dist;
        try_files $uri $uri/ /index.html;
    }
}
```

### Post-Installation Verification

1. **Health Check**
   ```bash
   curl http://localhost:3001/health
   ```

2. **Database Verification**
   ```bash
   psql -U vura -d vura_db -c "SELECT COUNT(*) FROM users;"
   ```

3. **VSDC Connection Test**
   ```bash
   curl -H "X-API-KEY: your_key" https://vsdc.rra.gov.rw/api/health
   ```

4. **Frontend Access**
   - Open http://localhost:3000 in browser
   - Verify all pages load correctly
   - Test login functionality

### Backup Configuration

**Daily Backups**
```bash
# Setup automated backup
0 2 * * * /opt/vura/backup.sh
```

**Backup Script**
```bash
#!/bin/bash
DATE=$(date +%Y%m%d)
BACKUP_DIR=/opt/backups
pg_dump vura_db | gzip > $BACKUP_DIR/vura_db_$DATE.sql.gz
tar -czf $BACKUP_DIR/app_$DATE.tar.gz /opt/vura/
```

---

## 5. PROGRAMMING AND CONFIGURATION MANUAL

### Architecture Overview

```
┌─────────────────────────────────────────────────┐
│          Vue 3 Frontend (Port 3000)              │
│  - Receipt creation and management              │
│  - Inventory management                         │
│  - Reporting and analytics                      │
└────────────────────┬────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
┌───────▼─────────────────┐  ┌───▼──────────────────────┐
│  AdonisJS API           │  │  VSDC API Integration    │
│  (Port 3001)            │  │  (External)              │
│                         │  │                          │
│  Controllers:           │  │  - Receipt Signature     │
│  - Receipts             │  │  - Stock Sync            │
│  - Stock                │  │  - Customer Mgmt         │
│  - Customers            │  │  - Import Workflow       │
│  - Reports              │  │  - Reporting             │
│                         │  │                          │
│  Services:              │  │  RRA VSDC Server         │
│  - Receipt Engine       │  │  (https://vsdc.rra...)   │
│  - Stock Sync           │  │                          │
│  - Template Rendering   │  │                          │
│  - PDF Generation       │  │                          │
│  - Import Workflow      │  │                          │
└───────┬─────────────────┘  └────────────────────────┘
        │
        ▼
┌─────────────────────────┐
│  PostgreSQL Database    │
│  - Receipts             │
│  - Stock Master         │
│  - Customers            │
│  - Electronic Journal    │
│  - Settings             │
└─────────────────────────┘
```

### Configuration Management

#### Environment Variables

**Critical Settings:**
```env
# Application
NODE_ENV=production
APP_URL=https://vura.example.com
APP_KEY=your_app_key_here

# Database
DB_CONNECTION=pg
DB_HOST=localhost
DB_PORT=5432
DB_USER=vura
DB_PASSWORD=secure_password
DB_NAME=vura_db

# VSDC Integration
VSDC_BASE_URL=https://vsdc.rra.gov.rw/api
VSDC_API_KEY=your_vsdc_api_key
VSDC_TIN=1234567890
VSDC_BHF_ID=001
VSDC_DEVICE_SERIAL=VURA-001

# Features
ENABLE_TRAINING_MODE=false
ENABLE_PDF_EXPORT=true
ENABLE_EMAIL_NOTIFICATIONS=false

# Security
JWT_SECRET=your_jwt_secret
CORS_ALLOWED_ORIGINS=https://vura.example.com

# Logging
LOG_LEVEL=info
LOG_DESTINATION=file
```

### Database Schema

**Key Tables:**

```sql
-- Users
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role ENUM('admin', 'operator'),
  created_at TIMESTAMP
);

-- Receipts
CREATE TABLE receipts (
  id SERIAL PRIMARY KEY,
  invoice_no VARCHAR(50) UNIQUE,
  receipt_type CHAR(1),
  customer_name VARCHAR(255),
  customer_tin VARCHAR(20),
  total_amount DECIMAL(15,2),
  tax_amount DECIMAL(15,2),
  payment_method VARCHAR(2),
  sale_date TIMESTAMP,
  sdc_id VARCHAR(50),
  receipt_signature VARCHAR(500),
  created_at TIMESTAMP
);

-- Stock Master
CREATE TABLE stock_master (
  id SERIAL PRIMARY KEY,
  item_code VARCHAR(50) UNIQUE,
  item_name VARCHAR(255),
  quantity INT DEFAULT 0,
  price DECIMAL(15,2),
  classification_code VARCHAR(20),
  sync_status VARCHAR(20),
  last_sync_date TIMESTAMP,
  created_at TIMESTAMP
);

-- Customers
CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  tin VARCHAR(20),
  mobile_no VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  created_at TIMESTAMP
);

-- Electronic Journal
CREATE TABLE electronic_journal (
  id SERIAL PRIMARY KEY,
  receipt_id INT,
  transaction_type VARCHAR(50),
  transaction_data JSON,
  timestamp TIMESTAMP,
  FOREIGN KEY (receipt_id) REFERENCES receipts(id)
);
```

### API Endpoints

#### Receipt Management
```
POST   /api/receipts              - Create receipt
GET    /api/receipts              - List receipts (paginated)
GET    /api/receipts/:id          - Get receipt detail
GET    /api/receipts/:id/print    - Print receipt
GET    /api/receipts/:id/pdf      - Download PDF
POST   /api/receipts/:id/resend   - Resend to VSDC
GET    /api/receipts/stats        - Get statistics
```

#### Stock Management
```
POST   /api/stock/update          - Update stock
GET    /api/stock                 - List stock items
GET    /api/stock/:code/balance   - Get item balance
GET    /api/stock/:code/check     - Check availability
GET    /api/stock/alerts/low      - Low stock alerts
GET    /api/stock/report          - Stock report
GET    /api/stock/sync-status     - Sync status
POST   /api/stock/sync-pending    - Sync pending items
```

#### Customer Management
```
POST   /api/customers             - Create customer
GET    /api/customers             - List customers
GET    /api/customers/:id         - Get customer detail
PUT    /api/customers/:id         - Update customer
DELETE /api/customers/:id         - Delete customer
```

#### Reporting
```
GET    /api/reports/x-daily       - X Report for today
GET    /api/reports/z-daily       - Z Report for today
GET    /api/reports/plu           - PLU Report
GET    /api/reports/sales         - Sales Report
```

### Custom Development

#### Adding a New Feature

1. **Create Database Migration**
   ```bash
   npm run make:migration create_new_table
   ```

2. **Create Service**
   ```bash
   # File: app/services/new_feature_service.ts
   export default class NewFeatureService {
     async doSomething() {
       // Implementation
     }
   }
   ```

3. **Create Controller**
   ```bash
   # File: app/controllers/new_feature_controller.ts
   import NewFeatureService from '../services/new_feature_service.js'
   
   export default class NewFeatureController {
     constructor(private featureService: NewFeatureService) {}
     
     async create({ request, response }) {
       // Handle request
     }
   }
   ```

4. **Add Routes**
   ```bash
   # File: start/routes.ts
   Route.post('/api/feature', 'NewFeatureController.create')
   ```

5. **Frontend Component**
   ```vue
   <!-- File: frontend/src/pages/Feature.vue -->
   <script setup>
   import { ref } from 'vue'
   
   const data = ref(null)
   
   async function fetch() {
     const response = await fetch('/api/feature')
     data.value = await response.json()
   }
   </script>
   ```

### Security Guidelines

- **Authentication:** JWT tokens with 24-hour expiry
- **HTTPS:** Enforce SSL/TLS for all connections
- **Input Validation:** Sanitize and validate all user input
- **SQL Injection:** Use parameterized queries (ORM handles this)
- **CORS:** Restrict to trusted domains only
- **Rate Limiting:** 100 requests/minute per IP
- **Logging:** Log all transaction and access attempts
- **Encryption:** Encrypt sensitive data at rest

### Performance Optimization

- **Database Indexing:** Index on receipt_no, customer_tin, item_code
- **Caching:** Redis for session and report caching
- **Pagination:** Default 20 items per page
- **Lazy Loading:** Load data on demand
- **Compression:** Enable gzip compression
- **CDN:** Serve static assets from CDN

---

## Support & Contact

**Technical Support:**
- Email: dev-support@ybgroup.rw
- Phone: +250 788 123 456
- Hours: Monday-Friday 8:00 AM - 5:00 PM EAT

**Escalation Contact:**
- Manager: engineering@ybgroup.rw
- Emergency: +250 788 999 999

**RRA VSDC Support:**
- Email: support@vsdc.rra.gov.rw
- Portal: https://vsdc.rra.gov.rw/support

---

**Document Version:** 1.0.0  
**Last Updated:** 2026-07-13  
**Next Review:** 2026-08-13
