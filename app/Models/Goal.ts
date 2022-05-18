import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Goal extends BaseModel {
  public static table = 'vac_objPostoVac'

  @column({ isPrimary: true, columnName: 'Id_objPostoVac' })
  public id: number

  @column({ columnName: 'IdLogin' })
  public idLogin: string

  @column({ columnName: 'Objectivo' })
  public goal: string

  @column({ columnName: 'Descricao' })
  public description: string

  @column({ columnName: 'numDose' })
  public doseNumber: number

  @column({ columnName: 'DtIni' })
  public startDate: number
  @column({ columnName: 'DtFim' })
  public endDate: number

  @column({ columnName: 'Id_Provincia' })
  public provinceId: number
  @column({ columnName: 'Id_Municipio' })
  public municipalityId: number

  @column({ columnName: 'Id_Comuna' })
  public communeId: number

  @column({ columnName: 'TipoPosto' })
  public postType: string

  @column({ columnName: 'DataCad' })
  public createdAt: string
  @column({ columnName: 'Flag' })
  public flag: string
}
