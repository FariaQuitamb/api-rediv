import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class RegVaccinationLog extends BaseModel {
  public static table = 'vac_regVacinacaoLog'

  @column({ isPrimary: true, columnName: 'Id_regVacinacaoLog' })
  public id: number
  @column({ columnName: 'Id_regVacinacao' })
  public vaccinationId: number
  @column({ columnName: 'Imei' })
  public imei: string
  @column({ columnName: 'Tipo' })
  public type: string
  @column({ columnName: 'Telefobe' })
  public phone: string
  @column({ columnName: 'Latitude' })
  public latitude: string
  @column({ columnName: 'longitude' })
  public longitude: string
}
