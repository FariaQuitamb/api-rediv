//import LogError from 'App/Models/LogError'
//import formatError from './format_error'

import formatedLog, { LogType } from './formated_log'

const logError = async (args: { type: string; page: string; error: string }) => {
  // formatedLog(`Controller:${args.page} -- ${args.error}`, LogType.error)

  formatedLog({
    text: `Controller:${args.page} -- ${args.error}`,
    data: {},
    auth: {},
    request: {},
    type: LogType.error,
  })

  // Desabilitada a inserção de log de erro no banco de dados - 10-06-2022
  /*  try {
    const log = await LogError.create(args)
    return log
  } catch (error) {
    const errorInfo = formatError(error)
    return errorInfo
  } */
}

export default logError
