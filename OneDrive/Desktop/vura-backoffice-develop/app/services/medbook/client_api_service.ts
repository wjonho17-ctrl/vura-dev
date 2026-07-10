import { ListClientQs, MedbookClient } from "#types/api/medbook/client_type"
import { KyInstance } from "ky"

export default class ClientApiSerivce {
  private path = 'clients'

  constructor(private api: KyInstance){}

  list(searchParams?: ListClientQs) {
    return this.api.get(this.path, { searchParams }).json<MedbookClient>()
  }

}