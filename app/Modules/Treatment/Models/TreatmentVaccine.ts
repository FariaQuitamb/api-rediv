import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class TreatmentVaccine extends BaseModel {
  public static table = 'vac_tratVacina'
  @column({ isPrimary: true, columnName: 'Id_tratVacina' })
  public id: number
  @column({ columnName: 'Nome' })
  public name: string
  @column({ columnName: 'Status' })
  public status: string
}
