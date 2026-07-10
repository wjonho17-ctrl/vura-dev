# Vura HMS - Referral & Appointment System Implementation Checklist

---

## 📋 Overview

This checklist guides implementation of the complete inter-hospital referral and appointment management system. All specifications, code examples, and components are provided in companion documents.

**Reference Documents:**
- `HMS_REFERRAL_APPOINTMENT_SYSTEM.md` - System specification and requirements
- `HMS_REFERRAL_IMPLEMENTATION.md` - Models, controllers, and services code
- `HMS_PRIMEVUE_COMPONENTS.md` - PrimeVue UI components
- `DATABASE_SCHEMA.md` - Database migration reference
- `HMS_QUICK_START.md` - Setup and testing guide

---

## 🗄️ Part 1: Database Setup

### Migration Files to Create

```bash
# 1. Create referral table
node ace make:migration create_referrals_table

# 2. Create appointment table
node ace make:migration create_appointments_table

# 3. Create appointment_reminders table
node ace make:migration create_appointment_reminders_table

# 4. Create practitioner_availability table
node ace make:migration create_practitioner_availability_table

# 5. Create practitioner_on_call table
node ace make:migration create_practitioner_on_call_table

# 6. Create hospital_networks table
node ace make:migration create_hospital_networks_table
```

### Migration Contents

Each migration file should follow the schema defined in `HMS_REFERRAL_APPOINTMENT_SYSTEM.md`.

**Checklist:**
- [ ] referrals migration with all fields and indexes
- [ ] appointments migration with status enum
- [ ] appointment_reminders migration with reminder tracking
- [ ] practitioner_availability migration with weekly schedule
- [ ] practitioner_on_call migration with phone tracking
- [ ] hospital_networks migration with connection tracking
- [ ] All foreign key constraints created
- [ ] All indexes for performance created
- [ ] Migrations tested in dev environment

---

## 🏗️ Part 2: Models

### Create Lucid Models

```bash
# Create all models
node ace make:model Referral
node ace make:model Appointment
node ace make:model AppointmentReminder
node ace make:model PractitionerAvailability
node ace make:model PractitionerOnCall
node ace make:model HospitalNetwork
```

**Checklist:**
- [ ] Referral model with all fields and relationships
- [ ] Appointment model with status enum and helpers
- [ ] AppointmentReminder model with SMS tracking
- [ ] PractitionerAvailability model with schedule helpers
- [ ] PractitionerOnCall model with phone tracking
- [ ] HospitalNetwork model for inter-hospital connections
- [ ] All relationships configured (belongsTo, hasMany)
- [ ] Computed properties for date/time helpers
- [ ] Type safety with TypeScript interfaces

**Example Relations:**
- Referral → HealthCenter (from/to)
- Referral → Patient
- Referral → Practitioner (referring doctor)
- Appointment → Patient
- Appointment → Practitioner
- Appointment → Referral (optional)
- AppointmentReminder → Appointment
- AppointmentReminder → Patient
- PractitionerAvailability → Practitioner
- PractitionerOnCall → Practitioner
- HospitalNetwork → HealthCenter (from/to)

---

## 🎮 Part 3: Controllers

### Create Controllers

```bash
# Create all controllers
node ace make:controller ReferralsController
node ace make:controller AppointmentsController
node ace make:controller AvailabilityController
node ace make:controller RemindersController
node ace make:controller HospitalNetworksController
```

**Referrals Controller Endpoints:**
- [ ] `POST /api/referrals` - Create new referral
- [ ] `GET /api/referrals/:id` - Get referral details
- [ ] `POST /api/referrals/:id/respond` - Accept/decline referral
- [ ] `GET /api/referrals/sent` - List sent referrals
- [ ] `GET /api/referrals/received` - List received referrals
- [ ] `DELETE /api/referrals/:id` - Cancel referral

**Appointments Controller Endpoints:**
- [ ] `POST /api/appointments` - Book appointment
- [ ] `GET /api/appointments/:id` - Get appointment details
- [ ] `PATCH /api/appointments/:id` - Update appointment
- [ ] `POST /api/appointments/:id/confirm` - Confirm appointment
- [ ] `POST /api/appointments/:id/complete` - Mark completed
- [ ] `POST /api/appointments/:id/cancel` - Cancel appointment
- [ ] `GET /api/appointments/patient/:patientId` - Patient's appointments
- [ ] `GET /api/appointments/practitioner/:practitionerId` - Practitioner's appointments
- [ ] `POST /api/appointments/:id/call-doctor` - Alert unavailable doctor

**Availability Controller Endpoints:**
- [ ] `GET /api/availability/:practitionerId` - Get available slots
- [ ] `POST /api/availability` - Set practitioner availability
- [ ] `PUT /api/availability/:id` - Update availability
- [ ] `DELETE /api/availability/:id` - Delete availability

**Reminders Controller Endpoints:**
- [ ] `GET /api/reminders` - List all reminders
- [ ] `GET /api/reminders/:id` - Get reminder details
- [ ] `POST /api/reminders/:id/resend` - Manually resend reminder
- [ ] `POST /api/reminders/send-pending` - Send all pending reminders

**Hospital Networks Controller:**
- [ ] `POST /api/hospital-networks` - Create network connection
- [ ] `GET /api/hospital-networks` - List connected hospitals
- [ ] `DELETE /api/hospital-networks/:id` - Remove connection

---

## 🔧 Part 4: Services

### Create Services

```bash
# Create all services
mkdir -p app/services
```

**Services to Implement:**
- [ ] `ReferralService` - Referral business logic
  - [ ] `create(data)` - Create referral
  - [ ] `respond(referralId, status)` - Accept/decline
  - [ ] `getSent(healthCenterId)` - Get sent referrals
  - [ ] `getReceived(healthCenterId)` - Get received referrals
  
- [ ] `AppointmentService` - Appointment business logic
  - [ ] `create(data)` - Book appointment
  - [ ] `checkAvailability(practitionerId, date, time)` - Verify slot
  - [ ] `cancel(appointmentId)` - Cancel appointment
  - [ ] `callPractitioner(appointmentId, reason, urgency)` - Alert doctor
  
- [ ] `ReminderService` - Reminder system
  - [ ] `createAutomaticReminders(appointment)` - Generate reminders
  - [ ] `sendPendingReminders()` - Send due reminders
  - [ ] `resendReminder(reminderId)` - Manual resend
  - [ ] `calculateReminderTime(appointment, hoursBeforeType)` - Calculate time
  
- [ ] `AvailabilityService` - Availability checking
  - [ ] `isSlotAvailable(practitionerId, date, time, duration)` - Check slot
  - [ ] `getAvailableSlots(practitionerId, date)` - Get day's slots
  - [ ] `getWeeklyAvailability(practitionerId)` - Get week schedule
  - [ ] `getNextAvailableSlot(practitionerId)` - Find soonest slot
  
- [ ] `SmsService` enhancements:
  - [ ] `sendReferralNotification(referral)` - Notify receiving hospital
  - [ ] `sendReferralResponse(referral, status)` - Confirm response
  - [ ] `sendAppointmentConfirmation(appointment)` - Confirm booking
  - [ ] `sendAppointmentReminder(appointment, reminderType)` - Send reminder
  - [ ] `sendDoctorAlert(appointment, reason, urgency)` - Alert unavailable doctor

---

## 📱 Part 5: PrimeVue Components

### Component Implementation

```bash
mkdir -p resources/views/components
```

**Components to Create:**

1. **ReferralForm Component**
   - [ ] Hospital selection dropdown (auto-populated)
   - [ ] Patient search with autocomplete
   - [ ] Referral reason dropdown
   - [ ] Medical summary textarea
   - [ ] Patient info auto-display
   - [ ] Submit button with validation
   - [ ] File: `resources/views/components/referral_form.vue`

2. **AppointmentBooking Component**
   - [ ] Patient selection (autocomplete)
   - [ ] Practitioner selection (dropdown)
   - [ ] Department selection
   - [ ] Date picker (Calendar)
   - [ ] Time slot selection (grid)
   - [ ] Confirmation review
   - [ ] Stepper for multi-step flow
   - [ ] File: `resources/views/components/appointment_booking.vue`

3. **AvailabilityCalendar Component**
   - [ ] Calendar for date selection
   - [ ] Time slot grid (30-min intervals)
   - [ ] Real-time availability checking
   - [ ] Practitioner info sidebar
   - [ ] Working hours display
   - [ ] Break time highlighting
   - [ ] Capacity indicator
   - [ ] File: `resources/views/components/availability_calendar.vue`

4. **ReferralTracker Component**
   - [ ] Sent referrals tab with DataTable
   - [ ] Received referrals tab with DataTable
   - [ ] Status badges (pending/accepted/declined/completed)
   - [ ] Search and filtering
   - [ ] Accept/decline actions
   - [ ] Statistics tab with metrics
   - [ ] Detail modal for referral info
   - [ ] File: `resources/views/components/referral_tracker.vue`

5. **ReminderManagement Component**
   - [ ] Reminders DataTable
   - [ ] Status filter (pending/sent/delivered/failed)
   - [ ] Reminder type filter (SMS/email/phone_call)
   - [ ] Resend action button
   - [ ] Statistics cards (pending/sent/delivered/failed counts)
   - [ ] Detail modal for message content
   - [ ] File: `resources/views/components/reminder_management.vue`

**Checklist:**
- [ ] All components use PrimeVue 4.4 components
- [ ] Form validation with Vee-Validate
- [ ] API integration with axios
- [ ] Toast notifications for user feedback
- [ ] Loading states and spinners
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Error handling and display
- [ ] Date/time formatting helpers
- [ ] Type safety with TypeScript

---

## 🛣️ Part 6: API Routes

### Update Routes File

Edit `start/routes.ts`:

```typescript
// Referral routes
Route.group(() => {
  // Create new referral
  Route.post('referrals', 'ReferralsController.store')
    .middleware(['auth', 'canCreateReferral'])
  
  // Respond to referral (accept/decline)
  Route.post('referrals/:id/respond', 'ReferralsController.respond')
    .middleware(['auth', 'canRespondToReferral'])
  
  // Get sent referrals
  Route.get('referrals/sent', 'ReferralsController.getSent')
    .middleware('auth')
  
  // Get received referrals
  Route.get('referrals/received', 'ReferralsController.getReceived')
    .middleware('auth')
  
  // Get referral details
  Route.get('referrals/:id', 'ReferralsController.show')
    .middleware('auth')
  
  // Cancel referral
  Route.delete('referrals/:id', 'ReferralsController.destroy')
    .middleware(['auth', 'canDeleteReferral'])
}).prefix('/api')

// Appointment routes
Route.group(() => {
  // Book appointment
  Route.post('appointments', 'AppointmentsController.store')
    .middleware('auth')
  
  // Get available slots
  Route.get('appointments/availability/:practitionerId', 'AppointmentsController.getAvailability')
    .middleware('auth')
  
  // Get appointment details
  Route.get('appointments/:id', 'AppointmentsController.show')
    .middleware('auth')
  
  // Confirm appointment
  Route.post('appointments/:id/confirm', 'AppointmentsController.confirm')
    .middleware('auth')
  
  // Complete appointment
  Route.post('appointments/:id/complete', 'AppointmentsController.complete')
    .middleware(['auth', 'canCompleteAppointment'])
  
  // Cancel appointment
  Route.delete('appointments/:id', 'AppointmentsController.destroy')
    .middleware('auth')
  
  // Call doctor (emergency contact)
  Route.post('appointments/:id/call-doctor', 'AppointmentsController.callDoctor')
    .middleware('auth')
}).prefix('/api')

// Availability routes
Route.group(() => {
  Route.get('availability/:practitionerId', 'AvailabilityController.show')
    .middleware('auth')
  
  Route.post('availability', 'AvailabilityController.store')
    .middleware(['auth', 'isAdmin'])
  
  Route.put('availability/:id', 'AvailabilityController.update')
    .middleware(['auth', 'isAdmin'])
}).prefix('/api')

// Reminder routes
Route.group(() => {
  Route.get('reminders', 'RemindersController.index')
    .middleware('auth')
  
  Route.get('reminders/:id', 'RemindersController.show')
    .middleware('auth')
  
  Route.post('reminders/:id/resend', 'RemindersController.resend')
    .middleware(['auth', 'isAdmin'])
}).prefix('/api')
```

**Checklist:**
- [ ] All referral routes with proper middleware
- [ ] All appointment routes with proper middleware
- [ ] All availability routes with proper middleware
- [ ] All reminder routes with proper middleware
- [ ] Authentication middleware on all routes
- [ ] Authorization middleware for sensitive operations
- [ ] Proper HTTP methods (GET/POST/PUT/DELETE)
- [ ] Consistent API naming conventions

---

## 🔐 Part 7: Middleware & Authorization

### Create Permissions

```typescript
// app/permissions/referral_permission.ts
export const canCreateReferral = (user: User) => {
  return user.role.name === 'doctor' || user.role.name === 'specialist'
}

export const canRespondToReferral = (user: User, referral: Referral) => {
  return (
    user.healthCenterId === referral.toHealthCenterId &&
    user.role.name !== 'receptionist'
  )
}

export const canDeleteReferral = (user: User, referral: Referral) => {
  return (
    user.healthCenterId === referral.fromHealthCenterId &&
    (user.role.name === 'doctor' || user.role.name === 'admin')
  )
}
```

**Checklist:**
- [ ] Doctor/Specialist can create referrals
- [ ] Receiving hospital staff can respond
- [ ] Only referral creator can cancel
- [ ] Receptionist cannot access medical data
- [ ] Patient data isolation by health center
- [ ] Audit logging for sensitive operations

---

## 🔔 Part 8: Jobs & Scheduled Tasks

### Create Scheduled Jobs

```bash
node ace make:job SendRemindersJob
node ace make:job CheckAppointmentStatusJob
node ace make:job CallPractitionerJob
```

**SendRemindersJob:**
- [ ] Query pending reminders due
- [ ] Send SMS for each reminder
- [ ] Update reminder status to 'sent'
- [ ] Log failures with reason
- [ ] Schedule: Every 5 minutes

**CheckAppointmentStatusJob:**
- [ ] Find in-progress appointments
- [ ] Check if past end time
- [ ] Auto-mark as completed
- [ ] Send completion SMS
- [ ] Schedule: Every 15 minutes

**CallPractitionerJob:**
- [ ] Query urgent appointment alerts
- [ ] Trigger phone call service
- [ ] Log call attempt
- [ ] Retry on failure
- [ ] Schedule: On-demand with queue

**Checklist:**
- [ ] Jobs integrated with queue service
- [ ] Error handling and retry logic
- [ ] Logging for audit trail
- [ ] SMS service integration
- [ ] Phone call service integration
- [ ] Database transaction safety

---

## 🧪 Part 9: Testing

### Test Coverage

**Referral Tests:**
- [ ] Create referral with valid data
- [ ] Reject referral without required fields
- [ ] Send referral notification SMS
- [ ] Accept referral and create appointment
- [ ] Decline referral and notify doctor
- [ ] List sent/received referrals with filtering
- [ ] Cancel pending referral

**Appointment Tests:**
- [ ] Check availability for practitioner
- [ ] Get available slots for date
- [ ] Book appointment with valid slot
- [ ] Reject duplicate time slot
- [ ] Confirm appointment booking
- [ ] Complete appointment
- [ ] Cancel appointment with notification
- [ ] Emergency call to doctor

**Reminder Tests:**
- [ ] Auto-create reminders on appointment
- [ ] Send reminder at correct time
- [ ] Resend failed reminder
- [ ] Update reminder status
- [ ] Mark as delivered

**Availability Tests:**
- [ ] Set weekly availability
- [ ] Get availability for day
- [ ] Check break times
- [ ] Enforce max appointments per day
- [ ] Exclude past dates

---

## 📊 Part 10: Dashboard Widgets

### Add Dashboard Widgets

**Receptionist Dashboard:**
- [ ] New referrals received today
- [ ] Pending referral responses
- [ ] Appointments to confirm
- [ ] Quick book appointment button

**Practitioner Dashboard:**
- [ ] Incoming referrals
- [ ] Upcoming appointments
- [ ] Appointment reminders status
- [ ] On-call status indicator

**Admin Dashboard:**
- [ ] Total referrals sent/received
- [ ] Referral acceptance rate
- [ ] Inter-hospital network stats
- [ ] Appointment utilization
- [ ] Reminder delivery rate

---

## 📱 Part 11: UI Integration

### Add Menu Items

Update navigation/sidebar:

```vue
<!-- Referral Management -->
<MenuItem label="Referrals" icon="pi pi-share-alt">
  <MenuItem label="Send Referral" to="/referrals/create" />
  <MenuItem label="Manage Referrals" to="/referrals/tracker" />
  <MenuItem label="Received Referrals" to="/referrals/received" />
</MenuItem>

<!-- Appointments -->
<MenuItem label="Appointments" icon="pi pi-calendar">
  <MenuItem label="Book Appointment" to="/appointments/book" />
  <MenuItem label="My Appointments" to="/appointments/list" />
  <MenuItem label="Availability" to="/appointments/availability" />
</MenuItem>

<!-- Reminders -->
<MenuItem label="Reminders" icon="pi pi-bell" v-if="isAdmin">
  <MenuItem label="Manage Reminders" to="/reminders/manage" />
  <MenuItem label="Reminder History" to="/reminders/history" />
</MenuItem>
```

**Checklist:**
- [ ] Navigation menu updated
- [ ] Page routes created
- [ ] Components integrated into pages
- [ ] Authentication required on all pages
- [ ] Role-based menu visibility
- [ ] Breadcrumb navigation added
- [ ] Mobile responsive layout

---

## 🚀 Part 12: Deployment

### Pre-Production Checklist

**Database:**
- [ ] All migrations tested and working
- [ ] Indexes created for performance
- [ ] Backup strategy in place
- [ ] Schema documented

**Code:**
- [ ] All tests passing
- [ ] Code review completed
- [ ] Linting issues resolved
- [ ] TypeScript compilation successful

**Security:**
- [ ] RBAC implemented and tested
- [ ] Patient data properly isolated
- [ ] Audit logging enabled
- [ ] SMS service secured
- [ ] Phone call service secured

**Performance:**
- [ ] Database queries optimized
- [ ] API response times < 200ms
- [ ] Caching implemented
- [ ] Load testing completed

**Documentation:**
- [ ] API documentation updated
- [ ] User guide written
- [ ] Deployment guide created
- [ ] Troubleshooting guide added

---

## 📋 Implementation Timeline

**Phase 1: Foundation (1-2 weeks)**
- Create all migrations
- Implement models and relationships
- Set up controllers with endpoints
- Create services

**Phase 2: Services & Jobs (1-2 weeks)**
- Implement referral service
- Implement appointment service
- Implement reminder service
- Set up scheduled jobs

**Phase 3: UI Components (1-2 weeks)**
- Build all 5 PrimeVue components
- Integrate into dashboard pages
- Add navigation menu items
- Test user flows

**Phase 4: Testing & Refinement (1 week)**
- Unit tests
- Integration tests
- User acceptance testing
- Bug fixes

**Phase 5: Deployment (1 week)**
- Database migration
- Code deployment
- Monitoring setup
- User training

---

## ✅ Final Verification

Before marking as complete:

- [ ] All database tables created and tested
- [ ] All models implemented with relationships
- [ ] All controllers with full CRUD operations
- [ ] All services with business logic
- [ ] All components built and integrated
- [ ] All API endpoints working
- [ ] Authorization properly enforced
- [ ] SMS notifications sending
- [ ] Reminders triggering automatically
- [ ] Referral workflow end-to-end tested
- [ ] Appointment booking end-to-end tested
- [ ] Dashboard widgets displaying correctly
- [ ] Mobile responsive design verified
- [ ] Error handling and validation working
- [ ] Audit logging capturing all actions
- [ ] Production deployment successful

---

## 📞 Support Resources

**Documents:**
- `HMS_REFERRAL_APPOINTMENT_SYSTEM.md` - System spec
- `HMS_REFERRAL_IMPLEMENTATION.md` - Code examples
- `HMS_PRIMEVUE_COMPONENTS.md` - UI components
- `HMS_QUICK_START.md` - Quick start guide
- `IMPLEMENTATION_CODE.md` - Full code reference

**Common Issues:**
- See `HMS_QUICK_START.md` Troubleshooting section
- Check database migrations: `node ace migration:status`
- Verify SMS service configuration in `.env`
- Check appointment availability logic in AvailabilityService

---

**Status**: Implementation Guide Complete
**Version**: 1.0
**Last Updated**: 2026-07-10
**Ready for Development**: ✅ YES

Begin with **Part 1: Database Setup** and work through sequentially.
Good luck! 🚀
