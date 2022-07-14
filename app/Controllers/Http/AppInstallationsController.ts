import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import AppInstallation from 'App/Models/AppInstallation'
import AppInstallationValidator from 'App/Validators/AppInstallationValidator'
import InstallationListValidator from 'App/Validators/InstallationListValidator'
import HttpStatusCode from 'Contracts/enums/HttpStatusCode'
import formatedLog, { LogType } from 'Contracts/functions/formated_log'
import formatError from 'Contracts/functions/format_error'
import formatHeaderInfo from 'Contracts/functions/format_header_info'
import formatUserInfo from 'Contracts/functions/format_user_info'
import logError from 'Contracts/functions/log_error'

export default class AppInstallationsController {
  public async store({ auth, request, response }: HttpContextContract) {
    const installationData = await request.validate(AppInstallationValidator)
    try {
      const appInstallation = await AppInstallation.create(installationData)

      formatedLog({
        text: 'Registo de instalação feito com sucesso',
        data: { appInstallation },
        auth: auth,
        request: request,
        type: LogType.success,
      })

      return response.status(HttpStatusCode.CREATED).send({
        message: 'Registo de instalação feito com sucesso',
        code: HttpStatusCode.OK,
        data: { appInstallation },
      })
    } catch (error) {
      //Log de erro

      const deviceInfo = JSON.stringify(formatHeaderInfo(request))
      const userInfo = formatUserInfo(auth.user)
      const errorInfo = formatError(error)

      await logError({
        type: 'MB',
        page: 'AppInstallationsController/store',
        error: `User:${userInfo} Device: ${deviceInfo} - ${errorInfo}`,
        request: request,
      })

      const substring = 'Timeout: Request failed to complete in'

      if (errorInfo.includes(substring)) {
        formatedLog({
          text: 'Não foi possível completar a operação dentro do tempo esperado',
          data: {},
          auth: auth,
          request: request,
          type: LogType.warning,
        })
        return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
          message: 'Não foi possível completar a operação dentro do tempo esperado',
          code: HttpStatusCode.INTERNAL_SERVER_ERROR,
          data: [],
        })
      }

      formatedLog({
        text: 'Ocorreu um erro no servidor',
        data: {},
        auth: auth,
        request: request,
        type: LogType.error,
      })

      return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
        message: 'Ocorreu um erro no servidor',
        code: HttpStatusCode.INTERNAL_SERVER_ERROR,
        data: [],
      })
    }
  }

  public async index({ auth, request, response }: HttpContextContract) {
    const installationList = await request.validate(InstallationListValidator)
    try {
      const appInstallation = await AppInstallation.query().paginate(
        installationList.page,
        installationList.limit
      )

      formatedLog({
        text: 'Registo de instalação feito com sucesso',
        data: { appInstallation },
        auth: auth,
        request: request,
        type: LogType.success,
      })

      return response.status(HttpStatusCode.OK).send({
        message: 'Lista de instalação do aplicativo',
        code: HttpStatusCode.OK,
        data: { appInstallation },
      })
    } catch (error) {
      //Log de erro

      const deviceInfo = JSON.stringify(formatHeaderInfo(request))
      const userInfo = formatUserInfo(auth.user)
      const errorInfo = formatError(error)

      await logError({
        type: 'MB',
        page: 'AppInstallationsController/index',
        error: `User:${userInfo} Device: ${deviceInfo} - ${errorInfo}`,
        request: request,
      })

      const substring = 'Timeout: Request failed to complete in'

      if (errorInfo.includes(substring)) {
        formatedLog({
          text: 'Não foi possível completar a operação dentro do tempo esperado',
          data: {},
          auth: auth,
          request: request,
          type: LogType.warning,
        })
        return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
          message: 'Não foi possível completar a operação dentro do tempo esperado',
          code: HttpStatusCode.INTERNAL_SERVER_ERROR,
          data: [],
        })
      }

      formatedLog({
        text: 'Ocorreu um erro no servidor',
        data: {},
        auth: auth,
        request: request,
        type: LogType.error,
      })

      return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
        message: 'Ocorreu um erro no servidor',
        code: HttpStatusCode.INTERNAL_SERVER_ERROR,
        data: [],
      })
    }
  }
}
