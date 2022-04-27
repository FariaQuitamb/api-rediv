import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Nationality extends BaseModel {
  public static table = 'vac_Nacionalidade'
  @column({ isPrimary: true, columnName: 'Id_Nacionalidade' })
  public id: number
  @column({ columnName: 'Nome' })
  public name: number
}
