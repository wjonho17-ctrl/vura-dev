import factory from '@adonisjs/lucid/factories'
import Patient from '#app/features/patients/patient'
import { RWANDA_PHONE_REGEX_FAKER } from '#app/shared/helpers/phone_helper'
import { DateTime } from 'luxon'

export const PatientFactory = factory
  .define(Patient, async ({ faker }) => {
    return {
      birthday: DateTime.fromJSDate(faker.date.birthdate()),
      genre: (Math.random() > 0.5 ? 'M' : 'F') as 'M',
      name: faker.person.fullName(),
      phone: faker.helpers.fromRegExp(RWANDA_PHONE_REGEX_FAKER),
      weight: faker.number.int({ min: 39, max: 200 }),
    }
  })
  .build()

