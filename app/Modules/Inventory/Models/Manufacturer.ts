import { BaseModel, column, HasMany, hasMany} from '@ioc:Adonis/Lucid/Orm'
import EquipmentModel from 'App/Models/EquipmentModel'

export default class Manufacturer extends BaseModel {
  public static table = 'marca_Equipamento'
  @column({ isPrimary: true, columnName: 'Id_marcaEquipamento' })
  public id: number

  @column({columnName: 'Nome'})
  public name:string

  @column({columnName: 'Status'})
  public Status:string

  @column({ columnName: 'DataCad'})
  public DataCad: string

  @hasMany(() => EquipmentModel)
  public equipmentModels: HasMany < typeof EquipmentModel>
}
