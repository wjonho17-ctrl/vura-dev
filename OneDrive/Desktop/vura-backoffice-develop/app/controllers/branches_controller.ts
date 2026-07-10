
import { MedbookAdminApiService } from '#services/medbook_admin_api_service';
import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';

@inject()
export default class PharmaciesController {
    constructor(private medbookApi: MedbookAdminApiService) { }

    async branches_view({ inertia, request }: HttpContext) {
        const id = request.param('id', '')
        const branch = await this.medbookApi.branchies.find(id)

        return inertia.render('dashboard/branch', { branch })
    }

    async update({ inertia, request }: HttpContext) {

    }

}