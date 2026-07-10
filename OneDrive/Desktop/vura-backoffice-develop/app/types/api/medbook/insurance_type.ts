import type { InsuranceType } from "#types/insurance_type"

export type InsuranceResponse = {
  type: InsuranceType
  name: string
  fullname: string
  tin: string
  email: string
  phoneNumber: string
  phoneNumberTwo: string | null
  address: string
  postalBox: string
  logoUrl: string | null
  hasApi?: boolean
  color: string
  pharmacies: {
    name: string
    id: string
  }[]
}

