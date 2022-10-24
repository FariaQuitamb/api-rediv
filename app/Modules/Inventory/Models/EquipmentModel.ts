import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Manufacturer from './Manufacturer'

export default class EquipmentModel extends BaseModel {
  public static table = 'modelo_Equipamento'

  @column({ isPrimary: true, columnName: 'Id_modeloEquipamento'})
  public id: number

  @column({columnName:'Id_marcaEquipamento'})
  public manufacturerId: number

  @column({columnName: 'Gas'})
  public gasType: string

  @column({columnName: 'Largura'})
  public width: string

  @column({columnName: 'Altura'})
  public height: string

  @column({columnName: 'Comprimento'})
  public lenght: string

  @column({columnName: 'Volume'})
  public volume: string

  @column({columnName: 'Status'})
  public status: string

  @column({columnName: 'DataCad'})
  public DataCad: string


  @belongsTo(()=> Manufacturer)
  public manufacturers: BelongsTo <typeof Manufacturer>
}
