import { BaseModel, column, hasMany, HasMany, HasOne, hasOne } from '@ioc:Adonis/Lucid/Orm'
import Login from './Login'
import VaccinationMessageArchive from './VaccinationMessageArchive'
import ViewedMessage from './ViewedMessage'

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

  @hasOne(() => Login, { localKey: 'loginId', foreignKey: 'id' })
  public sender: HasOne<typeof Login>

  @hasMany(() => VaccinationMessageArchive, { localKey: 'id', foreignKey: 'vaccinationMessageId' })
  public archives: HasMany<typeof VaccinationMessageArchive>

  @hasOne(() => ViewedMessage, { localKey: 'id', foreignKey: 'vaccinationMessageId' })
  public view: HasOne<typeof ViewedMessage>
}
