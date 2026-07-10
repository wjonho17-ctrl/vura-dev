import { BasicAdResponse } from '#types/api/medbook/basic_ads_type'
import { KyInstance } from 'ky'

export default class BasicAdsApiSerivce {
  private path = 'basic_ads'

  constructor(private api: KyInstance) { }

  list(searchParams: any) {
    return this.api.get(this.path, { searchParams }).json<BasicAdResponse[]>()
  }

  store(body: any) {
    return this.api.post(this.path, { body: JSON.stringify(body) }).json<BasicAdResponse>()
  }
}
