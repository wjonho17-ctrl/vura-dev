import { RWANDA_PHONE_REGEX } from '#constants/index'
import vine from '@vinejs/vine'

export const createPharmacyValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(3).maxLength(100).unique({ table: 'pharmacies', column: 'name', connection: 'medbook' }),
    isWholeseller: vine.boolean(),
    isImporter: vine.boolean(),
    logo: vine.file({ extnames: ['png', 'PNG', 'jpg', 'JPG', 'jpeg', 'JPEG'], size: '5mb' }).nullable(),
    tin: vine.number().range([100000000, 999999999]).positive().unique({ table: 'pharmacies', column: 'tin', connection: 'medbook' }),
    postalBox: vine.string().optional(),
    email: vine.string().email().unique({ table: 'pharmacies', column: 'email', connection: 'medbook' }),
    phoneNumber: vine.string().regex(RWANDA_PHONE_REGEX).unique({ table: 'pharmacies', column: 'phone_number', connection: 'medbook' }).unique({ table: 'pharmacies', column: 'phone_number_two', connection: 'medbook' }),
    phoneNumberTwo: vine.string().regex(RWANDA_PHONE_REGEX).unique({ table: 'pharmacies', column: 'phone_number_two', connection: 'medbook' }).unique({ table: 'pharmacies', column: 'phone_number', connection: 'medbook' }).optional(),
    branch: vine.object({
      villageId: vine.number().exists({ table: 'villages', column: 'id', connection: 'medbook' }),
      longitude: vine.number(),
      latitude: vine.number(),
    }),
    profile: vine.object({
      phone: vine.string().regex(RWANDA_PHONE_REGEX).unique({ table: 'users', column: 'phone', connection: 'medbook' }),
      firstname: vine.string().minLength(3).maxLength(100),
      lastname: vine.string().maxLength(100).minLength(3),
      gender: vine.enum(['M', 'F']),
      email: vine.string().email().unique({ table: 'users', column: 'email', connection: 'medbook' }),
      fdaLiscense: vine.file({ extnames: ['png', 'PNG', 'jpg', 'JPG', 'jpeg', 'JPEG', 'pdf', 'PDF'], size: '20mb' }),
      pharmacistLiscense: vine.file({ extnames: ['png', 'PNG', 'jpg', 'JPG', 'jpeg', 'JPEG', 'pdf', 'PDF'], size: '20mb' }),
    })
  })
)
