import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import Database from '@ioc:Adonis/Lucid/Database'
import GetUserRank from 'App/Validators/getUserRank'
import constants from 'Contracts/constants/constants'
import HttpStatusCode from 'Contracts/enums/HttpStatusCode'
import formatedLog, { LogType } from 'Contracts/functions/formated_log'
import formatError from 'Contracts/functions/format_error'
import formatHeaderInfo from 'Contracts/functions/format_header_info'
import formatUserInfo from 'Contracts/functions/format_user_info'
import getUserRank from 'Contracts/functions/get_user_rank'
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

  public async rankUser({ auth, response, request }: HttpContextContract) {
    const searchData = await request.validate(GetUserRank)
    try {
      const topUsers = await Database.rawQuery(constants.rankingQueryNational, [searchData.top])

      const provinceTopUsers = await Database.rawQuery(constants.rankingQueryProvince, [
        searchData.top,
        searchData.provinceId,
      ])

      const municipalityTopUsers = await Database.rawQuery(constants.rankingQueryMunicipality, [
        searchData.top,
        searchData.municipalityId,
      ])

      const rankNational = getUserRank(topUsers, searchData.userId)
      const rankProvince = getUserRank(provinceTopUsers, searchData.userId)
      const rankMunicipality = getUserRank(municipalityTopUsers, searchData.userId)

      return response.status(HttpStatusCode.ACCEPTED).send({
        message: `Ranking do utilizador`,
        code: HttpStatusCode.ACCEPTED,
        data: { rankNational, rankProvince, rankMunicipality },
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
        context: { controller: 'VaccinationRanksController', method: 'rankUser' },
      })

      const errorInfo = formatError(error)

      const deviceInfo = JSON.stringify(formatHeaderInfo(request))
      const userInfo = formatUserInfo(auth.user)

      await logError({
        type: 'MB',
        page: 'VaccinationRanksController/rankUser',
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

  public async rankUserTreatment({ auth, response, request }: HttpContextContract) {
    const searchData = await request.validate(GetUserRank)
    try {
      const topUsers = await Database.rawQuery(constants.treatmentNationalRank, [searchData.top])

      const provinceTopUsers = await Database.rawQuery(constants.treatmentProvinceRank, [
        searchData.top,
        searchData.provinceId,
      ])

      const municipalityTopUsers = await Database.rawQuery(constants.treatmentMunicipalityRank, [
        searchData.top,
        searchData.municipalityId,
      ])

      const rankNational = getUserRank(topUsers, searchData.userId)
      const rankProvince = getUserRank(provinceTopUsers, searchData.userId)
      const rankMunicipality = getUserRank(municipalityTopUsers, searchData.userId)

      return response.status(HttpStatusCode.ACCEPTED).send({
        message: `Ranking dos tratamentos registados pelo  utilizador`,
        code: HttpStatusCode.ACCEPTED,
        data: { rankNational, rankProvince, rankMunicipality },
      })
    } catch (error) {
      formatedLog({
        text: error,
        data: {},
        auth: auth,
        request: request,
        type: LogType.error,
        tag: { key: 'timeout', value: 'Timeout' },
        context: { controller: 'VaccinationRanksController', method: 'rankUserTreatment' },
      })

      const errorInfo = formatError(error)

      const deviceInfo = JSON.stringify(formatHeaderInfo(request))
      const userInfo = formatUserInfo(auth.user)

      await logError({
        type: 'MB',
        page: 'VaccinationRanksController/rankUserTreatment',
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

  public async treatmentLocationsRank({ auth, response, request }: HttpContextContract) {
    try {
      const provinces = await Database.rawQuery(constants.provinceRank)
      const municipalities = await Database.rawQuery(constants.municipalityRank)

      return response.status(HttpStatusCode.ACCEPTED).send({
        message: 'Ranking de vacinação por provincia e por município',
        code: HttpStatusCode.ACCEPTED,
        data: { provinces, municipalities },
      })
    } catch (error) {
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
