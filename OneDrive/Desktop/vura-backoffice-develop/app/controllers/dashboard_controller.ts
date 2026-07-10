import LocationAction from '#actions/location_action'
import District from '#models/district'
import Province from '#models/province'
import { MedbookAdminApiService } from '#services/medbook_admin_api_service'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class DashboardController {

  constructor(private medbookApi: MedbookAdminApiService) { }

  async index({ inertia }: HttpContext) {
    const pmsGlobalBasicStats = await this.medbookApi.stats.getGlobalBasic()
    return inertia.render('dashboard/index', {
      pmsGlobalBasicStats
    })
  }

  async overview({ inertia, request }: HttpContext) {
    const tab = request.input('tab', 'pms')

    if (tab == 'lms') {
      return inertia.render('dashboard/overview/logistics_overview')
    }
    else if (tab == 'hms') {
      return inertia.render('dashboard/overview/hms_overview')
    }

    const input = request.qs()
    const { districts, provinces } = await LocationAction.findAllBy({ provinceId: input?.provinceId })

    const stats = await this.medbookApi.stats.getOverview(input)
    return inertia.render('dashboard/overview/pms_overview', { stats, provinces, districts })
  }

  async product_overview({ params, inertia, request }: HttpContext) {
    const id = params.id
    const query = request.qs()
    const data = await this.medbookApi.stats.getProductOverview(id, query)

    const {province, district} = await LocationAction.findOneBy({
      districtId: query?.districtId,
      provinceId: query?.provinceId
    })

    return inertia.render('dashboard/overview/product_pharmacy_overview', { ...data, province: province?.name, district: district?.name })
  }
}