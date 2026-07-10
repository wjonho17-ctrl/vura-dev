import type { HttpContext } from '@adonisjs/core/http'

export enum NotificationToastType {
  SUCCESS = 'success',
  ERROR = 'error',
  INFO = 'info',
}

export enum ToastType {
  SUCCESS = 'success',
  ERROR = 'error',
  INFO = 'info',
}

export enum InertiaToastType {
  SUCCESS = 'success',
  ERROR = 'error',
  INFO = 'info',
  WARN = 'warn',
}

//#region flash notifications

export function flashNotification(
  session: HttpContext['session'],
  type: NotificationToastType,
  content: string
) {
  const value = { type, content }
  session.flash('notification', value)
  return value
}

export function flashToast(session: HttpContext['session'], type: ToastType, content: string) {
  const value = { type, content }
  session.flash('toast', value)
  return { type, value }
}

export function flashErrorToast(session: HttpContext['session'], message: string) {
  flashToast(session, ToastType.ERROR, message)
}

export function flashSuccessToast(session: HttpContext['session'], message: string) {
  flashToast(session, ToastType.SUCCESS, message)
}

export function flashContactSupportToast(session: HttpContext['session'], msg: string) {
  flashToast(session, ToastType.ERROR, `${msg}. Please contact support!`)
}

export function flashInertiaToast(
  session: HttpContext['session'],
  type: InertiaToastType,
  content: string
) {
  switch (type) {
    case InertiaToastType.ERROR:
      session.flash('toast', { error: content })
      break
    case InertiaToastType.SUCCESS:
      session.flash('toast', { success: content })
      break
    case InertiaToastType.INFO:
      session.flash('toast', { info: content })
      break
    case InertiaToastType.WARN:
      session.flash('toast', { warn: content })
      break

    default:
      break
  }
}

export function flashInertiaToastError(session: HttpContext['session'], message: string) {
  flashInertiaToast(session, InertiaToastType.ERROR, message)
}

export function flashInertiaToastInfo(session: HttpContext['session'], message: string) {
  flashInertiaToast(session, InertiaToastType.INFO, message)
}

export function flashInertiaToastWarn(session: HttpContext['session'], message: string) {
  flashInertiaToast(session, InertiaToastType.WARN, message)
}

export function flashInertiaToastSuccess(session: HttpContext['session'], message: string) {
  flashInertiaToast(session, InertiaToastType.SUCCESS, message)
}

export function flashInertiaToastContactSupport(
  session: HttpContext['session'],
  msg: string = 'Something went wrong!'
) {
  flashInertiaToast(session, InertiaToastType.ERROR, `${msg}. Please contact support!`)
}

export function flashInertiaError(session: HttpContext['session'], msg: string) {
  session.flashErrors({
    error: msg,
  })
}

export function flashInertiaWarn(session: HttpContext['session'], msg: string) {
  session.flashErrors({
    warn: msg,
  })
}

export function flashInertiaInfo(session: HttpContext['session'], msg: string) {
  session.flashErrors({
    info: msg,
  })
}

export function flashInertiaSuccess(session: HttpContext['session'], msg: string) {
  session.flash({
    success: msg,
  })
}

export function flashInertiaContactSupport(session: HttpContext['session'], msg: string) {
  flashInertiaError(session, msg + '. please contact support!')
}
//#endregion
