import { BasicAdResponse } from '#types/api/medbook/basic_ads_type'
import { KyInstance } from 'ky'

export default class SettingApiSerivce {
  private path = 'settings'

  constructor(private api: KyInstance) { }

  update() {
    return this.api.post(this.path + '/update').json<BasicAdResponse[]>()
  }
}
