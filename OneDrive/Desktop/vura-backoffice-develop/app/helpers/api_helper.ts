import { HttpContext } from '@adonisjs/core/http'
import { flashInertiaContactSupport, flashInertiaError } from './toast_notification_helper.js'
import { HTTPError } from 'ky'

const formattedErrors = (messages: any[]) =>
  messages.reduce((acc, { field, message }) => {
    acc[field] = message
    return acc
  }, {})

export async function flashApiError(session: HttpContext['session'], error: any, msg: string) {
  if (error instanceof HTTPError) {
    const res = await error.response.json()
    console.error(res)
    if (res?.messages) {
      session.flashErrors(res?.messages ? formattedErrors(res?.messages) : res.error)
    }
    else {
      flashInertiaError(session, res?.error || msg)
    }
  } else {
    console.error(error)
    flashInertiaContactSupport(session, msg)
  }
}
