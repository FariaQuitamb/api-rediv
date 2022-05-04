import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class LoggedUser extends BaseModel {
  public static table = 'api_tokens'

  @column({ isPrimary: true, columnName: 'user_id' })
  public id: number

  @column({ columnName: 'name' })
  public name: string

  @column({ columnName: 'type' })
  public type: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public expiresAt: DateTime
}
