
import LocationAction from '#actions/location_action';
import { PharmacyAction } from '#actions/pharmacy_action';
import { PHONE_VALIDATION_MESSAGES } from '#constants/index';
import { flashInertiaError, flashInertiaToastSuccess } from '#helpers/toast_notification_helper';
import Pharmacy from '#models/pharmacy';
import { MedbookAdminApiService } from '#services/medbook_admin_api_service';
import { createPharmacyValidator } from '#validators/pharmacy_validator';
import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';
import vine, { SimpleMessagesProvider } from '@vinejs/vine';

@inject()
export default class PharmaciesController {
    constructor(private medbookApi: MedbookAdminApiService) { }

    async list({ inertia, request }: HttpContext) {
        const query = request.qs()
        const pharmacies = await this.medbookApi.pharmacies.list(query)

        const { districts, provinces } = await LocationAction.findAllBy({ provinceId: query?.provinceId })

        return inertia.render('dashboard/pharmacies', { pharmacies, districts, provinces })
    }

    async new_view({ inertia }: HttpContext) {
        return inertia.render('dashboard/new_pharmacy')
    }

    async edit({ inertia, request }: HttpContext) {
        const id = request.param('id', '')
        const pharmacy = await Pharmacy.query().where({ id })
            .preload('owner', q => q.preload('profile'))
            .preload('branches', q => q.preload('village'))
            .whereHas('branches', q => q.where({ isMain: true })).firstOrFail()
        return inertia.render('dashboard/new_pharmacy', { pharmacy })
    }

    async store({ request, session, response }: HttpContext) {

        const payload = await request.validateUsing(createPharmacyValidator, {
            messagesProvider: new SimpleMessagesProvider({ ...PHONE_VALIDATION_MESSAGES })
        })

        try {
            const pharmacy = await PharmacyAction.create(payload)
            await this.medbookApi.pharmacies.sendWelcomeEmail({ pharmacyId: pharmacy.id })
        } catch (error: any) {
            console.error(error)
            flashInertiaError(session, error?.msg || 'Cannot add pharmacy.')
        } finally {
            return response.redirect().back()
        }
    }

    async update({ response, request, session }: HttpContext) {
        const validator = vine.compile(vine.object({
            pharmacyId: vine.string(),
            isImporter: vine.boolean().optional(),
            isWholeseller: vine.boolean().optional(),
        }))

        const { pharmacyId, ...payload } = await request.validateUsing(validator)

        try {
            const pharmacy = await Pharmacy.findOrFail(pharmacyId)

            if (!pharmacy.isWholeseller) {
                throw { msg: 'A pharmacy must be a wholeseller to be an importer' }
            }

            payload.isImporter = pharmacy.isWholeseller ? payload.isImporter : false

            await pharmacy.merge(payload).save()
            flashInertiaToastSuccess(session, 'pharmacy updated!')
        } catch (error: any) {
            console.error(error)
            await flashInertiaError(session, error?.msg || 'Cannot update pharmacy')
        } finally {
            response.redirect().back()
        }
    }

    async representative_view({ request, response, inertia, params }: HttpContext) {
        const pharmacyId = params.id

        const pharmacy = await Pharmacy.query().where({ id: pharmacyId }).preload('owner', q => q.preload('profile').preload('pharmacistProfile')).firstOrFail()

        const [fdaLicenseLink, pharmacistLicenseLink] = await Promise.all([
            pharmacy.owner.pharmacistProfile.fdaLicense?.getSignedUrl(),
            pharmacy.owner.pharmacistProfile.pharmacyLicense?.getSignedUrl(),
        ])

        return inertia.render('dashboard/pharmacy/representative', { pharmacy, fdaLicenseLink, pharmacistLicenseLink })
    }

}