import { flashApiError } from '#helpers/api_helper'
import { flashInertiaToastInfo, flashInertiaToastSuccess } from '#helpers/toast_notification_helper'
import { MedbookAdminApiService } from '#services/medbook_admin_api_service'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class InsuranceProductsController {

    constructor(private medbookApi: MedbookAdminApiService) { }
    async index({ inertia, request }: HttpContext) {
        const { products, insurances } = await this.medbookApi.insuranceProducts.list(request.qs() as any)
        return inertia.render('dashboard/insurance_products', { products, insurances })
    }

    async store({ request, session, response }: HttpContext) {
        try {
            await this.medbookApi.insuranceProducts.store(request.body() as any)
            flashInertiaToastSuccess(session, 'insurance product list updated!')
        } catch (error: any) {
            await flashApiError(session, error, 'Cannot update insurance list. please contact support!')
        } finally {
            response.redirect().withQs().back()
        }
    }

    async delete({ session, response }: HttpContext) {
        try {
            await this.medbookApi.insuranceProducts.delete()
            flashInertiaToastSuccess(session, 'insurance product list deleted!')
        } catch (error: any) {
            await flashApiError(session, error, 'Cannot delete insurance list. please contact support!')
        } finally {
            response.redirect().withQs().back()
        }
    }

    async sync({ session, response, request }: HttpContext) {
        try {
            const products = await this.medbookApi.insuranceProducts.sync(request.body())

            if (request.isTuyau) return products

            flashInertiaToastInfo(session, 'insurance product list synced!')
            response.redirect().withQs().back()
        } catch (error: any) {
            await flashApiError(session, error, 'Cannot delete insurance list. please contact support!')
            response.redirect().withQs().back()
        }
    }
}
