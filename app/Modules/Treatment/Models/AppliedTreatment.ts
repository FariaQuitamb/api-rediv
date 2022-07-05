import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class AppliedTreatment extends BaseModel {
  public static table = 'vac_vacTratamento]'
  @column({ isPrimary: true, columnName: 'Id_vacTratamento' })
  public id: number
  @column({ columnName: 'Id_regIndividual' })
  public personId: number

  @column({ columnName: 'Id_tipoDoenca' })
  public illnessId: number

  @column({ columnName: 'Id_Tratamento' })
  public treatmentId: number

  @column({ columnName: 'Id_tratDose' })
  public treatmentDoseId: number

  @column({ columnName: 'Id_userPostoVacinacao' })
  public vaccinationPostUserId: number

  @column({ columnName: 'Latitude' })
  public latitude: string
  @column({ columnName: 'Longitude' })
  public longitude: string
  @column({ columnName: 'Status' })
  public status: string

  @column({ columnName: 'DataCad' })
  public createdAt: string
}
