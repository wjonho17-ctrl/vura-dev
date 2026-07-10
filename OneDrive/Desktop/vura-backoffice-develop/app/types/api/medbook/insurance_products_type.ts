export type InsuranceProductResponse = {
  id: string
  name: string
  genericDescription: string
  designation: string
  instructions: string
  sellingUnit: string
  price: string
  product: null | {
    name: string
  }
}

export type InsuranceProductSyncResponse = {
  id: string
  name: string
  genericDescription: string
  designation: string
  instructions: string
  reviewed: boolean
  sellingUnit: string
  price: string
  suggestions: {
    name: string
    productId: number
    composition: string
  }
}
