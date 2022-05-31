import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class ViewedMessage extends BaseModel {
  public static table = 'vac_msgVacinacaoVisto'

  /*
    vaccinationMessageId
    vaccinationPostId
    vaccinationPostUserId
    accinationPostUserRoleId

  */

  @column({ isPrimary: true, columnName: 'Id_msgVacinacaoVisto' })
  public id: number

  @column({ columnName: 'Id_msgVacinacao' })
  public vaccinationMessageId: number

  @column({ columnName: 'Id_postoVacinacao' })
  public vaccinationPostId: number

  @column({ columnName: 'Id_userPostoVacinacao' })
  public userId: number

  @column({ columnName: 'Id_tipoFuncPostoVac' })
  public userPostRoleId: number

  @column({ columnName: 'Flag' })
  public flag: String

  @column({ columnName: 'DataCad' })
  public viewedAt: String
}
