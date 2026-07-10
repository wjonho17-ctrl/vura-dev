import { InsuranceProductResponse, InsuranceProductSyncResponse } from '#types/api/medbook/insurance_products_type'
import { KyInstance } from 'ky'
import { MedbookGlobalBasicStatsResponse, MedbookOverviewStatsResponse, MedbookProductOverviewResponse } from '#types/api/medbook/stat_type'

export default class StatsApiSerivce {
  private path = 'stats'

  constructor(private api: KyInstance) { }

  getGlobalBasic() {
    return this.api.get(this.path + '/global/basic').json<MedbookGlobalBasicStatsResponse>()
  }

  getOverview(searchParams: any) {
    return this.api.get(this.path + '/overview', { searchParams }).json<MedbookOverviewStatsResponse>()
  }

  getProductOverview(productId: string, searchParams: any) {
    return this.api.get(this.path + `/product/${productId}/overview`, { searchParams }).json<MedbookProductOverviewResponse>()
  }

}
