import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ApiAccess from 'App/Models/ApiAccess'
import ApiAccessValidator from 'App/Validators/ApiAccessValidator'
import HttpStatusCode from 'Contracts/enums/HttpStatusCode'
import formatError from 'Contracts/functions/format_error'
import formatUserInfo from 'Contracts/functions/format_user_info'
import logError from 'Contracts/functions/log_error'

export default class ApiAcessesController {
  public async index({}: HttpContextContract) {
    const access = await ApiAccess.all()

    return access
  }

  public async store({ auth, request, response }: HttpContextContract) {
    const accessData = await request.validate(ApiAccessValidator)
    try {
      const findAccess = await ApiAccess.findBy('name', accessData.name)

      if (findAccess) {
        return response.status(HttpStatusCode.FOUND).send({
          message: 'Essa Instituição já possuí acesso !',
          code: HttpStatusCode.FOUND,
          data: findAccess,
        })
      }

      const access = await ApiAccess.create(accessData)

      //Generate JWT token here
      const token = 1

      return response.status(HttpStatusCode.CREATED).send({
        message: 'Acesso criado com sucesso!',
        code: HttpStatusCode.CREATED,
        data: access,
      })
    } catch (error) {
      console.log(error)

      const userInfo = formatUserInfo(auth.user)
      const errorInfo = formatError(error)

      await logError({
        type: 'MB',
        page: 'ApiAcessesController/store',
        error: `User:${userInfo} - ${errorInfo}`,
      })
      return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
        message: 'Ocorreu um erro no servidor!',
        code: HttpStatusCode.INTERNAL_SERVER_ERROR,
        data: [],
      })
    }
  }

  public async show({}: HttpContextContract) {}

  public async edit({}: HttpContextContract) {}

  public async update({}: HttpContextContract) {}

  public async destroy({}: HttpContextContract) {}
}
