import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class LogError extends BaseModel {
  public static table = 'LogERRO'

  @column({ isPrimary: true, columnName: 'DataCad' })
  public id: string

  @column({ columnName: 'Tipo' })
  public type: string
  @column({ columnName: 'Pagina' })
  public page: string
  @column({ columnName: 'MsgErro' })
  public error: string
  @column({ columnName: 'DataCad' })
  public date: string
}
