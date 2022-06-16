import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import MobileVersionValidator from 'App/Validators/MobileVersionValidator copy'
import HttpStatusCode from 'Contracts/enums/HttpStatusCode'
import formatedLog, { LogType } from 'Contracts/functions/formated_log'
import formatError from 'Contracts/functions/format_error'
import formatHeaderInfo from 'Contracts/functions/format_header_info'
import formatUserInfo from 'Contracts/functions/format_user_info'
import logError from 'Contracts/functions/log_error'
import fs from 'fs/promises'
import path from 'path'

export default class ConfigsController {
  public async changeAppVersion({ auth, request, response }: HttpContextContract) {
    const versionData = await request.validate(MobileVersionValidator)
    try {
      const fileName = path.resolve(__dirname, '../../../', 'json', 'mobile_version.json')

      const content = {
        mobile_app_version: versionData.mobileVersion,
        changes: versionData.changes,
      }

      content.changes.push('')

      const str = JSON.stringify(content)

      await fs.writeFile(fileName, str)

      const newData = await fs.readFile(fileName, 'utf8')
      const version = JSON.parse(newData)

      formatedLog('Versão actual da aplicação mobile modificada!', LogType.success)

      return response.status(HttpStatusCode.CREATED).send({
        message: 'Versão actual da aplicação mobile modificada!',
        code: HttpStatusCode.CREATED,
        data: { version: version?.mobile_app_version, changes: version?.changes },
      })
    } catch (error) {
      const deviceInfo = JSON.stringify(formatHeaderInfo(request))
      const userInfo = formatUserInfo(auth.user)
      const errorInfo = formatError(error)

      await logError({
        type: 'MB',
        page: 'ConfigsController/changeAppVersion',
        error: `User:${userInfo} Device: ${deviceInfo} - ${errorInfo}`,
      })

      return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
        message: 'Não foi possível modificar a versão actual da aplicação mobile!',
        code: HttpStatusCode.INTERNAL_SERVER_ERROR,
        data: [],
      })
    }
  }

  public async getMobileVersion({ auth, request, response }: HttpContextContract) {
    try {
      const fileName = path.resolve(__dirname, '../../../', 'json', 'mobile_version.json')

      const newData = await fs.readFile(fileName, 'utf8')
      const version = JSON.parse(newData)

      formatedLog(
        'Versão actual da aplicação mobile : ' + version?.mobile_app_version,
        LogType.success
      )

      return response.status(HttpStatusCode.OK).send({
        message: 'Versão actual da aplicação mobile : ' + version?.mobile_app_version,
        code: HttpStatusCode.OK,
        data: { version: version?.mobile_app_version, changes: version?.changes },
      })
    } catch (error) {
      const deviceInfo = JSON.stringify(formatHeaderInfo(request))
      const userInfo = formatUserInfo(auth.user)
      const errorInfo = formatError(error)

      await logError({
        type: 'MB',
        page: 'ConfigsController/getMobileVersion',
        error: `User:${userInfo} Device: ${deviceInfo} - ${errorInfo}`,
      })

      return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
        message: 'Não foi possível obter a versão actual da aplicação mobile!',
        code: HttpStatusCode.INTERNAL_SERVER_ERROR,
        data: [],
      })
    }
  }

  public async store({}: HttpContextContract) {}

  public async show({}: HttpContextContract) {}

  public async edit({}: HttpContextContract) {}

  public async update({}: HttpContextContract) {}

  public async destroy({}: HttpContextContract) {}
}
