import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Person from 'App/Models/Person'
import BusinessCode from 'Contracts/enums/BusinessCode'
import HttpStatusCode from 'Contracts/enums/HttpStatusCode'
import formatedLog, { LogType } from 'Contracts/functions/formated_log'
import formatError from 'Contracts/functions/format_error'
import formatHeaderInfo from 'Contracts/functions/format_header_info'
import formatUserInfo from 'Contracts/functions/format_user_info'
import isAfterToday from 'Contracts/functions/isafter_today'
import logError from 'Contracts/functions/log_error'
import logRegister from 'Contracts/functions/log_register'
import moment from 'moment'
import ChildValidator from '../../Validators/ChildValidator'
import Env from '@ioc:Adonis/Core/Env'

export default class ChildrenController {
  public async index({}: HttpContextContract) {}

  public async store({ auth, response, request }: HttpContextContract) {
    const childData = await request.validate(ChildValidator)
    try {
      //Valor padrão para comorbilidade

      childData.coMorbidity = 'NÃO'
      //Verify future date

      if (isAfterToday(childData.dataCad) || childData.dataCad === null) {
        const previewsDate = childData.dataCad
        childData.dataCad = moment().toISOString()
        formatedLog({
          text: `A data do registo individual foi modificada para data de hoje! Data Inserida: ${previewsDate} User: Id:${auth.user?.id} Name: ${auth.user?.name} Phone: ${auth.user?.phone} BI:${auth.user?.bi}`,
          data: childData,
          auth: auth,
          request: request,
          type: LogType.warning,
        })
      }

      const prevDate = childData.dataCad
      childData.dataCad = moment(childData.dataCad, moment.ISO_8601, true).toISOString()
      //Caso tenha inserido data que não seja possível converter
      if (childData.dataCad === null) {
        childData.dataCad = moment().toISOString()
        formatedLog({
          text: `A data do registo individual foi modificada para data de hoje! Data Inserida: ${prevDate} User: Id:${auth.user?.id} Name: ${auth.user?.name} Phone: ${auth.user?.phone} BI:${auth.user?.bi}`,
          data: childData,
          auth: auth,
          request: request,
          type: LogType.warning,
        })
      }

      //Verifica se existe um utente com o número de documento enviado
      const childExists = await Person.query()
        .where('NCartao', childData.cardNumber)
        .timeout(60000)
        .first()

      if (childExists) {
        return response.status(HttpStatusCode.OK).send({
          message: 'Já existe um utente registrado com esse número de cartão.',
          code: BusinessCode.FOUND_INDIVIDUAL,
          data: childExists,
        })
      }

      const child = await Person.create(childData)

      const version = Env.get('API_VERSION')

      await logRegister({
        id: auth.user?.id ?? 0,
        system: 'MB',
        screen: ' ChildrenController/store',
        table: 'regIndividual',
        job: 'Cadastrar',
        tableId: child.id,
        action: 'Registo de Utente Menor',
        actionId: `V:${version}-ID:${child.id.toString()}`,
      })

      formatedLog({
        text: 'Novo utente registrado com sucesso!',
        type: LogType.success,
        data: childData,
        auth: auth,
        request: request,
      })

      //Utente registado com sucesso
      return response.status(HttpStatusCode.CREATED).send({
        message: 'Utente registrado com sucesso!',
        code: HttpStatusCode.CREATED,
        data: child,
      })
    } catch (error) {
      const childJson = JSON.stringify(childData)

      const deviceInfo = JSON.stringify(formatHeaderInfo(request))
      const userInfo = formatUserInfo(auth.user)
      const errorInfo = formatError(error)

      await logError({
        type: 'MB',
        page: ' ChildrenController/store',
        error: `User:${userInfo} Device: ${deviceInfo} Dados : ${childJson} - ${errorInfo}`,
        request: request,
      })

      const substring = 'Timeout: Request failed to complete in'

      if (errorInfo.includes(substring)) {
        formatedLog({
          text: 'Não foi possível completar a operação dentro do tempo esperado!',
          type: LogType.warning,
          data: childData,
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

  public async update({}: HttpContextContract) {}
}
