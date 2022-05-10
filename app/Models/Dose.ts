import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Dose extends BaseModel {
  public static table = 'vac_DoseVacina'

  @column({ isPrimary: true, columnName: 'Id_DoseVacina' })
  public id: number

  @column({ columnName: 'Id_Vacina' })
  public vaccineId: number
  @column({ columnName: 'Nome' })
  public name: string
  @column({ columnName: 'NumDias' })
  public numDays: number
  @column({ columnName: 'NumOrdem' })
  public orderNumber: number
  @column({ columnName: 'Visualizar' })
  public view: number
}
