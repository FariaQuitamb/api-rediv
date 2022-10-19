import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import VaccinationPost from 'App/Models/VaccinationPost'
import Treatment from './Treatment'

export default class AppliedTreatment extends BaseModel {
  public static table = 'vac_vacTratamento]'
  @column({ isPrimary: true, columnName: 'Id_vacTratamento' })
  public id: number

  @column({ columnName: 'Id_CampTratVac' })
  public campaignId: number
  @column({ columnName: 'Id_regIndividual' })
  public personId: number

  @column({ columnName: 'Id_tipoDoenca' })
  public illnessId: number

  @column({ columnName: 'Id_Tratamento' })
  public treatmentId: number

  @column({ columnName: 'Id_tratDose' })
  public treatmentDoseId: number

  @column({ columnName: 'Id_postoVacinacao' })
  public vaccinationPostId: number

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

  @belongsTo(() => Treatment)
  public treatment: BelongsTo<typeof Treatment>

  @belongsTo(() => VaccinationPost)
  public vaccinationPost: BelongsTo<typeof VaccinationPost>
}
