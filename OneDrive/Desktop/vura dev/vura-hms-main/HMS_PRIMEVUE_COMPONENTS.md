# Vura HMS - PrimeVue Components for Referral & Appointment System

---

## Part 1: ReferralForm Component

```vue
<!-- resources/views/components/referral_form.vue -->
<template>
  <div class="referral-form-container">
    <Card>
      <template #title>
        <div class="flex items-center gap-2">
          <i class="pi pi-share-alt text-xl"></i>
          Send Patient Referral
        </div>
      </template>

      <Form @submit="submitForm" :validation-schema="validationSchema" v-slot="{ errors }">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Receiving Hospital Selection -->
          <div class="col-span-full">
            <label class="block text-sm font-medium mb-2">Receiving Hospital</label>
            <Dropdown
              v-model="form.toHealthCenterId"
              :options="hospitals"
              option-label="name"
              option-value="id"
              placeholder="Select hospital"
              filter
              show-clear
              :class="{ 'ng-invalid ng-touched': errors.toHealthCenterId }"
            />
            <small class="text-red-500" v-if="errors.toHealthCenterId">
              {{ errors.toHealthCenterId }}
            </small>
          </div>

          <!-- Patient Selection -->
          <div>
            <label class="block text-sm font-medium mb-2">Patient</label>
            <AutoComplete
              v-model="form.patientId"
              :suggestions="filteredPatients"
              @complete="searchPatients"
              field="fullName"
              placeholder="Search patient name or ID"
              :class="{ 'ng-invalid ng-touched': errors.patientId }"
            />
            <small class="text-red-500" v-if="errors.patientId">
              {{ errors.patientId }}
            </small>
          </div>

          <!-- Referral Reason -->
          <div>
            <label class="block text-sm font-medium mb-2">Reason for Referral</label>
            <Dropdown
              v-model="form.reason"
              :options="referralReasons"
              placeholder="Select reason"
              :class="{ 'ng-invalid ng-touched': errors.reason }"
            />
            <small class="text-red-500" v-if="errors.reason">
              {{ errors.reason }}
            </small>
          </div>

          <!-- Medical Summary -->
          <div class="col-span-full">
            <label class="block text-sm font-medium mb-2">Medical Summary</label>
            <Textarea
              v-model="form.medicalSummary"
              rows="4"
              placeholder="Brief summary of patient condition, current medications, recent tests..."
              :class="{ 'ng-invalid ng-touched': errors.medicalSummary }"
            />
            <small class="text-gray-500">{{ form.medicalSummary?.length || 0 }} / 500 characters</small>
          </div>

          <!-- Patient Info Display -->
          <div class="col-span-full">
            <Divider />
            <h4 class="text-sm font-medium mb-3">Patient Information (Auto-filled)</h4>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div>
                <span class="text-gray-500">National ID:</span>
                <p class="font-medium">{{ selectedPatient?.nationalId }}</p>
              </div>
              <div>
                <span class="text-gray-500">Gender:</span>
                <p class="font-medium">{{ selectedPatient?.gender }}</p>
              </div>
              <div>
                <span class="text-gray-500">Date of Birth:</span>
                <p class="font-medium">{{ formatDate(selectedPatient?.dateOfBirth) }}</p>
              </div>
              <div>
                <span class="text-gray-500">Phone:</span>
                <p class="font-medium">{{ selectedPatient?.phone }}</p>
              </div>
              <div>
                <span class="text-gray-500">Insurance:</span>
                <p class="font-medium">{{ selectedPatient?.insurances?.[0]?.name }}</p>
              </div>
            </div>
          </div>

          <!-- Additional Notes -->
          <div class="col-span-full">
            <label class="block text-sm font-medium mb-2">Additional Notes</label>
            <Textarea
              v-model="form.notes"
              rows="3"
              placeholder="Any additional information for receiving hospital..."
            />
          </div>

          <!-- Submit Button -->
          <div class="col-span-full flex justify-end gap-2">
            <Button
              type="button"
              label="Cancel"
              severity="secondary"
              @click="$emit('cancel')"
            />
            <Button
              type="submit"
              label="Send Referral"
              icon="pi pi-send"
              :loading="submitting"
            />
          </div>
        </div>
      </Form>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Form } from 'vee-validate'
import * as yup from 'yup'
import axios from 'axios'

const submitting = ref(false)
const hospitals = ref([])
const patients = ref([])
const filteredPatients = ref([])
const selectedPatient = ref(null)

const form = ref({
  toHealthCenterId: null,
  patientId: null,
  reason: '',
  medicalSummary: '',
  notes: '',
})

const referralReasons = [
  'Specialist consultation',
  'Surgery required',
  'Advanced diagnostics',
  'Emergency care',
  'Chronic disease management',
  'Rehabilitation',
  'Mental health support',
]

const validationSchema = yup.object({
  toHealthCenterId: yup.string().required('Hospital is required'),
  patientId: yup.string().required('Patient is required'),
  reason: yup.string().required('Reason is required'),
  medicalSummary: yup.string().max(500, 'Maximum 500 characters'),
})

const searchPatients = async (event: any) => {
  if (event.query.length < 2) return
  try {
    const { data } = await axios.get('/api/patients/search', {
      params: { q: event.query }
    })
    filteredPatients.value = data
  } catch (error) {
    console.error('Error searching patients', error)
  }
}

const submitForm = async (values: any) => {
  submitting.value = true
  try {
    await axios.post('/api/referrals', form.value)
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Referral sent successfully',
      life: 3000,
    })
    form.value = { toHealthCenterId: null, patientId: null, reason: '', medicalSummary: '', notes: '' }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to send referral',
      life: 3000,
    })
  } finally {
    submitting.value = false
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString()
}
</script>

<style scoped>
.referral-form-container {
  max-width: 900px;
  margin: 0 auto;
}
</style>
```

---

## Part 2: AppointmentBooking Component

```vue
<!-- resources/views/components/appointment_booking.vue -->
<template>
  <div class="appointment-booking-container">
    <Card>
      <template #title>
        <div class="flex items-center gap-2">
          <i class="pi pi-calendar text-xl"></i>
          Book Appointment
        </div>
      </template>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <!-- Left Panel: Selection -->
        <div class="lg:col-span-2">
          <Stepper v-model="activeStep">
            <StepperPanel header="Patient">
              <template #content="{ index, clickCallback }">
                <div class="space-y-4">
                  <AutoComplete
                    v-model="booking.patientId"
                    :suggestions="filteredPatients"
                    @complete="searchPatients"
                    field="fullName"
                    placeholder="Search patient"
                    class="w-full"
                  />

                  <div v-if="selectedPatient" class="bg-blue-50 p-3 rounded-lg">
                    <p class="font-medium">{{ selectedPatient.fullName }}</p>
                    <p class="text-sm text-gray-600">ID: {{ selectedPatient.nationalId }}</p>
                  </div>

                  <Button
                    label="Next"
                    icon="pi pi-arrow-right"
                    @click="clickCallback()"
                    :disabled="!booking.patientId"
                  />
                </div>
              </template>
            </StepperPanel>

            <StepperPanel header="Practitioner">
              <template #content="{ index, clickCallback }">
                <div class="space-y-4">
                  <Dropdown
                    v-model="booking.practitionerId"
                    :options="practitioners"
                    option-label="fullName"
                    option-value="id"
                    placeholder="Select practitioner"
                    filter
                    show-clear
                  />

                  <Dropdown
                    v-model="booking.department"
                    :options="departments"
                    placeholder="Select department"
                  />

                  <div class="flex gap-2">
                    <Button
                      label="Back"
                      icon="pi pi-arrow-left"
                      severity="secondary"
                      @click="activeStep = 0"
                    />
                    <Button
                      label="Next"
                      icon="pi pi-arrow-right"
                      @click="clickCallback()"
                      :disabled="!booking.practitionerId"
                    />
                  </div>
                </div>
              </template>
            </StepperPanel>

            <StepperPanel header="Date & Time">
              <template #content="{ index, clickCallback }">
                <div class="space-y-4">
                  <Calendar
                    v-model="booking.scheduledDate"
                    date-format="yy-mm-dd"
                    :min-date="minDate"
                    :inline="true"
                  />

                  <div>
                    <label class="block text-sm font-medium mb-2">Available Times</label>
                    <div class="grid grid-cols-4 gap-2">
                      <button
                        v-for="slot in availableSlots"
                        :key="slot.time"
                        @click="booking.scheduledTime = slot.time"
                        :disabled="!slot.available"
                        :class="{
                          'bg-blue-500 text-white': booking.scheduledTime === slot.time,
                          'bg-gray-100 text-gray-400': !slot.available,
                          'bg-gray-50 hover:bg-gray-100': slot.available && booking.scheduledTime !== slot.time,
                        }"
                        class="p-2 rounded text-sm font-medium cursor-pointer disabled:cursor-not-allowed"
                      >
                        {{ slot.time }}
                      </button>
                    </div>
                  </div>

                  <div class="flex gap-2">
                    <Button
                      label="Back"
                      icon="pi pi-arrow-left"
                      severity="secondary"
                      @click="activeStep = 1"
                    />
                    <Button
                      label="Next"
                      icon="pi pi-arrow-right"
                      @click="clickCallback()"
                      :disabled="!booking.scheduledTime"
                    />
                  </div>
                </div>
              </template>
            </StepperPanel>

            <StepperPanel header="Confirm">
              <template #content="{ index, clickCallback }">
                <div class="space-y-4">
                  <div class="bg-gray-50 p-4 rounded-lg space-y-2">
                    <p><strong>Patient:</strong> {{ selectedPatient?.fullName }}</p>
                    <p><strong>Practitioner:</strong> {{ selectedPractitioner?.fullName }}</p>
                    <p><strong>Department:</strong> {{ booking.department }}</p>
                    <p><strong>Date:</strong> {{ formatDate(booking.scheduledDate) }}</p>
                    <p><strong>Time:</strong> {{ booking.scheduledTime }}</p>
                    <p><strong>Type:</strong> {{ booking.appointmentType }}</p>
                  </div>

                  <Textarea
                    v-model="booking.reason"
                    rows="3"
                    placeholder="Reason for appointment (optional)"
                  />

                  <div class="flex gap-2">
                    <Button
                      label="Back"
                      icon="pi pi-arrow-left"
                      severity="secondary"
                      @click="activeStep = 2"
                    />
                    <Button
                      label="Confirm Booking"
                      icon="pi pi-check"
                      @click="submitBooking"
                      :loading="submitting"
                    />
                  </div>
                </div>
              </template>
            </StepperPanel>
          </Stepper>
        </div>

        <!-- Right Panel: Summary -->
        <div>
          <Card class="sticky top-4">
            <template #title>
              <i class="pi pi-info-circle mr-2"></i>
              Appointment Summary
            </template>

            <div class="space-y-3 text-sm">
              <div class="bg-blue-50 p-3 rounded" v-if="selectedPatient">
                <p class="text-gray-600">Patient</p>
                <p class="font-medium">{{ selectedPatient.fullName }}</p>
              </div>

              <div class="bg-green-50 p-3 rounded" v-if="selectedPractitioner">
                <p class="text-gray-600">Practitioner</p>
                <p class="font-medium">{{ selectedPractitioner.fullName }}</p>
              </div>

              <div class="bg-purple-50 p-3 rounded" v-if="booking.scheduledDate && booking.scheduledTime">
                <p class="text-gray-600">Date & Time</p>
                <p class="font-medium">{{ formatDate(booking.scheduledDate) }} at {{ booking.scheduledTime }}</p>
              </div>

              <Divider />

              <div class="space-y-2">
                <p class="text-gray-600">Process Progress</p>
                <ProgressBar :value="(activeStep + 1) * 25"></ProgressBar>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import axios from 'axios'

const activeStep = ref(0)
const submitting = ref(false)
const practitioners = ref([])
const patients = ref([])
const filteredPatients = ref([])
const availableSlots = ref([])
const minDate = new Date()

const booking = ref({
  patientId: null,
  practitionerId: null,
  scheduledDate: null,
  scheduledTime: null,
  department: '',
  appointmentType: 'consultation',
  reason: '',
})

const departments = [
  'General Medicine',
  'Surgery',
  'Pediatrics',
  'Gynecology',
  'Cardiology',
  'Neurology',
  'Psychiatry',
]

const selectedPatient = computed(() => {
  return patients.value.find(p => p.id === booking.value.patientId)
})

const selectedPractitioner = computed(() => {
  return practitioners.value.find(p => p.id === booking.value.practitionerId)
})

const searchPatients = async (event: any) => {
  if (event.query.length < 2) return
  try {
    const { data } = await axios.get('/api/patients/search', {
      params: { q: event.query }
    })
    filteredPatients.value = data
    patients.value = data
  } catch (error) {
    console.error('Error searching patients', error)
  }
}

const submitBooking = async () => {
  submitting.value = true
  try {
    await axios.post('/api/appointments', booking.value)
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Appointment booked successfully',
      life: 3000,
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to book appointment',
      life: 3000,
    })
  } finally {
    submitting.value = false
  }
}

const formatDate = (date: any) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
</script>

<style scoped>
.appointment-booking-container {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
```

---

## Part 3: AvailabilityCalendar Component

```vue
<!-- resources/views/components/availability_calendar.vue -->
<template>
  <div class="availability-calendar-container">
    <Card>
      <template #title>
        <div class="flex items-center gap-2">
          <i class="pi pi-clock text-xl"></i>
          Practitioner Availability
        </div>
      </template>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <!-- Calendar Panel -->
        <div class="lg:col-span-2">
          <Calendar
            v-model="selectedDate"
            :inline="true"
            :min-date="minDate"
            :disabled-dates="disabledDates"
            @date-select="onDateSelect"
            class="w-full"
          />

          <!-- Time Slots -->
          <div class="mt-6">
            <h3 class="text-lg font-medium mb-4">
              Available Slots for {{ formatDate(selectedDate) }}
            </h3>

            <div v-if="loadingSlots" class="flex justify-center py-8">
              <ProgressSpinner style="width: 50px; height: 50px" stroke-width="4" />
            </div>

            <div v-else class="grid grid-cols-4 gap-2">
              <button
                v-for="slot in timeSlots"
                :key="slot.time"
                @click="selectedTime = slot.time"
                :disabled="!slot.available"
                :class="{
                  'ring-2 ring-blue-500 bg-blue-50': selectedTime === slot.time,
                  'bg-gray-100 text-gray-400 cursor-not-allowed': !slot.available,
                  'bg-white hover:bg-gray-50 border border-gray-300 cursor-pointer': slot.available,
                }"
                class="p-3 rounded text-sm font-medium transition-all"
              >
                {{ slot.time }}
              </button>
            </div>

            <p v-if="timeSlots.filter(s => s.available).length === 0" class="text-center text-gray-500 py-4">
              No available slots for this day
            </p>
          </div>
        </div>

        <!-- Info Panel -->
        <div>
          <Card class="sticky top-4">
            <template #title>
              <i class="pi pi-info-circle mr-2"></i>
              Schedule Details
            </template>

            <div class="space-y-4 text-sm">
              <!-- Practitioner Info -->
              <div class="bg-blue-50 p-3 rounded-lg">
                <p class="text-gray-600 text-xs">Practitioner</p>
                <p class="font-medium">{{ practitioner?.fullName }}</p>
                <p class="text-gray-600">{{ practitioner?.specialization }}</p>
              </div>

              <!-- Selected Date/Time -->
              <div v-if="selectedDate" class="bg-green-50 p-3 rounded-lg">
                <p class="text-gray-600 text-xs">Selected</p>
                <p class="font-medium">{{ formatDate(selectedDate) }}</p>
                <p v-if="selectedTime" class="text-gray-600">{{ selectedTime }}</p>
              </div>

              <!-- Availability Info -->
              <div class="bg-purple-50 p-3 rounded-lg">
                <p class="text-gray-600 text-xs">Availability</p>
                <div class="space-y-2 mt-2">
                  <div class="flex justify-between">
                    <span>Today Availability:</span>
                    <Tag
                      :value="todayAvailabilityPercent + '%'"
                      :severity="todayAvailabilityPercent > 50 ? 'success' : 'warning'"
                    />
                  </div>
                  <ProgressBar :value="todayAvailabilityPercent"></ProgressBar>
                </div>
              </div>

              <!-- Working Hours -->
              <div class="space-y-2">
                <p class="font-medium text-gray-700">Working Hours</p>
                <div class="text-sm space-y-1">
                  <p><span class="text-gray-600">Start:</span> {{ practitioner?.workStartTime }}</p>
                  <p><span class="text-gray-600">End:</span> {{ practitioner?.workEndTime }}</p>
                  <p v-if="practitioner?.breakStartTime">
                    <span class="text-gray-600">Break:</span>
                    {{ practitioner?.breakStartTime }} - {{ practitioner?.breakEndTime }}
                  </p>
                </div>
              </div>

              <!-- Max Appointments -->
              <div class="bg-orange-50 p-3 rounded-lg">
                <p class="text-gray-600 text-xs">Capacity</p>
                <p class="font-medium">{{ availableCount }} / {{ practitioner?.maxAppointmentsPerDay }} slots available</p>
              </div>

              <Button
                label="Book This Slot"
                icon="pi pi-check"
                class="w-full"
                :disabled="!selectedTime"
                @click="$emit('confirm', { date: selectedDate, time: selectedTime })"
              />
            </div>
          </Card>
        </div>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import axios from 'axios'

const props = defineProps({
  practitionerId: {
    type: String,
    required: true,
  },
})

const selectedDate = ref(new Date())
const selectedTime = ref(null)
const loadingSlots = ref(false)
const timeSlots = ref([])
const minDate = new Date()
const disabledDates = ref([])
const practitioner = ref(null)

const availableCount = computed(() => {
  return timeSlots.value.filter(s => s.available).length
})

const todayAvailabilityPercent = computed(() => {
  const total = timeSlots.value.length
  const available = availableCount.value
  return total > 0 ? Math.round((available / total) * 100) : 0
})

const onDateSelect = async () => {
  loadingSlots.value = true
  try {
    const { data } = await axios.get(`/api/appointments/availability/${props.practitionerId}`, {
      params: {
        date: formatDateISO(selectedDate.value),
      },
    })
    timeSlots.value = data
  } catch (error) {
    console.error('Error fetching slots', error)
  } finally {
    loadingSlots.value = false
  }
}

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const formatDateISO = (date: Date) => {
  return date.toISOString().split('T')[0]
}

onMounted(async () => {
  await onDateSelect()
})
</script>

<style scoped>
.availability-calendar-container {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
```

---

## Part 4: ReferralTracker Component

```vue
<!-- resources/views/components/referral_tracker.vue -->
<template>
  <div class="referral-tracker-container">
    <TabView>
      <!-- Sent Referrals Tab -->
      <TabPanel header="Sent Referrals" leftIcon="pi pi-send">
        <div class="space-y-4">
          <div class="flex gap-2 mb-4">
            <InputGroup>
              <InputText
                v-model="searchQuery"
                placeholder="Search by patient name or hospital..."
                class="w-full"
              />
              <Button icon="pi pi-search" />
            </InputGroup>
            <Button
              icon="pi pi-refresh"
              @click="fetchSentReferrals"
              :loading="loading"
            />
          </div>

          <DataTable
            :value="sentReferrals"
            :loading="loading"
            paginator
            :rows="10"
            :total-records="sentReferrals.length"
            responsive-layout="scroll"
            striped-rows
          >
            <Column field="patient.fullName" header="Patient">
              <template #body="{ data }">
                <div>
                  <p class="font-medium">{{ data.patientFirstName }} {{ data.patientLastName }}</p>
                  <p class="text-sm text-gray-500">ID: {{ data.patientNationalId }}</p>
                </div>
              </template>
            </Column>

            <Column field="toHealthCenter.name" header="To Hospital" />

            <Column field="reason" header="Reason">
              <template #body="{ data }">
                <Tag :value="data.reason" />
              </template>
            </Column>

            <Column field="status" header="Status">
              <template #body="{ data }">
                <Tag
                  :value="data.status"
                  :severity="getStatusSeverity(data.status)"
                />
              </template>
            </Column>

            <Column field="createdAt" header="Sent Date">
              <template #body="{ data }">
                {{ formatDate(data.createdAt) }}
              </template>
            </Column>

            <Column header="Actions">
              <template #body="{ data }">
                <Button
                  icon="pi pi-eye"
                  class="p-button-rounded p-button-text"
                  @click="viewReferral(data)"
                  v-tooltip="'View Details'"
                />
                <Button
                  v-if="data.status === 'pending'"
                  icon="pi pi-times"
                  class="p-button-rounded p-button-text p-button-danger"
                  @click="cancelReferral(data.id)"
                  v-tooltip="'Cancel'"
                />
              </template>
            </Column>
          </DataTable>
        </div>
      </TabPanel>

      <!-- Received Referrals Tab -->
      <TabPanel header="Received Referrals" leftIcon="pi pi-inbox">
        <div class="space-y-4">
          <div class="flex gap-2 mb-4">
            <InputGroup>
              <InputText
                v-model="searchQuery"
                placeholder="Search referrals..."
                class="w-full"
              />
              <Button icon="pi pi-search" />
            </InputGroup>
            <Button
              icon="pi pi-refresh"
              @click="fetchReceivedReferrals"
              :loading="loading"
            />
          </div>

          <DataTable
            :value="receivedReferrals"
            :loading="loading"
            paginator
            :rows="10"
            responsive-layout="scroll"
            striped-rows
          >
            <Column field="referringDoctor.user.fullName" header="From Doctor" />

            <Column field="fromHealthCenter.name" header="From Hospital" />

            <Column field="patientFirstName" header="Patient">
              <template #body="{ data }">
                <div>
                  <p class="font-medium">{{ data.patientFirstName }} {{ data.patientLastName }}</p>
                  <p class="text-sm text-gray-500">{{ data.patientPhone }}</p>
                </div>
              </template>
            </Column>

            <Column field="reason" header="Reason">
              <template #body="{ data }">
                <Tag :value="data.reason" />
              </template>
            </Column>

            <Column field="status" header="Status">
              <template #body="{ data }">
                <Tag
                  :value="data.status"
                  :severity="getStatusSeverity(data.status)"
                />
              </template>
            </Column>

            <Column header="Actions">
              <template #body="{ data }">
                <div v-if="data.status === 'pending'" class="flex gap-2">
                  <Button
                    icon="pi pi-check"
                    class="p-button-rounded p-button-text p-button-success"
                    @click="respondToReferral(data.id, 'accepted')"
                    v-tooltip="'Accept'"
                  />
                  <Button
                    icon="pi pi-times"
                    class="p-button-rounded p-button-text p-button-danger"
                    @click="respondToReferral(data.id, 'declined')"
                    v-tooltip="'Decline'"
                  />
                </div>
                <Button
                  icon="pi pi-eye"
                  class="p-button-rounded p-button-text"
                  @click="viewReferral(data)"
                  v-tooltip="'View Details'"
                  v-else
                />
              </template>
            </Column>
          </DataTable>
        </div>
      </TabPanel>

      <!-- Statistics Tab -->
      <TabPanel header="Statistics" leftIcon="pi pi-chart-bar">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <template #title>Total Sent</template>
            <p class="text-3xl font-bold text-blue-600">{{ totalSent }}</p>
            <p class="text-sm text-gray-500">Referrals sent</p>
          </Card>

          <Card>
            <template #title>Total Received</template>
            <p class="text-3xl font-bold text-green-600">{{ totalReceived }}</p>
            <p class="text-sm text-gray-500">Referrals received</p>
          </Card>

          <Card>
            <template #title>Acceptance Rate</template>
            <p class="text-3xl font-bold text-purple-600">{{ acceptanceRate }}%</p>
            <p class="text-sm text-gray-500">Acceptance rate</p>
          </Card>

          <Card>
            <template #title>Pending</template>
            <p class="text-3xl font-bold text-orange-600">{{ pendingCount }}</p>
            <p class="text-sm text-gray-500">Awaiting response</p>
          </Card>
        </div>
      </TabPanel>
    </TabView>

    <!-- Referral Detail Dialog -->
    <Dialog
      v-model:visible="showDetailDialog"
      :header="`Referral Details - ${selectedReferral?.patientFirstName}`"
      :modal="true"
      :style="{ width: '500px' }"
    >
      <div v-if="selectedReferral" class="space-y-4">
        <div>
          <p class="text-gray-600 text-sm">Patient Information</p>
          <Divider />
          <div class="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span class="text-gray-600">Name:</span>
              <p class="font-medium">{{ selectedReferral.patientFirstName }} {{ selectedReferral.patientLastName }}</p>
            </div>
            <div>
              <span class="text-gray-600">National ID:</span>
              <p class="font-medium">{{ selectedReferral.patientNationalId }}</p>
            </div>
            <div>
              <span class="text-gray-600">Phone:</span>
              <p class="font-medium">{{ selectedReferral.patientPhone }}</p>
            </div>
            <div>
              <span class="text-gray-600">Gender:</span>
              <p class="font-medium">{{ selectedReferral.patientGender }}</p>
            </div>
          </div>
        </div>

        <div>
          <p class="text-gray-600 text-sm">Medical Summary</p>
          <Divider />
          <p class="text-sm">{{ selectedReferral.medicalSummary }}</p>
        </div>

        <div>
          <p class="text-gray-600 text-sm">Insurance Information</p>
          <Divider />
          <p class="text-sm">{{ JSON.stringify(selectedReferral.insuranceInfo, null, 2) }}</p>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const loading = ref(false)
const searchQuery = ref('')
const showDetailDialog = ref(false)
const selectedReferral = ref(null)
const sentReferrals = ref([])
const receivedReferrals = ref([])

const totalSent = computed(() => sentReferrals.value.length)
const totalReceived = computed(() => receivedReferrals.value.length)
const pendingCount = computed(() =>
  sentReferrals.value.filter(r => r.status === 'pending').length
)
const acceptanceRate = computed(() => {
  const accepted = sentReferrals.value.filter(r => r.status === 'accepted').length
  return totalSent.value > 0 ? Math.round((accepted / totalSent.value) * 100) : 0
})

const getStatusSeverity = (status: string) => {
  const severities: Record<string, string> = {
    pending: 'warning',
    accepted: 'success',
    declined: 'danger',
    completed: 'info',
  }
  return severities[status] || 'info'
}

const fetchSentReferrals = async () => {
  loading.value = true
  try {
    const { data } = await axios.get('/api/referrals/sent')
    sentReferrals.value = data
  } catch (error) {
    console.error('Error fetching sent referrals', error)
  } finally {
    loading.value = false
  }
}

const fetchReceivedReferrals = async () => {
  loading.value = true
  try {
    const { data } = await axios.get('/api/referrals/received')
    receivedReferrals.value = data
  } catch (error) {
    console.error('Error fetching received referrals', error)
  } finally {
    loading.value = false
  }
}

const respondToReferral = async (referralId: string, status: string) => {
  try {
    await axios.post(`/api/referrals/${referralId}/respond`, { status })
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: `Referral ${status}`,
      life: 3000,
    })
    await fetchReceivedReferrals()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to respond to referral',
      life: 3000,
    })
  }
}

const cancelReferral = async (referralId: string) => {
  try {
    await axios.delete(`/api/referrals/${referralId}`)
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Referral cancelled',
      life: 3000,
    })
    await fetchSentReferrals()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to cancel referral',
      life: 3000,
    })
  }
}

const viewReferral = (referral: any) => {
  selectedReferral.value = referral
  showDetailDialog.value = true
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString()
}

onMounted(() => {
  fetchSentReferrals()
  fetchReceivedReferrals()
})
</script>

<style scoped>
.referral-tracker-container {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
```

---

## Part 5: ReminderManagement Component

```vue
<!-- resources/views/components/reminder_management.vue -->
<template>
  <div class="reminder-management-container">
    <Card>
      <template #title>
        <div class="flex items-center gap-2">
          <i class="pi pi-bell text-xl"></i>
          Appointment Reminders
        </div>
      </template>

      <div class="space-y-4">
        <!-- Filters -->
        <div class="flex flex-wrap gap-2 mb-4">
          <Dropdown
            v-model="filters.status"
            :options="['All', 'Pending', 'Sent', 'Delivered', 'Failed']"
            placeholder="Filter by status"
            @change="applyFilters"
            class="w-40"
          />
          <Dropdown
            v-model="filters.reminderType"
            :options="['All', 'SMS', 'Email', 'Phone Call']"
            placeholder="Filter by type"
            @change="applyFilters"
            class="w-40"
          />
          <Button
            icon="pi pi-refresh"
            @click="fetchReminders"
            :loading="loading"
          />
        </div>

        <!-- Reminders Table -->
        <DataTable
          :value="filteredReminders"
          :loading="loading"
          paginator
          :rows="10"
          responsive-layout="scroll"
          striped-rows
        >
          <Column field="appointment.patient.fullName" header="Patient">
            <template #body="{ data }">
              <div>
                <p class="font-medium">{{ data.appointment?.patient?.fullName }}</p>
                <p class="text-sm text-gray-500">{{ data.appointment?.scheduledDate }} at {{ data.appointment?.scheduledTime }}</p>
              </div>
            </template>
          </Column>

          <Column field="reminderType" header="Type">
            <template #body="{ data }">
              <Tag
                :value="data.reminderType.toUpperCase()"
                :severity="getReminderTypeSeverity(data.reminderType)"
              />
            </template>
          </Column>

          <Column field="remindBeforeHours" header="Before (Hours)">
            <template #body="{ data }">
              <Badge :value="data.remindBeforeHours" class="bg-blue-500" />
            </template>
          </Column>

          <Column field="status" header="Status">
            <template #body="{ data }">
              <Tag
                :value="data.status"
                :severity="getStatusSeverity(data.status)"
              />
            </template>
          </Column>

          <Column field="reminderDate" header="Scheduled">
            <template #body="{ data }">
              {{ formatDateTime(data.reminderDate, data.reminderTime) }}
            </template>
          </Column>

          <Column header="Actions">
            <template #body="{ data }">
              <Button
                v-if="data.status === 'pending'"
                icon="pi pi-send"
                class="p-button-rounded p-button-text p-button-success"
                @click="resendReminder(data.id)"
                v-tooltip="'Send Now'"
              />
              <Button
                icon="pi pi-eye"
                class="p-button-rounded p-button-text"
                @click="viewReminder(data)"
                v-tooltip="'View Details'"
              />
            </template>
          </Column>
        </DataTable>

        <!-- Statistics -->
        <Divider />
        <div class="grid grid-cols-4 gap-4">
          <div class="text-center">
            <p class="text-3xl font-bold text-orange-600">{{ pendingCount }}</p>
            <p class="text-sm text-gray-600">Pending</p>
          </div>
          <div class="text-center">
            <p class="text-3xl font-bold text-green-600">{{ sentCount }}</p>
            <p class="text-sm text-gray-600">Sent</p>
          </div>
          <div class="text-center">
            <p class="text-3xl font-bold text-blue-600">{{ deliveredCount }}</p>
            <p class="text-sm text-gray-600">Delivered</p>
          </div>
          <div class="text-center">
            <p class="text-3xl font-bold text-red-600">{{ failedCount }}</p>
            <p class="text-sm text-gray-600">Failed</p>
          </div>
        </div>
      </div>
    </Card>

    <!-- Reminder Detail Dialog -->
    <Dialog
      v-model:visible="showDetailDialog"
      header="Reminder Details"
      :modal="true"
      :style="{ width: '500px' }"
    >
      <div v-if="selectedReminder" class="space-y-4">
        <div>
          <p class="text-gray-600 text-sm mb-2">Appointment</p>
          <div class="bg-blue-50 p-3 rounded">
            <p class="font-medium">{{ selectedReminder.appointment?.patient?.fullName }}</p>
            <p class="text-sm text-gray-600">
              {{ selectedReminder.appointment?.scheduledDate }} at {{ selectedReminder.appointment?.scheduledTime }}
            </p>
          </div>
        </div>

        <div>
          <p class="text-gray-600 text-sm mb-2">Reminder Details</p>
          <div class="space-y-2 text-sm">
            <p><strong>Type:</strong> {{ selectedReminder.reminderType }}</p>
            <p><strong>Status:</strong> {{ selectedReminder.status }}</p>
            <p><strong>Scheduled:</strong> {{ formatDateTime(selectedReminder.reminderDate, selectedReminder.reminderTime) }}</p>
            <p><strong>Hours Before:</strong> {{ selectedReminder.remindBeforeHours }}</p>
          </div>
        </div>

        <div>
          <p class="text-gray-600 text-sm mb-2">Message Content</p>
          <div class="bg-gray-50 p-3 rounded text-sm">
            {{ selectedReminder.messageContent }}
          </div>
        </div>

        <div v-if="selectedReminder.status === 'failed'">
          <p class="text-gray-600 text-sm mb-2">Failure Reason</p>
          <div class="bg-red-50 p-3 rounded text-sm text-red-700">
            {{ selectedReminder.failedReason }}
          </div>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import axios from 'axios'

const loading = ref(false)
const reminders = ref([])
const showDetailDialog = ref(false)
const selectedReminder = ref(null)

const filters = ref({
  status: 'All',
  reminderType: 'All',
})

const filteredReminders = computed(() => {
  return reminders.value.filter(r => {
    const statusMatch = filters.value.status === 'All' || r.status === filters.value.status.toLowerCase()
    const typeMatch = filters.value.reminderType === 'All' || r.reminderType === filters.value.reminderType.toLowerCase()
    return statusMatch && typeMatch
  })
})

const pendingCount = computed(() => reminders.value.filter(r => r.status === 'pending').length)
const sentCount = computed(() => reminders.value.filter(r => r.status === 'sent').length)
const deliveredCount = computed(() => reminders.value.filter(r => r.status === 'delivered').length)
const failedCount = computed(() => reminders.value.filter(r => r.status === 'failed').length)

const getStatusSeverity = (status: string) => {
  const severities: Record<string, string> = {
    pending: 'warning',
    sent: 'info',
    delivered: 'success',
    failed: 'danger',
  }
  return severities[status] || 'info'
}

const getReminderTypeSeverity = (type: string) => {
  const severities: Record<string, string> = {
    sms: 'info',
    email: 'success',
    phone_call: 'warning',
  }
  return severities[type] || 'info'
}

const fetchReminders = async () => {
  loading.value = true
  try {
    const { data } = await axios.get('/api/reminders')
    reminders.value = data
  } catch (error) {
    console.error('Error fetching reminders', error)
  } finally {
    loading.value = false
  }
}

const resendReminder = async (reminderId: string) => {
  try {
    await axios.post(`/api/reminders/${reminderId}/resend`)
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Reminder sent successfully',
      life: 3000,
    })
    await fetchReminders()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to send reminder',
      life: 3000,
    })
  }
}

const viewReminder = (reminder: any) => {
  selectedReminder.value = reminder
  showDetailDialog.value = true
}

const applyFilters = () => {
  // Filtering is handled by computed property
}

const formatDateTime = (date: string, time: string) => {
  return `${new Date(date).toLocaleDateString()} at ${time}`
}

onMounted(() => {
  fetchReminders()
})
</script>

<style scoped>
.reminder-management-container {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
```

---

## Component Integration Notes

These components should be integrated into the HMS dashboard as follows:

1. **ReferralForm** - Add to Receptionist/Doctor dashboard for sending referrals
2. **AppointmentBooking** - Add to Receptionist dashboard for booking appointments
3. **AvailabilityCalendar** - Show practitioner availability when selecting time
4. **ReferralTracker** - Add to Dashboard as main referral management page
5. **ReminderManagement** - Add to Admin/Receptionist dashboard for managing SMS reminders

---

**Status**: Components Ready for Implementation
**Version**: 1.0
**Technology**: Vue 3 + PrimeVue 4.4 + TypeScript
