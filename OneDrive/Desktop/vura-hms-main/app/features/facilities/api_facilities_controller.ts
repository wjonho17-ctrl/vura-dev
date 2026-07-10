import { PASSWORD_VALIDATION_MESSAGES, PHONE_VALIDATION_MESSAGES } from '#constants/index'
import { JobPriority } from '#app/shared/enums/job_enum'
import { UserRole } from '#app/shared/enums/user_enum'
import { RWANDA_PHONE_REGEX } from '#app/shared/helpers/phone_helper'
import HealthFacility from '#app/features/facilities/health_facility'
import User from '#app/shared/user'
import EmailService, { EMAIL_TEMPLATES } from '#app/shared/services/email_service'
import env from '#start/env'
import type { HttpContext } from '@adonisjs/core/http'
import router from '@adonisjs/core/services/router'
import vine, { SimpleMessagesProvider } from '@vinejs/vine'

export default class ApiFacilitiesController {

    async index({ request, response }: HttpContext) {
        try {
            const { page, perPage, ...input } = request.qs()

            return HealthFacility.filter(input).preload('admin').preload('users').orderBy('name', 'asc').paginate(+page || 1, +perPage || 20)
        } catch (error) {
            console.error(error)
            return response.badRequest(error?.msg || 'Cannot list facilities')
        }
    }

    async store({ request, response }: HttpContext) {
        try {
            const validator = vine.compile(vine.object({
                name: vine.string().minLength(3).maxLength(100).unique({ table: 'health_facilities', column: 'name' }),
                address: vine.string().minLength(3).maxLength(100),
                postalBox: vine.string().maxLength(100).unique({ table: 'health_facilities', column: 'postal_box' }).optional(),
                phone: vine.string().regex(RWANDA_PHONE_REGEX).unique({ table: 'health_facilities', column: 'phone' }).unique({ table: 'health_facilities', column: 'phone_two' }),
                phoneTwo: vine.string().regex(RWANDA_PHONE_REGEX).unique({ table: 'health_facilities', column: 'phone_two' }).unique({ table: 'health_facilities', column: 'phone' }).optional(),
                email: vine.string().email().unique({ table: 'health_facilities', column: 'email' }),
                villageId: vine.number().positive().min(1),
                longitude: vine.number(),
                latitude: vine.number()
            }))

            const payload = await request.validateUsing(validator, {
                messagesProvider: new SimpleMessagesProvider({ ...PHONE_VALIDATION_MESSAGES })
            })

            return await HealthFacility.create(payload)
        } catch (error) {
            console.error(error)
            return response.badRequest(error)
        }
    }

    async update({ request, response }: HttpContext) {
        try {
            const validator = vine.compile(vine.object({
                facilityId: vine.string(),
                name: vine.string().trim().minLength(3).maxLength(100),
                address: vine.string().minLength(3).maxLength(100).optional(),
                postalBox: vine.string().maxLength(100).optional(),
                phone: vine.string().regex(RWANDA_PHONE_REGEX),
                phoneTwo: vine.string().regex(RWANDA_PHONE_REGEX).optional(),
                email: vine.string().email(),
                villageId: vine.number().positive().min(1),
                longitude: vine.number(),
                latitude: vine.number(),
                adminId: vine.string().nullable().optional()
            }))

            const { facilityId, ...payload } = await request.validateUsing(validator)

            const [facility, adminStaff] = await Promise.all([
                HealthFacility.query().where({ id: facilityId }).preload('admin').firstOrFail(),
                payload.adminId && User.query().where('id', payload.adminId || '').whereHas('healthFacilities', q => q.where('facility_id', facilityId)).first()
            ])

            if (!facility) {
                return response.notFound({ error: 'Facility not found' })
            }

            if (payload.adminId && !adminStaff) {
                return response.notFound({ error: 'Staff member cannot be set has administrator. please contact support!' })
            }

            payload.adminId = payload.adminId || null

            const [nameExists, postalBoxExists, emailExists, phoneExists, phoneTwoExists] = await Promise.all([
                HealthFacility.query().where('name', payload.name).andWhereNot('id', facilityId).first(),
                HealthFacility.query().where('postal_box', payload.postalBox || '').andWhereNot('id', facilityId).first(),
                HealthFacility.query().where('email', payload.email).andWhereNot('id', facilityId).first(),
                HealthFacility.query().where(qb => {
                    qb.orWhere('phone', payload.phone || '')
                        .orWhere('phone_two', payload.phone || '')
                })
                    .andWhereNot('id', facilityId)
                    .first(),
                HealthFacility.query()
                    .where((qb) => {
                        qb.where('phone', payload.phoneTwo || '')
                            .orWhere('phone_two', payload.phoneTwo || '')
                    })
                    .andWhereNot('id', facilityId)
                    .first()
            ])

            if (nameExists) {
                throw { error: 'Facility name already taken' }
            }

            if (postalBoxExists) {
                throw { error: 'Postal box already taken' }
            }

            if (emailExists) {
                throw { error: 'Email already taken' }
            }

            if (phoneExists) {
                throw { error: 'Phone number already taken' }
            }

            if (phoneTwoExists) {
                throw { error: 'Phone two number already taken' }
            }

            const isNewAdmin = payload.adminId != facility.adminId && payload.adminId != null

            return await Promise.all([
                facility.merge(payload).save(),
                !payload.adminId && facility.admin && facility.admin.merge({ role: UserRole.STAFF }).save(),
                isNewAdmin && adminStaff && adminStaff.merge({ role: UserRole.ADMIN }).save(),
                isNewAdmin && adminStaff && EmailService.send(adminStaff.email, EMAIL_TEMPLATES.WELCOME_FACITITY_ADMINISTRATOR, {
                    subject: 'E-Prescription Facility Administrator Assigned',
                    data: {
                        username: adminStaff.fullname,
                        facility: { name: payload.name, email: facility.email, phone: facility.phoneNumber },
                        link: env.get('DOMAIN') + router.makeUrl('auth.login.view')
                    },
                }, JobPriority.LOW)
            ])
        } catch (error) {
            console.error(error)
            return response.badRequest(error)
        }
    }
}


