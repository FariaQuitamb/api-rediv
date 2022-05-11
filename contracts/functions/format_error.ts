import Env from '@ioc:Adonis/Core/Env'

const formatError = (error: any) => {
  const version = Env.get('API_VERSION')
  const code = error.code
  const stacktrace = error.stack
  const erroInfo = `Version:${version} Error -> CODE: ${code}-STACKTRACE:${stacktrace} `
  return erroInfo
}

export default formatError
