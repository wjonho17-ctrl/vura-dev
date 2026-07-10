import type { HttpContext } from '@adonisjs/core/http'
import { flashInertiaToastSuccess } from '../helpers/toast_notification_helper.js'
import { flashApiError } from '../helpers/api_helper.js'
import { MedbookAdminApiService } from '#services/medbook_admin_api_service'
import { inject } from '@adonisjs/core'
import { ListTransporterQs, StoreTransporterBody } from '#types/api/medbook/transporter_type'

@inject()
export default class TransportersController {
  constructor(private medbookApi: MedbookAdminApiService) { }

  async list({ inertia, request }: HttpContext) {
    const transporters = await this.medbookApi.transporters.list(request.qs() as ListTransporterQs)

    return inertia.render('dashboard/transporter_list', { transporters })
  }

  async store({ request, session, response }: HttpContext) {
    try {
      await this.medbookApi.transporters.store(request.body() as StoreTransporterBody)
      flashInertiaToastSuccess(session, 'new transporter added!')
    } catch (error: any) {
      await flashApiError(session, error, 'Cannot add new transporter')
    } finally {
      response.redirect().back()
    }
  }

  
  async update({ request, session, response }: HttpContext) {
    try {
      const id = request.input('transporterId', '')
      await this.medbookApi.transporters.update(id, request.body())
      flashInertiaToastSuccess(session, 'transporter updated!')
    } catch (error: any) {
      await flashApiError(session, error, 'Cannot update transporter')
    } finally {
      response.redirect().back()
    }
  }
}
