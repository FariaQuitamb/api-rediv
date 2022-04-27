import { schema, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UserValidator {
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
    email: schema.string({ trim: true }, [rules.email(), rules.minLength(5), rules.maxLength(150)]),
    username: schema.string({ escape: true, trim: true }, [
      rules.minLength(3),
      rules.maxLength(100),
    ]),
    firstName: schema.string({ escape: true, trim: true }, [
      rules.minLength(1),
      rules.maxLength(100),
    ]),
    lastName: schema.string({ escape: true, trim: true }, [
      rules.minLength(1),
      rules.maxLength(100),
    ]),
    phone: schema.string({ trim: true }, [rules.minLength(9), rules.maxLength(20)]),
    altPhone: schema.string({ trim: true }, [rules.minLength(9), rules.maxLength(20)]),
    institutionId: schema.number([rules.exists({ table: 'institutions', column: 'id' })]),
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
