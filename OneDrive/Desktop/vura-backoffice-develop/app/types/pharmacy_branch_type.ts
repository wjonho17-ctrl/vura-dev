import vine from '@vinejs/vine'

export type PharmacyBranchPaymentData = {
  name: string
  type: string
  isManual: boolean
  transferNumbers: {
    name: string
    value: string
    infos?: Object
  }[]
}

export enum PharmacyEmployeePosition {
  PHARMACY_MANAGER = 'PHARMACY_MANAGER',
  BRANCH_MANAGER = 'BRANCH_MANAGER',
  PHARMACIST = 'PHARMACIST',
  NURSE = 'NURSE',
  FINANCE = 'FINANCE',
}

export type PharmacyBranchDistanceLocation = {
  province: number
  district: number
  cell: number
  village: number
  sector: number
}

//wholeseler recomendation v4
export type PharmacyBranchCartRecomendationData = {
  best: {
    productId: number
    productName: string
    branchId: string
    branchName: string
    price: number
    quantity: number
    globalCount: number
    distance: string
  }
  others: PharmacyBranchCartRecomendationData['best'][]
}

//wholeseler recomendation v5
// export type PharmacyBranchCartRecomendationData = {
//   best: {
//     productId: number
//     productName: string
//     branchId: string
//     branchName: string
//     price: number
//     quantity: number
//     globalCount: number
//     locationDistance: {
//       province: number
//       district: number
//       cell: number
//       village: number
//       sector: number
//     }
//   }
//   others: PharmacyBranchCartRecomendationData['best'][]
// }

export type PharmacyBranchCartRecomendationItem = {
  cartProductName: string
  wholeseller: {
    productId: number
    productName: string
    branchId: string
    branchName: string
    price: number
    quantity: number
    globalCount: number
    locationDistance: PharmacyBranchDistanceLocation
  }
  // score: number
}

//wholeseller recomendation v4
export const PharmacyBranchCartProductValidatorV4 = vine.compile(
  vine.array(
    vine.object({
      cartProductName: vine.string(),

      best: vine.object({
        productId: vine.number(),
        productName: vine.string(),
        branchId: vine.string(),
        branchName: vine.string(),
        price: vine.number(),
        globalCount: vine.number(),
        quantity: vine.number(),
        distance: vine.string(),
      }),

      others: vine.array(
        vine.object({
          productId: vine.number(),
          productName: vine.string(),
          branchId: vine.string(),
          branchName: vine.string(),
          price: vine.number(),
          globalCount: vine.number(),
          quantity: vine.number(),
          distance: vine.string(),
        })
      ),
    })
  )
)

//wholseller recomendation v5
export const PharmacyBranchCartProductValidatorV5 = vine.compile(
  vine.array(
    vine.object({
      cartProductName: vine.string(),

      best: vine.object({
        productId: vine.number(),
        productName: vine.string(),
        branchId: vine.string(),
        branchName: vine.string(),
        price: vine.number(),
        globalCount: vine.number(),
        quantity: vine.number(),
        locationDistance: vine.object({
          province: vine.number(),
          district: vine.number(),
          cell: vine.number(),
          village: vine.number(),
          sector: vine.number(),
        }),
      }),

      others: vine.array(
        vine.object({
          productId: vine.number(),
          productName: vine.string(),
          branchId: vine.string(),
          branchName: vine.string(),
          price: vine.number(),
          globalCount: vine.number(),
          quantity: vine.number(),
          locationDistance: vine.object({
            province: vine.number(),
            district: vine.number(),
            cell: vine.number(),
            village: vine.number(),
            sector: vine.number(),
          }),
        })
      ),
    })
  )
)


export type PharmacyPrescriptionProduct = {
  name: string
  quantity: number
  productId: number
  expirationDate: string
  batchNo: string | null
  lot: string | null
  remark?: string
}

export type PharmacyPrescriptionData = {
  id: number
  userId: string
  patientId?: string | null
  healthFacilityId: string
  insuranceId?: string | null
  patientName: string
  patientPhone: string
  patientGenre: string
  patientWeight: string
  treatmentDate: string
  code: string
  products: { data: PharmacyPrescriptionProduct[] }
  pharmacyHistory: { data: PharmacyPrescriptionPharmacyHistory[] }
  createdAt: string
  updatedAt: string
  healthFacility: {
    id: string
    userId: string
    name: string
    villageId?: number | null
    createdAt: string
    updatedAt: string
  }
  practitioner: {
    id: string
    firstname: string
    lastname: string
    email: string
    phone: string
    isOnline: boolean
    isActive: boolean
    regno: string
    villageId?: number | null
    createdAt: string
    updatedAt: string
    role: string
    genre: string
    heathFacility?: {
      id: string
      userId: string
      name: string
      villageId?: number | null
      createdAt: string
      updatedAt: string
    }
    phoneNumber?: string
    fullname?: string
  }
}


export type PharmacyPrescriptionPharmacyHistory = {
  time: string
  branchId: string
  branchName: string
  pharmacyName: string
  servedBy: {
    name: string
    phone: string
  }
  products: PharmacyPrescriptionProduct[]
  address: string
  note?: string
  phone: string
  email: string
  villageId: number
}


export enum PharmacyPrescriptionPharmacyHistoryStatus {
  PHARMACY_PRODUCT_SOLD,
}
