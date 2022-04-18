import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Lot extends BaseModel {
  public static table = 'vac_LoteVacina'

  @column({ isPrimary: true, columnName: 'Id_LoteVacina' })
  public id: number

  @column({ columnName: 'Id_Vacina' })
  public vaccineId: number

  @column({ columnName: 'NumLote' })
  public numLote: string

  @column({ columnName: 'DtValidade' })
  public validationDate: string
  @column({ columnName: 'Id_FrabicanteVacina' })
  public manufacturerId: number
  @column({ columnName: 'Visualizar' })
  public view: string
}
