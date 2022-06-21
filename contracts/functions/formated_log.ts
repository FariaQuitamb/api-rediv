export enum LogType {
  success = 'SUCCESS',
  warning = 'WARNING',
  error = 'ERROR',
}

const formatedLog = (text: string, type: LogType) => {
  if (type === LogType.success) {
    console.log(
      /**'\x1b[1m' Bold */
      '\x1b[92m' /**Text Color */,
      `\u2714 ${LogType.success} \u2551\u2551\u2560\u00BB\u00BB\u00BB ${text}\x1b[0m \n`
    )
    return
  }
  if (type === LogType.warning) {
    console.log(
      '\x1b[93m' /**Text Color */,
      `\u26A0 ${LogType.warning} \u2551\u2551\u2560\u00BB\u00BB\u00BB  ${text}\x1b[0m \n`
    )
    return
  }

  if (type === LogType.error) {
    console.log(
      '\x1b[91m' /**Text Color */,
      `\u274C ${LogType.error} \u2551\u2551\u2560\u00BB\u00BB\u00BB ${text}\x1b[0m \n`
    )
    return
  }

  console.log(`${text} \n`)
  return
}

export default formatedLog
