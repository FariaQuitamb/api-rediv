import { BaseModel, column, HasMany, hasMany, HasOne, hasOne } from '@ioc:Adonis/Lucid/Orm'
import VaccinationMessage from './VaccinationMessage'

export default class VaccinationPostUserMessage extends BaseModel {
  public static table = 'vac_msgUserPostoVac'

  @column({ isPrimary: true, columnName: 'Id_msgUserPostoVac' })
  public id: number
  @column({ columnName: 'Id_userPostoVacinacao' })
  public vaccinationPostUserId: number
  @column({ columnName: 'Id_msgVacinacao' })
  public vaccinationMessageId: number
  @column({ columnName: 'IdLogin' })
  public loginId: number
  @column({ columnName: 'DataCad' })
  public createdAt: string
  @column({ columnName: 'Flag' })
  public flag: string

  @hasOne(() => VaccinationMessage, { foreignKey: 'id', localKey: 'vaccinationMessageId' })
  public message: HasOne<typeof VaccinationMessage>
}
