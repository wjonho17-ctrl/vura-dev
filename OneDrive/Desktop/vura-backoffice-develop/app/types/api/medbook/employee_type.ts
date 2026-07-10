import { MetaDataPaginator } from '#types/meta'
import { MedbookProfile } from './client_type.js'

export type MedbookEmployee = {
  data: {
    email?: string
    phone: string
    phoneNumber: string
    profile: MedbookProfile
    currentPharmacyEmployeeProfile?: {
      pharmacy?: {
        name: string
      }
      branch?: {
        name: string
      }
    },
    pharmacyEmployeeProfiles?: {
      pharmacy?: {
        name: string
      },
      branch?: {
        name: string
      }
    }[]
  }[]
  meta: MetaDataPaginator
}

export type MedbookEmployeeRoles =
  | 'PHARMACIST'
  | 'FINANCE'
  | 'NURSE'
  | 'PHARMACY_MANAGER'
  | 'BRANCH_MANAGER'

export type ListEmployeeQs = {
  employeeSearchQuery?: string
  pharmacyId?: string
  employeePosition?: any // [type, value]
  employeeRole?: any  // [type, value]
  page?: number
  perPage?: number
}

export type MedbookStoreEmployeeBody = Object

export type MedbookStoreEmployee = {}
