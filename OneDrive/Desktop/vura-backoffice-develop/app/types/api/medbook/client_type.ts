import { MetaDataPaginator } from '#types/meta'
import { MedbookUserRole } from '../../../enums/user_role.js'

export type MedbookClient = {
  data: {
    email?: string
    phone: string
    phoneNumber: string
    profile: MedbookProfile
  }[]
  meta: MetaDataPaginator
}

export type MedbookProfile = {
  firstname: string
  lastname: string
  gender: 'M' | 'F'
}

export type ListClientQs = {
  searchQuery?: string
  hasPharmacy?: boolean
  roleId?: MedbookUserRole
  page?: number
  perPage?: number
}

export type MedbookStoreClientBody = Object

export type MedbookStoreClient = {}
