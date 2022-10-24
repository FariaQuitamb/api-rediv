import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class EquipmentType extends BaseModel {
  public static table = 'tipo_Equipamento'
  @column({ isPrimary: true, columnName: 'Id_tipoEquipamento'})
  public id: number

  @column ({columnName: 'Nome'})
  public name: string

  @column({columnName: 'Status'})
  public status:string

  @column({columnName: 'DataCad'})
  public DataCad: string
}
