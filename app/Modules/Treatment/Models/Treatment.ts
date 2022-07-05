import { DateTime } from 'luxon'
import { BaseModel, belongsTo, BelongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Illness from './Illness'
import TreatmentPrevention from './TreatmentPrevention'
import TreatmentVaccine from './TreatmentVaccine'

export default class Treatment extends BaseModel {
  public static table = 'vac_Tratamento'

  @column({ isPrimary: true, columnName: 'Id_Tratamento' })
  public id: number

  @column({ columnName: 'Id_tipoDoenca' })
  public illnessId: number

  @column({ columnName: 'Id_tratVacina' })
  public treatmentVaccineId: number
  @column({ columnName: 'Id_tratPrevencao' })
  public treatmentPreventionId: number

  @column({ columnName: 'Status' })
  public status: string

  @belongsTo(() => Illness)
  public illness: BelongsTo<typeof Illness>

  @belongsTo(() => TreatmentPrevention)
  public prevention: BelongsTo<typeof TreatmentPrevention>
  @belongsTo(() => TreatmentVaccine)
  public vaccine: BelongsTo<typeof TreatmentVaccine>
}
