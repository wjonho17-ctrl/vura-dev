import Token from '#app/features/auth/token'
import User from '#app/shared/user'
import EmailService, { EMAIL_TEMPLATES } from '#app/shared/services/email_service'
import env from '#start/env'
import router from '@adonisjs/core/services/router'

export default class PasswordResetAction {
  static async sendRestEmail(email: string, subject?: string) {
    const user = await User.query().where('email', email).withScopes(s => s.isActive()).firstOrFail()
    const token = await Token.generatePasswordResetToken(user)
    const resetLink = router.makeUrl('password.reset', [token])

    EmailService.send(user.email, EMAIL_TEMPLATES.PASSWORD_RESET, {
      subject: 'E-Prescription Reset Password', data: {
        link: env.get('DOMAIN') + resetLink,
        username: user.firstname
      }
    }, 8)
  }
}


