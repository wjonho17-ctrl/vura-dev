import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import { TokenType, TokenVerifcationType } from '#app/shared/types/token_type'
import User from '#app/shared/user'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import string from '@adonisjs/core/helpers/string'
import db from '@adonisjs/lucid/services/db'


export default class Token extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number | null

  @column()
  declare type: TokenType

  @column()
  declare token: string

  @column.dateTime()
  declare expiresAt: DateTime | null


  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // relationships
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  // methods

  public static async generateVerifyEmailToken(user: User, type: TokenVerifcationType, expirePreviousToken:boolean = true) {
    const token = string.random(64)

    if(expirePreviousToken) await Token.expireTokens(user, type)
    const record = await user.related('tokens').create({
      type,
      expiresAt: DateTime.now().plus({ hours: 24 }),
      token
    })

    return record.token
  }

  public static async generatePasswordResetToken(user: User | null) {
    const token = string.random(64)

    if (!user) return token

    await Token.expireTokens(user, TokenType.RESET_PASSWORD)
    const record = await user.related('tokens').create({
      type: TokenType.RESET_PASSWORD,
      expiresAt: DateTime.now().plus({ hour: 1 }),
      token,
    })

    return record.token
  }

  public static async expireToken(token: string) {
    const tokenToExpire = await Token.findBy('token', token)
    if(tokenToExpire) {
      await tokenToExpire.merge({ expiresAt: DateTime.now() }).save()
    }
  }

  public static async expireTokens(user: User, type: TokenType) {
    
    if (type !== TokenType.RESET_PASSWORD) {
      await db.from('tokens').update({
        expires_at: DateTime.now()
      }).where('type', type)
      return
    }

    const query = user.related('passwordResetTokens').query()
    await query.update({
      expiresAt: DateTime.now()
    })
  }

  public static async getTokenUser(token: string, type: TokenType) {
    const record = await Token.query()
      .preload('user')
      .where('token', token)
      .where('type', type)
      .where('expiresAt', '>', DateTime.now().toSQL())
      .orderBy('createdAt', 'desc')
      .first()

    return record?.user
  }

  public static async getTokenType(token: string) {
    const record = await Token.query()
      .where('token', token)
      .where('expiresAt', '>', DateTime.now().toSQL())
      .first()

    return record?.type
  }

  public static async verify(token: string, type: TokenType) {
    const record = await Token.query()
      .where('expiresAt', '>', DateTime.now().toSQL())
      .where('token', token)
      .where('type', type)
      .first()

    return !!record
  }

  // FIXME: remove tken after validation
  public static async verifyManyType(token: string, types: TokenType[], returnObj:boolean = false) {
    const query = Token.query()
      .where('expiresAt', '>', DateTime.now().toSQL())
      .where('token', token)
      .andWhereIn('type', types)

    const record =  await query.first()

    return returnObj ? Promise.resolve(record) : Promise.resolve(!!record)
  }

}

