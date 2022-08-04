import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'

import LoggedUserActivityValidator from 'App/Validators/LoggedUserActivityValidator'
import UserWorkValidator from 'App/Validators/UserWorkValidator'
import constants from 'Contracts/constants/constants'
import HttpStatusCode from 'Contracts/enums/HttpStatusCode'
import formatError from 'Contracts/functions/format_error'
import formatHeaderInfo from 'Contracts/functions/format_header_info'
import formatUserInfo from 'Contracts/functions/format_user_info'
import generateQuery from 'Contracts/functions/generate_query'
import logError from 'Contracts/functions/log_error'

export default class UsersController {
  public async userWork({ auth, request, response }: HttpContextContract) {
    const searchData = await request.validate(UserWorkValidator)
    try {
      /*

 
 

  


     */

      const fields: Array<{ field: string; value: any }> = [
        {
          field: ' [SIGIS].[dbo].[vac_userPostoVacinacao].[Id_userPostoVacinacao]',
          value: searchData.userId,
        },
        { field: '[SIGIS].[dbo].[vac_userPostoVacinacao].[Nome]', value: searchData.personalName },
        {
          field: '[SIGIS].[dbo].[vac_userPostoVacinacao].[Utilizador]',
          value: searchData.username,
        },
        { field: '[BI]', value: searchData.nationalID },
        { field: '[Telefone]', value: searchData.phone },
        { field: '[SIGIS].[dbo].[vac_tipoFuncPostoVac].[Nome]', value: searchData.role },
        { field: '[TipoPosto] ', value: searchData.postType },

        { field: '[NomeEM] ', value: searchData.postName },
        { field: '[NomeResp] ', value: searchData.postManagerName },
        { field: '[BIResp] ', value: searchData.postManagerNationalId },
        { field: '[TelResp]', value: searchData.postManagerPhone },
        { field: '[p].[Nome]', value: searchData.province },
        { field: '[SIGIS].[dbo].[Municipio].[Nome]', value: searchData.municipality },
        { field: '[Mac_address]', value: searchData.deviceId },

        { field: '[SIGIS].[dbo].[vac_regVacinacaoLog].[Latitude] ', value: searchData.latitude },
        { field: '[SIGIS].[dbo].[vac_regVacinacaoLog].[Longitude]', value: searchData.longitude },

        { field: '[Tipo]', value: searchData.vaccineDose },
        { field: 'vac.DataCad', value: searchData.vaccinationDate },
      ]

      let query = generateQuery(fields)
      console.log(query)

      //Logged in
      const userWork = await Database.from(constants.userWorkTable)
        .select(constants.userWorkFields)
        .joinRaw(constants.userWorkSources)
        .whereRaw(query)
        .orderBy('Data', 'desc')
        .paginate(searchData.page, searchData.limit)

      return response.status(HttpStatusCode.OK).send({
        message: 'Trabalho realizado: filtro =' + query,
        code: HttpStatusCode.OK,
        data: { userWork },
      })
    } catch (error) {
      //Log de erro
      const deviceInfo = JSON.stringify(formatHeaderInfo(request))
      const userInfo = formatUserInfo(auth.user)
      const errorInfo = formatError(error)
      await logError({
        type: 'MB',
        page: 'AuthController/aboutUsers',
        error: `User: ${userInfo} Device: ${deviceInfo} ${errorInfo} `,
        request: request,
      })
      return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
        code: HttpStatusCode.INTERNAL_SERVER_ERROR,
        details: error,
        message: 'Não foi possível obter informação sobre os utilizadores',
      })
    }
  }
}
