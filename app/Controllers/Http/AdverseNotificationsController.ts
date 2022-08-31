import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import AdverseNotification from 'App/Models/AdverseNotification'
import AdverseNotificationValidator from 'App/Validators/AdverseNotificationValidator'
import PersonAdversesValidator from 'App/Validators/PersonAdversesValidator'
import constantQueries from 'Contracts/constants/constant_queries'
import HttpStatusCode from 'Contracts/enums/HttpStatusCode'
import formatedLog, { LogType } from 'Contracts/functions/formated_log'
import formatError from 'Contracts/functions/format_error'
import formatHeaderInfo from 'Contracts/functions/format_header_info'
import formatUserInfo from 'Contracts/functions/format_user_info'
import isAfterToday from 'Contracts/functions/isafter_today'
import logError from 'Contracts/functions/log_error'
import resolvePersonNotifications from 'Contracts/functions/resolve_person_notifications'
import moment from 'moment'

export default class AdverseNotificationsController {
  public async store({ auth, response, request }: HttpContextContract) {
    const notificationData = await request.validate(AdverseNotificationValidator)
    try {
      //Verifica se é necessário validar a data do futuro
      let checkFuture = true

      const previewsDate = notificationData.createdAt

      //Mudança : formatação da data
      //const dateBefore = personData.dataCad

      notificationData.createdAt = moment(
        notificationData.createdAt,
        moment.ISO_8601,
        true
      ).toISOString()

      if (notificationData.createdAt === null) {
        checkFuture = false

        const today = moment()
        notificationData.createdAt = moment(today, moment.ISO_8601, true).toISOString()

        formatedLog({
          text: `A data do registo de notificação de caso adverso  foi modificada para data de hoje por ser inválida ,  data Inserida: ${previewsDate}  Data Final :  ${notificationData.createdAt} User: Id:${auth.user?.id} Name: ${auth.user?.name} Phone: ${auth.user?.phone} BI:${auth.user?.bi}`,
          data: notificationData,
          auth: auth,
          request: request,
          type: LogType.warning,
          tag: { key: 'warning', value: 'Alertas' },
          context: { controller: 'AdverseNotificationsController', method: 'store' },
        })
      }

      if (checkFuture) {
        if (isAfterToday(notificationData.createdAt)) {
          notificationData.createdAt = moment().toISOString()
          formatedLog({
            text: ` A data do registo de notificação de caso adverso foi modificada para data de hoje por ser maior que a data actual data inserida: ${previewsDate}  Data Final :  ${notificationData.createdAt} User: Id:${auth.user?.id} Name: ${auth.user?.name} Phone: ${auth.user?.phone} BI:${auth.user?.bi}`,
            data: notificationData,
            auth: auth,
            request: request,
            type: LogType.warning,
            tag: { key: 'warning', value: 'Alertas' },
            context: { controller: 'AdverseNotificationsController', method: 'store' },
          })
        }
      }

      const notification = await AdverseNotification.create(notificationData)

      if (!notification) {
        formatedLog({
          text: 'Não foi possível inserir a notificação de caso adverso',
          type: LogType.error,
          data: notificationData,
          auth: auth,
          request: request,
          tag: { key: 'timeout', value: 'Timeout' },
          context: { controller: 'PeopleController', method: 'store' },
        })

        return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
          message: 'Não foi possível inserir a notificação de caso adverso',
          code: HttpStatusCode.INTERNAL_SERVER_ERROR,
          data: {},
        })
      }

      formatedLog({
        text: 'Registo de notificação de caso adverso feito com sucesso',
        type: LogType.success,
        data: notificationData,
        auth: auth,
        request: request,
      })
      console.log(notification)
      return response.status(HttpStatusCode.CREATED).send({
        message: 'Registo de  notificação de caso adverso feito com sucesso',
        code: HttpStatusCode.CREATED,
        data: notification,
      })
    } catch (error) {
      //console.log(error)

      const notificationJson = JSON.stringify(notificationData)

      //Log de erro

      const deviceInfo = JSON.stringify(formatHeaderInfo(request))
      const userInfo = formatUserInfo(auth.user)
      const errorInfo = formatError(error)

      await logError({
        type: 'MB',
        page: 'PeopleController/store',
        error: `User:${userInfo} Device: ${deviceInfo} Dados : ${notificationJson} - ${errorInfo}`,
        request: request,
      })

      const substring = 'Timeout: Request failed to complete in'

      if (errorInfo.includes(substring)) {
        formatedLog({
          text: 'Não foi possível completar a operação dentro do tempo esperado',
          type: LogType.error,
          data: notificationData,
          auth: auth,
          request: request,
          tag: { key: 'timeout', value: 'Timeout' },
          context: { controller: 'PeopleController', method: 'store' },
        })

        return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
          message: 'Não foi possível completar a operação dentro do tempo esperado',
          code: HttpStatusCode.INTERNAL_SERVER_ERROR,
          data: [],
        })
      }

      return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
        message: 'Ocorreu um erro no servidor',
        code: HttpStatusCode.INTERNAL_SERVER_ERROR,
        data: [],
      })
    }
  }

  public async personAdverseCases({ auth, response, request }: HttpContextContract) {
    const searchData = await request.validate(PersonAdversesValidator)

    try {
      //Pesquisa pelo CodigoNum

      const treatmentNotifications = await Database.rawQuery(
        constantQueries.treatmentNotifications,
        [searchData.personId]
      )

      const vaccinationNotifications = await Database.rawQuery(
        constantQueries.vaccinationNotifications,
        [searchData.personId]
      )

      const notifications = resolvePersonNotifications(
        vaccinationNotifications,
        treatmentNotifications
      )

      formatedLog({
        text: 'Pesquisa  de notificações de casos adversos do utente feita com sucesso',
        data: searchData,
        auth: auth,
        request: request,
        type: LogType.success,
      })
      return response.status(HttpStatusCode.ACCEPTED).send({
        message: 'Lista de notificações de casos adversos do utente',
        code: HttpStatusCode.ACCEPTED,
        data: { reports: notifications.vaccines },
      })
    } catch (error) {
      //console.log(error)
      //Log de erro
      const searchInfo = JSON.stringify(searchData)
      const deviceInfo = JSON.stringify(formatHeaderInfo(request))
      const userInfo = formatUserInfo(auth.user)
      const errorInfo = formatError(error)
      await logError({
        type: 'MB',
        page: 'v2:AdverseNotificationsController/personAdverseCases',
        error: `User: ${userInfo} Device: ${deviceInfo} Dados: ${searchInfo} ${errorInfo}`,
        request: request,
      })

      const substring = 'Timeout: Request failed to complete in'

      if (errorInfo.includes(substring)) {
        formatedLog({
          text: 'Não foi possível completar a operação dentro do tempo esperado',
          type: LogType.warning,
          data: searchData,
          auth: auth,
          request: request,
          tag: { key: 'timeout', value: 'Erros' },
          context: { controller: 'AdverseNotificationsController', method: 'personAdverseCases' },
        })

        return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
          message: 'Não foi possível completar a operação dentro do tempo esperado',
          code: HttpStatusCode.INTERNAL_SERVER_ERROR,
          data: [],
        })
      }

      return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
        message: 'Ocorreu um erro no servidor',
        code: HttpStatusCode.INTERNAL_SERVER_ERROR,
        data: [],
      })
    }
  }
}
