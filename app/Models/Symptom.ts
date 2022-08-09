import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Severity from './Severity'

export default class Symptom extends BaseModel {
  public static table = 'vac_Sintomas'
  @column({ isPrimary: true, columnName: 'Id_Sintomas' })
  public id: number

  @column({ columnName: 'Nome' })
  public name: string

  @column({ columnName: 'Id_Severidade' })
  public severityId: number

  @belongsTo(() => Severity)
  public severity: BelongsTo<typeof Severity>
}
