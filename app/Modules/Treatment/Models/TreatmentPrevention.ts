import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class TreatmentPrevention extends BaseModel {
  public static table = 'vac_tratPrevencao'

  @column({ isPrimary: true, columnName: 'Id_tratPrevencao' })
  public id: number
  @column({ columnName: 'Nome' })
  public name: string
  @column({ columnName: 'Status' })
  public status: string
}
