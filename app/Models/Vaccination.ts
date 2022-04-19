import { BaseModel, BelongsTo, belongsTo, column, HasOne, hasOne } from '@ioc:Adonis/Lucid/Orm'
import Person from './Person'
import User from './User'
import Vaccine from './Vaccine'

export default class Vaccination extends BaseModel {
  public static table = 'vac_regVacinacao'

  @column({ isPrimary: true, columnName: 'Id_regVacinacao' })
  public id: number

  @column({ columnName: 'Id_regInstituicao' })
  public institutionId: number

  @column({ columnName: 'Id_regIndividual' })
  public personId: number

  @column({ columnName: 'Id_Vacina' })
  public vaccineId: number

  @column({ columnName: 'Id_Dose' })
  public doseId: number

  @column({ columnName: 'numLote' })
  public numLot: string

  @column({ columnName: 'Id_userPostoVacinacao' })
  public userId: number

  @column({ columnName: 'Status' })
  public status: string

  @column({ columnName: 'DataCad' })
  public createdAt: string

  @column({ columnName: 'Id_postoVacinacao' })
  public vaccinationPostId: number

  @column({ columnName: 'Id_Provincia' })
  public provinceId: number

  @column({ columnName: 'Id_LoteVacina' })
  public lotId: number
  @column({ columnName: 'Id_PaisVac' })
  public vaccinationCountryId: number
  @column({ columnName: 'RegMB' })
  public regMB: string

  @belongsTo(() => Person)
  public person: BelongsTo<typeof Person>

  @belongsTo(() => Vaccine)
  public vaccine: BelongsTo<typeof Vaccine>

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>
}
