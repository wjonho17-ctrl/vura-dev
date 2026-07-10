import factory from '@adonisjs/lucid/factories'
import HealthFacility from '#app/features/facilities/health_facility'
import { UserFactory } from './user_factory.js'
import { RWANDA_PHONE_REGEX_FAKER } from '#app/shared/helpers/phone_helper'

export const HealthFacilityFactory = factory
  .define(HealthFacility, async ({ faker }) => {
    return {
      name: faker.company.catchPhraseDescriptor(),
      villageId: 1,
      address: 'kicukiro kicukiro',
      latitude: 0,
      longitude: 0,
      email: faker.internet.email(),
      phone: faker.helpers.fromRegExp(RWANDA_PHONE_REGEX_FAKER),
    }
  })
  .relation('users', () => UserFactory)
  .build()
