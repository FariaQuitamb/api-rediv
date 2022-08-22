import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class AdverseNotification extends BaseModel {
  public static table = '[SIGIS].[dbo].[vac_regVacNotificacao]'

  @column({ isPrimary: true, columnName: 'Id_regVacNotificacao' })
  public id: number
  @column({ columnName: 'Id_regInstituicao' })
  public institutionId: number
  @column({ columnName: 'Id_regIndividual' })
  public personId: number
  @column({ columnName: 'Id_userPostoVacinacao' })
  public vaccinationPostUserId: number

  @column({ columnName: 'Id_vacTratamento' })
  public vaccinationId: number

  @column({ columnName: 'Id_regVacinacao' })
  public appliedTreatmentId: number

  @column({ columnName: 'Status' })
  public state: string

  @column({ columnName: 'Id_Sintomas' })
  public symptoms: string

  @column({ columnName: 'Gravidez' })
  public pregnancy: string

  @column({ columnName: 'SemanaGravidez' })
  public pregnancyWeek: number

  @column({ columnName: 'DataCad' })
  public createdAt: string
}
