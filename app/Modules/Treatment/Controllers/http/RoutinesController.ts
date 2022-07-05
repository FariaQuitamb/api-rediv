import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import HttpStatusCode from 'Contracts/enums/HttpStatusCode'
import formatedLog, { LogType } from 'Contracts/functions/formated_log'
import formatError from 'Contracts/functions/format_error'
import formatHeaderInfo from 'Contracts/functions/format_header_info'
import formatUserInfo from 'Contracts/functions/format_user_info'
import logError from 'Contracts/functions/log_error'
import Illness from '../../Models/Illness'

export default class RoutinesController {
  public async routinePreload({ auth, response, request }: HttpContextContract) {
    try {
      const illnesses = await Illness.query().preload('treatments', (query) => {
        query.preload('vaccine').preload('prevention')
      })

      return response.status(HttpStatusCode.OK).send({
        message: 'Lista de doenças e respectivo tratamento',
        code: HttpStatusCode.OK,
        data: illnesses,
      })
    } catch (error) {
      //Log de erro

      const deviceInfo = JSON.stringify(formatHeaderInfo(request))
      const userInfo = formatUserInfo(auth.user)
      const errorInfo = formatError(error)

      await logError({
        type: 'MB',
        page: 'RoutinesController/routinePreload',
        error: `User:${userInfo} Device: ${deviceInfo} - ${errorInfo}`,
        request: request,
      })

      const substring = 'Timeout: Request failed to complete in'

      if (errorInfo.includes(substring)) {
        formatedLog({
          text: 'Não foi possível obter a lista de doenças e tratamentos',
          type: LogType.warning,
          data: {},
          auth: auth,
          request: request,
        })

        return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
          message: 'Não foi possível completar a operação dentro do tempo esperado!',
          code: HttpStatusCode.INTERNAL_SERVER_ERROR,
          data: [],
        })
      }

      return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
        message: 'Ocorreu um erro no servidor!',
        code: HttpStatusCode.INTERNAL_SERVER_ERROR,
        data: [],
      })
    }
  }
}
