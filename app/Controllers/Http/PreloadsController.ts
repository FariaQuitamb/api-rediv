import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import DocType from 'App/Models/DocType'
import Nationality from 'App/Models/Nationality'
import Province from 'App/Models/Province'
import Vaccine from 'App/Models/Vaccine'
import HttpStatusCode from 'Contracts/enums/HttpStatusCode'
import formatError from 'Contracts/functions/format_error'
import formatHeaderInfo from 'Contracts/functions/format_header_info'
import formatUserInfo from 'Contracts/functions/format_user_info'
import logError from 'Contracts/functions/log_error'
import Env from '@ioc:Adonis/Core/Env'
import formatedLog, { LogType } from 'Contracts/functions/formated_log'
import Severity from 'App/Models/Severity'
import addActivityLogJob from 'App/bullmq/queue/queue'

export default class PreloadsController {
  public async index({ auth, request, response }: HttpContextContract) {
    try {
      const provinces = await Province.query()
        .preload('municipalities', (query) => query.orderBy('Nome'))
        .orderBy('Nome')

      const nationalities = await Nationality.query().orderBy('Nome')

      const docTypes = await DocType.query().orderBy('Id_tipoDocumento')

      const symptoms = await Severity.query().preload('symptoms')

      const vaccines = await Vaccine.query()
        .preload('lots', (query) => query.where('Visualizar', 'S').orderBy('NumLote'))
        .preload('doses', (query) => query.where('Visualizar', 'S').orderBy('Nome'))
        .where('Visualizar', 'S')
        .orderBy('Nome')

      if (!provinces) {
        return response.status(HttpStatusCode.OK).send({
          code: HttpStatusCode.OK,
          message: 'Não foi possível obter os dados das províncias',
          data: [],
        })
      }

      if (!nationalities) {
        return response.status(HttpStatusCode.OK).send({
          code: HttpStatusCode.OK,
          message: 'Não foi possível obter os dados das nacionalidades',
          data: [],
        })
      }

      if (!docTypes) {
        return response.status(HttpStatusCode.OK).send({
          code: HttpStatusCode.OK,
          message: 'Não foi possível obter os tipos de documento',
          data: [],
        })
      }

      if (!symptoms) {
        return response.status(HttpStatusCode.OK).send({
          code: HttpStatusCode.OK,
          message: 'Não foi possível obter a lista de sintomas',
          data: [],
        })
      }

      if (!vaccines) {
        return response.status(HttpStatusCode.OK).send({
          code: HttpStatusCode.OK,
          message: 'Não foi possível obter os dados das vacinas',
          data: [],
        })
      }

      //Log de actividade

      const version = Env.get('API_VERSION')

      const log = {
        id: auth.user?.id ?? 0,
        system: 'MB',
        screen: 'PreloadController/index',
        table: 'Provincia/Municipio/Tipo documentos/Vacinas',
        job: 'Consulta',
        tableId: 0,
        action: 'Pré-carregamento',
        actionId: `V:${version}`,
      }

      await addActivityLogJob(log)

      formatedLog({
        text: 'Carregamento inicial  de dados para o dispositivo',
        data: {},
        auth: auth,
        request: request,
        type: LogType.success,
      })

      return response.status(HttpStatusCode.ACCEPTED).send({
        message: 'Dados de pré-carregamento',
        code: HttpStatusCode.ACCEPTED,
        data: { provinces, nationalities, docTypes, vaccines, symptoms },
      })
    } catch (error) {
      //console.log(error)
      //Log de erro
      const deviceInfo = JSON.stringify(formatHeaderInfo(request))
      const userInfo = formatUserInfo(auth.user)
      const errorInfo = formatError(error)
      await logError({
        type: 'MB',
        page: 'PreloadController/index',
        error: `User: ${userInfo} Device: ${deviceInfo} ${errorInfo}`,
        request: request,
      })
      return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
        code: HttpStatusCode.INTERNAL_SERVER_ERROR,
        message: 'Ocorreu um erro ao  obter os dados de pré-carregamento',
        data: [],
      })
    }
  }

  public async symptomsList({ auth, request, response }: HttpContextContract) {
    try {
      const symptoms = await Severity.query().preload('symptoms')

      if (!symptoms) {
        return response.status(HttpStatusCode.OK).send({
          code: HttpStatusCode.OK,
          message: 'Não foi possível obter a lista de sintomas',
          data: [],
        })
      }

      //Log de actividade

      const version = Env.get('API_VERSION')

      const log = {
        id: auth.user?.id ?? 0,
        system: 'MB',
        screen: 'PreloadController/index',
        table: 'Provincia/Municipio/Tipo documentos/Vacinas',
        job: 'Consulta',
        tableId: 0,
        action: 'Pré-carregamento',
        actionId: `V:${version}`,
      }

      await addActivityLogJob(log)

      formatedLog({
        text: 'Lista de sintomas carregada',
        data: {},
        auth: auth,
        request: request,
        type: LogType.success,
      })

      return response.status(HttpStatusCode.ACCEPTED).send({
        message: 'Lista de sintomas',
        code: HttpStatusCode.ACCEPTED,
        data: { symptoms },
      })
    } catch (error) {
      //console.log(error)
      //Log de erro
      const deviceInfo = JSON.stringify(formatHeaderInfo(request))
      const userInfo = formatUserInfo(auth.user)
      const errorInfo = formatError(error)
      await logError({
        type: 'MB',
        page: 'PreloadController/symptomsList',
        error: `User: ${userInfo} Device: ${deviceInfo} ${errorInfo}`,
        request: request,
      })
      return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
        code: HttpStatusCode.INTERNAL_SERVER_ERROR,
        message: 'Ocorreu um erro ao  obter  a lista de sintomas',
        data: [],
      })
    }
  }
}
