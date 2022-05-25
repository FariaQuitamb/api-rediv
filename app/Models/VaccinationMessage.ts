import { BaseModel, column, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import VaccinationMessageArchive from './VaccinationMessageArchive'

export default class VaccinationMessage extends BaseModel {
  public static table = 'vac_msgVacinacao'

  @column({ isPrimary: true, columnName: 'Id_msgVacinacao' })
  public id: number
  @column({ columnName: 'IdLogin' })
  public loginId: number
  @column({ columnName: 'TipoMsg' })
  public type: string
  @column({ columnName: 'Assunto' })
  public subject: string
  @column({ columnName: 'Texto' })
  public text: string
  @column({ columnName: 'DataCad' })
  public createdAt: string
  @column({ columnName: 'Flag' })
  public flag: string

  @hasMany(() => VaccinationMessageArchive, { localKey: 'id', foreignKey: 'vaccinationMessageId' })
  public archives: HasMany<typeof VaccinationMessageArchive>
}
