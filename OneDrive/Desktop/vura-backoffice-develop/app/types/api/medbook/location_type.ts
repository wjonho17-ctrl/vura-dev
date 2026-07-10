export type ListLocationQs = {
  type: 'PROVINCE' | 'VILLAGE' | 'CELL' | 'SECTOR' | 'DISTRICT'
  page?: number
  perPgae?: number
}

export type StoreLocationBody = {
  type: ListLocationQs['type']
  names: string[]
}

export type MedbookProvince = {
  id: number
  name: string
}

export type MedbookDistrict = {
  id: number
  name: string
  provinceId: number
}

export type MedbookSector = {
  id: number
  name: string
  districtId: number
}

export type MedbookCell = {
  id: number
  name: string
  sectorId: number
  phoneNumber: string
}

export type MedbookVillage = {
  id: number
  name: string
  cellId: number
}

export type MedbookLocationResult<T extends ListLocationQs['type']> = T extends 'PROVINCE'
  ? MedbookProvince
  : MedbookDistrict
