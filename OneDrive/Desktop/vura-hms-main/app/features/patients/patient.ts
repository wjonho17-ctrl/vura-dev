import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column, computed, hasMany } from '@adonisjs/lucid/orm'
import Prescription from './prescription.js'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import { PatientHistory } from '../../inertia/types/index.js'

export default class Patient extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column()
  declare name: string

  @column()
  declare phone: string

  @column()
  declare genre: 'M' | 'F'

  @column()
  declare weight: number

  @column.date()
  declare birthday: DateTime

  @column()
  declare history: { data: PatientHistory }

  @computed()
  public get phoneNumber() {
    return this.phone.replace('+25', '')
  }

  @hasMany(() => Prescription)
  declare prescriptions: HasMany<typeof Prescription>

  @beforeCreate()
  static async setId(patient: Patient) {
    patient.id = crypto.randomUUID()
  }
}
