export enum InsuranceType {
    RSSB,
    RADIANT,
    EDEN_CARE,
    MMI,
    PRIME
}

export type InsuranceData = {
    name: string
    fullname: string
    tin: string
    email: string
    phoneNumber: string
    phoneNumberTwo: string | null
    address: string
    postalBox: string
    logoUrl: string | null
    type: InsuranceType
    hasApi?: boolean
    color: string
}

export type InsuranceProductInfo = {
    genericDescription: string
    designation: string
    sellingUnit: string
    instructions: string
}