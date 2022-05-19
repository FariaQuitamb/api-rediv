import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class ApiTokenCustom extends BaseModel {
  public static table = 'api_tokens'

  @column({ isPrimary: true })
  public id: number

  @column()
  public userId: number

  @column()
  public name: string

  @column()
  public type: string

  @column()
  public personalName: string
  @column()
  public nationalId: string

  @column()
  public phone: string

  @column()
  public role: string

  @column()
  public vaccinationPost: string

  @column()
  public vaccinationPostId: string

  @column()
  public province: string

  @column()
  public municipality: string

  @column()
  public apiVersion: string

  @column.dateTime()
  public expiresAt: DateTime

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime
}
