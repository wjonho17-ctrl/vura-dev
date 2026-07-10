# Vura Ecosystem Architecture & Connection Guide

## System Overview

The Vura ecosystem is a comprehensive healthcare management platform consisting of four main applications connected through APIs and sharing a common infrastructure.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         VURA ECOSYSTEM ARCHITECTURE                      │
└─────────────────────────────────────────────────────────────────────────┘

                        ┌──────────────────────────┐
                        │  Vura Backoffice         │
                        │  (Port 3334)             │
                        │  Central Admin Platform  │
                        └───────────┬──────────────┘
                                    │
                  ┌─────────────────┼─────────────────┐
                  │                 │                 │
         ┌────────▼────────┐ ┌─────▼─────────┐ ┌────▼──────────┐
         │ Vura PMS        │ │ Vura HMS      │ │ Mock EBM API  │
         │ (Port 3333)     │ │ (Port 3335)   │ │ (Port 3500)   │
         │ Pharmacy Mgmt   │ │ E-Prescription│ │ Insurance API │
         └────────┬────────┘ └─────┬─────────┘ └────┬──────────┘
                  │                 │                 │
                  └─────────────────┼─────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
            ┌───────▼────────┐          ┌──────────▼─────────┐
            │  Shared Infrastructure  │  External Services │
            └────────────────┘        └────────────────────┘
```

---

## Applications

### 1. Vura Backoffice (Port 3334)
**Purpose**: Central administration platform for the entire ecosystem

**Role**:
- Manage global locations, pharmacies, hospitals
- Manage transporters and fleet
- Product catalog management
- System configuration and monitoring
- User and role management

**Tech Stack**:
- Backend: AdonisJS v6 (Node.js)
- Frontend: Vue 3 + Inertia.js
- UI: PrimeVue
- Database: PostgreSQL (vura_backoffice)
- Search: Meilisearch

**Key APIs**:
- GET `/api/locations` - List all locations
- GET `/api/pharmacies` - List all pharmacies
- POST `/api/products/sync` - Sync products to PMS
- GET `/api/notifications` - Receive system notifications

### 2. Vura HMS (Port 3335)
**Purpose**: E-Prescription and Healthcare Management System

**Role**:
- Manage prescriptions
- Patient management
- Insurance integration
- Healthcare provider management
- Prescription fulfillment tracking

**Tech Stack**:
- Backend: AdonisJS v6 (Node.js)
- Frontend: Vue 3 + Inertia.js
- UI: PrimeVue
- Database: PostgreSQL (vura_hms)
- Cache: Redis (for session/cache)
- Search: Meilisearch

**Key APIs**:
- POST `/api/prescriptions` - Create prescription
- GET `/api/prescriptions/:id` - Get prescription details
- POST `/api/insurance/verify` - Verify insurance coverage
- GET `/api/patients/:id/insurance` - Patient insurance info

### 3. Vura PMS (Port 3333)
**Purpose**: Pharmacy Management System (Individual Pharmacy)

**Role**:
- Daily sales and stock management
- Inventory management
- POS system
- Customer management
- Prescription fulfillment

**Tech Stack**:
- Backend: AdonisJS v6 (Node.js)
- Frontend: Vue 3 + Inertia.js
- Database: PostgreSQL (vura_pms)
- Cache: Redis
- Search: Meilisearch

**Key APIs**:
- GET `/api/products` - Get product catalog (from Backoffice)
- POST `/api/orders` - Create sales order
- GET `/api/inventory` - Check stock levels
- POST `/api/notifications` - Send notifications to Backoffice

### 4. Mock EBM API (Port 3500)
**Purpose**: Mock External Insurance/EBM (Electronic Benefit Management) API

**Role**:
- Simulate insurance company API
- Verify patient eligibility
- Approve/deny claims
- Return insurance products

**Tech Stack**:
- Backend: Node.js + Express
- No database (in-memory mocks)

**Endpoints**:
- GET `/api/insurance-products` - List insurance products
- POST `/api/verify-prescription` - Verify prescription eligibility
- GET `/api/patients/:id/insurance` - Get patient insurance status
- POST `/api/claims` - Submit insurance claim
- GET `/api/claims/:id` - Get claim status

---

## Shared Infrastructure

### 1. PostgreSQL Database (Port 5432)
**Purpose**: Persistent data storage

**Databases**:
- `backoffice` - Backoffice application data
- `hms` - HMS application data
- `medbook` - Alternative/legacy database

**Credentials**:
- User: postgres
- Password: (system default)
- Host: localhost
- Port: 5432

**Connection String**:
```
postgresql://postgres@localhost:5432/backoffice
```

### 2. Redis Cache (Port 6379)
**Purpose**: Session management, caching, queues

**Usage**:
- Session storage for HMS (configured via `.env`)
- Cache layer for Meilisearch results
- Job queues for background tasks

**Connection String**:
```
redis://localhost:6379
```

### 3. Meilisearch (Port 7700)
**Purpose**: Full-text search and indexing

**Features**:
- Product search
- Prescription search
- Patient search
- Fast filtering and sorting

**Master Key**: `UXo7WQ9Pys416bawtsYpR2opjCl6JN_Fwh22OmZVqHY`

**Admin Panel**: http://localhost:7700

### 4. Mailpit (Port 8025)
**Purpose**: Email testing and visualization

**Features**:
- Intercept all outgoing emails
- View email content in web UI
- Test email functionality without real SMTP

**Web UI**: http://localhost:8025

**SMTP Configuration**:
- Host: 127.0.0.1
- Port: 1025
- No authentication needed

### 5. Storage (S3/MinIO)
**Purpose**: File storage for documents, images, prescriptions

**Services**:
- MinIO (Object storage compatible with S3)
- Or LocalStack for AWS S3 emulation

**Buckets**:
- `vura-backoffice` - Backoffice files
- `vura-hms` - HMS files
- `vura-pms` - PMS files

---

## Inter-Application Communication

### API Authentication

Applications communicate using Bearer Token authentication. Each app has:
- An API token (generated in admin panel)
- Token is passed in `Authorization: Bearer <TOKEN>` header

### Configuration

Each app's `.env` file contains:

```env
# Allow list of API URLs that can call this app
ALLOW_API_URL_LIST=http://localhost:3333,http://localhost:3334,http://localhost:3335

# API tokens for calling other apps
API_BACKOFFICE_TOKEN=<token_generated_in_backoffice>
API_BACKOFFICE_TOKEN_NAME=vura-backoffice-token

API_HMS_TOKEN=<token_generated_in_hms>
API_HMS_TOKEN_NAME=vura-hms-token

API_PMS_TOKEN=<token_generated_in_pms>
API_PMS_TOKEN_NAME=vura-pms-token
```

### Data Flow

**Backoffice → PMS (Product Sync)**
```
1. Admin updates product catalog in Backoffice
2. Backoffice calls: POST /api/products/sync (PMS)
3. PMS receives and stores products
4. PMS indexes products in Meilisearch
5. Backoffice receives confirmation
```

**PMS/HMS → Backoffice (Notifications)**
```
1. Event occurs in PMS (e.g., high stock alert)
2. PMS calls: POST /api/notifications (Backoffice)
3. Backoffice logs notification
4. Backoffice admins see alert in dashboard
```

**HMS → Mock EBM (Insurance Verification)**
```
1. HMS receives prescription
2. HMS calls: POST /verify-prescription (Mock EBM API)
3. Mock EBM API returns verification status
4. HMS proceeds with prescription fulfillment
```

---

## Database Schema Overview

### Backoffice Database (vura_backoffice)

Key tables:
```
├── locations
│   └── name, address, coordinates, timezone
├── pharmacies
│   └── name, location_id, manager_id, contact
├── hospitals
│   └── name, location_id, director_id, beds
├── transporters
│   └── name, location_id, vehicle_info, routes
├── products
│   └── name, sku, description, price, meilisearch_id
├── product_categories
│   └── name, description
├── users
│   └── email, name, role, permissions
├── api_tokens
│   └── name, token, app_id, permissions
└── notifications
    └── type, message, read_status, created_at
```

### HMS Database (vura_hms)

Key tables:
```
├── patients
│   └── name, dob, contact, insurance_id
├── prescriptions
│   └── patient_id, doctor_name, medicines, status
├── medicines
│   └── name, dosage, manufacturer, price
├── insurance_products
│   └── name, code, coverage_percentage
├── prescription_items
│   └── prescription_id, medicine_id, quantity
└── claims
    └── prescription_id, amount, status, ebm_reference
```

### PMS Database (vura_pms)

Key tables:
```
├── inventory
│   └── product_id, quantity, reorder_level
├── sales_orders
│   └── customer_id, total_amount, date
├── order_items
│   └── order_id, product_id, quantity, price
├── customers
│   └── name, phone, email, loyalty_points
└── stock_movements
    └── product_id, type, quantity, reason
```

---

## Environment Configuration

### Backoffice (.env)

```env
# Server
PORT=3334
HOST=0.0.0.0
NODE_ENV=development

# Database
DB_CONNECTION=pg
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=
DB_DATABASE=backoffice

# Encryption
APP_KEY=<generated_key>

# Mail
SMTP_HOST=127.0.0.1
SMTP_PORT=1025

# Search
MEILISEARCH_HOST=localhost:7700
MEILISEARCH_API_KEY=UXo7WQ9Pys416bawtsYpR2opjCl6JN_Fwh22OmZVqHY

# File Storage
DRIVE_DISK=s3
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
AWS_REGION=us-east-1
AWS_S3_ENDPOINT=http://localhost:9000  # or http://localhost:4566 for LocalStack
S3_BUCKET=vura-backoffice

# Inter-app APIs
ALLOW_API_URL_LIST=http://localhost:3333,http://localhost:3335
```

### HMS (.env)

```env
# Server
PORT=3335
HOST=0.0.0.0
NODE_ENV=development

# Database
DB_CONNECTION=pg
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=
DB_DATABASE=hms

# Encryption
APP_KEY=<generated_key>

# Redis (Session storage)
REDIS_HOST=localhost
REDIS_PORT=6379

# Mail
SMTP_HOST=127.0.0.1
SMTP_PORT=1025

# Search
MEILISEARCH_HOST=localhost:7700

# File Storage
DRIVE_DISK=s3
AWS_S3_ENDPOINT=http://localhost:9000
S3_BUCKET=vura-hms

# External EBM API
EBM_API_URL=http://localhost:3500
EBM_API_KEY=<if_needed>

# Inter-app APIs
ALLOW_API_URL_LIST=http://localhost:3333,http://localhost:3334
API_BACKOFFICE_URL=http://localhost:3334
API_BACKOFFICE_TOKEN=<generated_in_backoffice>
```

### PMS (.env)

```env
# Server
PORT=3333
HOST=0.0.0.0
NODE_ENV=development

# Database
DB_CONNECTION=pg
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_DATABASE=vura_pms or medbook

# Redis (Cache)
REDIS_HOST=localhost
REDIS_PORT=6379

# Search
MEILISEARCH_HOST=localhost:7700

# File Storage
DRIVE_DISK=s3
AWS_S3_ENDPOINT=http://localhost:9000
S3_BUCKET=vura-pms

# Inter-app APIs
ALLOW_API_URL_LIST=http://localhost:3334,http://localhost:3335
API_BACKOFFICE_URL=http://localhost:3334
API_BACKOFFICE_TOKEN=<generated_in_backoffice>
API_HMS_URL=http://localhost:3335
API_HMS_TOKEN=<generated_in_hms>
```

---

## Connection Verification Checklist

### 1. Services Running

```bash
# Check all Docker containers
docker-compose ps

# Expected output:
# postgres    - running (healthy)
# redis       - running (healthy)
# mailpit     - running (healthy)
# meilisearch - running (healthy)
# <s3_service> - running
```

### 2. Database Connectivity

```bash
# Test PostgreSQL
docker exec vura-postgres psql -U postgres -c "\l" 

# Check databases exist
# - backoffice
# - hms
# - medbook (or vura_pms)
```

### 3. Application APIs

**Backoffice**
```bash
# Should return HTML (redirects to login) or API response
curl http://localhost:3334

# Check API is responding
curl http://localhost:3334/health 2>/dev/null || echo "App starting..."
```

**HMS**
```bash
curl http://localhost:3335
```

**PMS**
```bash
curl http://localhost:3333
```

**Mock EBM API**
```bash
curl http://localhost:3500/health
# Expected: {"status":"ok","service":"Mock EBM API"}
```

### 4. External Services

**Mailpit**
- Open http://localhost:8025
- Check if emails appear when apps send them

**Meilisearch**
- Open http://localhost:7700
- View search indices

**Redis**
```bash
docker exec vura-redis redis-cli ping
# Expected: PONG
```

### 5. Inter-App Communication

Test API calls between apps:

```bash
# Backoffice → HMS (assuming token is set)
curl -X GET http://localhost:3335/api/endpoint \
  -H "Authorization: Bearer <HMS_API_TOKEN>" \
  -H "Content-Type: application/json"

# PMS → Backoffice
curl -X GET http://localhost:3334/api/products \
  -H "Authorization: Bearer <BACKOFFICE_API_TOKEN>" \
  -H "Content-Type: application/json"
```

---

## Debugging & Troubleshooting

### View Service Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f postgres
docker-compose logs -f redis

# Application logs (in terminal running npm run dev)
# Look for error messages and stack traces
```

### Check Service Health

```bash
# See which containers are healthy/unhealthy
docker-compose ps

# If unhealthy, check logs
docker-compose logs postgres  # or service name
```

### Database Connection Issues

**Problem**: `connection refused`

**Solution**:
1. Verify PostgreSQL is running: `docker-compose ps postgres`
2. Check it's healthy: `docker-compose ps` shows "healthy"
3. Verify connection string in `.env`
4. Check firewall isn't blocking port 5432

### API Connection Issues

**Problem**: `Cannot reach other app`

**Solution**:
1. Verify both apps are running
2. Check `.env` has correct URL for other app
3. Check API token is correct
4. Look for CORS errors in browser console
5. Verify `ALLOW_API_URL_LIST` includes calling app's URL

### Meilisearch Issues

**Problem**: `Meilisearch unhealthy` or `connection refused`

**Solution**:
```bash
# Check logs
docker-compose logs meilisearch

# Restart
docker-compose restart meilisearch

# Wait 10 seconds and check again
docker-compose ps meilisearch
```

### Email Not Appearing in Mailpit

**Problem**: Emails not showing in Mailpit UI

**Solution**:
1. Verify `SMTP_HOST=127.0.0.1` and `SMTP_PORT=1025`
2. Check Mailpit is running: `docker-compose ps mailpit`
3. Open http://localhost:8025 in browser
4. Try sending test email from app admin panel
5. Check app logs for email send errors

---

## Data Synchronization

### Products from Backoffice to PMS

1. Admin edits product in Backoffice
2. Backoffice triggers webhook or scheduled job
3. Calls PMS API: `POST /api/products/sync`
4. PMS receives and stores product
5. Meilisearch index is updated
6. Confirmation sent back

### Notifications from PMS/HMS to Backoffice

1. Event in PMS/HMS (e.g., low stock)
2. App calls Backoffice: `POST /api/notifications`
3. Backoffice logs and alerts admin
4. Admin sees in dashboard

### Prescription Verification Flow

1. HMS prescriber creates prescription
2. HMS calls Mock EBM API: `POST /verify-prescription`
3. Mock EBM validates and returns status
4. HMS stores verification result
5. PMS can fulfill prescription

---

## Performance Optimization

### Caching Strategy

**Redis Cache**:
- Session data (HMS)
- Frequently accessed products (PMS)
- User permissions (All apps)

**Meilisearch Cache**:
- Product search results
- Patient search results
- Prescription filters

### Query Optimization

**Database Indices**:
- User emails (login)
- Product SKU (search)
- Patient ID (lookup)
- Prescription status (filtering)

**API Response Caching**:
- GET endpoints cached for 5-10 min
- POST/PUT/DELETE bypass cache

---

## Security Considerations

### API Authentication
- Token-based (Bearer tokens)
- Tokens stored hashed in database
- Tokens expire after 30 days
- Regenerate tokens regularly

### Database Security
- PostgreSQL user per application (in production)
- Encrypted passwords
- VPC/network isolation (in production)

### HTTPS/TLS
- Development: HTTP only (localhost)
- Production: Must use HTTPS
- SSL certificates required
- Redirect HTTP → HTTPS

### Data Privacy
- PII encrypted (patient data)
- Logs don't contain sensitive data
- Audit trails for compliance
- GDPR compliance measures

---

## Production Deployment

### Pre-Deployment Checklist

- [ ] All `.env` files updated with production values
- [ ] Database backups configured
- [ ] SSL certificates installed
- [ ] API tokens generated and securely stored
- [ ] Database credentials updated
- [ ] Email provider configured
- [ ] S3 buckets created (real AWS)
- [ ] CDN/reverse proxy configured
- [ ] Monitoring & alerting setup
- [ ] Load balancing configured (if needed)

### Docker Production Build

```bash
# Build images
docker build -t vura-backoffice:latest ./vura-backoffice-develop
docker build -t vura-hms:latest ./vura-hms-main
docker build -t vura-pms:latest ./vura-pms-main

# Push to registry
docker push <registry>/vura-backoffice:latest
docker push <registry>/vura-hms:latest
docker push <registry>/vura-pms:latest

# Deploy with production docker-compose.yml
docker-compose -f docker-compose.prod.yml up -d
```

---

## Monitoring & Maintenance

### Health Checks
- Database connection pooling
- Redis connectivity
- Meilisearch indexing
- API responsiveness

### Backup Strategy
- Daily database backups
- Point-in-time recovery
- S3 bucket versioning
- Configuration backups

### Log Monitoring
- Application error logs
- Database query logs
- API access logs
- Failed transaction logs

---

## Contact & Support

- **Documentation**: See README.md and SETUP.md
- **Architecture Issues**: Review this document
- **Database Questions**: Check database schema section
- **API Integration**: See inter-app communication section

---

**Last Updated**: 2026-07-10
