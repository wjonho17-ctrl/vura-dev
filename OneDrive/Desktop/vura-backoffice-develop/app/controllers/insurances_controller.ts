import { MedbookAdminApiService } from '#services/medbook_admin_api_service'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class InsurancesController {

    constructor(private medbookApi: MedbookAdminApiService) { }
    async index({ inertia, request }: HttpContext) {
        const { tab, ...input } = request.qs()

        if (tab == 'insurance_products') {
            const { products, insurances } = await this.medbookApi.insuranceProducts.list(input as any)
            return inertia.render('dashboard/insurance_products', { products, insurances })
        } else {
            const insurances = await this.medbookApi.insurances.list()
            return inertia.render('dashboard/insurances', { insurances })
        }

    }



}