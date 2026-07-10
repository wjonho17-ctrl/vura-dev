import { OtpAction } from '#app/features/auth/otp_action'
import { flashInertiaError } from '#app/shared/helpers/toast_notification_helper'
import User from '#app/shared/user'
import EmailService, { EMAIL_TEMPLATES } from '#app/shared/services/email_service'
import { verifyOtpValidator } from '#app/features/auth/otp_validator'
import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'

export default class AuthController {
  login_view({ inertia }: HttpContext) {
    return inertia.render('login')
  }

  async login_with_email({ request, response, session }: HttpContext) {
    const validator = vine.compile(
      vine.object({
        email: vine.string().trim().email(),
        password: vine.string(),
      })
    )
    
    const payload = await request.validateUsing(validator)

    try {
      const user = await User.verifyCredentials(payload.email, payload.password)
      const otp = await OtpAction.generate(user, true)

      await EmailService.send(user.email, EMAIL_TEMPLATES.USER_LOGIN_OTP as 'USER_LOGIN_OTP', {
        subject: 'OTP to login in Pharmacy Management System',
        data: { username: user.fullname, otp },
      })
    } catch (error) {
      console.error(error)
      flashInertiaError(session, 'Cannot login. please check your email or password!')
    } finally {
      return response.redirect().back()
    }
  }

  async login({ request, response, auth, session }: HttpContext) {
    const payload = await request.validateUsing(verifyOtpValidator)
    try {
      const { isValid, user } = await OtpAction.verify(payload)

      if (!isValid) {
        throw { msg: 'Wrong code, please insert valid code!' }
      }

      await auth.use('web').login(user, !!payload.rememberMe)

      return response.redirect().toRoute('dashboard.overview')
    } catch (error) {
      console.error(error)
      flashInertiaError(session, error?.msg || 'Cannot verify otp. please contact support!')
      return response.redirect().back()
    }
  }

  async logout({ response, auth }: HttpContext) {
    await auth.use('web').logout()

    return response.redirect().toRoute('auth.login.view')
  }
}



