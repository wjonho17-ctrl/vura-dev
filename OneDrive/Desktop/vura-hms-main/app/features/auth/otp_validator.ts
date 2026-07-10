import vine from '@vinejs/vine'

export const verifyOtpValidator = vine.compile(
  vine.object({
    mode: vine.enum(['email', 'phone']),
    email: vine
      .string()
      .email()
      .optional()
      .requiredWhen('mode', '=', 'emial'),
    otp: vine.string().trim().fixedLength(6),
    phone: vine
      .string()
      .trim()
      .startsWith('07')
      .fixedLength(10)
      .transform((v) => `+25${v}`)
      .optional()
      .requiredWhen('mode', '=', 'emial'),
    rememberMe: vine.boolean().optional()
  })
)

export const generateOtpValidator = vine.compile(
  vine.object({
    phone: vine
      .string()
      .trim()
      .startsWith('07')
      .fixedLength(10)
      .transform((v) => `+25${v}`),
  })
)
