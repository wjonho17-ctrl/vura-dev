import { InsuranceProductResponse, InsuranceProductSyncResponse } from '#types/api/medbook/insurance_products_type'
import { KyInstance } from 'ky'
import { NotificationList, NotificationResponse } from '#types/api/medbook/notification_type'

export default class NotificationApiSerivce {
  private path = 'notifications'

  constructor(private api: KyInstance) { }

  list() {
    return this.api.get(this.path).json<NotificationList>()
  }

  read(id: number, userId: string) {
    const json = { system: 'BACKOFFICE', id: userId }
    return this.api.put(this.path + '/' + id, { json }).json<NotificationResponse>()
  }

}
