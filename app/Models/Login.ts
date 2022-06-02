import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Login extends BaseModel {
  public static table = 'Login'

  @column({ isPrimary: true, columnName: 'Id_Login' })
  public id: number

  @column({ columnName: 'Utilizador' })
  public username: string

  @column({ columnName: 'NomeUtilizador' })
  public name: string

  @column({ columnName: 'Fone' })
  public phone: string

  @column({ columnName: 'Email' })
  public email: string

  @column({ columnName: 'Descricao' })
  public description: string

  @column({ columnName: 'Id_regInstituicao' })
  public institutionId: string
}
