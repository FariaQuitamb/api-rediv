import LogError from 'App/Models/LogError'
import formatError from './format_error'

const logError = async (args: { type: string; page: string; error: string }) => {
  try {
    const log = await LogError.create(args)
    return log
  } catch (error) {
    const errorInfo = formatError(error)
    return errorInfo
  }
}

export default logError
