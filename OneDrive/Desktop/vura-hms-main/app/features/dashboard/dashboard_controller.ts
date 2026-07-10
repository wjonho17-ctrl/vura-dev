import PdfAction from '#app/features/auth/pdf_action'
import { flashInertiaError, flashSuccessToast } from '#app/shared/helpers/toast_notification_helper'
import Prescription from '#app/features/prescriptions/prescription'
import User from '#app/shared/user'
import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import vine from '@vinejs/vine'
import { DateTime } from 'luxon'
import { PrescriptionProduct } from '../../inertia/types/index.js'
import HealthFacility from '#app/features/facilities/health_facility'

export default class DashboardController {
  async overview({ inertia, auth, request }: HttpContext) {
    const user = auth.user as User
    const { page, perPage, ...input } = request.qs()

    const prescriptions = await Prescription.filter(input)
      .where('health_facility_id', user.currentHeathFacility.id)
      .orderBy('created_at', 'desc')
      .paginate(+page || 1, +perPage || 20)
    return inertia.render('dashboard', { prescriptions })
  }

  prescription_creation_view({ inertia }: HttpContext) {
    return inertia.render('dashboard/prescription_creation')
  }

  async prescription_print({ view, auth, request }: HttpContext) {
    const id = +request.param('id') || -1
    const user = auth.user as User
    const prescription = await user.currentHeathFacility
      .related('prescriptions')
      .query()
      .where({ id })
      .preload('practitioner')
      .preload('healthFacility')
      .firstOrFail()

    const title = `${prescription.patientPhone.replace('+25', '')}(${prescription.createdAt.toFormat('yyyy-MM-dd hh:MM')})`

    return await view.render('prescription_print', { prescription, title })
  }

  async prescription_create({ auth, request, response, session }: HttpContext) {
    const validator = vine.compile(
      vine.object({
        products: vine.array(
          vine.object({
            name: vine.string().trim(),
            id: vine.number(),
            quantity: vine.number(),
            frequency: vine.string().trim(),
            duration: vine.number(),
          })
        ),
        patient: vine.object({
          name: vine.string().trim(),
          weight: vine.number(),
          phone: vine
            .string()
            .fixedLength(9)
            .startsWith('7')
            .transform((v) => '+250' + v),
          genre: vine.enum(['M', 'F']),
        }),
        treatmentDate: vine
          .date({ formats: ['iso8601'] })
          .transform<DateTime>((v) => DateTime.fromJSDate(v)),
      })
    )
    const payload = await request.validateUsing(validator)

    const products: PrescriptionProduct[] = payload.products.map((p) => ({
      name: p.name,
      quantity: p.quantity,
      productId: p.id,
      drugFrenquency: p.frequency,
      durationDays: p.duration,
    }))

    try {
      const user = auth.user as User
      await user.load('currentHeathFacility')

      await user.currentHeathFacility.related('prescriptions').create({
        treatmentDate: payload.treatmentDate,
        products: { data: products },
        patientName: payload.patient.name,
        patientPhone: payload.patient.phone,
        patientGenre: payload.patient.genre,
        patientWeight: payload.patient.weight,
        userId: user.id,
      })

      flashSuccessToast(session, 'prescription generated')
      return response.redirect().toRoute('dashboard.overview')
    } catch (error) {
      console.error(error)
      flashInertiaError(session, 'cannot generate prescription. please contact support!')
      return response.redirect().back()
    }
  }

  async facility_switch({ request, auth, response }: HttpContext) {
    const user = auth.user as User
    await user.related('currentHeathFacility').dissociate()
    return response.redirect().back()
  }

  async facility_pick_list({ inertia, auth, response }: HttpContext) {
    if (auth.user?.currentHeathFacility) {
      return response.redirect().toRoute('dashboard.overview')
    }

    const facilities = await auth.user?.related('healthFacilities').query()
    return inertia.render('facility_pick_list', { facilities })
  }

  async facility_join({ session, request, auth, response }: HttpContext) {
    try {

      if (auth.user?.currentHeathFacility) {
        return response.redirect().toRoute('dashboard.overview')
      }

      const facilityId = request.param('facilityId', '')
      const user = auth.user as User
      console.log({ facilityId })
      const facility = await HealthFacility.query().where({ id: facilityId }).whereHas('users', q => q.where('users.id', user.id)).firstOrFail()
      await user.related('currentHeathFacility').associate(facility)

      return response.redirect().toRoute('dashboard.overview')
    } catch (error) {
      console.error(error)
      flashInertiaError(session, 'cannot join facility. please contact support!')
      return response.redirect().back()
    }
  }
}



