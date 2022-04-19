import { schema, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class PersonValidator {
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
    name: schema.string({ escape: true, trim: true }, [
      rules.minLength(1),
      rules.maxLength(80),
      rules.regex(/^[a-záàâãéèêíïóôõöúçñ ]+$/i),
    ]),
    phone: schema.string({ trim: true }, [rules.minLength(9), rules.maxLength(9)]),
    email: schema.string.optional({ escape: true, trim: true }, [rules.email()]),
    genre: schema.enum(['Masculino', 'Femenino'] as const),

    birthday: schema.string(),

    doctypeId: schema.number(),
    docNumber: schema.string({ escape: true, trim: true }),
    nationalityId: schema.number(),
    provinceId: schema.number(),
    municipalityId: schema.number(),
    categoryId: schema.number(),
    //code: schema.string(),
    status: schema.string({ escape: true, trim: true }, [rules.minLength(1), rules.maxLength(1)]),
    flagRegSimp: schema.enum.optional(['S', 'N'] as const),
    sectorId: schema.number(),
    coMorbidity: schema.string.optional({ escape: true, trim: true }, [rules.maxLength(3)]),
    observation: schema.string.optional({ escape: true, trim: true }, [rules.maxLength(200)]),
    //webAlt: schema.enum(['S', 'N'] as const),
    fatherName: schema.string.optional({ escape: true, trim: true }, [rules.minLength(1)]),
    motherName: schema.string.optional({ escape: true, trim: true }, [rules.minLength(1)]),
    //certification: schema.enum.optional(['S', 'N'] as const),
    codeNumber: schema.string.optional(),
    institutionId: schema.number(),
    dataCad: schema.string({ escape: true, trim: true }),
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
