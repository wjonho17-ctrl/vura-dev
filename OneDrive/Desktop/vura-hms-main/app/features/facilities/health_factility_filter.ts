
import { BaseModelFilter } from 'adonis-lucid-filter'
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import HealthFactility from '#app/features/facilities/health_facility'

export default class HealthFactilityFilter extends BaseModelFilter {
  declare $query: ModelQueryBuilderContract<typeof HealthFactility>

  name(value: string): void {
    console.log('Searhcing...', value)
    this.$query.whereILike('name', `%${value}%`)
  }
}
