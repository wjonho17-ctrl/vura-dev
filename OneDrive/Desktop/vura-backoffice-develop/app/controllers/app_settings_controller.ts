import PmsAppSetting from '#models/pms_app_setting'
import { MedbookAdminApiService } from '#services/medbook_admin_api_service'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'

@inject()
export default class AppSettingsController {
    constructor(private medbookApi: MedbookAdminApiService) { }


    async list({ inertia, request }: HttpContext) {
        const tab = request.input('tab', 'pms')

        if (tab == 'lms') {
            // return inertia.render('dashboard/overview/logistics_overview')
        }
        else if (tab == 'hms') {
            // return inertia.render('dashboard/overview/hms_overview')
        }

        // FIXME: filtering settings
        const settings = await PmsAppSetting.query().orderBy('id', 'desc').limit(3)

        return inertia.render('dashboard/settings/setting_list', { settings })
    }

    async active({ inertia, request, response }: HttpContext) {
        const { tab, id } = await request.validateUsing(vine.compile(vine.object({
            tab: vine.enum(['pms', 'hms', 'lms']),
            id: vine.number().min(1)
        })))

        if (tab == 'lms') {
            // return inertia.render('dashboard/overview/logistics_overview')
        }
        else if (tab == 'hms') {
            // return inertia.render('dashboard/overview/hms_overview')
        }

        const [activeSetting, setting] = await Promise.all([
            PmsAppSetting.findByOrFail({ isActive: true }),
            PmsAppSetting.findOrFail(id)
        ])

        console.log(activeSetting.id, setting.id)

        if (activeSetting.id === setting.id) return response.redirect().back()

        await Promise.all([
            activeSetting.merge({ isActive: false }).save(),
            setting.merge({ isActive: true }).save()
        ])

        await this.medbookApi.settings.update()

        return response.redirect().back()
    }
}