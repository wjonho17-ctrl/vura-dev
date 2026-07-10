import { TokenType } from '#app/shared/types/token_type'
import Token from '#app/features/auth/token'
import type { HttpContext } from '@adonisjs/core/http'
import vine, { SimpleMessagesProvider } from '@vinejs/vine'
import PasswordResetAction from '#app/features/auth/password_reset_action'
import {
  flashInertiaToastError,
  flashInertiaToastSuccess,
} from '#app/shared/helpers/toast_notification_helper'
import { PASSWORD_REGEX, PASSWORD_VALIDATION_MESSAGES } from '#constants/index'

export default class PasswordResetController {
  public async forgot({ inertia }: HttpContext) {
    return inertia.render('forgot_password')
  }

  public async send({ request, response, session }: HttpContext) {
    const emailValidator = vine.compile(
      vine.object({
        email: vine.string().email(),
      })
    )

    try {
      const { email } = await request.validateUsing(emailValidator)
      await PasswordResetAction.sendRestEmail(email)

    } catch (error) {
      console.error(error)
    } finally {
      flashInertiaToastSuccess(session, 'Password reset email sent. Please check your inbox.')
      return response.redirect().back()
    }
  }

  public async reset({ inertia, params }: HttpContext) {
    const token = params.token
    const isValid = await Token.verify(token, TokenType.RESET_PASSWORD)

    return inertia.render('reset_password', { isValid, token })
  }

  public async store({ request, response, session, auth }: HttpContext) {
    const passwordValidator = vine.compile(
      vine.object({
        token: vine.string(),
        password: vine.string().regex(PASSWORD_REGEX).minLength(8).confirmed({ confirmationField: 'confirmPassword' }),
      })
    )


    const { token, password } = await request.validateUsing(passwordValidator, { messagesProvider: new SimpleMessagesProvider({ ...PASSWORD_VALIDATION_MESSAGES }) })
    const user = await Token.getTokenUser(token, TokenType.RESET_PASSWORD)

    if (!user) {
      flashInertiaToastError(session, 'Token expired or associated user could not be found')

      return response.redirect().back()
    }

    await user.merge({ password }).save()
    await Token.expireTokens(user, TokenType.RESET_PASSWORD)

    const route = 'auth.login.view'
    return response.redirect().toRoute(route)
  }
}



