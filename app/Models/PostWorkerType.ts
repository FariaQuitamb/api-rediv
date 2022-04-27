import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class PostWorkerType extends BaseModel {
  public static table = 'vac_tipoFuncPostoVac'
  @column({ isPrimary: true, columnName: 'Id_tipoFuncPostoVac' })
  public id: number

  @column({ columnName: 'Nome' })
  public type: string
}
