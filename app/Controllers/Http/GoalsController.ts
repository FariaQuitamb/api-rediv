import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import VaccinationPost from 'App/Models/VaccinationPost'

import VaccinationPostGoalValidator from 'App/Validators/vaccinationPostGoalValidator'
import HttpStatusCode from 'Contracts/enums/HttpStatusCode'
import formatError from 'Contracts/functions/format_error'
import formatHeaderInfo from 'Contracts/functions/format_header_info'
import formatUserInfo from 'Contracts/functions/format_user_info'
import logError from 'Contracts/functions/log_error'

export default class GoalsController {
  public async getVaccinationPostGoal({ auth, response, request }: HttpContextContract) {
    const searchData = await request.validate(VaccinationPostGoalValidator)

    try {
      const vaccinationPost = await VaccinationPost.query()
        .preload('goals', (query) => {
          query
            .whereRaw(`DtIni <= CONVERT(DATE,GETDATE())`)
            .whereRaw(`DtFim  >= CONVERT(DATE,GETDATE())`)
            .orderBy('DtIni', 'desc')
        })
        .where('Id_postoVacinacao', searchData.vaccinationPostId)

        .first()

      if (!vaccinationPost) {
        return response.status(HttpStatusCode.OK).send({
          message: 'Posto de vacinação não encontrado',
          code: HttpStatusCode.OK,
          data: [],
        })
      }

      if (vaccinationPost.goals.length === 0) {
        return response.status(HttpStatusCode.ACCEPTED).send({
          message: 'Posto de vacinação sem objectivos',
          code: HttpStatusCode.ACCEPTED,
          data: [],
        })
      }

      const name =
        `${vaccinationPost?.nomePVAR}  ${vaccinationPost?.nameEM} ${vaccinationPost?.nameEA}`.trim()

      const data = {
        id: vaccinationPost.id,
        name,
        goals: vaccinationPost?.goals,
      }

      return response.status(HttpStatusCode.ACCEPTED).send({
        message: 'Objectivos do posto de vacinação',
        code: HttpStatusCode.ACCEPTED,
        data,
      })
    } catch (error) {
      console.log(error)
      //Log de erro
      const searchInfo = JSON.stringify(searchData)
      const deviceInfo = JSON.stringify(formatHeaderInfo(request))
      const userInfo = formatUserInfo(auth.user)
      const errorInfo = formatError(error)
      await logError({
        type: 'MB',
        page: 'v2:GoalsController/getVaccinationPostGoal',
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
