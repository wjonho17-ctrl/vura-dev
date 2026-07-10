# Vura HMS - Complete Implementation Plan
## Hospital Management System - Finalized Specification

---

## 📋 Project Overview

**Vura HMS** is a comprehensive Hospital Management System integrating:
- Electronic Medical Records (EMR)
- Electronic Health Records (EHR)
- Electronic Patient Records (EHR)
- Insurance management
- Prescription fulfillment via PMS
- SMS notifications
- Role-based access control
- Complete audit trail

**Status**: Complete finalization with PrimeVue UI, all features

---

## 🏗️ System Architecture

### Tech Stack
- **Backend**: AdonisJS 6.18 (Node.js)
- **Frontend**: Vue 3 + Inertia.js + PrimeVue 4.4
- **Database**: PostgreSQL 16
- **Cache**: Redis
- **Search**: Meilisearch
- **Storage**: MinIO (S3-compatible)
- **Notifications**: SMS (Brevo/Custom), In-app
- **External APIs**: WHO API, PMS API, Insurance APIs

### Core Modules
1. **Authentication & Authorization**
   - Role-based access control (RBAC)
   - Health center-based multi-tenancy
   - Session management

2. **Patient Management**
   - Patient registration (national ID)
   - Insurance management
   - Patient history & records
   - Patient search & filtering

3. **Practitioner Management**
   - Practitioner profiles & qualifications
   - Department assignment
   - Availability management
   - Queue management

4. **Clinical Operations**
   - Patient assignment to practitioners
   - Symptom documentation
   - Diagnosis (WHO diseases API)
   - Prescriptions
   - Exams & lab tests
   - Treatment plans
   - Medical history

5. **Prescription Management**
   - Prescription creation
   - SMS notifications to patients
   - Prescription codes (unique IDs)
   - Integration with PMS
   - Medicine fulfillment tracking

6. **Insurance Management**
   - Insurance provider integration
   - Patient insurance verification
   - Coverage checking
   - Claims management

7. **Notifications & SMS**
   - SMS to patient (prescriptions, recalls, appointments)
   - In-app notifications
   - Email notifications
   - Appointment reminders

8. **Reporting & Analytics**
   - Patient statistics
   - Practitioner performance
   - Disease patterns
   - Insurance claims
   - Revenue tracking

9. **Security & Compliance**
   - Data encryption
   - Audit trail
   - HIPAA/Healthcare compliance
   - Patient data protection
   - Access logs

---

## 🗄️ Database Schema

### Core Tables

#### Health Centers
```
health_centers:
  id (UUID)
  name (string) - required
  type (enum: clinic, health_center, chu, hospital) - required
  public_code (string, 6-char hex) - unique, auto-generated
  address (string)
  phone (string)
  email (string)
  logo (string - file path)
  settings (JSON - configuration)
  is_active (boolean)
  created_at (timestamp)
  updated_at (timestamp)
```

#### Users & Roles
```
users:
  id (UUID)
  email (string) - unique, required
  password (string) - hashed
  first_name (string)
  last_name (string)
  phone (string)
  avatar (string - file path)
  health_center_id (UUID) - foreign key
  role_id (UUID) - foreign key
  is_active (boolean)
  last_login (timestamp)
  created_at (timestamp)
  updated_at (timestamp)

roles:
  id (UUID)
  name (enum: admin, receptionist, nurse, doctor, surgeon, specialist, etc)
  permissions (JSON - array of permission strings)
  health_center_id (UUID)
  created_at (timestamp)

role_permissions:
  id (UUID)
  role_id (UUID)
  permission (string)
  resource (string) - patient, prescription, exam, etc
  action (string) - view, create, edit, delete
```

#### Patients
```
patients:
  id (UUID)
  national_id (string) - required, unique per health_center
  first_name (string) - required
  last_name (string) - required
  date_of_birth (date) - required
  gender (enum: male, female) - required
  phone (string) - required
  email (string)
  address (string)
  city (string)
  postal_code (string)
  emergency_contact_name (string)
  emergency_contact_phone (string)
  is_minor (boolean)
  tutor_national_id (string) - if minor
  tutor_name (string) - if minor
  health_center_id (UUID) - foreign key
  is_active (boolean)
  created_at (timestamp)
  updated_at (timestamp)

patient_insurances:
  id (UUID)
  patient_id (UUID) - foreign key
  insurance_id (UUID) - foreign key
  policy_number (string)
  coverage_percentage (integer)
  is_primary (boolean)
  valid_from (date)
  valid_until (date)
  created_at (timestamp)

patient_history:
  id (UUID)
  patient_id (UUID) - foreign key
  action (string) - created, registered, updated
  details (JSON)
  user_id (UUID) - who did the action
  created_at (timestamp)
```

#### Practitioners
```
practitioners:
  id (UUID)
  user_id (UUID) - foreign key (same as users.id)
  license_number (string) - required
  specialization (string) - required
  department (string)
  health_center_id (UUID) - foreign key
  qualifications (JSON - array of qualifications)
  is_available (boolean)
  consultation_fee (decimal)
  created_at (timestamp)
  updated_at (timestamp)
```

#### Consultations & Queues
```
consultations:
  id (UUID)
  patient_id (UUID) - foreign key
  practitioner_id (UUID) - foreign key
  department (string)
  service_type (string) - general, specialist, emergency, etc
  status (enum: pending, assigned, in_progress, completed, cancelled)
  notes (text)
  started_at (timestamp)
  completed_at (timestamp)
  health_center_id (UUID)
  created_at (timestamp)
  updated_at (timestamp)

consultation_queue:
  id (UUID)
  consultation_id (UUID) - foreign key
  practitioner_id (UUID) - foreign key
  position (integer) - queue position
  status (enum: waiting, called, in_progress, completed)
  picked_at (timestamp)
  completed_at (timestamp)
  created_at (timestamp)
```

#### Symptoms & Diagnosis
```
symptoms:
  id (UUID)
  consultation_id (UUID) - foreign key
  symptom (string) - required
  severity (enum: mild, moderate, severe)
  duration (string)
  notes (text)
  created_at (timestamp)

diagnoses:
  id (UUID)
  consultation_id (UUID) - foreign key
  icd10_code (string) - WHO disease code
  disease_name (string)
  description (text)
  severity (enum: mild, moderate, severe)
  is_primary (boolean)
  confirmed_date (date)
  created_at (timestamp)
```

#### Prescriptions
```
prescriptions:
  id (UUID) - also serves as prescription_code
  patient_id (UUID) - foreign key - REQUIRED
  consultation_id (UUID) - foreign key - REQUIRED
  practitioner_id (UUID) - foreign key
  prescription_code (string) - unique, generated from ID
  status (enum: draft, active, fulfilled, cancelled, expired)
  sms_sent (boolean)
  sms_sent_at (timestamp)
  sms_phone (string)
  pms_sync (boolean) - synced to pharmacy
  pms_sync_at (timestamp)
  expiry_date (date)
  notes (text)
  health_center_id (UUID)
  created_at (timestamp)
  updated_at (timestamp)

prescription_items:
  id (UUID)
  prescription_id (UUID) - foreign key
  medicine_name (string) - required
  quantity (integer) - required
  dosage (string)
  frequency (string) - e.g., "3 times daily"
  duration (string) - e.g., "7 days"
  instructions (text)
  created_at (timestamp)

prescription_sms_log:
  id (UUID)
  prescription_id (UUID)
  patient_phone (string)
  message_content (text)
  status (enum: pending, sent, failed)
  sent_at (timestamp)
  error_message (text)
  created_at (timestamp)
```

#### Exams & Lab Tests
```
exams:
  id (UUID)
  consultation_id (UUID) - foreign key
  patient_id (UUID) - foreign key
  exam_type (string) - blood_test, x_ray, ultrasound, etc
  exam_name (string)
  status (enum: pending, completed, analysing, results_ready)
  ordered_date (date)
  scheduled_date (date)
  completed_date (date)
  notes (text)
  health_center_id (UUID)
  created_at (timestamp)
  updated_at (timestamp)

exam_results:
  id (UUID)
  exam_id (UUID) - foreign key
  result_name (string)
  result_value (string)
  result_unit (string)
  reference_range (string)
  is_abnormal (boolean)
  notes (text)
  created_at (timestamp)
```

#### Insurance
```
insurances:
  id (UUID)
  name (string) - insurance provider name
  code (string) - unique code
  contact_person (string)
  phone (string)
  email (string)
  api_endpoint (string) - for API integration
  api_key (string) - encrypted
  is_active (boolean)
  created_at (timestamp)

insurance_settings:
  id (UUID)
  health_center_id (UUID)
  insurance_id (UUID)
  is_accepted (boolean)
  coverage_percentage (integer)
  requires_approval (boolean)
  created_at (timestamp)
```

#### Notifications
```
notifications:
  id (UUID)
  user_id (UUID) - foreign key
  type (enum: sms, email, in_app)
  title (string)
  message (text)
  reference_type (string) - patient, prescription, exam, etc
  reference_id (UUID)
  is_read (boolean)
  is_sent (boolean)
  sent_at (timestamp)
  created_at (timestamp)

sms_notifications:
  id (UUID)
  patient_id (UUID)
  phone (string)
  message (text)
  status (enum: pending, sent, failed)
  sent_at (timestamp)
  error_message (text)
  created_at (timestamp)
```

#### Audit & History
```
audit_logs:
  id (UUID)
  user_id (UUID)
  action (string) - viewed, created, updated, deleted
  resource (string) - patient, prescription, exam, etc
  resource_id (UUID)
  changes (JSON) - what changed
  ip_address (string)
  user_agent (string)
  health_center_id (UUID)
  created_at (timestamp)
```

---

## 🔌 API Endpoints

### Authentication
```
POST   /auth/register          - Register new user
POST   /auth/login             - Login
POST   /auth/logout            - Logout
POST   /auth/refresh           - Refresh token
GET    /auth/me                - Get current user
POST   /auth/password-reset    - Request password reset
POST   /auth/verify-email      - Verify email
```

### Health Centers
```
POST   /health-centers         - Create health center (admin)
GET    /health-centers/:id     - Get health center details
PUT    /health-centers/:id     - Update health center
GET    /health-centers/:id/public-code - Get public code
POST   /health-centers/:id/users - Add user to health center
```

### Patients
```
POST   /patients               - Register new patient (receptionist)
GET    /patients               - List patients (with filtering)
GET    /patients/:id           - Get patient details
PUT    /patients/:id           - Update patient
GET    /patients/:id/history   - Get patient history
GET    /patients/:id/insurances - Get patient insurances
POST   /patients/:id/insurances - Add insurance to patient
GET    /patients/search        - Search patients by ID/name/phone
```

### Practitioners
```
GET    /practitioners          - List practitioners
GET    /practitioners/:id      - Get practitioner details
PUT    /practitioners/:id      - Update practitioner
GET    /practitioners/:id/availability - Get availability
POST   /practitioners/:id/queue - Get patient queue
```

### Consultations
```
POST   /consultations          - Create consultation (receptionist)
GET    /consultations          - List consultations
GET    /consultations/:id      - Get consultation details
PUT    /consultations/:id      - Update consultation
POST   /consultations/:id/assign - Assign to practitioner
GET    /consultations/:id/queue - Get position in queue
```

### Prescriptions
```
POST   /prescriptions          - Create prescription (practitioner)
GET    /prescriptions          - List prescriptions
GET    /prescriptions/:id      - Get prescription details
PUT    /prescriptions/:id      - Update prescription
DELETE /prescriptions/:id      - Cancel prescription
GET    /prescriptions/:code    - Get by prescription code
POST   /prescriptions/:id/send-sms - Send SMS notification
GET    /prescriptions/:id/sms-log - Get SMS history
POST   /prescriptions/:id/sync-to-pms - Sync to pharmacy
```

### Symptoms & Diagnosis
```
POST   /consultations/:id/symptoms - Add symptoms
GET    /consultations/:id/symptoms - Get symptoms
POST   /consultations/:id/diagnoses - Add diagnosis
GET    /consultations/:id/diagnoses - Get diagnoses
```

### Exams
```
POST   /exams                  - Order exam
GET    /exams                  - List exams
GET    /exams/:id              - Get exam details
PUT    /exams/:id              - Update exam
POST   /exams/:id/results      - Add exam results
GET    /exams/:id/results      - Get exam results
```

### Insurance
```
GET    /insurances             - List insurances
GET    /insurances/:id         - Get insurance details
POST   /patients/:id/verify-insurance - Verify patient insurance
GET    /patients/:id/coverage  - Get coverage information
```

### Notifications & SMS
```
POST   /notifications/sms      - Send SMS to patient
POST   /notifications/email    - Send email
GET    /notifications          - Get user notifications
PUT    /notifications/:id/read - Mark notification as read
```

### Search & Dashboard
```
GET    /search                 - Global search (patient, prescription, exam, etc)
GET    /dashboard              - Get role-based dashboard
GET    /reports/statistics     - Get health center statistics
GET    /reports/diseases       - Disease statistics
GET    /reports/practitioners  - Practitioner statistics
```

---

## 🎨 UI Components (PrimeVue)

### Core Components
- **DataTable**: Patient list, consultation queue, prescriptions (with filtering, sorting, pagination)
- **Card**: Patient card, consultation card, prescription card
- **Form**: Patient registration, prescription creation, exam ordering
- **Dialog**: Confirmation dialogs, detail modals
- **ProgressBar**: Queue position, treatment progress
- **Badge**: Status badges (pending, active, completed, cancelled)
- **Tag**: Insurance tags, department tags, severity tags
- **Button**: Action buttons (Create, Assign, Pick, Send SMS, etc)
- **Dropdown**: Role selector, department selector, insurance selector
- **Menu**: Navigation menu (role-based)
- **Toast**: Notifications (success, error, warning, info)
- **Sidebar**: Navigation sidebar
- **Toolbar**: Search and filter toolbar
- **Tabs**: Patient history, consultations, prescriptions, exams
- **Accordion**: Expandable sections for detailed information
- **InputText**: Search inputs, text fields
- **InputNumber**: Quantity, dosage inputs
- **Checkbox/RadioButton**: Yes/no selections
- **DatePicker**: Date of birth, appointment dates
- **MultiSelect**: Select multiple insurances, symptoms

### Layout Components
- **Navbar**: Top navigation with search, notifications, user menu
- **Sidebar**: Left navigation (role-based menu items)
- **Dashboard**: Role-based dashboard layout
- **PatientView**: Complete patient information layout
- **ConsultationView**: Consultation workflow
- **PrescriptionForm**: Prescription creation form
- **ExamOrderForm**: Exam ordering form
- **ReportsView**: Analytics and reports

---

## 🔐 Security & Access Control

### Role-Based Permissions

#### Admin
- All access across health center
- Manage users and roles
- View all patients, consultations, prescriptions
- Manage insurance settings
- View all reports and audit logs

#### Receptionist
- Register patients (only with accepted insurances)
- Assign patients to practitioners
- View patient list
- View patient details
- Manage appointments
- Send SMS notifications
- Cannot view medical records

#### Nurse
- View patient medical records
- Add symptoms to consultation
- View prescriptions
- Order exams
- Update patient vitals
- Cannot create diagnoses
- Cannot modify prescriptions

#### Doctor/Specialist
- Full access to patient medical records
- Create/modify diagnoses
- Create/modify prescriptions
- Order exams
- Create treatment plans
- View own consultations and patients

#### Surgeon
- Full access to surgical patients
- Similar to doctor but limited to surgical cases

### Data Protection
- All patient data encrypted at rest
- Role-based field-level access
- Audit trail for all data access
- SMS notification logging
- Patient data cannot be viewed by unauthorized users

---

## 📱 Prescription & SMS Flow

### Prescription Creation Flow
1. Practitioner creates prescription
2. Add medicine items (name, quantity, dosage, frequency, duration)
3. Save prescription
4. SMS automatically sent to patient with:
   - "Prescription Code: [ID]"
   - "Medicines:"
   - "1. Medicine Name - Quantity x Dosage, [Frequency], [Duration]"
   - "Please bring this code to pharmacy"
5. SMS log created
6. Prescription synced to PMS
7. Pharmacist fulfills prescription
8. HMS receives fulfillment notification
9. Patient history updated

### SMS Content Example
```
Prescription Code: RX-2024-001234
Your prescription from Vura HMS:
1. Paracetamol - 10 tablets x 500mg, 3 times daily for 5 days
2. Amoxicillin - 20 capsules x 500mg, 2 times daily for 7 days
Please bring this code to the pharmacy.
```

---

## 🏥 Health Center Types

Each type has different features:

**Clinic**
- Small facility
- General practitioners only
- Basic exams (no surgery)
- Limited specialties

**Health Center**
- Medium facility
- Multiple departments
- More specialties
- Basic surgical capabilities

**CHU (Center Hospitalar Universitário)**
- Large teaching hospital
- All specialties
- Full surgical capabilities
- Research and education

**Hospital**
- Large general hospital
- Multiple specialties
- Emergency department
- ICU capabilities

---

## 📊 Role-Based Dashboards

### Receptionist Dashboard
- Today's appointments
- New patients to register
- Patient queue by department
- Quick links to patient registration, assign to practitioner
- Cannot see medical data

### Nurse Dashboard
- Assigned patients
- Patient vitals monitoring
- Exam orders to prepare
- Consultation queue status
- Cannot see diagnoses or medications details

### Doctor/Practitioner Dashboard
- My patients queue
- Current consultations
- Today's prescriptions created
- Exam results to review
- Medical records summary
- Performance statistics

### Administrator Dashboard
- Health center overview
- Total patients, consultations, prescriptions
- Revenue and insurance claims
- Practitioner performance
- Disease statistics
- System usage analytics

---

## 🔔 Notification System

### SMS Notifications
- Prescription delivery
- Appointment reminders
- Test result notifications
- Patient recalls

### In-App Notifications
- New patient assigned to queue
- Prescription sync status
- Exam results ready
- Insurance claim updates
- System alerts

### Email Notifications
- Password reset
- Important updates
- Monthly reports (for practitioners)

---

## 📋 Compliance & Standards

### EMR/EHR/PHR Requirements
- Complete patient medical history
- All clinical encounters documented
- All medications and allergies recorded
- Lab results and imaging
- Diagnoses and treatments
- Audit trail of all access

### Data Protection
- Patient data encryption
- Access logging
- Role-based field access
- Data retention policies
- GDPR/Healthcare compliance

### WHO Integration
- WHO ICD-10 disease codes
- Disease database sync
- Diagnosis standardization

---

## 🎯 Implementation Phases

### Phase 1: Foundation (Complete)
- User authentication & authorization
- Health center setup
- Role-based access control
- Patient management (CRUD)

### Phase 2: Clinical Operations (Current)
- Practitioner assignment
- Consultation queue
- Symptoms documentation
- Diagnosis (WHO API)

### Phase 3: Prescriptions & SMS
- Prescription creation
- SMS integration
- PMS sync
- Medicine fulfillment tracking

### Phase 4: Exams & Labs
- Exam ordering
- Lab result management
- Result tracking
- Integration with labs

### Phase 5: Insurance & Compliance
- Insurance integration
- Coverage verification
- Claims management
- EMR/EHR/PHR compliance

### Phase 6: Reports & Analytics
- Dashboard creation
- Statistics & reports
- Performance tracking
- Audit reports

### Phase 7: Optimization & Testing
- Performance optimization
- Security audit
- User testing
- Production deployment

---

## 🚀 Deployment & Environment Setup

### Development
- Local PostgreSQL
- Redis for caching
- Meilisearch for search
- MinIO for storage
- Brevo/Twilio for SMS (test mode)

### Production
- Managed PostgreSQL
- Managed Redis
- Managed Meilisearch
- AWS S3 for storage
- Brevo/Twilio for SMS (production)
- Load balancing
- SSL/TLS encryption

---

## 📚 Additional Considerations

- **Printing**: All views printable via browser print functionality
- **History**: Complete audit trail of all actions
- **Filtering**: All tables filterable by relevant fields
- **Search**: Global search across patients, prescriptions, exams
- **Performance**: Optimized queries, caching, pagination
- **Accessibility**: WCAG 2.1 AA compliance
- **Mobile**: Responsive design for tablets/mobile devices

---

**Status**: Complete specification for HMS finalization
**Last Updated**: 2026-07-10
**Version**: 1.0 - Final
