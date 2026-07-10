import env from '#start/env'
import mail from '@adonisjs/mail/services/main'
import { Job } from 'adonisjs-jobs'

type SendEmailPayload = {
  email: string
  template: string
  subject: string
  data: any
  from?: string
}

export default class SendEmailJob extends Job {
  async handle({ email, template, from, data, subject }: SendEmailPayload) {
    try {
      await mail.send((message) => {
        message
          .to(email)
          .from(from || env.get('EMAIL_NO_REPLY'))
          .subject(subject)
          .htmlView(template, data)
      })
  
      this.logger.info(`mail sent [from: ${from}][to: ${email}]`)
    } catch (error) {
      console.error('Error sending email:', error)
      throw error
    }
  }
}
