import moment from 'moment'
import formatHeaderInfo from './format_header_info'
import formatUserInfo from './format_user_info'
import sentryReport from './sentry/sentry_reporter'

export enum LogType {
  success = 'SUCCESS',
  warning = 'WARNING',
  error = 'ERROR',
}

type LogFields = {
  text: string
  type: LogType
  auth: any
  data: any
  request: any
  tag?: { key: string; value: string }
  context?: { controller: string; method: string }
}

const formatedLog = ({ text, type, auth, data, request, tag, context }: LogFields) => {
  const today = moment()

  const time = today.locale('pt').format('LLLL:ss').toUpperCase()

  if (
    type !== LogType.success &&
    tag !== undefined &&
    context !== undefined &&
    tag !== null &&
    context !== null
  ) {
    sentryReport(text, auth.user, context, tag)
  }

  const dataJson = JSON.stringify(data)

  let deviceInfo = ''
  if (request.headers() !== undefined) {
    deviceInfo = JSON.stringify(formatHeaderInfo(request))
  }

  const userInfo = formatUserInfo(auth.user)

  if (type === LogType.success) {
    console.log(
      /**'\x1b[1m' Bold */
      `\n\n ⏰ ${time} \n\n   \x1b[92m` /**Text Color */,
      `\u2714 ${LogType.success} \u2551\u2551\u2560\u00BB\u00BB\u00BB ${text}\x1b[0m \n   \x1b[92mINFO:\x1b[34m User: ${userInfo} Device: ${deviceInfo} Data: ${dataJson}  \n `
    )
    return
  }
  if (type === LogType.warning) {
    console.log(
      `\n\n ⏰ ${time} \n\n  \x1b[93m` /**Text Color */,
      `\u26A0 ${LogType.warning} \u2551\u2551\u2560\u00BB\u00BB\u00BB  ${text}\x1b[0m \n   \x1b[92mINFO:\x1b[34m User: ${userInfo} Device: ${deviceInfo} Data: ${dataJson} \n `
    )
    return
  }

  if (type === LogType.error) {
    console.log(
      `\n\n ⏰ ${time} \n\n   \x1b[91m` /**Text Color */,
      `\u274C ${LogType.error} \u2551\u2551\u2560\u00BB\u00BB\u00BB ${text}\x1b[0m \n    \x1b[92mINFO:\x1b[34m User: ${userInfo} Device: ${deviceInfo} Data: ${dataJson}  \n`
    )
    return
  }

  console.log(
    `${text}   \x1b[92m INFO:\x1b[93m User: ${userInfo} Device: ${deviceInfo} Data: ${dataJson}  \n`
  )
  return
}

export default formatedLog
