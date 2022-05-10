import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Municipality extends BaseModel {
  public static table = 'Municipio'

  @column({ isPrimary: true, columnName: 'Id_Municipio' })
  public id: number
  @column({ columnName: 'Nome' })
  public name: number

  @column({ columnName: 'Id_Provincia' })
  public provinceId: number

  /*
  @belongsTo(() => Province)
  public province: BelongsTo<typeof Province>

  */
}
