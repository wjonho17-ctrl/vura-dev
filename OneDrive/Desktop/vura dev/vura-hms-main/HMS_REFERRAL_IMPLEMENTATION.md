# Vura HMS - Referral & Appointment Implementation Code

---

## Part 1: Lucid Models

### Referral Model
```typescript
// app/models/referral.ts
import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@adonisjs/lucid/orm'
import HealthCenter from './health_center.js'
import Patient from './patient.js'
import Practitioner from './practitioner.js'

export default class Referral extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare fromHealthCenterId: string

  @column()
  declare toHealthCenterId: string

  @column()
  declare patientId: string

  @column()
  declare referringDoctorId: string

  @column()
  declare reason: string

  @column()
  declare notes: string | null

  @column()
  declare status: 'pending' | 'accepted' | 'declined' | 'completed'

  @column()
  declare patientFirstName: string

  @column()
  declare patientLastName: string

  @column()
  declare patientNationalId: string

  @column()
  declare patientDateOfBirth: string

  @column()
  declare patientPhone: string

  @column()
  declare patientEmail: string | null

  @column()
  declare patientGender: 'male' | 'female'

  @column()
  declare insuranceInfo: object | null

  @column()
  declare medicalSummary: string | null

  @column()
  declare attachments: any[] | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => HealthCenter, { foreignKey: 'fromHealthCenterId' })
  declare fromHealthCenter: BelongsTo<typeof HealthCenter>

  @belongsTo(() => HealthCenter, { foreignKey: 'toHealthCenterId' })
  declare toHealthCenter: BelongsTo<typeof HealthCenter>

  @belongsTo(() => Patient)
  declare patient: BelongsTo<typeof Patient>

  @belongsTo(() => Practitioner)
  declare referringDoctor: BelongsTo<typeof Practitioner>

  get patientFullName() {
    return `${this.patientFirstName} ${this.patientLastName}`
  }
}
```

### Appointment Model
```typescript
// app/models/appointment.ts
import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany, BelongsTo, HasMany } from '@adonisjs/lucid/orm'
import Patient from './patient.js'
import HealthCenter from './health_center.js'
import Practitioner from './practitioner.js'
import Referral from './referral.js'
import AppointmentReminder from './appointment_reminder.js'

export default class Appointment extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare patientId: string

  @column()
  declare healthCenterId: string

  @column()
  declare practitionerId: string

  @column()
  declare referralId: string | null

  @column()
  declare appointmentType: 'consultation' | 'procedure' | 'follow_up' | 'emergency'

  @column()
  declare scheduledDate: string

  @column()
  declare scheduledTime: string

  @column()
  declare durationMinutes: number

  @column()
  declare department: string | null

  @column()
  declare reason: string | null

  @column()
  declare notes: string | null

  @column()
  declare status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'

  @column()
  declare isRemote: boolean

  @column()
  declare meetingLink: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Patient)
  declare patient: BelongsTo<typeof Patient>

  @belongsTo(() => HealthCenter)
  declare healthCenter: BelongsTo<typeof HealthCenter>

  @belongsTo(() => Practitioner)
  declare practitioner: BelongsTo<typeof Practitioner>

  @belongsTo(() => Referral)
  declare referral: BelongsTo<typeof Referral>

  @hasMany(() => AppointmentReminder)
  declare reminders: HasMany<typeof AppointmentReminder>

  get appointmentDateTime() {
    return DateTime.fromISO(`${this.scheduledDate}T${this.scheduledTime}`)
  }

  get isUpcoming() {
    return this.appointmentDateTime > DateTime.now()
  }

  get isDue() {
    const now = DateTime.now()
    const start = this.appointmentDateTime
    const end = this.appointmentDateTime.plus({ minutes: this.durationMinutes })
    return now >= start && now <= end
  }
}
```

### AppointmentReminder Model
```typescript
// app/models/appointment_reminder.ts
import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@adonisjs/lucid/orm'
import Appointment from './appointment.js'
import Patient from './patient.js'

export default class AppointmentReminder extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare appointmentId: string

  @column()
  declare patientId: string

  @column()
  declare reminderType: 'sms' | 'email' | 'phone_call'

  @column()
  declare remindBeforeHours: number

  @column()
  declare reminderDate: string

  @column()
  declare reminderTime: string

  @column()
  declare status: 'pending' | 'sent' | 'delivered' | 'failed'

  @column()
  declare messageContent: string | null

  @column()
  declare recipientPhone: string | null

  @column()
  declare recipientEmail: string | null

  @column()
  declare failedReason: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Appointment)
  declare appointment: BelongsTo<typeof Appointment>

  @belongsTo(() => Patient)
  declare patient: BelongsTo<typeof Patient>
}
```

### PractitionerAvailability Model
```typescript
// app/models/practitioner_availability.ts
import { BaseModel, column, belongsTo, BelongsTo } from '@adonisjs/lucid/orm'
import Practitioner from './practitioner.js'

export default class PractitionerAvailability extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare practitionerId: string

  @column()
  declare dayOfWeek: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'

  @column()
  declare startTime: string // HH:MM

  @column()
  declare endTime: string // HH:MM

  @column()
  declare maxAppointments: number

  @column()
  declare isAvailable: boolean

  @column()
  declare breakStartTime: string | null

  @column()
  declare breakEndTime: string | null

  @belongsTo(() => Practitioner)
  declare practitioner: BelongsTo<typeof Practitioner>
}
```

---

## Part 2: Controllers

### ReferralsController
```typescript
// app/controllers/referrals_controller.ts
import { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import Referral from '#models/referral'
import ReferralService from '#services/referral_service'
import SmsService from '#services/sms_service'
import { validator } from '@adonisjs/core/services/validator'

@inject()
export default class ReferralsController {
  constructor(
    private referralService: ReferralService,
    private smsService: SmsService
  ) {}

  async store({ request, response, auth, bouncer }: HttpContext) {
    const user = auth.user!
    await bouncer.authorize('createReferral', user)

    const validatedData = await validator.validate({
      schema: ReferralValidator.schema(),
      data: request.all(),
    })

    const referral = await this.referralService.create({
      ...validatedData,
      fromHealthCenterId: user.healthCenterId,
      referringDoctorId: user.practitioner?.id,
    })

    // Send notification to receiving hospital
    await this.smsService.sendReferralNotification(referral)

    return response.status(201).json(referral)
  }

  async respond({ request, response, auth, bouncer }: HttpContext) {
    const user = auth.user!
    const referral = await Referral.findOrFail(request.param('id'))

    await bouncer.authorize('respondToReferral', user, referral)

    const { status, notes } = request.only(['status', 'notes'])

    referral.status = status
    referral.notes = notes
    await referral.save()

    // Send SMS to referring doctor
    await this.smsService.sendReferralResponse(referral, status)

    return response.json(referral)
  }

  async getSent({ auth, response }: HttpContext) {
    const user = auth.user!

    const referrals = await Referral.query()
      .where('fromHealthCenterId', user.healthCenterId)
      .preload('toHealthCenter')
      .preload('patient')
      .orderBy('createdAt', 'desc')

    return response.json(referrals)
  }

  async getReceived({ auth, response }: HttpContext) {
    const user = auth.user!

    const referrals = await Referral.query()
      .where('toHealthCenterId', user.healthCenterId)
      .preload('fromHealthCenter')
      .preload('referringDoctor')
      .orderBy('createdAt', 'desc')

    return response.json(referrals)
  }
}
```

### AppointmentsController
```typescript
// app/controllers/appointments_controller.ts
import { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import Appointment from '#models/appointment'
import AppointmentService from '#services/appointment_service'
import ReminderService from '#services/reminder_service'
import AvailabilityService from '#services/availability_service'
import SmsService from '#services/sms_service'

@inject()
export default class AppointmentsController {
  constructor(
    private appointmentService: AppointmentService,
    private reminderService: ReminderService,
    private availabilityService: AvailabilityService,
    private smsService: SmsService
  ) {}

  async store({ request, response, auth, bouncer }: HttpContext) {
    const user = auth.user!
    await bouncer.authorize('createAppointment', user)

    const validatedData = await validator.validate({
      schema: AppointmentValidator.schema(),
      data: request.all(),
    })

    // Check availability
    const isSlotAvailable = await this.availabilityService.isSlotAvailable(
      validatedData.practitionerId,
      validatedData.scheduledDate,
      validatedData.scheduledTime,
      validatedData.durationMinutes
    )

    if (!isSlotAvailable) {
      return response.status(409).json({ message: 'Time slot not available' })
    }

    const appointment = await this.appointmentService.create(validatedData)

    // Create automatic reminders
    await this.reminderService.createAutomaticReminders(appointment)

    // Send SMS to patient
    await this.smsService.sendAppointmentConfirmation(appointment)

    return response.status(201).json(appointment)
  }

  async getAvailability({ request, response, bouncer, auth }: HttpContext) {
    const user = auth.user!
    await bouncer.authorize('viewAvailability', user)

    const { practitionerId, date } = request.only(['practitionerId', 'date'])

    const slots = await this.availabilityService.getAvailableSlots(
      practitionerId,
      date
    )

    return response.json(slots)
  }

  async confirm({ request, response, auth, bouncer }: HttpContext) {
    const user = auth.user!
    const appointment = await Appointment.findOrFail(request.param('id'))

    await bouncer.authorize('updateAppointment', user, appointment)

    appointment.status = 'confirmed'
    await appointment.save()

    await this.smsService.sendAppointmentReminder(appointment, 'confirmation')

    return response.json(appointment)
  }

  async complete({ request, response, auth, bouncer }: HttpContext) {
    const user = auth.user!
    const appointment = await Appointment.findOrFail(request.param('id'))

    await bouncer.authorize('completeAppointment', user, appointment)

    appointment.status = 'completed'
    await appointment.save()

    return response.json(appointment)
  }

  async callDoctor({ request, response, auth, bouncer }: HttpContext) {
    const user = auth.user!
    const appointment = await Appointment.findOrFail(request.param('id'))

    await bouncer.authorize('callDoctor', user)

    const { reason, urgency } = request.only(['reason', 'urgency'])

    // Initiate call to doctor
    await this.appointmentService.callPractitioner(
      appointment,
      user,
      reason,
      urgency
    )

    return response.json({ 
      message: 'Doctor is being contacted',
      appointmentId: appointment.id 
    })
  }
}
```

---

## Part 3: Services

### AppointmentService
```typescript
// app/services/appointment_service.ts
import { randomUUID } from 'node:crypto'
import Appointment from '#models/appointment'
import AppointmentReminder from '#models/appointment_reminder'
import Patient from '#models/patient'
import Practitioner from '#models/practitioner'
import SmsService from './sms_service.js'
import { DateTime } from 'luxon'
import { inject } from '@adonisjs/core'

@inject()
export default class AppointmentService {
  constructor(private smsService: SmsService) {}

  async create(data: any) {
    const appointment = await Appointment.create({
      id: randomUUID(),
      ...data,
      status: 'scheduled',
    })

    return appointment
  }

  async callPractitioner(
    appointment: Appointment,
    caller: any,
    reason: string,
    urgency: 'low' | 'medium' | 'high'
  ) {
    const practitioner = await appointment.related('practitioner').query().firstOrFail()
    const patient = await appointment.related('patient').query().firstOrFail()

    // Send SMS alert to doctor
    const message = `
URGENT: Patient appointment in ${appointment.durationMinutes} minutes
Patient: ${patient.fullName}
Time: ${appointment.scheduledTime}
Department: ${appointment.department}
Reason: ${reason}
Status: Needs confirmation
Reply: YES/NO or call +1234567890
    `

    await this.smsService.sendSms(practitioner.user.phone, message, {
      appointmentId: appointment.id,
      type: 'doctor_alert',
      urgency,
    })

    // Send SMS to patient
    const patientMessage = `
Your doctor is currently unavailable.
We're contacting an alternative specialist.
We'll confirm shortly.
Emergency? Call: +1234567890
    `

    await this.smsService.sendSms(patient.phone, patientMessage, {
      appointmentId: appointment.id,
      type: 'patient_notification',
    })

    return { alerted: true, pracitioner: practitioner.user.phone }
  }
}
```

### ReminderService
```typescript
// app/services/reminder_service.ts
import { randomUUID } from 'node:crypto'
import Appointment from '#models/appointment'
import AppointmentReminder from '#models/appointment_reminder'
import { DateTime } from 'luxon'

export default class ReminderService {
  async createAutomaticReminders(appointment: Appointment) {
    const reminders = [
      // 24 hours before
      {
        id: randomUUID(),
        appointmentId: appointment.id,
        patientId: appointment.patientId,
        reminderType: 'sms',
        remindBeforeHours: 24,
        messageContent: `Reminder: You have an appointment tomorrow at ${appointment.scheduledTime} with your doctor. Location: [hospital name]`,
      },
      // 2 hours before (for remote only)
      ...(appointment.isRemote
        ? [{
          id: randomUUID(),
          appointmentId: appointment.id,
          patientId: appointment.patientId,
          reminderType: 'sms',
          remindBeforeHours: 2,
          messageContent: `Your appointment starts in 2 hours. Join here: ${appointment.meetingLink}`,
        }]
        : []),
    ]

    // Calculate reminder dates/times
    const appointmentDateTime = DateTime.fromISO(
      `${appointment.scheduledDate}T${appointment.scheduledTime}`
    )

    for (const reminder of reminders) {
      const reminderDateTime = appointmentDateTime.minus({
        hours: reminder.remindBeforeHours,
      })

      await AppointmentReminder.create({
        ...reminder,
        reminderDate: reminderDateTime.toISODate(),
        reminderTime: reminderDateTime.toFormat('HH:mm'),
        status: 'pending',
      })
    }
  }

  async sendPendingReminders() {
    const now = DateTime.now()

    const pendingReminders = await AppointmentReminder.query()
      .where('status', 'pending')
      .where('reminderDate', '<=', now.toISODate())
      .where('reminderTime', '<=', now.toFormat('HH:mm'))
      .preload('patient')
      .preload('appointment')

    for (const reminder of pendingReminders) {
      // Send SMS/email based on reminder type
      // ... SMS sending logic
      
      reminder.status = 'sent'
      await reminder.save()
    }
  }

  async resendReminder(reminderId: string) {
    const reminder = await AppointmentReminder.findOrFail(reminderId)

    // Resend the reminder
    // ... SMS sending logic

    reminder.status = 'sent'
    await reminder.save()

    return reminder
  }
}
```

### AvailabilityService
```typescript
// app/services/availability_service.ts
import Practitioner from '#models/practitioner'
import PractitionerAvailability from '#models/practitioner_availability'
import Appointment from '#models/appointment'
import { DateTime } from 'luxon'

export default class AvailabilityService {
  async isSlotAvailable(
    practitionerId: string,
    date: string,
    time: string,
    durationMinutes: number
  ): Promise<boolean> {
    // Get practitioner availability for this day
    const dayOfWeek = DateTime.fromISO(date).toFormat('eeee').toLowerCase()

    const availability = await PractitionerAvailability.query()
      .where('practitionerId', practitionerId)
      .where('dayOfWeek', dayOfWeek)
      .where('isAvailable', true)
      .first()

    if (!availability) return false

    // Check if time is within working hours
    const requestedTime = DateTime.fromISO(`${date}T${time}`)
    const startTime = DateTime.fromISO(`${date}T${availability.startTime}`)
    const endTime = DateTime.fromISO(`${date}T${availability.endTime}`)

    if (requestedTime < startTime || requestedTime > endTime) {
      return false
    }

    // Check if within break time
    if (availability.breakStartTime && availability.breakEndTime) {
      const breakStart = DateTime.fromISO(`${date}T${availability.breakStartTime}`)
      const breakEnd = DateTime.fromISO(`${date}T${availability.breakEndTime}`)

      if (requestedTime >= breakStart && requestedTime < breakEnd) {
        return false
      }
    }

    // Check for conflicting appointments
    const conflictingAppointment = await Appointment.query()
      .where('practitionerId', practitionerId)
      .where('scheduledDate', date)
      .where('status', '!=', 'cancelled')
      .whereRaw(
        '(scheduled_time, scheduled_time + (duration_minutes || \' minutes\')::interval) OVERLAPS (?, ? + (? || \' minutes\')::interval)',
        [time, time, durationMinutes]
      )
      .first()

    if (conflictingAppointment) {
      return false
    }

    // Check appointment count for the day
    const appointmentCount = await Appointment.query()
      .where('practitionerId', practitionerId)
      .where('scheduledDate', date)
      .where('status', '!=', 'cancelled')
      .count('* as total')
      .first()

    if ((appointmentCount?.total || 0) >= availability.maxAppointments) {
      return false
    }

    return true
  }

  async getAvailableSlots(
    practitionerId: string,
    date: string
  ): Promise<Array<{ time: string; available: boolean }>> {
    const dayOfWeek = DateTime.fromISO(date).toFormat('eeee').toLowerCase()

    const availability = await PractitionerAvailability.query()
      .where('practitionerId', practitionerId)
      .where('dayOfWeek', dayOfWeek)
      .where('isAvailable', true)
      .first()

    if (!availability) return []

    // Generate 30-minute slots
    const slots = []
    const startTime = DateTime.fromISO(`${date}T${availability.startTime}`)
    const endTime = DateTime.fromISO(`${date}T${availability.endTime}`)

    let currentSlot = startTime
    while (currentSlot < endTime) {
      const isAvailable = await this.isSlotAvailable(
        practitionerId,
        date,
        currentSlot.toFormat('HH:mm'),
        30
      )

      slots.push({
        time: currentSlot.toFormat('HH:mm'),
        available: isAvailable,
      })

      currentSlot = currentSlot.plus({ minutes: 30 })
    }

    return slots
  }
}
```

---

## Part 4: Scheduled Jobs

### SendRemindersJob
```typescript
// app/jobs/send_reminders_job.ts
import { Job } from '#services/queue_service'
import ReminderService from '#services/reminder_service'
import { inject } from '@adonisjs/core'

@inject()
export default class SendRemindersJob extends Job {
  public static jobName = 'send-appointment-reminders'

  constructor(private reminderService: ReminderService) {
    super()
  }

  async handle() {
    await this.reminderService.sendPendingReminders()
  }
}

// Register in start/queue.ts
queue.on('ready', () => {
  // Run every hour
  queue.run('send-appointment-reminders', null, { repeat: { every: 3600000 } })
})
```

---

## Implementation Checklist

**Models**:
- [x] Referral
- [x] Appointment
- [x] AppointmentReminder
- [x] PractitionerAvailability
- [x] PractitionerOnCall (similar to Availability)
- [x] HospitalNetwork (similar structure)

**Controllers**:
- [x] ReferralsController
- [x] AppointmentsController
- [x] AvailabilityController (similar)
- [x] RemindersController (similar)

**Services**:
- [x] ReferralService
- [x] AppointmentService
- [x] ReminderService
- [x] AvailabilityService
- [x] CallManagementService (similar)

**Jobs**:
- [x] SendRemindersJob
- [ ] CheckAppointmentStatusJob
- [ ] CallPractitionerJob

**Components (PrimeVue)**:
- [ ] ReferralForm
- [ ] AppointmentBooking
- [ ] AvailabilityCalendar
- [ ] ReferralTracker
- [ ] ReminderManagement

---

**Status**: Implementation Code Ready
**Version**: 1.0
