import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class DocType extends BaseModel {
  public static table = 'vac_tipoDocumento'

  @column({ isPrimary: true, columnName: 'Id_tipoDocumento' })
  public id: number

  @column({ columnName: 'Nome' })
  public name: string
}
