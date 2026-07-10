import { RWANDA_PHONE_REGEX } from '#constants/index'
import BasicAd from '#models/basic_ad'
import User from '#models/user'
import { MedbookAdminApiService } from '#services/medbook_admin_api_service'
import { BasicAdTarget } from '#types/api/medbook/basic_ads_type'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { Attachment, attachmentManager } from '@jrmc/adonis-attachment'
import vine from '@vinejs/vine'
import { DateTime } from 'luxon'

export default class BasicAdsController {
    async list({ inertia, request }: HttpContext) {
        const tab = request.input('tab', 'pms')

        if (tab == 'lms') {
            // return inertia.render('dashboard/overview/logistics_overview')
        }
        else if (tab == 'hms') {
            // return inertia.render('dashboard/overview/hms_overview')
        }

        const { page, perPage } = await request.qs()

        // FIXME: filtering ads
        const ads = await BasicAd.query().paginate(+page || 1, +perPage || 12)

        return inertia.render('dashboard/basic_ads/pms_basic_ads', { ads })
    }

    async check_client({ request, response }: HttpContext) {
        const validator = vine.compile(vine.object({
            organizationName: vine.string(),
            organizationEmail: vine.string().email(),
            organizationPhone: vine
                .string()
                .trim()
                .regex(RWANDA_PHONE_REGEX),
            customerName: vine.string(),
            customerPhone: vine
                .string()
                .trim()
                .regex(RWANDA_PHONE_REGEX),
            customerEmail: vine.string().email().optional()
        }))

        await request.validateUsing(validator)

        return response.redirect().back()
    }

    async store({ request, response, auth }: HttpContext) {
        const validator = vine.compile(vine.object({
            cover: vine.file({ extnames: ['png', 'jpg', 'jpeg', 'PNG', 'JPEG', 'JPG'], size: '15mb' }),
            description: vine.string().optional(),
            target: vine.number().min(1).max(3),
            startAt: vine.date({ formats: ['iso8601'] }).optional().transform<DateTime>(v => DateTime.fromJSDate(v)),
            endAt: vine.date({ formats: ['iso8601'] }).optional().transform<DateTime>(v => DateTime.fromJSDate(v)),
            link: vine.string().optional(),
            organizationName: vine.string(),
            organizationEmail: vine.string().email(),
            organizationPhone: vine
                .string()
                .trim()
                .regex(RWANDA_PHONE_REGEX),
            customerName: vine.string(),
            customerPhone: vine
                .string()
                .trim()
                .regex(RWANDA_PHONE_REGEX),
            customerEmail: vine.string().email().optional()
        }))

        const { cover, ...payload } = await request.validateUsing(validator)

        const image = await attachmentManager.createFromFile(cover) as Attachment


        await BasicAd.create({ ...payload, image, adminName: auth.user?.fullname, adminPhone: auth.user?.phone, adminEmail: auth.user?.email })

        return response.redirect().back()
    }

    async show({ params }: HttpContext) {
        return await BasicAd.findOrFail(+params.id)
    }

    async destroy({ params, response }: HttpContext) {
        const ad = await BasicAd.findOrFail(+params.id)
        await ad.delete()
        return response.redirect().back()
    }
}