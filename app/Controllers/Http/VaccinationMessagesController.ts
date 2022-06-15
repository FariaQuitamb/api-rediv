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
import ViewedMessageValidator from 'App/Validators/viewedValidator'
import ViewedMessage from 'App/Models/ViewedMessage'
import orderNotifications from 'Contracts/functions/order_notifications'

export default class VaccinationMessagesController {
  public async getMessage({ auth, response, request }: HttpContextContract) {
    const userMessage = await request.validate(MessageValidator)

    try {
      const vaccinationPostMessages = await VaccinationPostMessage.query()
        .preload('message', (query) =>
          query
            .preload('sender')
            .preload('archives')
            .preload('view', (query) => query.where('Id_userPostoVacinacao', userMessage.userId))
            .orderBy('DataCad', 'desc')
        )
        .whereRaw(
          'Id_postoVacinacao = ? and (Id_tipoFuncPostoVac = 0 OR Id_tipoFuncPostoVac = ? )',
          [userMessage.vaccinationPostId, userMessage.userPostRoleId]
        )
        .orderBy('DataCad', 'desc')

      const userMessages = await VaccinationPostUserMessage.query()
        .preload('message', (query) =>
          query
            .preload('sender')
            .preload('archives')
            .preload('view', (query) => query.where('Id_userPostoVacinacao', userMessage.userId))
            .orderBy('DataCad', 'desc')
        )
        .where('Id_userPostoVacinacao', userMessage.userId)
        .orderBy('DataCad', 'desc')

      const notificationList = [...vaccinationPostMessages.values(), ...userMessages.values()]

      // vaccinationPostMessages, userMessages,

      const total = notificationList.length

      const notifications = orderNotifications(notificationList)

      return response.status(HttpStatusCode.OK).send({
        message: 'Notificações do utilizador',
        code: HttpStatusCode.OK,
        data: { total, notifications },
      })
    } catch (error) {
      //console.log(error)
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

  public async viewMessage({ auth, response, request }: HttpContextContract) {
    const viewMessage = await request.validate(ViewedMessageValidator)

    try {
      const viewed = await ViewedMessage.create(viewMessage)

      return response.status(HttpStatusCode.CREATED).send({
        message: 'Mensagem visualizada',
        code: HttpStatusCode.CREATED,
        data: viewed,
      })
    } catch (error) {
      //console.log(error)
      //Log de erro
      const searchInfo = JSON.stringify(viewMessage)
      const deviceInfo = JSON.stringify(formatHeaderInfo(request))
      const userInfo = formatUserInfo(auth.user)
      const errorInfo = formatError(error)

      const version = Env.get('API_VERSION')
      await logError({
        type: 'MB',
        page: `V:${version} VaccinationMessagesController/viewMessage`,
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
