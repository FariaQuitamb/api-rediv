import { column, BaseModel, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import VaccinationPost from './VaccinationPost'

export default class User extends BaseModel {
  public static table = 'vac_userPostoVacinacao'

  @column({ isPrimary: true, columnName: 'Id_userPostoVacinacao' })
  public id: number

  @column({ columnName: 'Utilizador' })
  public username: string

  @column({ columnName: 'Senha', serializeAs: null })
  public password: string

  @column({ columnName: 'Nome' })
  public name: string

  @column({ columnName: 'Id_postoVacinacao' })
  public vaccinationPostId: number

  @column({ columnName: 'BI' })
  public bi: string

  @column({ columnName: 'Telefone' })
  public phone: string

  @column({ columnName: 'Email' })
  public email: string

  @column({ columnName: 'Id_provincia' })
  public provinceId: number

  @column({ columnName: 'Id_Municipio' })
  public municipalityId: number

  @column({ columnName: 'Endereco' })
  public address: string

  @column({ columnName: 'IBAN' })
  public iban: string

  @column({ columnName: 'Id_tipoFuncPostoVac' })
  public postWorkerTypeId: string

  @column({ columnName: 'Status' })
  public status: string

  @column({ columnName: 'DataCad' })
  public createdAt: string

  @column({ columnName: 'Padrao' })
  public pattern: string
  @column({ columnName: 'Flag' })
  public flag: string

  @belongsTo(() => VaccinationPost)
  public vaccinationPost: BelongsTo<typeof VaccinationPost>

  @column()
  public rememberMeToken?: string
}
