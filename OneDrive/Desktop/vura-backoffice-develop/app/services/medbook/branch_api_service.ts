import { ListPharmacyQs, ListTransporterQs, MedbookPharmacy, MedbookTransporter, StorePharmacyBody, StoreTransporterBody } from '#types/api/medbook/transporter_type'
import { KyInstance } from 'ky'

export default class BranchApiSerivce {
  private path = 'branchies'

  constructor(private api: KyInstance) { }

  find(id: string) {
    return this.api.get(this.path + '/' + id).json<MedbookTransporter>()
  }
}
