import { BaseModel, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import Lot from './Lot'
import Dose from './Dose'

export default class Vaccine extends BaseModel {
  public static table = 'vac_Vacina'

  @column({ isPrimary: true, columnName: 'Id_Vacina' })
  public id: number

  @column({ columnName: 'Nome' })
  public name: string

  @column({ columnName: 'Fabricante' })
  public manufacturer: string

  @hasMany(() => Lot, {
    foreignKey: 'vaccineId', // userId column on "Post" model
  })
  public lots: HasMany<typeof Lot>
  @hasMany(() => Dose, {
    foreignKey: 'vaccineId', // userId column on "Post" model
  })
  public doses: HasMany<typeof Dose>
}
