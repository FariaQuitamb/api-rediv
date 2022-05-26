import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import VaccinationPostMessage from 'App/Models/VaccinationPostMessage'
import VaccinationPostUserMessage from 'App/Models/VaccinationPostUserMessage'

import MessageValidator from 'App/Validators/messageValidator'
import HttpStatusCode from 'Contracts/enums/HttpStatusCode'
import formatError from 'Contracts/functions/format_error'
import formatHeaderInfo from 'Contracts/functions/format_header_info'
import formatUserInfo from 'Contracts/functions/format_user_info'
import logError from 'Contracts/functions/log_error'
import Env from '@ioc:Adonis/Core/Env'

export default class VaccinationMessagesController {
  public async getMessage({ auth, response, request }: HttpContextContract) {
    const userMessage = await request.validate(MessageValidator)

    try {
      const vaccinationPostMessages = await VaccinationPostMessage.query()
        .preload('messages', (query) =>
          query
            .preload('archives')
            .preload('views', (query) => query.where('Id_userPostoVacinacao', userMessage.userId))
            .orderBy('DataCad', 'desc')
        )
        .where('Id_postoVacinacao', userMessage.vaccinationPostId)
        .orWhere('Id_tipoFuncPostoVac', userMessage.userPostRoleId)
        .orderBy('DataCad', 'desc')
        .paginate(userMessage.page, userMessage.limit)

      const userMessages = await VaccinationPostUserMessage.query()
        .preload('messages', (query) =>
          query
            .preload('archives')
            .preload('views', (query) => query.where('Id_userPostoVacinacao', userMessage.userId))
            .orderBy('DataCad', 'desc')
        )
        .where('Id_userPostoVacinacao', userMessage.userId)
        .orderBy('DataCad', 'desc')
        .paginate(userMessage.page, userMessage.limit)

      return response.status(HttpStatusCode.OK).send({
        message: 'Notificações do utilizador',
        code: HttpStatusCode.OK,
        data: { vaccinationPostMessages, userMessages },
      })
    } catch (error) {
      console.log(error)
      //Log de erro
      const searchInfo = JSON.stringify(userMessage)
      const deviceInfo = JSON.stringify(formatHeaderInfo(request))
      const userInfo = formatUserInfo(auth.user)
      const errorInfo = formatError(error)

      const version = Env.get('API_VERSION')
      await logError({
        type: 'MB',
        page: `V:${version} VaccinationMessagesController/getMessage`,
        error: `User: ${userInfo} Device: ${deviceInfo} Dados: ${searchInfo} ${errorInfo}`,
      })
      return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
        message: 'Ocorreu um erro no servidor!',
        code: HttpStatusCode.INTERNAL_SERVER_ERROR,
        data: [],
      })
    }
  }
}
