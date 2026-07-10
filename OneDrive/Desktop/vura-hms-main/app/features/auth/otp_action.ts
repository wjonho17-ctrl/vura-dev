import { generateRandomInt } from '#app/shared/helpers/math_helper'
import Admin from '#app/features/auth/admin'
import User from '#app/shared/user'
import { SMS_TEMPLATES, SmsService } from '#app/shared/services/sms_service'

interface VerifyOtpOption {
  phone?: string
  otp: string
  mode: string
  email?: string
}

export class OtpAction {
  static async generate(user: User, withoutSms: boolean = false) {
    const otp = generateRandomInt(3).toString() + generateRandomInt(3).toString()

    await user.related('otps').updateOrCreate({ userId: user.id }, { code: otp })

    if (withoutSms) {
      return Promise.resolve(otp)
    }

    SmsService.sendLater(user.phone, SMS_TEMPLATES.LOGIN_OTP, { otp })

    return Promise.resolve(otp)
  }

  static async generateAdminOTP(user: Admin, withoutSms: boolean = false) {
    const otp = generateRandomInt(3).toString() + generateRandomInt(3).toString()

    await user.related('otps').updateOrCreate({ adminId: user.id }, { code: otp })

    if (withoutSms) {
      return Promise.resolve(otp)
    }

    SmsService.sendLater(user.phone, SMS_TEMPLATES.LOGIN_OTP, { otp })

    return Promise.resolve(otp)
  }

  static async verifyAdmin({ phone, otp, mode, email }: VerifyOtpOption) {
    const user =  mode === 'email' ? await Admin.findByOrFail({ email }) : await Admin.findByOrFail({ phone })

    const userOtp = await user.related('otps').query().firstOrFail()
    
    const isValid = userOtp.code === otp
    
    if (isValid) {
      await user.related('otps').query().delete()
    }
    
    return Promise.resolve({ isValid, user })
  }

  static async verify({ phone, otp, mode, email }: VerifyOtpOption) {
    const user =  mode === 'email' ? await User.findByOrFail({ email }) : await User.findByOrFail({ phone })

    const userOtp = await user.related('otps').query().firstOrFail()

    const isValid = userOtp.code === otp

    if (isValid) {
      await user.related('otps').query().delete()
    }

    return Promise.resolve({ isValid, user })
  }

}


