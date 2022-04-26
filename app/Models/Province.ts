import { BaseModel, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import Municipality from './Municipality'

export default class Province extends BaseModel {
  public static table = 'Provincia'

  @column({ isPrimary: true, columnName: 'Id_Provincia' })
  public id: number
  @column({ columnName: 'Nome' })
  public name: string
  @column({ columnName: 'Sigla' })
  public sigla: string
  @column({ columnName: 'Populacao' })
  public population: number

  @hasMany(() => Municipality, {
    foreignKey: 'provinceId', // userId column on "Post" model
  })
  public municipalities: HasMany<typeof Municipality>
}
