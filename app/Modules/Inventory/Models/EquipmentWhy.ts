import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class EquipmentWhy extends BaseModel {
  public static table = 'porque_Equipamento'
  @column({ isPrimary: true, columnName:'Id_porqueEquipamento' })
  public id: number

  @column({columnName: 'Nome'})
  public name: string
}
