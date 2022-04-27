import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class VaccinationLog extends BaseModel {
  public static table = 'LogRegVac'

  @column({ isPrimary: true, columnName: 'Id_LogRegVac' })
  public id: number

  @column({ columnName: 'Id_Login' })
  public userId: number

  @column({ columnName: 'Id_regVacinacao' })
  public vaccinationId: number
  @column({ columnName: 'Sistema' })
  public system: string
  @column({ columnName: 'TipoJOB' })
  public job: string
  @column({ columnName: 'Pagina' })
  public screen: string
  @column({ columnName: 'Acao' })
  public action: string
  @column({ columnName: 'Observacao' })
  public observation: string
  @column({ columnName: 'Data' })
  public date: string
  @column({ columnName: 'Id_userPostoVacinacao' })
  public userPostoVaccination: number
}
