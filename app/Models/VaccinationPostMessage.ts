import { BaseModel, column, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import VaccinationMessage from './VaccinationMessage'

export default class VaccinationPostMessage extends BaseModel {
  public static table = 'vac_msgPostoVac'

  @column({ isPrimary: true, columnName: 'Id_msgPostoVac' })
  public id: number

  @column({ columnName: 'Id_postoVacinacao' })
  public vaccinationPostId: number

  @column({ columnName: 'Id_msgVacinacao' })
  public vaccinationMessageId: number
  @column({ columnName: 'Id_tipoFuncPostoVac' })
  public vaccinationPostRoleId: number
  @column({ columnName: 'IdLogin' })
  public loginId: number
  @column({ columnName: 'DataCad' })
  public createdAt: number
  @column({ columnName: 'Flag' })
  public flag: number

  @hasMany(() => VaccinationMessage, { foreignKey: 'id', localKey: 'vaccinationMessageId' })
  public messages: HasMany<typeof VaccinationMessage>
}
