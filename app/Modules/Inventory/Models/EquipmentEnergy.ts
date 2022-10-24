import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class EquipmentEnergy extends BaseModel {
  public static table = 'energia_Equipamento'
  @column({ isPrimary: true, columnName: 'Id_energiaEquipamento' })
  public id: number

  @column({columnName: 'Nome'})
  public name: string

  @column({columnName: 'Status'})
  public status: string
}
