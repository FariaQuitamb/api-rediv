import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import trustNetworkQueries from 'Contracts/constants/trust_network_query'
import HttpStatusCode from 'Contracts/enums/HttpStatusCode'
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
      })

      const substring = 'Timeout: Request failed to complete in'

      if (errorInfo.includes(substring)) {
        console.log('Não foi possível completar a operação dentro do tempo esperado!')
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
