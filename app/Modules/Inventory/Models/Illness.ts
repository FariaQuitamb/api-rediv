import { BaseModel, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import Treatment from './Treatment'

export default class Illness extends BaseModel {
  public static table = 'vac_tipoDoenca'
  @column({ isPrimary: true, columnName: 'Id_tipoDoenca' })
  public id: number
  @column({ columnName: 'Nome' })
  public name: string
  @column({ columnName: 'Status' })
  public status: string
  @hasMany(() => Treatment)
  public treatments: HasMany<typeof Treatment>
}
