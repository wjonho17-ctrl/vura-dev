import { HospitalPosition } from '#enums/prescription_user_enum'
import type { DefineComponent } from 'vue'
import DashboardLayout from '~/components/layouts/AppLayout.vue'
import DefaultLayout from '~/components/layouts/EmptyLayout.vue'

export function setLayout(name: string, page: DefineComponent) {
  if (!page.default) {
    throw new Error(`Page ${name} does not have a default export`)
  }

  if (page.default.layout) {
    return
  }

  if (name.includes('dashboard')) {
    page.default.layout = DashboardLayout
  } else {
    page.default.layout = DefaultLayout
  }
}

export const getGendersOptions = () => {
  return [
    { label: 'Male', value: 'M' },
    { label: 'Female', value: 'F' },
  ]
}

export function formatCurrency(value: number) {
  if (value) return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
  return
}

export const CLIENT_ROLES_OPTIONS = [
  { label: 'Pharmacist', value: 3 },
  { label: 'Wholeseller', value: 11 }
]

export const PHARMACY_EMPLOYEE_ROLES_OPTIONS = [
  { label: 'Pharmacy', value: '1' },
  { label: 'Wholeseller', value: '2' }
]

export const PHARMACY_EMPLOYEE_POSITIONS_OPTIONS = [
  { label: 'Pharmacy Manager', value: 'PHARMACY_MANAGER' },
  { label: 'Branch Manager', value: 'BRANCCH_MANAGER' },
  { label: 'Pharmacist', value: 'PHARMACIST' },
  { label: 'Finance', value: 'FINANCE' },
  { label: 'Nurse', value: 'NURSE' },
]

export const TRANSPORTER_TYPES_OPTIONS = [
  { label: 'Moto', value: 'MOTO' }
]

export function getPharmacyEmloyeeRoleName(role: '1' | '2') {
  return role === '1' ? 'Pharmacy' : 'Wholeseller'
}

export function getAllCountries() {
  return [
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda",
    "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas",
    "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin",
    "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei",
    "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon",
    "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia",
    "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba",
    "Cyprus", "Czechia (Czech Republic)", "Democratic Republic of the Congo",
    "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt",
    "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini",
    "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia",
    "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau",
    "Guyana", "Haiti", "Holy See", "Honduras", "Hungary", "Iceland", "India",
    "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan",
    "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos",
    "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein",
    "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives",
    "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico",
    "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco",
    "Mozambique", "Myanmar (formerly Burma)", "Namibia", "Nauru", "Nepal",
    "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea",
    "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine State",
    "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland",
    "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis",
    "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino",
    "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles",
    "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands",
    "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka",
    "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Tajikistan",
    "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago",
    "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine",
    "United Arab Emirates", "United Kingdom", "United States of America",
    "Uruguay", "Uzbekistan", "Vanuatu", "Venezuela", "Vietnam", "Yemen",
    "Zambia", "Zimbabwe"
  ]
}

export const getProductClassifications = () => [
  { label: 'Human Medicine', value: '1' },
  { label: 'Veterinary Medicine', value: '2' },
  { label: 'Food Products', value: '3' },
  { label: 'Cosmetics and Household Chemicals', value: '4' },
  { label: 'Human Medical Devices', value: '5' },
  { label: 'Other', value: '6' }
];

export function getProductClassificationFromValue(classifications: { label: string, value: string }[], value: string) {
  return classifications.find(c => c.value === value)?.label
}

export function isInsuranceProductAsSamePrice(insurances: { price: number }[]) {
  return insurances.every(insurance => insurance.price === insurances[0].price)
}

export const getDoctorInstructions = () => [
  { short: "NS", full: "Normal Saline" },
  { short: "NPO", full: "Nothing by Mouth" },
  { short: "PRN", full: "As Needed" },
  { short: "BID", full: "Twice a Day" },
  { short: "TID", full: "Three Times a Day" },
  { short: "QID", full: "Four Times a Day" },
  { short: "OD", full: "Once a Day" },
  { short: "IV", full: "Intravenous" },
  { short: "IM", full: "Intramuscular" },
  { short: "SC", full: "Subcutaneous" },
  { short: "PO", full: "By Mouth" },
  { short: "SOS", full: "If Necessary" },
  { short: "STAT", full: "Immediately" },
  { short: "HS", full: "At Bedtime" },
  { short: "AC", full: "Before Meals" },
  { short: "PC", full: "After Meals" }
];

export const getFacilityStaffRole = () => [
  { label: 'ADMIN', value: '1' },
  { label: 'MANAGER', value: '2' },
  { label: 'STAFF', value: '3' },
]

export const getFacilityPosition = () => [ // Leadership & Administration
  { label: "Hospital Director", value: "HOSPITAL_DIRECTOR" },
  { label: "Chief Medical Officer", value: "CHIEF_MEDICAL_OFFICER" },
  { label: "Chief Nursing Officer", value: "CHIEF_NURSING_OFFICER" },
  { label: "Medical Director", value: "MEDICAL_DIRECTOR" },
  { label: "Administrator", value: "ADMINISTRATOR" },
  { label: "Operations Manager", value: "OPERATIONS_MANAGER" },
  { label: "Human Resources Manager", value: "HUMAN_RESOURCES_MANAGER" },
  { label: "Finance Manager", value: "FINANCE_MANAGER" },

  // Doctors
  { label: "Physician", value: "PHYSICIAN" },
  { label: "Surgeon", value: "SURGEON" },
  { label: "Resident Doctor", value: "RESIDENT_DOCTOR" },
  { label: "Intern Doctor", value: "INTERN_DOCTOR" },

  // Nursing
  { label: "Registered Nurse", value: "REGISTERED_NURSE" },
  { label: "Licensed Practical Nurse", value: "LICENSED_PRACTICAL_NURSE" },
  { label: "Nurse Practitioner", value: "NURSE_PRACTITIONER" },
  { label: "Head Nurse", value: "HEAD_NURSE" },
  { label: "Nurse Midwife", value: "NURSE_MIDWIFE" },

  // Allied Health
  { label: "Pharmacist", value: "PHARMACIST" },
  { label: "Pharmacy Technician", value: "PHARMACY_TECHNICIAN" },
  { label: "Laboratory Technician", value: "LAB_TECHNICIAN" },
  { label: "Radiology Technician", value: "RADIOLOGY_TECHNICIAN" },
  { label: "Physiotherapist", value: "PHYSIOTHERAPIST" },
  { label: "Occupational Therapist", value: "OCCUPATIONAL_THERAPIST" },
  { label: "Respiratory Therapist", value: "RESPIRATORY_THERAPIST" },
  { label: "Dietitian", value: "DIETITIAN" },
  { label: "Speech Therapist", value: "SPEECH_THERAPIST" },

  // Emergency & Support
  { label: "Paramedic", value: "PARAMEDIC" },
  { label: "Emergency Medical Technician (EMT)", value: "EMT" },
  { label: "Medical Assistant", value: "MEDICAL_ASSISTANT" },
  { label: "Clinical Assistant", value: "CLINICAL_ASSISTANT" },

  // IT & Records
  { label: "Health Informatics Officer", value: "HEALTH_INFORMATICS_OFFICER" },
  { label: "IT Support", value: "IT_SUPPORT" },
  { label: "System Administrator", value: "SYSTEM_ADMINISTRATOR" },
  { label: "Medical Records Officer", value: "MEDICAL_RECORDS_OFFICER" },

  // Front Desk
  { label: "Receptionist", value: "RECEPTIONIST" },
  { label: "Patient Registration Officer", value: "PATIENT_REGISTRATION_OFFICER" },
  { label: "Billing Officer", value: "BILLING_OFFICER" },

  // Facilities
  { label: "Maintenance Technician", value: "MAINTENANCE_TECHNICIAN" },
  { label: "Housekeeping Staff", value: "HOUSEKEEPING_STAFF" },
  { label: "Security Guard", value: "SECURITY_GUARD" },
  { label: "Driver", value: "DRIVER" },
  { label: "Mortuary Attendant", value: "MORTUARY_ATTENDANT" },

  // Others
  { label: "Volunteer", value: "VOLUNTEER" },
  { label: "Trainee", value: "TRAINEE" }
]

export const getFacilitySpecilities = () => [
  { label: "General Practitioner (Generalist)", value: "GENERAL_PRACTITIONER" },
  { label: "Emergency Physician", value: "EMERGENCY_PHYSICIAN" },
  { label: "Anesthesiologist", value: "ANESTHESIOLOGIST" },
  { label: "Pediatrician", value: "PEDIATRICIAN" },
  { label: "Cardiologist", value: "CARDIOLOGIST" },
  { label: "Neurologist", value: "NEUROLOGIST" },
  { label: "Orthopedic Surgeon", value: "ORTHOPEDIC_SURGEON" },
  { label: "Dermatologist", value: "DERMATOLOGIST" },
  { label: "Psychiatrist", value: "PSYCHIATRIST" },
  { label: "Radiologist", value: "RADIOLOGIST" },
  { label: "Pathologist", value: "PATHOLOGIST" },
  { label: "Obstetrician & Gynecologist (OB-GYN)", value: "OBSTETRICIAN_GYNECOLOGIST" },
  { label: "Oncologist", value: "ONCOLOGIST" },
  { label: "Endocrinologist", value: "ENDOCRINOLOGIST" },
  { label: "Gastroenterologist", value: "GASTROENTEROLOGIST" },
  { label: "Pulmonologist", value: "PULMONOLOGIST" },
  { label: "Nephrologist", value: "NEPHROLOGIST" },
  { label: "Urologist", value: "UROLOGIST" },
  { label: "Ophthalmologist", value: "OPHTHALMOLOGIST" },
  { label: "Otolaryngologist (ENT)", value: "OTOLARYNGOLOGIST" },
  { label: "Infectious Disease Specialist", value: "INFECTIOUS_DISEASE_SPECIALIST" },
  { label: "Rheumatologist", value: "RHEUMATOLOGIST" },
  { label: "Hematologist", value: "HEMATOLOGIST" },
  { label: "Immunologist", value: "IMMUNOLOGIST" },
  { label: "Geriatrician", value: "GERIATRICIAN" },
  { label: "Neonatologist", value: "NEONATOLOGIST" },
  { label: "Pain Management Specialist", value: "PAIN_MANAGEMENT_SPECIALIST" },
  { label: "Critical Care Physician (Intensivist)", value: "INTENSIVIST" },
  { label: "Sports Medicine Physician", value: "SPORTS_MEDICINE_PHYSICIAN" },
  { label: "Physical Medicine & Rehabilitation (Physiatrist)", value: "PHYSIATRIST" }
]

/**
 * Returns true if the given hospital position
 * requires one or more medical specialties.
 *
 * Aligned with HospitalPositionOptions:
 * - PHYSICIAN
 * - SURGEON
 * - RESIDENT_DOCTOR
 * - INTERN_DOCTOR
 */
export function positionNeedsSpecialty(
  position: HospitalPosition
): boolean {
  const POSITIONS_REQUIRING_SPECIALTY = new Set<HospitalPosition>([
    HospitalPosition.PHYSICIAN,
    HospitalPosition.SURGEON,
    HospitalPosition.RESIDENT_DOCTOR,
    HospitalPosition.INTERN_DOCTOR
  ])

  return POSITIONS_REQUIRING_SPECIALTY.has(position);
}
