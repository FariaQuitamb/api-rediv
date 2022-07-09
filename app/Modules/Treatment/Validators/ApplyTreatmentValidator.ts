import { schema } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ApplyTreatmentValidator {
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
   *
   *
   *    ```
   * 
   * "personId":1951516,
"campaignId":2,
"vaccinationPostUserId":345,
"latitude":"25367383883",
"longitude":"67383893903",
   */
  public schema = schema.create({
    campaignId: schema.number(),
    personId: schema.number(),
    vaccinationPostUserId: schema.number(),
    latitude: schema.string({ escape: true, trim: true }),
    longitude: schema.string({ escape: true, trim: true }),
    birthday: schema.string({ escape: true, trim: true }),

    treatments: schema.array().members(
      schema.object().members({
        campaignId: schema.number.optional(),
        personId: schema.number.optional(),
        vaccinationPostUserId: schema.number.optional(),
        latitude: schema.string.optional({ escape: true, trim: true }),
        longitude: schema.string.optional({ escape: true, trim: true }),

        illnessId: schema.number(),
        treatmentId: schema.number(),
        treatmentDoseId: schema.number.optional(),
        createdAt: schema.string({ escape: true, trim: true }),
      })
    ),
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
