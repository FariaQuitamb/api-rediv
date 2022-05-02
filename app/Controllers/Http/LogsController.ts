// import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import LogError from 'App/Models/LogError'
import LogVaccine from 'App/Models/LogVaccine'
import LogSearchValidator from 'App/Validators/LogSearchValidator'
import LogSearchValidatorFilter from 'App/Validators/LogSearchValidatorFilter'
import LogValidator from 'App/Validators/LogValidator'
import HttpStatusCode from 'Contracts/enums/HttpStatusCode'
import formatError from 'Contracts/functions/format_error'
import logError from 'Contracts/functions/log_error'

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
        .whereRaw(`CONVERT(date,[DataCad]) = '${logData.search}'`)
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

  public async vaccineGeneral({ response, request }: HttpContextContract) {
    const logData = await request.validate(LogSearchValidator)
    try {
      const logs = await LogVaccine.query()
        .where('Sistema', 'MB')
        .orderBy('Data', 'desc')
        .paginate(logData.page, logData.limit)

      return response.status(HttpStatusCode.OK).send({
        message: 'Logs de actividade da API geral! ',
        code: HttpStatusCode.OK,
        data: logs,
      })
    } catch (error) {
      console.log(error)
      //Log de erro
      const errorInfo = formatError(error)
      await logError({ type: 'MB', page: 'LogsController/vaccineGeneral', error: errorInfo })
      return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
        message: 'Ocorreu um erro no servidor!',
        code: HttpStatusCode.INTERNAL_SERVER_ERROR,
        data: [],
      })
    }
  }

  public async vaccineByDate({ response, request }: HttpContextContract) {
    const logData = await request.validate(LogSearchValidatorFilter)
    try {
      const logs = await LogVaccine.query()
        .where('Sistema', 'MB')
        .whereRaw(`CONVERT(date,[Data]) = '${logData.search}'`)
        .orderBy('Data', 'desc')
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
      await logError({ type: 'MB', page: 'LogsController/vaccineByDate', error: errorInfo })
      return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
        message: 'Ocorreu um erro no servidor!',
        code: HttpStatusCode.INTERNAL_SERVER_ERROR,
        data: [],
      })
    }
  }

  public async vaccineFilterDateAction({ response, request }: HttpContextContract) {
    const logData = await request.validate(LogSearchValidatorFilter)
    try {
      if (logData.action === undefined) {
        return response.status(HttpStatusCode.OK).send({
          message: 'Digite a acção a obter! ',
          code: HttpStatusCode.OK,
          data: [],
        })
      }
      const logs = await LogVaccine.query()
        .where('Sistema', 'MB')
        .whereRaw(`CONVERT(date,[Data]) = '${logData.search}'`)
        .where('Acao', logData.action as string)
        .orderBy('Data', 'desc')
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
      await logError({
        type: 'MB',
        page: 'LogsController/vaccineFilterDateAction',
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
