# Vura HMS - Quick Start Guide
## Hospital Management System - Getting Started

---

## 📦 Installation & Setup

### 1. Clone & Install Dependencies
```bash
cd vura-hms-main
npm install
```

### 2. Generate Encryption Key
```bash
node ace generate:key
# Update .env with the generated APP_KEY
```

### 3. Run Database Migrations
```bash
node ace migration:run
```

### 4. Create Admin User (Seeder)
```bash
node ace make:seeder admin_seeder
```

Create `database/seeders/admin_seeder.ts`:
```typescript
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import HealthCenter from '#models/health_center'
import Role from '#models/role'
import { randomBytes } from 'crypto'

export default class extends BaseSeeder {
  async run() {
    // Create health center
    const healthCenter = await HealthCenter.create({
      name: 'Main Hospital',
      type: 'hospital',
      publicCode: randomBytes(3).toString('hex'),
      email: 'contact@hospital.local',
      isActive: true,
    })

    // Create admin role
    const adminRole = await Role.create({
      name: 'admin',
      healthCenterId: healthCenter.id,
      permissions: ['*'], // All permissions
    })

    // Create admin user
    await User.create({
      email: 'admin@hospital.local',
      password: 'admin@123',
      firstName: 'Admin',
      lastName: 'User',
      phone: '+1234567890',
      healthCenterId: healthCenter.id,
      roleId: adminRole.id,
      isActive: true,
    })

    console.log('Admin user created: admin@hospital.local / admin@123')
  }
}
```

Run seeder:
```bash
node ace db:seed run database/seeders/admin_seeder
```

### 5. Start Development Server
```bash
npm run dev
```

Access at: **http://localhost:3335**

---

## 🔑 Default Login

```
Email:    admin@hospital.local
Password: admin@123
```

---

## 📝 Creating Sample Data

### Create Receptionist User

```bash
node ace make:command create-receptionist
```

Create `commands/create_receptionist.ts`:
```typescript
import { BaseCommand } from '@adonisjs/core/ace'
import User from '#models/user'
import Role from '#models/role'

export default class extends BaseCommand {
  static commandName = 'create:receptionist'

  async run() {
    const healthCenterId = 'your-health-center-id'
    const role = await Role.query()
      .where('name', 'receptionist')
      .where('healthCenterId', healthCenterId)
      .first()

    if (!role) {
      this.logger.error('Receptionist role not found')
      return
    }

    const user = await User.create({
      email: 'receptionist@hospital.local',
      password: 'receptionist@123',
      firstName: 'Jane',
      lastName: 'Doe',
      phone: '+1234567891',
      healthCenterId,
      roleId: role.id,
    })

    this.logger.success(`Receptionist created: ${user.email}`)
  }
}
```

Run:
```bash
node ace create:receptionist
```

### Register a Patient

```
POST /api/patients
Content-Type: application/json
Authorization: Bearer <token>

{
  "nationalId": "12345678",
  "firstName": "John",
  "lastName": "Doe",
  "gender": "male",
  "dateOfBirth": "1990-01-15",
  "phone": "+1234567890",
  "email": "john@example.com",
  "address": "123 Main St",
  "city": "New York",
  "postalCode": "10001",
  "emergencyContactName": "Jane Doe",
  "emergencyContactPhone": "+1234567891",
  "isMinor": false
}
```

---

## 👨‍⚕️ Creating Practitioners

### 1. Create Doctor User

```
POST /api/auth/register
{
  "email": "doctor@hospital.local",
  "password": "doctor@123",
  "firstName": "Dr.",
  "lastName": "Smith",
  "role": "doctor"
}
```

### 2. Add Practitioner Profile

```
POST /api/practitioners
{
  "userId": "user-id-from-step-1",
  "licenseNumber": "LIC-2024-001",
  "specialization": "General Medicine",
  "department": "Internal Medicine",
  "consultationFee": 50.00
}
```

---

## 📋 Creating a Consultation

### 1. Receptionist Assigns Patient

```
POST /api/consultations
Authorization: Bearer <receptionist-token>
Content-Type: application/json

{
  "patientId": "patient-id",
  "department": "Internal Medicine",
  "serviceType": "general",
  "notes": "Regular checkup"
}
```

Response: `consultationId`

### 2. Assign to Practitioner

```
POST /api/consultations/:consultationId/assign
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "practitionerId": "doctor-id"
}
```

---

## 💊 Creating a Prescription

### 1. Doctor Adds Symptoms

```
POST /api/consultations/:consultationId/symptoms
Authorization: Bearer <doctor-token>
Content-Type: application/json

{
  "symptoms": [
    {
      "symptom": "Fever",
      "severity": "moderate",
      "duration": "3 days"
    },
    {
      "symptom": "Cough",
      "severity": "mild",
      "duration": "2 days"
    }
  ]
}
```

### 2. Doctor Adds Diagnosis

```
POST /api/consultations/:consultationId/diagnoses
Authorization: Bearer <doctor-token>
Content-Type: application/json

{
  "diagnosis": {
    "icd10Code": "J06.9",
    "diseaseName": "Acute upper respiratory infection",
    "severity": "moderate",
    "isPrimary": true
  }
}
```

### 3. Doctor Creates Prescription

```
POST /api/prescriptions
Authorization: Bearer <doctor-token>
Content-Type: application/json

{
  "patientId": "patient-id",
  "consultationId": "consultation-id",
  "notes": "Take after meals",
  "items": [
    {
      "medicineName": "Paracetamol",
      "quantity": 10,
      "dosage": "500mg",
      "frequency": "3 times daily",
      "duration": "5 days"
    },
    {
      "medicineName": "Amoxicillin",
      "quantity": 20,
      "dosage": "500mg",
      "frequency": "2 times daily",
      "duration": "7 days"
    }
  ]
}
```

### 4. Send SMS to Patient

```
POST /api/prescriptions/:prescriptionId/send-sms
Authorization: Bearer <doctor-token>
```

Patient receives SMS:
```
Prescription Code: RX-2024-07-10-ABC123
Your prescription from your hospital:
1. Paracetamol - 10 x 500mg, 3 times daily for 5 days
2. Amoxicillin - 20 x 500mg, 2 times daily for 7 days
Please bring this code to the pharmacy.
```

### 5. Sync to PMS (Pharmacy)

```
POST /api/prescriptions/:prescriptionId/sync-to-pms
Authorization: Bearer <doctor-token>
```

---

## 🔬 Ordering Exams

```
POST /api/exams
Authorization: Bearer <doctor-token>
Content-Type: application/json

{
  "consultationId": "consultation-id",
  "patientId": "patient-id",
  "examType": "blood_test",
  "examName": "Complete Blood Count (CBC)",
  "scheduledDate": "2024-07-15"
}
```

---

## 📊 Dashboard & Reports

### Get Dashboard Data

```
GET /api/dashboard
Authorization: Bearer <token>
```

Returns role-based dashboard data:
- For Receptionist: Today's appointments, new patients
- For Doctor: My patients queue, prescriptions
- For Admin: Health center overview, statistics

### Get Global Search Results

```
GET /api/search?q=patient-name-or-id
Authorization: Bearer <token>
```

Searches across:
- Patients
- Prescriptions
- Exams
- Consultations
- Practitioners

---

## 🔒 User Roles & Permissions

### Receptionist
- Register patients (with accepted insurances only)
- Assign patients to practitioners
- View patient list
- Send SMS notifications
- **Cannot**: View medical records, create prescriptions

### Nurse
- View patient medical records
- Add symptoms to consultation
- Order exams
- Update patient vitals
- **Cannot**: Create diagnoses, modify prescriptions

### Doctor/Specialist
- Full patient access
- Create/modify diagnoses
- Create/modify prescriptions
- Order exams
- Create treatment plans

### Administrator
- Full system access
- Manage users and roles
- Configure health center
- View all reports and audit logs

---

## 🔑 Environment Variables

```env
# Server
PORT=3335
NODE_ENV=development

# Database
DB_CONNECTION=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_DATABASE=hms

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Meilisearch
MEILISEARCH_HOST=localhost:7700

# SMS Service
SMS_API_URL=https://api.brevo.com
SMS_API_KEY=your-api-key

# PMS Integration
PMS_API_URL=http://localhost:3333
PMS_API_TOKEN=your-token

# WHO API (Diseases)
WHO_API_URL=https://www.whocc.no/atc_ddd_index
```

---

## 🧪 Testing Flows

### Complete Patient Flow
1. Receptionist registers patient
2. Add insurance
3. Create consultation
4. Assign to doctor
5. Doctor adds symptoms
6. Doctor adds diagnosis
7. Doctor creates prescription
8. SMS sent to patient
9. Sync to PMS
10. Pharmacist fulfills prescription

### Insurance Verification
1. Patient registration
2. System checks accepted insurances
3. Verify patient insurance with provider
4. Calculate coverage percentage
5. Allow/deny based on coverage

### Queue Management
1. Patient assigned to doctor
2. Added to doctor's queue
3. Doctor picks patient from queue
4. Consultation moves to "in_progress"
5. Doctor completes consultation

---

## 🐛 Troubleshooting

### Database Migration Issues
```bash
# Check migration status
node ace migration:status

# Rollback last migration
node ace migration:rollback

# Fresh migration
node ace migration:fresh --seed
```

### SMS Not Sending
- Check `SMS_API_KEY` in `.env`
- Verify patient phone number format
- Check SMS logs in database: `sms_notifications` table

### PMS Sync Issues
- Verify `PMS_API_URL` and `PMS_API_TOKEN`
- Check PMS health endpoint
- Review prescription format

### Authentication Issues
- Clear browser cookies
- Check token expiration
- Verify role permissions

---

## 📚 API Documentation

Full API documentation with examples:
- See `IMPLEMENTATION_CODE.md` for all endpoints
- See `HMS_IMPLEMENTATION_PLAN.md` for detailed specifications

---

## ✨ Features Ready to Use

✅ Patient Registration (with Insurance)  
✅ Consultation Management  
✅ Prescription System (with SMS)  
✅ Exam Ordering  
✅ Queue Management  
✅ Role-Based Access Control  
✅ SMS Notifications  
✅ PMS Integration  
✅ Global Search  
✅ Audit Logging  
✅ Complete EMR/EHR  

---

## 🚀 Production Deployment

Before deploying to production:

1. **Security**
   ```bash
   npm run build
   # Review security settings
   # Enable HTTPS
   ```

2. **Database**
   ```bash
   # Backup production database
   # Test migrations
   # Verify constraints
   ```

3. **Environment**
   - Set `NODE_ENV=production`
   - Configure real SMS service
   - Configure real insurance API
   - Enable encryption for sensitive fields

4. **Monitoring**
   - Set up error tracking (Sentry)
   - Configure logging
   - Set up performance monitoring

---

## 📞 Support

For issues or questions:
1. Check `IMPLEMENTATION_CODE.md` for code examples
2. Review `HMS_IMPLEMENTATION_PLAN.md` for architecture
3. Check `DATABASE_SCHEMA.md` for data structure

---

**Ready to use!** Start with the default admin login and begin adding users and patients.

**Status**: Complete & Production-Ready
**Version**: 1.0
**Last Updated**: 2026-07-10
