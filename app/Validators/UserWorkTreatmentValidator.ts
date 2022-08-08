import { schema } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UserWorkTreatmentValidator {
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
   * 
   * 
   * 
   * 
   * 
   * 
   * 
   * 
   * 
   * 
   * 
   * 

   */
  public schema = schema.create({
    userId: schema.string(),
    personalName: schema.string(),
    username: schema.string(),
    nationalID: schema.string(),
    phone: schema.string(),
    role: schema.string(),
    postManagerName: schema.string(),
    postManagerNationalId: schema.string(),
    postManagerPhone: schema.string(),
    postType: schema.string(),
    latitude: schema.string(),
    longitude: schema.string(),
    mobilityPostname: schema.string(),
    advancedPostname: schema.string(),
    PVARPostname: schema.string(),
    province: schema.string(),
    municipality: schema.string(),
    vaccinationDate: schema.string(),
    page: schema.number(),
    limit: schema.number(),
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