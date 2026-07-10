import SendEmailJob from '#app/shared/jobs/send_email_job'

export const EMAIL_TEMPLATES = {
  USER_LOGIN_OTP: 'emails/otp',
  CONTACT_US: 'emails/contact_us',
  PASSWORD_RESET: 'emails/reset_password',
  WELCOME_STAFF: 'emails/welcome_staff',
  WELCOME_FACITITY_ADMINISTRATOR: 'emails/welcome_facility_admin'
}

export type EmailServiceData = {
  subject: string
  data: Object
}

export default class EmailService {
  static async send(email: string, template: keyof typeof EMAIL_TEMPLATES | string, { subject, data }: EmailServiceData, priority?: number) {
    return SendEmailJob.dispatch({ email, template, subject, data }, { priority })
  }
}

