import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class TreatmentDose extends BaseModel {
  public static table = 'vac_tratDose'
  @column({ isPrimary: true, columnName: 'Id_tratDose' })
  public id: number
  @column({ columnName: 'Id_tipoDoenca' })
  public illnessId: number
  @column({ columnName: 'Id_Tratamento' })
  public treatmentId: number
  @column({ columnName: 'Nome' })
  public name: string
  @column({ columnName: 'NumDias' })
  public numDays: number
  @column({ columnName: 'NumOrdem' })
  public orderNumber: number
  @column({ columnName: 'Visualizar' })
  public visualize: string
}
