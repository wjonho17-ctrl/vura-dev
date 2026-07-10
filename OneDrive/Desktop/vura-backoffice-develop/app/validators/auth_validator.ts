import vine from '@vinejs/vine'

export const LoginValidator = vine.compile(vine.object({
  email: vine.string().email(),
  password: vine.string(),
  checked: vine.boolean().optional()
}))