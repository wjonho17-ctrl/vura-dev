import { PHONE_VALIDATION_MESSAGES, RWANDA_PHONE_REGEX } from '#constants/index';
import { HospitalPosition, MedicalSpecialty, UserPrescriptionRole } from '#enums/prescription_user_enum';
import HealthFacility from '#models/health_facility';
import Staff from '#models/staff';
import Village from '#models/village';
import { EPrescriptionService } from '#services/e_prescription_service';
import { inject } from '@adonisjs/core';
import stringHelpers from '@adonisjs/core/helpers/string';
import type { HttpContext } from '@adonisjs/core/http';
import { attachmentManager } from '@jrmc/adonis-attachment';
import vine, { SimpleMessagesProvider } from '@vinejs/vine';
import { flashApiError } from '../helpers/api_helper.js';
import { flashInertiaError, flashInertiaToastSuccess } from '../helpers/toast_notification_helper.js';

@inject()
export default class PrescriptionsController {
    constructor(private prescriptionService: EPrescriptionService) { }

    async list_staffs({ request, response, inertia }: HttpContext) {
        const doctors = await this.prescriptionService.listStaffs()
        return inertia.render('dashboard/e_prescription/staffs', { doctors })
    }

    async new_staff({ inertia, request }: HttpContext) {
        const facilityId = request.input('facilityId', undefined)

        const facility = facilityId && await HealthFacility.findOrFail(facilityId)

        return inertia.render('dashboard/e_prescription/new_staff', { facility })
    }

    async create_staff({ request, session, response }: HttpContext) {
        const connection = 'e_prescription'
        const validator = vine.compile(vine.object({
            image: vine.file({ extnames: ['jpg', 'jpeg', 'JPG', 'JPEG', 'png', 'PNG'], size: '5mb' }).optional(),
            firstname: vine.string().minLength(3).maxLength(100).trim(),
            lastname: vine.string().minLength(3).maxLength(100).trim(),
            email: vine.string().email().unique({ table: 'users', column: 'email', connection }),
            phone: vine.string().regex(RWANDA_PHONE_REGEX).unique({ table: 'users', column: 'phone', connection }),
            regno: vine.string().unique({ table: 'users', column: 'regno', connection }).optional(),
            genre: vine.enum(['M', 'F']),
            role: vine.enum(UserPrescriptionRole),
            healthFacilityId: vine.string().exists({ table: 'health_facilities', column: 'id', connection }),
            position: vine.enum(HospitalPosition),
            specialities: vine.object({
                data: vine.array(vine.enum(MedicalSpecialty))
            }).optional()
        }))

        const { image, ...payload } = await request.validateUsing(validator, {
            messagesProvider: new SimpleMessagesProvider({
                ...PHONE_VALIDATION_MESSAGES,
                'healthFacilityId': 'health facility not found'
            })
        })

        try {
            const photo = image && await attachmentManager.createFromFile(image)

            const facility = await HealthFacility.find(payload.healthFacilityId)

            if (!facility) throw { msg: 'this healfacility doese not exist!' }

            const user = await facility.related('staffs').create({ ...payload, password: stringHelpers.generateRandom(16), photo })

            await this.prescriptionService.sendStaffWelcomeEmail(user.id)

            flashInertiaToastSuccess(session, 'docotor added successfully')
        } catch (error: any) {
            console.error(error)
            flashInertiaError(session, error?.msg || 'Cannot add doctor!')
        }

        return response.redirect().back()
    }


    async edit_staff({ request, inertia }: HttpContext) {
        const staffId = request.param('id', '')
        const staff = await Staff.findOrFail(staffId)

        return inertia.render('dashboard/e_prescription/new_staff', { staff })
    }

    async update_staff({ request, session, response }: HttpContext) {
        const validator = vine.compile(vine.object({
            staffId: vine.string(),
            image: vine.file({ extnames: ['jpg', 'jpeg', 'JPG', 'JPEG', 'png', 'PNG'], size: '5mb' }).optional(),
            firstname: vine.string().minLength(3).maxLength(100).trim().optional(),
            lastname: vine.string().minLength(3).maxLength(100).trim().optional(),
            email: vine.string().email().optional(),
            phone: vine.string().regex(RWANDA_PHONE_REGEX).optional(),
            regno: vine.string().optional(),
            genre: vine.enum(['M', 'F']).optional(),
            role: vine.enum(UserPrescriptionRole).optional(),
            position: vine.enum(HospitalPosition).optional(),
            specialities: vine.object({
                data: vine.array(vine.enum(MedicalSpecialty))
            }).optional(),
            isPhotoDeleted: vine.boolean(),
        }))

        const { image, isPhotoDeleted, staffId, ...payload } = await request.validateUsing(validator, {
            messagesProvider: new SimpleMessagesProvider({
                ...PHONE_VALIDATION_MESSAGES,
                'healthFacilityId': 'health facility not found'
            })
        })

        try {

            const staff = await Staff.findOrFail(staffId)

            const [emailExist, phoneExist, regnoExist, imageToAdd] = await Promise.all([
                await Staff.query().where({ email: payload.email || '' }).whereNot({ id: staffId }).first(),
                await Staff.query().where({ phone: payload.phone || '' }).whereNot({ id: staffId }).first(),
                await Staff.query().where({ regno: payload.regno || '' }).whereNot({ id: staffId }).first(),
                image ? await attachmentManager.createFromFile(image) : null
            ])

            if (imageToAdd) {
                staff.photo = imageToAdd
            } else if (isPhotoDeleted) {
                staff.photo = null
            }

            if (emailExist) throw { msg: 'Email already taken' }
            if (phoneExist) throw { msg: 'Phone number already taken' }
            if (regnoExist) throw { msg: 'Reg no already taken' }

            await staff.merge(payload).save()

        } catch (error: any) {
            console.error(error)
            await flashInertiaError(session, error?.msg || 'Cannot update staff member')
        } finally {
            response.redirect().back()
        }
    }

    async list_facilities({ request, response, inertia }: HttpContext) {
        const facilities = await this.prescriptionService.listFacilities(request.qs())
        if (request.isTuyau) return { facilities }
        return inertia.render('dashboard/facilities', { facilities })
    }

    async new_facility({ inertia }: HttpContext) {
        return inertia.render('dashboard/new_facility')
    }

    async create_facility({ request, session, response }: HttpContext) {
        try {
            const villageId = request.input('villageId', -1)
            const village = await Village.findOrFail(villageId)
            const address = village.address
            await this.prescriptionService.storeFacility({ ...request.body(), address })
            flashInertiaToastSuccess(session, 'new facility added!')
        } catch (error: any) {
            await flashApiError(session, error, 'Cannot add new facility')
        } finally {
            response.redirect().back()
        }
    }

    async edit_facility({ request, inertia }: HttpContext) {
        const facilityId = request.param('id', '')
        const facility = await HealthFacility.query().where('id', facilityId).preload('staffs').preload('admin').firstOrFail()
        const village = await Village.findOrFail(facility.villageId)
        return inertia.render('dashboard/new_facility', { facility, village })
    }

    async update_facility({ request, session, response }: HttpContext) {
        try {
            const villageId = request.input('villageId', -1)
            const village = await Village.findOrFail(villageId)
            const address = village.address
            await this.prescriptionService.updateFacility({ ...request.body(), address })
            flashInertiaToastSuccess(session, 'facility updated successfully!')
        } catch (error: any) {
            await flashApiError(session, error, 'Cannot update facility')
        } finally {
            response.redirect().back()
        }
    }
}