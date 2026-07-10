import { InsuranceProductResponse, InsuranceProductSyncResponse } from '#types/api/medbook/insurance_products_type'
import { InsuranceResponse } from '#types/api/medbook/insurance_type'
import { KyInstance } from 'ky'

export default class InsuranceApiSerivce {
  private path = 'insurances'

  constructor(private api: KyInstance) { }


  list() {
    return this.api.get(this.path).json<InsuranceResponse[]>()
  }

}
