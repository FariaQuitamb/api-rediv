import {
  BaseModel,
  BelongsTo,
  belongsTo,
  column,
  ManyToMany,
  manyToMany,
} from '@ioc:Adonis/Lucid/Orm'
import Goal from './Goal'
import Municipality from './Municipality'
import Province from './Province'

export default class VaccinationPost extends BaseModel {
  public static table = 'vac_postoVacinacao'

  @column({ isPrimary: true, columnName: 'Id_postoVacinacao' })
  public id: number

  @column({ columnName: 'NomeResp' })
  public managerName: string

  @column({ columnName: 'BIResp' })
  public managerBI: string

  @column({ columnName: 'TelResp' })
  public managerTel: string

  @column({ columnName: 'EmailResp' })
  public managerEmail: string

  @column({ columnName: 'TipoPosto' })
  public postType: string

  @column({ columnName: 'Id_regInstituicaoPUS' })
  public institutionRegPusId: string

  @column({ columnName: 'NomePVAR' })
  public nomePVAR: string

  @column({ columnName: 'Id_provinciaPVAR' })
  public provinceId: number

  @column({ columnName: 'Id_MunicipioPVAR' })
  public municipalityId: number

  @column({ columnName: 'Id_ComunaPVAR' })
  public communePVARId: number

  @column({ columnName: 'NomeEA' })
  public nameEA: number

  @column({ columnName: 'Id_provinciaEA' })
  public provinceIdEA: number

  @column({ columnName: 'Id_MunicipioEA' })
  public municipalityIdEA: number

  @column({ columnName: 'Id_ComunaEA' })
  public communeIdEA: number

  @column({ columnName: 'DescricaoEA' })
  public descriptionEA: string

  @column({ columnName: 'Status' })
  public status: string

  @column({ columnName: 'DataCad' })
  public dateRegistration: string

  @column({ columnName: 'Latitude' })
  public latitude: string

  @column({ columnName: 'Latitude' })
  public longitude: string

  @column({ columnName: 'NomeEM' })
  public nameEM: string

  @column({ columnName: 'Id_provinciaEM' })
  public provinceEMId: number

  @column({ columnName: 'Id_MunicipioEM' })
  public municipalityEMId: number

  @column({ columnName: 'Id_ComunaEM' })
  public communeEMId: number
  @column({ columnName: 'DescricaoEM' })
  public descriptionEMId: number

  @belongsTo(() => Province)
  public province: BelongsTo<typeof Province>

  @belongsTo(() => Municipality)
  public municipality: BelongsTo<typeof Municipality>

  @manyToMany(() => Goal, {
    pivotTable: 'vac_objPostoVacOBJ',
    localKey: 'id',
    pivotForeignKey: 'Id_postoVacinacao',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'Id_objPostoVac',
  })
  public goals: ManyToMany<typeof Goal>
}
