import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Equipment extends BaseModel {
  public static table = 'reg_Equipamento'
  @column({ isPrimary: true, columnName: 'Id_regEquipamento'})
  public id: number

  @column({columnName: 'Id_tipoEquipamento'})
  public equipmentTypeId: number

  @column({columnName: 'Id_marcaEquipamento'})
  public equipmentManufacturerId: number

  @column({columnName: 'Id_modeloEquipamento'})
  public equipmentModelId: number

  @column({columnName: 'Id_energiaEquipamento'})
  public equipmentEnergyId: number

  @column({columnName: 'Situacao'})
  public workingStatus: string

  @column({columnName: 'anoInstalacao'})
  public instalationAt: string

  @column({columnName: 'Id_porqueEquipamento'})
  public equipmentWhiesId: number

  @column({columnName: 'Comentario'})
  public comment: string

  @column({columnName: 'Status'})
  public status: string

  @column({columnName: 'DataCad'})
  public dataCad: string

  @column({columnName: 'Latitude'})
  public lat: string

  @column({columnName: 'Longitude'})
  public long: string

  @column({columnName: 'Id_Login'})
  public createdBy: number
}
