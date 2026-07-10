import { ListPharmacyQs, ListTransporterQs, MedbookPharmacy, MedbookTransporter, StorePharmacyBody, StoreTransporterBody } from '#types/api/medbook/transporter_type'
import { KyInstance } from 'ky'

export default class PharmacyApiSerivce {
  private path = 'pharmacies'

  constructor(private api: KyInstance) { }

  list(searchParams: ListPharmacyQs) {
    return this.api.get(this.path, { searchParams }).json<MedbookTransporter>()
  }

  store(json: StorePharmacyBody) {
    return this.api.post(this.path, { json }).json<MedbookPharmacy['data']>()
  }

  sendWelcomeEmail(json: any) {
    return this.api.post(this.path + '/send_welcome_email', { json })
  }

  findBranch(id: string) {
    return this.api.get(this.path + '/branches/' + id).json<MedbookTransporter>()
  }

  update(body: any) {
    return this.api.post(this.path + '/update/'  + body?.pharmacyId || 'no-id' , { body })
  }

}
