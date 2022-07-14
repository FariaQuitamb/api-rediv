import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ApiAccess from 'App/Models/ApiAccess'
import accessInfo from 'Contracts/functions/access_info'

export default class AccessRequest {
  public async handle({ request, response }: HttpContextContract, next: () => Promise<void>) {
    // code for middleware goes here. ABOVE THE NEXT CALL

    const accessHeader = accessInfo(request.headers())

    if (accessHeader.id === 'undefined' || accessHeader.accessKey === 'undefined') {
      response.unauthorized({ code: 401, message: 'Envie os dados de acesso correctamente' })
      return
    }

    const access = await ApiAccess.query()
      .where('api_id', accessHeader.id)
      .where('access_key', accessHeader.accessKey)
      .where('state', 1)
      .first()

    if (!access) {
      response.unauthorized({ code: 401, message: 'Acesso negado' })
      return
    }

    await next()
  }
}
