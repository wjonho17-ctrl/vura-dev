
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

/**
 * Returns the facility position option (label + value)
 * for a given position value.
 */
export function getFacilityPositionFromValue(
  value: ReturnType<typeof getFacilityPosition>[0]['value']
) {
  return getFacilityPosition().find(
    position => position.value === value
  )?.value;
}