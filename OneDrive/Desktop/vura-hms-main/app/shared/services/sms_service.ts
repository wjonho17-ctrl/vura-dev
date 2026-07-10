import SendEmailJob from '#app/shared/jobs/send_email_job'
import env from '#start/env'

export const SMS_TEMPLATES = {
  EMPLOYEE_INVITATION_OTP: 'sms/employee_invitation_otp',
  LOGIN_OTP: 'sms/login',
}

export class SmsService {
  // Your code here

  static async send<T>(phone: string, template: string, data?: T) {
    if (env.get('SMS_SERVICE_MODE') === 'test') {
      return SendEmailJob.dispatch(
        {
          email: 'sms@test.com',
          data,
          subject: `SMS TEST [${phone.replace('+25', '')}]`,
          template,
        },
        {
          priority: 10
        }
      )
    }

    //send real sms
  }

  static async sendLater<T>(phone: string, template: string, data?: T) {
    if (env.get('SMS_SERVICE_MODE') === 'test') {
      return this.send(phone, template, data)
    }

    //send real sms
  }
}

