import { BaseModel, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import Symptom from './Symptom'

export default class Severity extends BaseModel {
  public static table = 'vac_Severidade'

  @column({ isPrimary: true, columnName: 'Id_Severidade' })
  public id: number

  @column({ columnName: 'Nome' })
  public name: string

  @hasMany(() => Symptom)
  public symptoms: HasMany<typeof Symptom>
}
