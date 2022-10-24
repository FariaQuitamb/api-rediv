import { schema, rules} from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class EquipmentValidator {
  constructor(protected ctx: HttpContextContract) {}

  /*
   * Define schema to validate the "shape", "type", "formatting" and "integrity" of data.
   *
   * For example:
   * 1. The username must be of data type string. But then also, it should
   *    not contain special characters or numbers.
   *    ```
   *     schema.string({}, [ rules.alpha() ])
   *    ```
   *
   * 2. The email must be of data type string, formatted as a valid
   *    email. But also, not used by any other user.
   *    ```
   *     schema.string({}, [
   *       rules.email(),
   *       rules.unique({ table: 'users', column: 'email' }),
   *     ])
   *    ```
   */
  public schema = schema.create({
    equipmentTypeId: schema.number(),
    equipmentManufacturerId: schema.number(),
    equipmentModelId: schema.number(),
    equipmentEnergyId: schema.number(),
    workingStatus: schema.string(),
    instalationAt: schema.string(),
    equipmentWhiesId: schema.number(),
    comment: schema.string(),
    status: schema.string({}, [rules.maxLength(1), rules.minLength(1)]),
    dataCad: schema.string(),
    lat: schema.string(),
    long: schema.string(),
    createdBy: schema.number()
  })
  /**
   * Custom messages for validation failures. You can make use of dot notation `(.)`
   * for targeting nested fields and array expressions `(*)` for targeting all
   * children of an array. For example:
   *
   * {
   *   'profile.username.required': 'Username is required',
   *   'scores.*.number': 'Define scores as valid numbers'
   * }
   *
   */
  public messages = {}
}
