const formatError = (error: any) => {
  const code = error.code
  const stacktrace = error.stack
  const erroInfo = `Error -> CODE: ${code}-STACKTRACE:${stacktrace} `
  return erroInfo
}

export default formatError
