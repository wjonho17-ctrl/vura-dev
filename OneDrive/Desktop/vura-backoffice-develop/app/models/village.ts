import { BaseModel, beforeFetch, beforeFind, belongsTo, column, computed } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import Cell from './cell.js'
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'

export default class Village extends BaseModel {
  static connection = 'medbook'

  @column({ isPrimary: true })
  declare id: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column()
  declare name: string

  @column()
  declare cellId: number

  @column()
  declare longitude: number

  @column()
  declare latitude: number

  @beforeFetch()
  static fetchLoaction(query: ModelQueryBuilderContract<typeof Village>) {
    query.preload('cell', (qC) =>
      qC.preload('sector', (qS) => qS.preload('district', (qD) => qD.preload('province')))
    )

  }

  /**
   * Runs before finding a single record from the database
   */
  @beforeFind()
  static findLoaction(query: ModelQueryBuilderContract<typeof Village>) {
    query.preload('cell', (qC) =>
      qC.preload('sector', (qS) => qS.preload('district', (qD) => qD.preload('province')))
    )

  }

  @computed()
  get address() {
    const cell = this.cell
    const district = cell?.sector?.district
    if (!district) return null
    return `${district.province.name}, ${district.name}, ${cell.sector.name}, ${cell.name}, ${this.name}`
  }

  //#region relationships
  @belongsTo(() => Cell)
  declare cell: BelongsTo<typeof Cell>
  //#endregion
}
