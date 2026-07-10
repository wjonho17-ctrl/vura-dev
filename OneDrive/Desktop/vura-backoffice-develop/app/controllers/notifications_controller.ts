import { MedbookAdminApiService } from '#services/medbook_admin_api_service'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class NotificationsController {

    constructor(private medbookApiSerice: MedbookAdminApiService) { }
    async index({ inertia, auth }: HttpContext) {
        const userId = auth.user?.id
        return inertia.render('dashboard/notifications', { userId })
    }

    async read({ params, auth }: HttpContext) {
        const id = +params.id
        const userId = auth.user?.id || ''
        return this.medbookApiSerice.notifications.read(id, userId)
    }

    async list({ auth }: HttpContext) {
        const notifications = await this.medbookApiSerice.notifications.list()
        const readToday = notifications.today.filter(n => n.readBy.data.find(d => d.id == auth.user?.id && d.system == 'BACKOFFICE')).map(n => n.id)
        const readYesterDay = notifications.yesterday.filter(n => n.readBy.data.find(d => d.id == auth.user?.id && d.system == 'BACKOFFICE')).map(n => n.id)
        const readLastWeek = notifications.lastWeek.filter(n => n.readBy.data.find(d => d.id == auth.user?.id && d.system == 'BACKOFFICE')).map(n => n.id)
        return {
            data: notifications, 
            readToday,
            readYesterDay,
            readLastWeek
        }
    }
}