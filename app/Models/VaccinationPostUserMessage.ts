import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class VaccinationPostUserMessage extends BaseModel {
  public static table = 'vac_msgUserPostoVac'

  /*
  []
  
      ,[Id_userPostoVacinacao]
      ,[Id_msgVacinacao]
      ,[IdLogin]
      ,[DataCad]
      ,[Flag]

  */

  @column({ isPrimary: true, columnName: 'Id_msgUserPostoVac' })
  public id: number
  @column({ isPrimary: true, columnName: '' })
  public vaccinationPostUserId: number
}
