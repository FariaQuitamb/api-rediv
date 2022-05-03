// import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import LogError from 'App/Models/LogError'
import LogVaccine from 'App/Models/LogVaccine'
import GetLogValidator from 'App/Validators/getLogValidator'
import LogSearchValidator from 'App/Validators/LogSearchValidator'
import LogSearchValidatorFilter from 'App/Validators/LogSearchValidatorFilter'
import LogSearchValidatorFilterElem from 'App/Validators/LogSearchValidatorFilterElem'

import HttpStatusCode from 'Contracts/enums/HttpStatusCode'
import formatError from 'Contracts/functions/format_error'
import logError from 'Contracts/functions/log_error'
import { DateTime } from 'luxon'

export default class LogsController {
  public async errorGeneral({ response, request }: HttpContextContract) {
    const logData = await request.validate(LogSearchValidator)
    try {
      const logs = await LogError.query()
        .where('Tipo', 'MB')
        .orderBy('DataCad', 'desc')
        .paginate(logData.page, logData.limit)

      return response.status(HttpStatusCode.OK).send({
        message: 'Logs de erro da API geral! ',
        code: HttpStatusCode.OK,
        data: logs,
      })
    } catch (error) {
      console.log(error)
      //Log de erro
      const errorInfo = formatError(error)
      await logError({ type: 'MB', page: 'LogsController/errorGeneral', error: errorInfo })
      return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
        message: 'Ocorreu um erro no servidor!',
        code: HttpStatusCode.INTERNAL_SERVER_ERROR,
        data: [],
      })
    }
  }

  public async errorByDate({ response, request }: HttpContextContract) {
    const logData = await request.validate(LogSearchValidatorFilter)
    try {
      const logs = await LogError.query()
        .where('Tipo', 'MB')
        .whereRaw(`CONVERT(date,[DataCad]) = '${logData.date}'`)
        .orderBy('DataCad', 'desc')
        .paginate(logData.page, logData.limit)

      return response.status(HttpStatusCode.OK).send({
        message: 'Logs de erro da API por data! ',
        code: HttpStatusCode.OK,
        data: logs,
      })
    } catch (error) {
      console.log(error)
      //Log de erro
      const errorInfo = formatError(error)
      await logError({ type: 'MB', page: 'LogsController/errorByDate', error: errorInfo })
      return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
        message: 'Ocorreu um erro no servidor!',
        code: HttpStatusCode.INTERNAL_SERVER_ERROR,
        data: [],
      })
    }
  }

  ///////////////////////////////////////////////////////

  //Logs de vacina

  public async getLogs({ response, request }: HttpContextContract) {
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

      if (filters.length === 0) {
      }

      if (filters.length === 1) {
        query += `${filters[0].field} = '${filters[0].value}'`
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
          }

          query += ` and ${filterQuery}`
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
      const errorInfo = formatError(error)
      await logError({
        type: 'MB',
        page: 'LogsController/getLogs',
        error: errorInfo,
      })
      return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
        message: 'Ocorreu um erro no servidor!',
        code: HttpStatusCode.INTERNAL_SERVER_ERROR,
        data: [],
      })
    }
  }
}
