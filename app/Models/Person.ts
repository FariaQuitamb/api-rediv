import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Person extends BaseModel {
  public static table = 'vac_regIndividual'

  @column({ isPrimary: true, columnName: 'Id_regIndividual' })
  public id: number

  @column({ columnName: 'Id_regInstituicao' })
  public institutionId: number

  @column({ columnName: 'Nome' })
  public name: string

  @column({ columnName: 'Telefone' })
  public phone: string

  @column({ columnName: 'Email' })
  public email: string

  @column({ columnName: 'Genero' })
  public genre: string

  @column({ columnName: 'dtNascimento' })
  public birthday: string

  @column({ columnName: 'Id_tipoDocumento' })
  public doctypeId: number
  @column({ columnName: 'docNum' })
  public docNumber: string

  @column({ columnName: 'Id_Nacionalidade' })
  public nationalityId: number

  @column({ columnName: 'Id_provincia' })
  public provinceId: number
  @column({ columnName: 'Id_Municipio' })
  public municipalityId: number
  @column({ columnName: 'Id_Categoria' })
  public categoryId: number

  @column({ columnName: 'Codigo' })
  public code: string

  @column({ columnName: 'Status' })
  public status: string

  @column({ columnName: 'DataCad' })
  public dataCad: string

  @column({ columnName: 'FlagRegSimp' })
  public flagRegSimp: string

  /*Não foi inserida no corpo da requisição para inserção*/
  @column({ columnName: 'Id_regDoencas' })
  public regDiseaseId: string

  @column({ columnName: 'Id_Setor' })
  public sectorId: number

  @column({ columnName: 'Comorbilidade' })
  public coMorbidity: string

  @column({ columnName: 'Observacao' })
  public observation: string

  @column({ columnName: 'WebAlt' })
  public webAlt: string

  @column({ columnName: 'NomePai' })
  public fatherName: string

  @column({ columnName: 'NomeMae' })
  public motherName: string
  @column({ columnName: 'Certificacao' })
  public certification: string
  @column({ columnName: 'CodigoNum' })
  public codeNumber: string
}
