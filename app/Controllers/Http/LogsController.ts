// import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import LogError from 'App/Models/LogError'
import LogVaccine from 'App/Models/LogVaccine'
import RegVaccinationLog from 'App/Models/RegVaccinationLog'
import VaccinationLog from 'App/Models/VaccinationLog'
import GetErrorLogValidator from 'App/Validators/getErrorLogValidator'
import GetLogValidator from 'App/Validators/getLogValidator'
import GetVaccineGeoLogValidator from 'App/Validators/getVaccineGeoLogValidator'
import GetVaccineLogValidator from 'App/Validators/getVaccineLogValidator'

import HttpStatusCode from 'Contracts/enums/HttpStatusCode'
import formatError from 'Contracts/functions/format_error'
import formatHeaderInfo from 'Contracts/functions/format_header_info'
import formatUserInfo from 'Contracts/functions/format_user_info'
import generateQuery from 'Contracts/functions/generate_query'
import logError from 'Contracts/functions/log_error'

export default class LogsController {
  //Logs de actividades

  public async getLogs({ auth, response, request }: HttpContextContract) {
    const logData = await request.validate(GetLogValidator)
    try {
      const filters: Array<{ field: string; value: any }> = []

      if (logData.job !== undefined && logData.job !== ' ') {
        const value = { field: 'TipoJOB', value: logData.job }
        filters.push(value)
      }

      if (logData.controllerMethod !== undefined && logData.controllerMethod !== ' ') {
        const value = { field: 'Pagina', value: logData.controllerMethod }
        filters.push(value)
      }

      if (logData.table !== undefined && logData.table !== ' ') {
        const value = { field: 'Tabela', value: logData.table }
        filters.push(value)
      }

      if (logData.tableId !== undefined && logData.tableId !== ' ') {
        const value = { field: 'ID_Tabela', value: logData.tableId }
        filters.push(value)
      }

      if (logData.date !== undefined) {
        const value = { field: 'Data', value: logData.date }
        filters.push(value)
      }

      if (logData.action !== undefined && logData.action !== ' ') {
        const value = { field: 'Acao', value: logData.action }
        filters.push(value)
      }

      let query = ''

      if (filters.length === 1) {
        if (filters[0].field === 'Data') {
          query = ` CONVERT(date,[Data]) =  CONVERT(date,'${filters[0].value}')`
        } else {
          query += `${filters[0].field} = '${filters[0].value}'`
        }
      } else {
        let filterQuery: string
        filters.map((elem, index) => {
          if (elem.field === 'Data') {
            filterQuery = ` CONVERT(date,[Data]) =  CONVERT(date,'${elem.value}')`
          } else {
            filterQuery = ` ${elem.field} = '${elem.value}'`
          }

          if (index === 0) {
            query += filterQuery
          } else {
            query += ` and ${filterQuery}`
          }
        })
      }

      const logs = await LogVaccine.query()
        .where('Sistema', 'MB')
        .whereRaw(query)
        .orderBy('Data', 'desc')
        .paginate(logData.page, logData.limit)
      return response.status(HttpStatusCode.OK).send({
        message: 'Logs de actividades da API : ' + query,
        code: HttpStatusCode.OK,
        data: logs,
      })
    } catch (error) {
      console.log(error)
      //Log de erro
      const deviceInfo = JSON.stringify(formatHeaderInfo(request))
      const userInfo = formatUserInfo(auth.user)
      const errorInfo = formatError(error)
      await logError({
        type: 'MB',
        page: 'LogsController/getLogs',
        error: `User: ${userInfo} Device: ${deviceInfo}  ${errorInfo}`,
      })
      return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
        message: 'Ocorreu um erro no servidor!',
        code: HttpStatusCode.INTERNAL_SERVER_ERROR,
        data: [],
      })
    }
  }

  public async getErrorLogs({ auth, response, request }: HttpContextContract) {
    const logData = await request.validate(GetErrorLogValidator)
    try {
      const filters: Array<{ field: string; value: any }> = []

      if (logData.controllerMethod !== undefined && logData.controllerMethod !== ' ') {
        const value = { field: 'Pagina', value: logData.controllerMethod }
        filters.push(value)
      }

      if (logData.date !== undefined) {
        const value = { field: 'DataCad', value: logData.date }
        filters.push(value)
      }

      let query = ''

      if (filters.length === 1) {
        if (filters[0].field === 'Data') {
          query = ` CONVERT(date,[Data]) =  CONVERT(date,'${filters[0].value}')`
        } else {
          query += `${filters[0].field} = '${filters[0].value}'`
        }
      } else {
        let filterQuery: string
        filters.map((elem, index) => {
          if (elem.field === 'DataCad') {
            filterQuery = ` CONVERT(date,[DataCad]) =  CONVERT(date,'${elem.value}')`
          } else {
            filterQuery = ` ${elem.field} = '${elem.value}'`
          }

          if (index === 0) {
            query += filterQuery
          } else {
            query += ` and ${filterQuery}`
          }
        })
      }

      const logs = await LogError.query()
        .where('Tipo', 'MB')
        .whereRaw(query)
        .orderBy('DataCad', 'desc')
        .paginate(logData.page, logData.limit)
      return response.status(HttpStatusCode.OK).send({
        message: 'Logs de erro da API : ' + query,
        code: HttpStatusCode.OK,
        data: logs,
      })
    } catch (error) {
      console.log(error)
      //Log de erro

      const deviceInfo = JSON.stringify(formatHeaderInfo(request))
      const userInfo = formatUserInfo(auth.user)
      const errorInfo = formatError(error)
      await logError({
        type: 'MB',
        page: 'LogsController/getErrorLogs',
        error: `User: ${userInfo} Device: ${deviceInfo}  ${errorInfo}`,
      })
      return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
        message: 'Ocorreu um erro no servidor!',
        code: HttpStatusCode.INTERNAL_SERVER_ERROR,
        data: [],
      })
    }
  }

  //Log de vaccine done
  public async getVaccineLogs({ auth, response, request }: HttpContextContract) {
    const logData = await request.validate(GetVaccineLogValidator)
    try {
      const fields: Array<{ field: string; value: any }> = [
        { field: 'TipoJOB', value: logData.job },
        { field: 'Id_Login', value: logData.loginId },
        { field: 'Pagina', value: logData.controllerMethod },
        { field: 'Acao', value: logData.action },
        { field: 'Observacao', value: logData.observation },
        { field: 'Data', value: logData.date },
        { field: 'Id_userPostoVacinacao', value: logData.vaccinationPostUserId },
        { field: 'Id_regVacinacao', value: logData.vaccinationId },
        { field: 'Id_LogRegVac', value: logData.logRecVacId },
      ]

      const query = generateQuery(fields)

      const logs = await VaccinationLog.query()
        .where('Sistema', 'MB')
        .whereRaw(query)
        .orderBy('Data', 'desc')
        .paginate(logData.page, logData.limit)
      return response.status(HttpStatusCode.OK).send({
        message: 'Logs de vacinação da API : ' + query,
        code: HttpStatusCode.OK,
        data: logs,
      })
    } catch (error) {
      console.log(error)
      //Log de erro

      const deviceInfo = JSON.stringify(formatHeaderInfo(request))
      const userInfo = formatUserInfo(auth.user)
      const errorInfo = formatError(error)
      await logError({
        type: 'MB',
        page: 'LogsController/getVaccineLogs',
        error: `User: ${userInfo} Device: ${deviceInfo}  ${errorInfo}`,
      })
      return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
        message: 'Ocorreu um erro no servidor!',
        code: HttpStatusCode.INTERNAL_SERVER_ERROR,
        data: [],
      })
    }
  }

  public async getVaccineGeoLogs({ auth, response, request }: HttpContextContract) {
    const logData = await request.validate(GetVaccineGeoLogValidator)
    try {
      /*

      FROM [SIGIS].[dbo].[vac_regVacinacaoLog]

      */
      const fields: Array<{ field: string; value: any }> = [
        { field: 'Id_regVacinacaoLog', value: logData.id },
        { field: 'Id_regVacinacao', value: logData.vaccinationId },
        { field: 'Imei', value: logData.imei },
        { field: 'Telefobe', value: logData.phone },
        { field: 'Latitude', value: logData.lat },
        { field: 'Longitude', value: logData.Long },
        { field: 'Tipo', value: logData.type },
        { field: 'Id_regVacinacao', value: logData.vaccinationId },
      ]

      const query = generateQuery(fields)

      console.log(query)

      const logs = await RegVaccinationLog.query()
        .whereRaw(query)
        .orderBy('Data', 'desc')
        .paginate(logData.page, logData.limit)
      return response.status(HttpStatusCode.OK).send({
        message: 'Logs de vacinação da API : ' + query,
        code: HttpStatusCode.OK,
        data: logs,
      })
    } catch (error) {
      console.log(error)
      //Log de erro

      const deviceInfo = JSON.stringify(formatHeaderInfo(request))
      const userInfo = formatUserInfo(auth.user)
      const errorInfo = formatError(error)
      await logError({
        type: 'MB',
        page: 'LogsController/getLogs',
        error: `User: ${userInfo} Device: ${deviceInfo}  ${errorInfo}`,
      })
      return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
        message: 'Ocorreu um erro no servidor!',
        code: HttpStatusCode.INTERNAL_SERVER_ERROR,
        data: [],
      })
    }
  }
}
