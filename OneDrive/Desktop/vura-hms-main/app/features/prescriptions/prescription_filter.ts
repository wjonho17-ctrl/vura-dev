import { BaseModelFilter } from 'adonis-lucid-filter'
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import Prescription from '#app/features/prescriptions/prescription'
import { DateTime } from 'luxon'

export default class PrescriptionFilter extends BaseModelFilter {
  declare $query: ModelQueryBuilderContract<typeof Prescription>

  fromDate(date: string): void {
    const time = DateTime.fromJSDate(new Date(date)).plus({day: 1})
    
    this.$query.whereRaw('created_at::DATE  = ?', [time.toSQLDate()!!])
  }
}

