import { MetaDataPaginator } from '#types/meta'
import { MedbookProfile } from './client_type.js'

export type MedbookTransporter = {
  data: {
    id: string
    profile: MedbookProfile
    email: string
    phone: string
    phoneNumber: string
    transporterProfile: {
      type: ListTransporterQs['type']
      isActive: boolean
      isWorking: boolean
      provinceId: number
    }
  }[]

  meta: MetaDataPaginator
}

export type ListTransporterQs = {
  type: 'MOTO'
  page?: number
  perPgae?: number
}

export type ListPharmacyQs = {
  name?: string
  page?: number
  perPgae?: number
}

export type StoreTransporterBody = {
  type: ListTransporterQs['type']
  names: string[]
}

export type StorePharmacyBody = {
}


export type MedbookPharmacy = {
  data: {
  }[]

  meta: MetaDataPaginator
}
