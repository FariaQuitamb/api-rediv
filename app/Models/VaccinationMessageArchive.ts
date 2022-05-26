import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class VaccinationMessageArchive extends BaseModel {
  public static table = 'vac_arqMsgVacinacao'
  @column({ isPrimary: true, columnName: 'Id_arqMsgVacinacao' })
  public id: number
  @column({ columnName: 'Id_msgVacinacao' })
  public vaccinationMessageId: number
  @column({ columnName: 'Ref' })
  public ref: string
  @column({ columnName: 'IdLogin' })
  public loginId: number
  @column({ columnName: 'NomeArq' })
  public archive: number
}
