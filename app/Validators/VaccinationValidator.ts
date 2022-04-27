import { schema, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class VaccinationValidator {
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
    personId: schema.number(),

    institutionId: schema.number(),
    vaccineId: schema.number(),
    doseId: schema.number(),
    numLot: schema.string({ escape: true, trim: true }),
    userId: schema.number(),
    status: schema.string({ escape: true, trim: true }, [rules.minLength(1), rules.maxLength(1)]),
    createdAt: schema.string({ escape: true, trim: true }),
    vaccinationPostId: schema.number(),
    provinceId: schema.number(),
    lotId: schema.number(),
    vaccinationCountryId: schema.number(),
    regMB: schema.string({ escape: true, trim: true }, [rules.minLength(1), rules.maxLength(1)]),
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
