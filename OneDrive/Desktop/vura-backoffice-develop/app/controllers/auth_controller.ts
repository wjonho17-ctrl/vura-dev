import User from '#models/user'
import { LoginValidator } from '#validators/auth_validator'
import type { HttpContext } from '@adonisjs/core/http'
import {
  flashInertiaContactSupport, flashInertiaToastSuccess
} from '../helpers/toast_notification_helper.js'
import { Sentry } from '@rlanz/sentry'

export default class AuthController {
  index({ inertia }: HttpContext) {
    return inertia.render('auth/Login')
  }

  async login({ request, response, auth, session }: HttpContext) {
    const { email, password, checked } = await request.validateUsing(LoginValidator)

    try {
      const user = await User.verifyCredentials(email, password)

      await auth.use('web').login(user, !!checked)

      flashInertiaToastSuccess(session, `welcome ${user.firstname}`)

      return response.redirect().toRoute('dashboard.index')
    } catch (error: any) {
      console.error(error)

      flashInertiaContactSupport(session, 'please insert valid credentials')
      return response.redirect().back()
    }
  }

  async logout({ response, auth }: HttpContext) {
    try {
      await auth.use('web').logout()
    } finally {
      return response.redirect().toRoute('auth.index')
    }
  }
}
