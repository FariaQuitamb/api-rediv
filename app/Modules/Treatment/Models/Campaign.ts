import { BaseModel, column, ManyToMany, manyToMany } from '@ioc:Adonis/Lucid/Orm'
import Treatment from './Treatment'

export default class Campaign extends BaseModel {
  public static table = 'vac_CampTratVac]'

  @column({ isPrimary: true, columnName: 'Id_CampTratVac' })
  public id: number

  @column({ columnName: 'IdLogin' })
  public loginId: number

  @column({ columnName: 'Campanha' })
  public name: string

  @column({ columnName: 'Descricao' })
  public description: string

  @column({ columnName: 'numDose' })
  public target: number

  @column({ columnName: 'DtIni' })
  public startDate: string

  @column({ columnName: 'DtFim' })
  public endDate: string

  @column({ columnName: 'DataCad' })
  public createdAt: string

  @column({ columnName: 'Status' })
  public status: string

  @manyToMany(() => Treatment, {
    localKey: 'id',
    pivotForeignKey: 'Id_CampTratVac',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'Id_Tratamento',
    pivotTable: 'vac_CampTratVacTRT',
  })
  public treatments: ManyToMany<typeof Treatment>
}
