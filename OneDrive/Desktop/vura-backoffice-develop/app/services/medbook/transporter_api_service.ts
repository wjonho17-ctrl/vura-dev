import { ListTransporterQs, MedbookTransporter, StoreTransporterBody } from '#types/api/medbook/transporter_type'
import { KyInstance } from 'ky'

export default class TransporterApiSerivce {
  private path = 'transporters'

  constructor(private api: KyInstance) { }

  list(searchParams: ListTransporterQs) {
    return this.api.get(this.path, { searchParams }).json<MedbookTransporter>()
  }

  store(json: any) {
    return this.api.post(this.path, { json }).json<MedbookTransporter>()
  }

  update(id: string, json: any) {
    return this.api.patch(this.path + '/' + id, { json }).json<MedbookTransporter>()
  }
}
