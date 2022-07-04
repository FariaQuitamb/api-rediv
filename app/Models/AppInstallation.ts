import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class AppInstallation extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public deviceId: string

  @column()
  public latitude: string
  @column()
  public longitude: string
  @column()
  public version: string
  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
