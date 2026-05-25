
import { BaseModelFilter } from 'adonis-lucid-filter'
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import ClassificationCode from '#models/classification_code'

export default class ClassificationCodeFilter extends BaseModelFilter {
  declare $query: ModelQueryBuilderContract<typeof ClassificationCode>

  name(value: string): void {
    this.$query.whereILike('name', `%${value}%`)
  }

  code(value: string): void {
    this.$query.whereILike('code', `%${value}%`)
  }
}