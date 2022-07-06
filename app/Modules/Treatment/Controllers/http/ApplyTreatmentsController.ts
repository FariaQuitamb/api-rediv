import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import formatedLog, { LogType } from 'Contracts/functions/formated_log'
import isAfterToday from 'Contracts/functions/isafter_today'
import moment from 'moment'
import AppliedTreatment from '../../Models/AppliedTreatment'
import ApplyTreatmentValidator from '../../Validators/ApplyTreatmentValidator'
import Env from '@ioc:Adonis/Core/Env'
import logRegister from 'Contracts/functions/log_register'
import HttpStatusCode from 'Contracts/enums/HttpStatusCode'
import formatHeaderInfo from 'Contracts/functions/format_header_info'
import formatUserInfo from 'Contracts/functions/format_user_info'
import formatError from 'Contracts/functions/format_error'
import logError from 'Contracts/functions/log_error'

export default class ApplyTreatmentsController {
  public async index({}: HttpContextContract) {}

  public async store({ auth, response, request }: HttpContextContract) {
    const treatmentData = await request.validate(ApplyTreatmentValidator)
    try {
      if (isAfterToday(treatmentData.createdAt)) {
        const previewsDate = treatmentData.createdAt
        treatmentData.createdAt = moment().toISOString()
        formatedLog({
          text: `A data de aplicação do tratamento foi modificada para data de hoje! Data Inserida: ${previewsDate} User: Id:${auth.user?.id} Name: ${auth.user?.name} Phone: ${auth.user?.phone} BI:${auth.user?.bi}`,
          data: treatmentData,
          auth: auth,
          request: request,
          type: LogType.warning,
        })
      }

      const prevDate = treatmentData.createdAt
      treatmentData.createdAt = moment(treatmentData.createdAt, moment.ISO_8601, true).toISOString()
      //Caso tenha inserido data que não seja possível converter
      if (treatmentData.createdAt === null) {
        treatmentData.createdAt = moment().toISOString()
        formatedLog({
          text: `A data de aplicação do tratamento foi modificada para data de hoje! Data Inserida: ${prevDate} User: Id:${auth.user?.id} Name: ${auth.user?.name} Phone: ${auth.user?.phone} BI:${auth.user?.bi}`,
          data: treatmentData,
          auth: auth,
          request: request,
          type: LogType.warning,
        })
      }

      treatmentData.treatmentDoseId = 1001

      const appliedTreatment = await AppliedTreatment.create(treatmentData)

      const version = Env.get('API_VERSION')

      await logRegister({
        id: auth.user?.id ?? 0,
        system: 'MB',
        screen: 'ApplyTreatmentsController/store',
        table: 'vac_vacTratamento',
        job: 'Cadastrar',
        tableId: appliedTreatment.id,
        action: 'Aplicação de tratamento',
        actionId: `V:${version}-ID:${appliedTreatment.id.toString()}`,
      })

      formatedLog({
        text: 'Tratamento aplicado com sucesso!',
        type: LogType.success,
        data: appliedTreatment,
        auth: auth,
        request: request,
      })

      //Utente registado com sucesso
      return response.status(HttpStatusCode.CREATED).send({
        message: 'Tratamento aplicado com sucesso',
        code: HttpStatusCode.CREATED,
        data: appliedTreatment,
      })
    } catch (error) {
      const treatmentStr = JSON.stringify(treatmentData)

      const deviceInfo = JSON.stringify(formatHeaderInfo(request))
      const userInfo = formatUserInfo(auth.user)
      const errorInfo = formatError(error)

      await logError({
        type: 'MB',
        page: 'ApplyTreatmentsController/store',
        error: `User:${userInfo} Device: ${deviceInfo} Dados : ${treatmentStr} - ${errorInfo}`,
        request: request,
      })

      const substring = 'Timeout: Request failed to complete in'

      if (errorInfo.includes(substring)) {
        formatedLog({
          text: 'Não foi possível realizar a operação de registo de tratamento dentro do tempo esperado!',
          type: LogType.warning,
          data: treatmentData,
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

  public async show({}: HttpContextContract) {}

  public async edit({}: HttpContextContract) {}

  public async update({}: HttpContextContract) {}

  public async destroy({}: HttpContextContract) {}
}
