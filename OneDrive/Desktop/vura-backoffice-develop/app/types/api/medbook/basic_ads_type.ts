export enum BasicAdTarget {
  BOTH = 1,
  WHOLESALER = 2,
  RETAILER = 3
}

export type BasicAdResponse = {
  adminId: string
  image: string
  target: BasicAdTarget
  description: string | null
  link: string | null
  startAt: string
  endAt: string
  views: number
  shares: number
  visits: number
}

