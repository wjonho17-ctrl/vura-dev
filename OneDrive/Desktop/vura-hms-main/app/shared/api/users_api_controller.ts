import User from '#app/shared/user'
import type { HttpContext } from '@adonisjs/core/http'
import vine, { SimpleMessagesProvider } from '@vinejs/vine'
import stringHelpers from '@adonisjs/core/helpers/string'
import { attachmentManager } from '@jrmc/adonis-attachment'
import EmailService, { EMAIL_TEMPLATES } from '#app/shared/services/email_service'
import { JobPriority } from '#app/shared/enums/job_enum'
import router from '@adonisjs/core/services/router'
import env from '#start/env'
import { UserRole } from '#app/shared/enums/user_enum'
import { RWANDA_PHONE_REGEX } from '#app/shared/helpers/phone_helper'
import { PHONE_VALIDATION_MESSAGES } from '#constants/index'
import { getFacilityPositionFromValue } from '#app/shared/helpers/facility_helper'
import HealthFacility from '#app/features/facilities/health_facility'


export default class ApiUsersController {

    async index({ request, response }: HttpContext) {
        try {
            const { page, perPage, ...input } = request.qs()
            return User.query().preload('healthFacilities').paginate(+page || 1, +perPage || 20)
        } catch (error) {
            console.error(error)
            return response.badRequest(error?.msg || 'Cannot list doctors')
        }
    }

    async store({ request, response }: HttpContext) {
        try {

            const validator = vine.compile(vine.object({
                image: vine.file({ extnames: ['jpg', 'jpeg', 'JPG', 'JPEG', 'png', 'PNG'], size: '5mb' }),
                firstname: vine.string().minLength(3).maxLength(100).trim(),
                lastname: vine.string().minLength(3).maxLength(100).trim(),
                email: vine.string().email().unique({ table: 'users', column: 'email' }),
                phone: vine.string().regex(RWANDA_PHONE_REGEX).unique({ table: 'users', column: 'phone' }).unique({ table: 'health_facilities', column: 'phone_two' }),
                regno: vine.string(),
                genre: vine.enum(['M', 'F']),
                role: vine.enum(UserRole),
                healthFacilityId: vine.string().exists({ table: 'health_facilities', column: 'id' })
            }))

            const { image, ...payload } = await request.validateUsing(validator, {
                messagesProvider: new SimpleMessagesProvider({
                    ...PHONE_VALIDATION_MESSAGES,
                    'healthFacilityId': 'health facility not found'
                })
            })

            const photo = await attachmentManager.createFromFile(image)

            return await User.create({ ...payload, password: stringHelpers.generateRandom(16), photo })

        } catch (error) {
            console.error(error)
            return response.badRequest(error)
        }
    }

    async send_welcome_email({ request, response }: HttpContext) {
        try {
            const id = request.param('id', '')
            const user = await User.query().where({ id }).preload('currentHeathFacility').firstOrFail()

            await EmailService.send(user.email, EMAIL_TEMPLATES.WELCOME_STAFF, {
                subject: 'Welcome to E-Prescription',
                data: {
                    username: user.fullname,
                    position: getFacilityPositionFromValue(user.position),
                    facility: {
                        name: user.currentHeathFacility.name,
                        email: user.currentHeathFacility.email,
                        phone: user.currentHeathFacility.phoneNumber
                    },
                    link: env.get('DOMAIN') + router.makeUrl('password.forgot')
                }
            }, JobPriority.MEDIUM)

            return response.ok({ message: 'Welcome email sent successfully' })
        } catch (error) {
            console.error(error)
            return response.badRequest(error?.msg || 'Cannot send welcome email')
        }
    }

    async assign({ request, response }: HttpContext) {
        try {
            const userId = request.input('userId', '')
            const facilityId = request.param('facilityId', '')
            const [facility, user] = await Promise.all([
                HealthFacility.query().where({ id: facilityId }).andWhereHas('users', q => q.where('users.id', userId)).first(),
                User.find(userId)
            ])

            if (!user) {
                throw { msg: 'User not found' }
            }

            if (!facility) {
                throw { msg: 'Facility not found' }
            }

            await user.related('currentHeathFacility').associate(facility)

            return response.ok({ message: 'Facility assigned successfully' })
        } catch (error) {
            console.error(error)
            return response.badRequest(error?.msg || 'Cannot assign facility')
        }
    }
}

