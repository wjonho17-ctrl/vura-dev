# Vura HMS - Referral & Appointment System
## Inter-Hospital Patient Referrals & Appointment Management

---

## 📋 System Overview

This document outlines the new **Referral System** and **Appointment Management** features that allow:
- Doctors to refer patients to other hospitals
- Receptionists to manage inter-hospital appointments
- SMS reminders for appointments
- Availability management for practitioners
- Call system integration for unavailable staff

---

## 🏥 New Database Tables

### Referrals Table
```sql
CREATE TABLE referrals (
  id UUID PRIMARY KEY,
  from_health_center_id UUID NOT NULL (source hospital),
  to_health_center_id UUID NOT NULL (destination hospital),
  patient_id UUID NOT NULL,
  referring_doctor_id UUID NOT NULL,
  reason TEXT,
  notes TEXT,
  status ENUM('pending', 'accepted', 'declined', 'completed') DEFAULT 'pending',
  patient_first_name STRING,
  patient_last_name STRING,
  patient_national_id STRING,
  patient_date_of_birth DATE,
  patient_phone STRING,
  patient_email STRING,
  patient_gender ENUM('male', 'female'),
  insurance_info JSON,
  medical_summary TEXT,
  attachments JSON, -- documents, test results, etc
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  
  FOREIGN KEY (from_health_center_id) REFERENCES health_centers(id),
  FOREIGN KEY (to_health_center_id) REFERENCES health_centers(id),
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (referring_doctor_id) REFERENCES practitioners(id)
);
```

### Appointments Table
```sql
CREATE TABLE appointments (
  id UUID PRIMARY KEY,
  patient_id UUID NOT NULL,
  health_center_id UUID NOT NULL,
  practitioner_id UUID NOT NULL,
  referral_id UUID, -- if from referral
  appointment_type ENUM('consultation', 'procedure', 'follow_up', 'emergency') DEFAULT 'consultation',
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  department STRING,
  reason TEXT,
  notes TEXT,
  status ENUM('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show') DEFAULT 'scheduled',
  is_remote BOOLEAN DEFAULT false,
  meeting_link STRING, -- for remote appointments
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (health_center_id) REFERENCES health_centers(id),
  FOREIGN KEY (practitioner_id) REFERENCES practitioners(id),
  FOREIGN KEY (referral_id) REFERENCES referrals(id)
);
```

### Appointment Reminders Table
```sql
CREATE TABLE appointment_reminders (
  id UUID PRIMARY KEY,
  appointment_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  reminder_type ENUM('sms', 'email', 'phone_call') DEFAULT 'sms',
  remind_before_hours INTEGER DEFAULT 24, -- remind 24 hours before
  reminder_date DATE,
  reminder_time TIME,
  status ENUM('pending', 'sent', 'delivered', 'failed') DEFAULT 'pending',
  message_content TEXT,
  recipient_phone STRING,
  recipient_email STRING,
  failed_reason TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  
  FOREIGN KEY (appointment_id) REFERENCES appointments(id),
  FOREIGN KEY (patient_id) REFERENCES patients(id)
);
```

### Practitioner Availability Table
```sql
CREATE TABLE practitioner_availability (
  id UUID PRIMARY KEY,
  practitioner_id UUID NOT NULL,
  day_of_week ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'),
  start_time TIME,
  end_time TIME,
  max_appointments INTEGER DEFAULT 10,
  is_available BOOLEAN DEFAULT true,
  break_start_time TIME, -- lunch break, etc
  break_end_time TIME,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  
  FOREIGN KEY (practitioner_id) REFERENCES practitioners(id),
  UNIQUE (practitioner_id, day_of_week)
);
```

### Practitioner On-Call Table
```sql
CREATE TABLE practitioner_on_call (
  id UUID PRIMARY KEY,
  practitioner_id UUID NOT NULL,
  on_call_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  is_available BOOLEAN DEFAULT true,
  notes TEXT,
  phone_number STRING, -- for emergency calls
  created_at TIMESTAMP,
  
  FOREIGN KEY (practitioner_id) REFERENCES practitioners(id)
);
```

### Hospital Network Table
```sql
CREATE TABLE hospital_networks (
  id UUID PRIMARY KEY,
  health_center_id_1 UUID NOT NULL,
  health_center_id_2 UUID NOT NULL,
  network_type ENUM('referral_partner', 'sister_hospital', 'clinic_network') DEFAULT 'referral_partner',
  is_active BOOLEAN DEFAULT true,
  can_refer BOOLEAN DEFAULT true,
  contact_person STRING,
  contact_phone STRING,
  contact_email STRING,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  
  FOREIGN KEY (health_center_id_1) REFERENCES health_centers(id),
  FOREIGN KEY (health_center_id_2) REFERENCES health_centers(id),
  UNIQUE (health_center_id_1, health_center_id_2)
);
```

---

## 🔄 Referral Flow

### Step 1: Doctor Creates Referral

```typescript
// POST /api/referrals
POST /api/referrals
Authorization: Bearer <doctor-token>
Content-Type: application/json

{
  "toHealthCenterId": "destination-hospital-id",
  "patientId": "patient-id",
  "reason": "Requires cardiology consultation",
  "notes": "Patient has hypertension. Recent ECG attached.",
  "attachments": [
    {
      "type": "test_result",
      "filename": "ECG_2024_07_10.pdf",
      "fileUrl": "s3://bucket/ecg.pdf"
    }
  ]
}
```

### Step 2: Receiving Hospital Accepts/Declines

```typescript
// PUT /api/referrals/:referralId/respond
PUT /api/referrals/:referralId/respond
Authorization: Bearer <receiving-doctor-token>
Content-Type: application/json

{
  "status": "accepted", // or "declined"
  "notes": "Can see patient on July 15th",
  "suggestedAppointmentDate": "2024-07-15"
}
```

### Step 3: SMS Sent to Sending Doctor

```
Referral Accepted!
Patient: John Doe (ID: 12345678)
To: Cardiology Center
Appointment: July 15, 2024
Action: Confirm appointment for patient
Reply: SMS or call hospital
```

---

## 📅 Appointment Booking Flow

### Step 1: Check Practitioner Availability

```typescript
// GET /api/practitioners/:practitionerId/availability?date=2024-07-15
GET /api/practitioners/:practitionerId/availability?date=2024-07-15
Authorization: Bearer <receptionist-token>

Response:
{
  "practitionerId": "doctor-id",
  "date": "2024-07-15",
  "availableSlots": [
    {
      "time": "09:00",
      "duration": 30,
      "available": true
    },
    {
      "time": "09:30",
      "duration": 30,
      "available": true
    },
    {
      "time": "10:00",
      "duration": 30,
      "available": false, // already booked
    },
    {
      "time": "10:30",
      "duration": 30,
      "available": true
    }
  ]
}
```

### Step 2: Receptionist Books Appointment

```typescript
// POST /api/appointments
POST /api/appointments
Authorization: Bearer <receptionist-token>
Content-Type: application/json

{
  "patientId": "patient-id",
  "practitionerId": "doctor-id",
  "referralId": "referral-id", // optional
  "scheduledDate": "2024-07-15",
  "scheduledTime": "09:30",
  "appointmentType": "consultation",
  "reason": "Cardiology consultation - hypertension follow-up",
  "notes": "Patient to bring previous ECG results"
}
```

### Step 3: SMS Confirmation to Patient

```
✅ Appointment Confirmed!
Date: Tuesday, July 15, 2024
Time: 09:30 AM
Doctor: Dr. Ahmed Hassan
Hospital: Cardiology Center
Address: 123 Medical Street
Phone: +1234567890

Reminders:
- We'll send you a reminder 24 hours before
- Arrive 10 minutes early
- Bring your insurance card
```

---

## 🔔 Smart Reminder System

### Automatic Reminder Creation

When appointment is created, system automatically creates reminders:

```typescript
// Auto-created reminders for appointment
{
  // 24 hours before
  {
    remindBeforeHours: 24,
    reminderType: "sms",
    message: "Reminder: You have an appointment tomorrow at 09:30 with Dr. Ahmed Hassan"
  },
  // 2 hours before (for remote appointments)
  {
    remindBeforeHours: 2,
    reminderType: "sms",
    message: "Your appointment starts in 2 hours. Meeting link: https://..."
  },
  // 1 day after (if not completed)
  {
    reminderType: "phone_call",
    daysAfter: 1,
    message: "Your appointment was scheduled. Did it happen? Please call us."
  }
}
```

### SMS Reminder Examples

**24 Hours Before**:
```
Reminder: You have an appointment tomorrow (Tuesday) at 09:30
Doctor: Dr. Ahmed Hassan
Location: Cardiology Center
Not able to come? Call us: +1234567890
```

**2 Hours Before** (Remote):
```
Your online appointment with Dr. Ahmed starts in 2 hours
Click to join: https://meet.hospital.local/appointment-xyz
Need to reschedule? Call: +1234567890
```

**Appointment Completed Confirmation**:
```
Thank you for visiting us today!
Rate your experience: https://feedback.hospital/apt-xyz
Next appointment? Call us or visit our website
```

---

## ☎️ Availability & On-Call Management

### Practitioner Sets Weekly Availability

```typescript
// POST /api/practitioners/:practitionerId/availability
POST /api/practitioners/:practitionerId/availability
Authorization: Bearer <doctor-token>
Content-Type: application/json

{
  "weekSchedule": [
    {
      "dayOfWeek": "monday",
      "startTime": "09:00",
      "endTime": "17:00",
      "breakStartTime": "12:30",
      "breakEndTime": "13:30",
      "maxAppointments": 8
    },
    {
      "dayOfWeek": "tuesday",
      "startTime": "09:00",
      "endTime": "17:00",
      "breakStartTime": "12:30",
      "breakEndTime": "13:30",
      "maxAppointments": 8
    },
    {
      "dayOfWeek": "wednesday",
      "startTime": "14:00", // afternoon only
      "endTime": "20:00",
      "maxAppointments": 6
    },
    {
      "dayOfWeek": "thursday",
      "startTime": "00:00",
      "endTime": "00:00",
      "isAvailable": false // day off
    },
    // ... friday - sunday
  ]
}
```

### Set On-Call Status

```typescript
// POST /api/practitioners/:practitionerId/on-call
POST /api/practitioners/:practitionerId/on-call
Authorization: Bearer <doctor-token>
Content-Type: application/json

{
  "onCallDate": "2024-07-15",
  "startTime": "18:00",
  "endTime": "06:00", // next day
  "phoneNumber": "+1234567890",
  "notes": "Available for emergency consultations"
}
```

### Check if Practitioner is Available

```typescript
// GET /api/practitioners/:practitionerId/is-available
GET /api/practitioners/:practitionerId/is-available
Authorization: Bearer <token>

Response:
{
  "isAvailable": true,
  "reason": "In working hours (Monday 10:00 AM)",
  "nextAvailableTime": "2024-07-15 09:00",
  "canBeReached": true,
  "phoneNumber": "+1234567890", // if on-call
  "status": "available" // or "on-call", "busy", "off-duty"
}
```

---

## 📞 Call System Integration

### If Practitioner is Unavailable

When appointment time approaches and practitioner is unavailable (marked unavailable, in another consultation, etc.):

```typescript
// POST /api/appointments/:appointmentId/call-doctor
POST /api/appointments/:appointmentId/call-doctor
Authorization: Bearer <receptionist-token>

{
  "reason": "Practitioner not available, need alternative",
  "urgency": "high"
}
```

**System Actions**:
1. Sends SMS to doctor's registered phone
2. Initiates automatic call (using Twilio, etc.)
3. SMS to patient: "We're reaching out to confirm your appointment"
4. Waits for response (5 minutes timeout)
5. If no response, offers alternatives

### SMS to Doctor on Call

```
URGENT: Patient appointment in 30 minutes
Patient: John Doe
Time: 09:30 AM
Department: Cardiology
Status: Waiting confirmation
Reply: YES/NO or call receptionist
```

### SMS to Patient (Unavailable Doctor)

```
Your doctor is currently unavailable.
We're contacting an alternative specialist.
We'll confirm shortly.
Can you wait 10 more minutes? Reply YES/NO
Emergency? Call: +1234567890
```

---

## 🗄️ New API Endpoints

### Referrals
```
POST   /api/referrals                    - Create referral
GET    /api/referrals                    - List my referrals
GET    /api/referrals/:id                - Get referral details
PUT    /api/referrals/:id/respond        - Accept/decline referral
GET    /api/referrals/sent               - My sent referrals
GET    /api/referrals/received           - My received referrals
POST   /api/referrals/:id/send-sms       - Send referral SMS to patient
```

### Appointments
```
POST   /api/appointments                 - Create appointment
GET    /api/appointments                 - List my appointments
GET    /api/appointments/:id             - Get appointment details
PUT    /api/appointments/:id             - Update appointment
DELETE /api/appointments/:id             - Cancel appointment
GET    /api/appointments/available       - Find available slots
POST   /api/appointments/:id/confirm     - Confirm appointment
POST   /api/appointments/:id/complete    - Mark as completed
POST   /api/appointments/:id/no-show     - Mark as no-show
```

### Reminders
```
GET    /api/reminders                    - Get my reminders
PUT    /api/reminders/:id                - Update reminder
POST   /api/reminders/:id/resend         - Resend reminder
GET    /api/reminders/pending            - Get pending reminders
```

### Availability
```
GET    /api/practitioners/:id/availability          - Get availability
POST   /api/practitioners/:id/availability          - Set availability
GET    /api/practitioners/:id/is-available          - Check if available
POST   /api/practitioners/:id/on-call               - Set on-call
DELETE /api/practitioners/:id/on-call               - Remove on-call
GET    /api/practitioners/:id/schedule              - Get full schedule
```

### Hospital Network
```
GET    /api/hospital-networks            - List connected hospitals
POST   /api/hospital-networks            - Create network connection
GET    /api/hospital-networks/:id        - Get network details
PUT    /api/hospital-networks/:id        - Update network
```

---

## 🎨 PrimeVue Components Needed

### 1. Referral Form Component
```vue
<!-- Send patient to another hospital -->
<PatientReferralForm 
  :patient="patient"
  :availableHospitals="hospitals"
  @submit="sendReferral"
/>
```

### 2. Appointment Booking Component
```vue
<!-- Schedule appointment -->
<AppointmentBooking
  :patient="patient"
  :practitioner="practitioner"
  :selectedDate="date"
  @select="bookAppointment"
/>
```

### 3. Availability Calendar
```vue
<!-- Show practitioner availability -->
<AvailabilityCalendar
  :practitioner="practitioner"
  @selectSlot="selectTimeSlot"
/>
```

### 4. Referral Status Tracker
```vue
<!-- Track referral status -->
<ReferralTracker
  :referral="referral"
  @respond="respondToReferral"
/>
```

### 5. Appointment Reminder List
```vue
<!-- Manage appointment reminders -->
<ReminderManagement
  :appointment="appointment"
  @resendReminder="resendReminder"
/>
```

---

## 📊 New Dashboard Widgets

### For Receptionist
```
- Upcoming Appointments (today & tomorrow)
- Pending Referrals (awaiting response)
- Cancelled Appointments (need rebooking)
- No-Show Appointments
- Pending Call Confirmations
```

### For Practitioner
```
- My Schedule (today)
- Availability Overview
- Pending Referral Responses
- Appointments Awaiting Confirmation
- On-Call Status
- Patient Reminders Sent
```

### For Admin
```
- Referral Network Statistics
- Inter-hospital Referral Rate
- Appointment Booking Rate
- Average Appointment Confirmation Time
- Reminder Delivery Rate
- On-Call Coverage Overview
```

---

## 🔔 Notification Examples

### Referral Created
**SMS to Receiving Hospital Doctor**:
```
New Referral Received
Patient: John Doe
Referring Doctor: Dr. Ahmed Hassan
Reason: Cardiology consultation
Medical Summary: Patient with hypertension
Action: Review & respond
Visit: [hospital-system-link]
```

### Appointment Confirmed
**SMS to Patient**:
```
✅ Appointment Confirmed!
Doctor: Dr. Ahmed Hassan
Date: July 15, 2024 at 09:30 AM
Location: Cardiology Center
Reminder: We'll SMS you 24 hours before
```

### Practitioner Unavailable
**SMS to Receptionist**:
```
⚠️ Doctor Status Changed
Dr. Ahmed Hassan is now UNAVAILABLE
In another consultation (Est. 30 mins)
Appointment at 09:30 may need confirmation
Action: Contact doctor or find alternative
```

### Appointment Reminder
**SMS to Patient (24 hours before)**:
```
Reminder: Your appointment is tomorrow!
Time: 09:30 AM
Doctor: Dr. Ahmed Hassan
Location: Cardiology Center
Not available? Call: +1234567890
```

---

## 🛡️ Security & Privacy

### Access Control
- **Referral Access**: Only doctor who created referral can see patient info
- **Appointment Access**: Only patient, practitioner, and receptionist can see
- **Availability**: Only practitioner can modify their own availability
- **On-Call Status**: Only on-call practitioners can be contacted

### Data Privacy
- Patient info encrypted when sent to other hospitals
- Medical summaries redacted for non-treating staff
- Phone numbers only visible to appropriate parties
- Call logs separate from medical records

---

## 📝 Implementation Checklist

Database:
- [ ] Create referrals table
- [ ] Create appointments table
- [ ] Create appointment_reminders table
- [ ] Create practitioner_availability table
- [ ] Create practitioner_on_call table
- [ ] Create hospital_networks table
- [ ] Add indexes for date queries
- [ ] Add foreign key constraints

Models:
- [ ] Referral model
- [ ] Appointment model
- [ ] AppointmentReminder model
- [ ] PractitionerAvailability model
- [ ] PractitionerOnCall model
- [ ] HospitalNetwork model

Controllers:
- [ ] ReferralsController
- [ ] AppointmentsController
- [ ] RemindersController
- [ ] AvailabilityController
- [ ] HospitalNetworksController

Services:
- [ ] ReferralService
- [ ] AppointmentService
- [ ] ReminderService
- [ ] AvailabilityService
- [ ] CallManagementService

Jobs/Scheduled Tasks:
- [ ] SendReminderJob (run every hour)
- [ ] CheckAppointmentStatusJob (run every 30 mins)
- [ ] CallPractitionerJob (triggered on unavailability)
- [ ] SendConfirmationJob (send to patient & doctor)

Components (PrimeVue):
- [ ] ReferralForm
- [ ] AppointmentBooking
- [ ] AvailabilityCalendar
- [ ] ReferralTracker
- [ ] ReminderManagement
- [ ] AvailabilityScheduler

APIs:
- [ ] Referral endpoints
- [ ] Appointment endpoints
- [ ] Reminder endpoints
- [ ] Availability endpoints
- [ ] Hospital network endpoints
- [ ] Call management endpoints

---

## ✨ Features Summary

✅ Send patients to other hospitals via referrals
✅ Receive referrals from other hospitals
✅ Book appointments with available time slots
✅ Automatic SMS reminders (24 hours before)
✅ Practitioner availability management
✅ On-call status tracking
✅ Automatic call system when unavailable
✅ Referral network management
✅ Appointment confirmation tracking
✅ Practitioner workload management
✅ Appointment rescheduling
✅ No-show tracking

---

**Status**: Ready for Implementation
**Version**: 1.0
**Last Updated**: 2026-07-10
