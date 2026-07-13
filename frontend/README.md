# VSDC Manager - Frontend

Modern electronic billing and stock management system for Rwanda EBM 2.1 compliance.

## Overview

VSDC Manager is a Vue 3 application built with:
- **Vue 3** - Progressive JavaScript framework
- **PrimeVue** - Enterprise UI component library
- **PrimeFlex** - Responsive CSS utility framework
- **Vite** - Next generation frontend tooling

## Features

- 🏢 **Multi-Branch Operations** - Manage multiple business branches from centralized dashboard
- 📄 **Billing & Invoicing** - EBM 2.1 compliant invoice and receipt generation
- 📦 **Stock Management** - Real-time inventory tracking and management
- 👥 **Customer Management** - Comprehensive customer profiles and history
- 📊 **Reporting & Analytics** - Detailed business reports and insights
- 🔐 **Compliance & Security** - Audit trails, encryption, and RRA regulatory compliance
- 👤 **User Management** - Role-based access control (Admin, Manager, Operator)
- 📱 **Responsive Design** - Mobile-friendly interface for all devices

## Installation

### Prerequisites
- Node.js 16+ and npm 8+

### Setup

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Authentication

The app supports two authentication modes:

### Administrator
- Full system administration
- User management and settings
- System-wide reporting

### Device Operator  
- Billing and invoicing
- Stock management
- Customer management

## Key Pages

- **Landing** - Public homepage with features and compliance info
- **Login** - Authentication with admin/operator modes
- **Dashboard** - Operator workspace with sales metrics
- **AdminDashboard** - Admin overview with system metrics and user management
- **NotFound** - 404 error page

## Building for Production

```bash
npm run build
npm run preview
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers

---

For backend API documentation, see the main README at the project root.
