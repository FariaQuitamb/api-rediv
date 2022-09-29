import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import IsPartnerValidator from 'App/Validators/IsPartnerValidator'
import trustNetworkQueries from 'Contracts/constants/trust_network_query'
import HttpStatusCode from 'Contracts/enums/HttpStatusCode'
import formatedLog, { LogType } from 'Contracts/functions/formated_log'
import formatError from 'Contracts/functions/format_error'
import formatHeaderInfo from 'Contracts/functions/format_header_info'
import formatUserInfo from 'Contracts/functions/format_user_info'
import logError from 'Contracts/functions/log_error'

export default class TrustNetworksController {
  public async today({ auth, response, request }: HttpContextContract) {
    try {
      const topTenPartners = await Database.rawQuery(trustNetworkQueries.queryTop10Today)

      const todayTotal = await Database.rawQuery(trustNetworkQueries.todayTotal)

      return response.status(HttpStatusCode.OK).send({
        message: 'Top 10 Instituições com mais registos hoje',
        code: HttpStatusCode.OK,
        data: { total: todayTotal[0].total, top_partners: topTenPartners },
      })
    } catch (error) {
      //Log de erro

      const deviceInfo = JSON.stringify(formatHeaderInfo(request))
      const userInfo = formatUserInfo(auth.user)
      const errorInfo = formatError(error)

      await logError({
        type: 'MB',
        page: 'TrustNetworksController/topTenToday',
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
          tag: { key: 'timeout', value: 'Timeout' },
          context: { controller: 'TrustNetworksController ', method: 'today' },
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

  public async weekly({ auth, response, request }: HttpContextContract) {
    try {
      const topTenPartners = await Database.rawQuery(trustNetworkQueries.weekQuery)

      const totalWeekly = await Database.rawQuery(trustNetworkQueries.weekQuery)

      return response.status(HttpStatusCode.OK).send({
        message: 'Top semanal das instituições com mais registos',
        code: HttpStatusCode.OK,
        data: { total: totalWeekly, top_partners: topTenPartners },
      })
    } catch (error) {
      //Log de erro
      console.log(error)

      const deviceInfo = JSON.stringify(formatHeaderInfo(request))
      const userInfo = formatUserInfo(auth.user)
      const errorInfo = formatError(error)

      await logError({
        type: 'MB',
        page: 'TrustNetworksController/weekly',
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
          tag: { key: 'timeout', value: 'Timeout' },
          context: { controller: 'TrustNetworksController ', method: 'weekly' },
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

  public async inGeneral({ auth, response, request }: HttpContextContract) {
    try {
      const topTenPartners = await Database.rawQuery(trustNetworkQueries.queryTop10General)

      const generalTotal = await Database.rawQuery(trustNetworkQueries.generalTotal)

      return response.status(HttpStatusCode.OK).send({
        message: 'Top 10 Instituições com mais registos em geral',
        code: HttpStatusCode.OK,
        data: { total: generalTotal[0].total, top_partners: topTenPartners },
      })
    } catch (error) {
      //Log de erro

      const deviceInfo = JSON.stringify(formatHeaderInfo(request))
      const userInfo = formatUserInfo(auth.user)
      const errorInfo = formatError(error)

      await logError({
        type: 'MB',
        page: 'TrustNetworksController/inGeneral',
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
          tag: { key: 'timeout', value: 'Timeout' },
          context: { controller: 'TrustNetworksController ', method: 'inGeneral' },
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

  public async withOneOrMoreRecord({ auth, response, request }: HttpContextContract) {
    try {
      const thisWeek = await Database.rawQuery(trustNetworkQueries.weekQuery)

      const thisMonth = await Database.rawQuery(trustNetworkQueries.weekQuery)

      const general = await Database.rawQuery(trustNetworkQueries.overtimeGeneral)

      return response.status(HttpStatusCode.OK).send({
        message: 'Top 10 Instituições com mais registos em geral',
        code: HttpStatusCode.OK,
        data: { general, thisWeek, thisMonth },
      })
    } catch (error) {
      //Log de erro

      const deviceInfo = JSON.stringify(formatHeaderInfo(request))
      const userInfo = formatUserInfo(auth.user)
      const errorInfo = formatError(error)

      await logError({
        type: 'MB',
        page: 'TrustNetworksController/withOneOrMoreRecord',
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
          tag: { key: 'timeout', value: 'Timeout' },
          context: { controller: 'TrustNetworksController ', method: 'withOneOrMoreRecord' },
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

  public async isTrustPartner({ auth, response, request }: HttpContextContract) {
    const partnerInfo = await request.validate(IsPartnerValidator)
    try {
      const partner = await Database.rawQuery(trustNetworkQueries.isTrustPartner, [
        partnerInfo.partnerCode,
      ])

      if (partner.length === 0) {
        return response.status(HttpStatusCode.OK).send({
          message: 'Ainda não é um parceiro da Rede de Confiança',
          code: HttpStatusCode.OK,
          data: [],
        })
      }

      const partnerData = partner[0]
      return response.status(HttpStatusCode.OK).send({
        message: 'A Instituição é parceira da Rede de Confiança',
        code: HttpStatusCode.OK,
        data: { partner: partnerData },
      })
    } catch (error) {
      //Log de erro

      const deviceInfo = JSON.stringify(formatHeaderInfo(request))
      const userInfo = formatUserInfo(auth.user)
      const errorInfo = formatError(error)

      await logError({
        type: 'MB',
        page: 'TrustNetworksController/isTrustPartner',
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
          tag: { key: 'timeout', value: 'Timeout' },
          context: { controller: 'TrustNetworksController ', method: 'withOneOrMoreRecord' },
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

  public async vaccinationPostLocations({ auth, response, request }: HttpContextContract) {
    try {
      const vaccinationPosts = await Database.rawQuery(trustNetworkQueries.vaccinationPostLocation)

      return response.status(HttpStatusCode.OK).send({
        message: 'Postos de vacinação e suas coordenadas',
        code: HttpStatusCode.OK,
        data: { vaccinationPosts },
      })
    } catch (error) {
      //Log de erro

      const deviceInfo = JSON.stringify(formatHeaderInfo(request))
      const userInfo = formatUserInfo(auth.user)
      const errorInfo = formatError(error)

      await logError({
        type: 'MB',
        page: 'TrustNetworksController/vaccinationPostLocations',
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
          tag: { key: 'timeout', value: 'Timeout' },
          context: { controller: 'TrustNetworksController', method: 'vaccinationPostLocations' },
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

  // Coordenadas dos locais com registos de vacinação
  public async vaccinationPlaces({ auth, response, request }: HttpContextContract) {
    try {
      const vaccinationPlaces = await Database.rawQuery(trustNetworkQueries.vaccinationPlaces)

      return response.status(HttpStatusCode.OK).send({
        message: 'Coordenadas dos locais com registos de vacinação',
        code: HttpStatusCode.OK,
        data: { vaccinationPlaces },
      })
    } catch (error) {
      //Log de erro

      const deviceInfo = JSON.stringify(formatHeaderInfo(request))
      const userInfo = formatUserInfo(auth.user)
      const errorInfo = formatError(error)

      await logError({
        type: 'MB',
        page: 'TrustNetworksController/vaccinationPlaces',
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
          tag: { key: 'timeout', value: 'Timeout' },
          context: { controller: 'TrustNetworksController', method: 'vaccinationPlaces' },
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
