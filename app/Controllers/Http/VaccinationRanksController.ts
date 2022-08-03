import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import Database from '@ioc:Adonis/Lucid/Database'
import constants from 'Contracts/constants/constants'
import HttpStatusCode from 'Contracts/enums/HttpStatusCode'
import formatedLog, { LogType } from 'Contracts/functions/formated_log'
import formatError from 'Contracts/functions/format_error'
import formatHeaderInfo from 'Contracts/functions/format_header_info'
import formatUserInfo from 'Contracts/functions/format_user_info'
import logError from 'Contracts/functions/log_error'

export default class VaccinationRanksController {
  public async locationsRank({ auth, response, request }: HttpContextContract) {
    try {
      const provinces = await Database.rawQuery(constants.provinceRank)
      const municipalities = await Database.rawQuery(constants.municipalityRank)

      return response.status(HttpStatusCode.ACCEPTED).send({
        message: 'Ranking de vacinação por provincia e por município',
        code: HttpStatusCode.ACCEPTED,
        data: { provinces, municipalities },
      })
    } catch (error) {
      //console.log(error)
      //Log de erro

      formatedLog({
        text: error,
        data: {},
        auth: auth,
        request: request,
        type: LogType.error,
        tag: { key: 'timeout', value: 'Timeout' },
        context: { controller: 'VaccinationRanksController', method: 'locationsRank' },
      })

      const errorInfo = formatError(error)

      const deviceInfo = JSON.stringify(formatHeaderInfo(request))
      const userInfo = formatUserInfo(auth.user)

      await logError({
        type: 'MB',
        page: 'VaccinationRanksController/locationsRank',
        error: `User: ${userInfo} Device: ${deviceInfo}  ${errorInfo}`,
        request: request,
      })
      return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
        message: 'Ocorreu um erro no servidor',
        code: HttpStatusCode.INTERNAL_SERVER_ERROR,
        data: [],
      })
    }
  }
}
