import { KyInstance } from 'ky'

export default class ProductApiSerivce {
  private path = 'products'

  constructor(private api: KyInstance) { }

}
