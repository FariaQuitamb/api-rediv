//import LogError from 'App/Models/LogError'
//import formatError from './format_error'

const logError = async (args: { type: string; page: string; error: string }) => {
  console.log(`Controller:${args.page} -- ${args.error}`)

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
