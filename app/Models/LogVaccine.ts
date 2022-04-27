import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class LogVaccine extends BaseModel {
  public static table = 'LogVAC'

  @column({ isPrimary: true, columnName: 'ID_Login' })
  public id: number
  @column({ columnName: 'Sistema' })
  public system: string

  @column({ columnName: 'TipoJOB' })
  public job: string

  @column({ columnName: 'Pagina' })
  public screen: string

  @column({ columnName: 'Tabela' })
  public table: string

  @column({ columnName: 'ID_Tabela' })
  public tableId: number

  @column({ columnName: 'Acao' })
  public action: string

  @column({ columnName: 'AcaoId' })
  public actionId: string

  @column({ columnName: 'Data' })
  public date: string
}
