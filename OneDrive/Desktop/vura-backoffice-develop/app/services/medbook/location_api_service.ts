import { MedbookStoreClient } from "#types/api/medbook/client_type"
import { ListLocationQs, MedbookLocationResult, StoreLocationBody } from "#types/api/medbook/location_type"
import { KyInstance } from "ky"

export default class LocationApiSerivce {
  private path = 'locations'

  constructor(private api: KyInstance){}

  list(searchParams: ListLocationQs) {
    return this.api.get(this.path, { searchParams }).json<MedbookLocationResult<typeof searchParams.type>>()
  }

  store(body: StoreLocationBody) {
    return this.api.post(this.path, {body: JSON.stringify(body)}).json<MedbookStoreClient>()
  }


}