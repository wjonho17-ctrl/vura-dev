# Vura Backoffice - Central Administration Documentation

**Vura Backoffice** is the core management engine for the Vura ecosystem. it serves as the "Super-Admin" platform used to configure, monitor, and manage all interconnected Vura applications, including **Vura PMS**, **Vura Fleet**, and **Vura HMS**.

----------

## 🏛️ System Role & Architecture

The Backoffice functions as the source of truth for the ecosystem's shared entities.

-   **Centralized Orchestration:** Manage global locations, pharmacies, hospitals, and transporters.
    
-   **Product Management:** Pushes global product catalogs to individual PMS instances via API.
    
-   **Cross-App Communication:** Receives real-time notifications from PMS instances and interacts with Fleet/HMS for logistical oversight.
    
-   **Multi-Tenant Provisioning:** The starting point for onboarding new pharmacies or medical facilities into the SaaS network.
    

----------

## 🛠️ Technical Stack

**Layer**

**Technology**

**Backend**

AdonisJS v6 (Node.js)

**Database**

PostgreSQL 17

**Frontend Bridge**

Inertia.js

**Frontend Framework**

Vue.js

**UI Library**

PrimeVue

**Email Testing**

Mailpit (Required for local development)

----------

## 🔌 Integration Logic

The Backoffice maintains a bidirectional relationship with peripheral apps:

1.  **PMS Integration:** * **Outgoing:** Syncing product master data and global settings.
    
    -   **Incoming:** Receiving system-wide notifications and activity logs.
        
2.  **Fleet & HMS:** Currently supports basic listing and information management for transporters and hospitals, with deep integration for future phases.
    

----------

## 🏗️ Infrastructure & Setup

### 1. Environment Configuration (.env)

Follow the standard Vura initialization protocol:

1.  **Copy the template:**
    
    Bash
    
    ```
    cp .env.example .env
    
    ```
    
2.  **Update the `.env` file:**
    

Bash

```
# --- APP SETTINGS ---
PORT=3334
HOST=0.0.0.0
NODE_ENV=development
# Generate using: node ace generate:key
APP_KEY= 

# --- DATABASE (PostgreSQL 17) ---
DB_CONNECTION=pg
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=root
DB_PASSWORD=root
DB_DATABASE=vura_backoffice

# --- MAIL SETTINGS (Mailpit) ---
SMTP_HOST=127.0.0.1
SMTP_PORT=1025

```

### 2. Required Services (Docker)

Ensure **PostgreSQL 17** and **Mailpit** are running.

YAML

```
services:
  # Database
  backoffice-db:
    image: postgres:17
    ports: ["5432:5432"]
    environment:
      POSTGRES_DB: vura_backoffice
      POSTGRES_USER: root
      POSTGRES_PASSWORD: root

  # Mail Testing
  mailpit:
    image: axllent/mailpit
    ports:
      - "1025:1025" # SMTP
      - "8025:8025" # Web UI

```

----------

## 🏃 Operational Commands

### 1. Initialization

Bash

```
# Generate the mandatory encryption key
node ace generate:key

# Setup database schema
node ace migration:run

```

### 2. Background Workers

The Backoffice uses a job queue primarily for handling system emails and notifications.

**Run the mailer queue:**

Bash

```
node ace job:run

```

----------

## 👥 User Roles & Access Control

The current version focuses on high-level administrative access, with granular roles planned for future releases:

-   **Admin:** Full access to system configuration and global entity management.
    
-   **Manager:** Oversight of operational data (Pharmacies/Transporters).
    
-   **System-Specific Roles (Roadmap):** Targeted roles for PMS, Fleet, and HMS auditors.
    

----------

### Comparison: PMS vs. Backoffice

While **Vura PMS** handles the _day-to-day sales and stock_ of a single pharmacy, **Vura Backoffice** handles the _creation and configuration_ of that pharmacy within the YB Group network.

Since you've got the two main pillars (PMS and Backoffice) documented, would you like to tackle the **Vura Fleet** or **Vura HMS** documentation next to complete the ecosystem overview?
