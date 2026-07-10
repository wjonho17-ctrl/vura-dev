import factory from '@adonisjs/lucid/factories'
import User from '#app/shared/user'
import { RWANDA_PHONE_REGEX_FAKER } from '#app/shared/helpers/phone_helper'
import { HospitalPosition, MedicalSpecialty, UserRole } from '#app/shared/enums/user_enum'

export const UserFactory = factory
  .define(User, async ({ faker }) => {
    return {
      email: faker.internet.email(),
      phone: faker.helpers.fromRegExp(RWANDA_PHONE_REGEX_FAKER),
      password: '12345678',
      regno: faker.number.int({ min: 1_000, max: 9999 }).toString(),
      firstname: faker.person.firstName(),
      lastname: faker.person.lastName(),
      genre: (Math.random() > 0.5 ? 'M' : 'F') as 'M',
      role: UserRole.STAFF,
      position: HospitalPosition.SURGEON,
      specialities: { data: [MedicalSpecialty.ANESTHESIOLOGIST, MedicalSpecialty.DERMATOLOGIST] },
    }
  })
  .build()

