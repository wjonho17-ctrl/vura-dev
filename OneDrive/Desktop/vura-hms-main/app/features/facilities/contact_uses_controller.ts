import { flashInertiaError } from '#app/shared/helpers/toast_notification_helper'
import EmailService, { EMAIL_TEMPLATES } from '#app/shared/services/email_service'
import env from '#start/env'
import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'

export default class ContactUsesController {

  async send({request, response, session}: HttpContext) {
    const validator = vine.compile(vine.object({
      email: vine.string().trim().email(),
      phone: vine.string().fixedLength(9).startsWith('7').transform(v => `+250${v}`),
      subject: vine.string().maxLength(125).trim(),
      message: vine.string().maxLength(500).trim()
    }))

    const payload = await request.validateUsing(validator)

    try {
      await EmailService.send(env.get('CONTACT_EMAIL'), EMAIL_TEMPLATES.CONTACT_US, {
        subject: '',
        data: payload
      })
    } catch (error) {
      console.error(error)
      flashInertiaError(session, 'cannot contact us')
    } finally {
      return response.redirect().back()
    }
  }
}
