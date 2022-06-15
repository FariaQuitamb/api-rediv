export enum LogType {
  success = 'SUCCESS::: ',
  warning = 'WARNING::: ',
  error = 'ERROR::: ',
}

const formatedLog = (text: string, type: LogType) => {
  if (type === LogType.success) {
    console.log(
      '\x1b[1m' /**Bold */,
      '\x1b[102m' /**BackGround */,
      '\x1b[37m' /**Text Color */,
      `${LogType.success} ${text}\x1b[0m`
    )
    return
  }
  if (type === LogType.warning) {
    console.log(
      '\x1b[1m' /**Bold */,
      '\x1b[103m' /**BackGround */,
      '\x1b[37m' /**Text Color */,
      `${LogType.warning} ${text}\x1b[0m`
    )
    return
  }

  if (type === LogType.error) {
    console.log(
      '\x1b[1m' /**Bold */,
      '\x1b[101m' /**BackGround */,
      '\x1b[37m' /**Text Color */,
      `${LogType.error} ${text}\x1b[0m`
    )
    return
  }

  console.log(`${text}`)
  return
}

export default formatedLog
