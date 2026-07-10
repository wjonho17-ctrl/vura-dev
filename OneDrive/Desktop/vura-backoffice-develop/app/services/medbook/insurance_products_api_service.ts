import { InsuranceProductResponse, InsuranceProductSyncResponse } from '#types/api/medbook/insurance_products_type'
import { InsuranceResponse } from '#types/api/medbook/insurance_type'
import { KyInstance } from 'ky'

export default class InsuranceProductApiSerivce {
  private path = 'insurance/products'
  constructor(private api: KyInstance) { }

  delete() {
    return this.api.delete(this.path + '/delete/all').json()
  }

  list(searchParams?: { name: string, page?: number, perPage?: number }) {
    return this.api.get(this.path, { searchParams }).json<{ products: InsuranceProductResponse, insurances: InsuranceResponse[] }>()
  }

  store(json: any) {
    return this.api.post(this.path, { json }).json()
  }

  sync(json: any) {
    return this.api.post(this.path + '/' + 'sync', { json }).json<{ products: InsuranceProductSyncResponse[] }>()
  }
}
