import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class PostGoal extends BaseModel {
  public static table = 'vac_objPostoVacOBJ'

  @column({ isPrimary: true, columnName: 'Id_objPostoVacOBJ' })
  public id: number

  @column({ columnName: 'Id_postoVacinacao' })
  public vaccinationPost: string

  @column({ columnName: 'Id_objPostoVac' })
  public goalPostVacId: number

  @column({ columnName: 'DataCad' })
  public createdAt: string

  @column({ columnName: 'Flag' })
  public flag: string
}
