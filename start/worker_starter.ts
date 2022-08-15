import execWorkers from 'App/bullmq/worker/worker'
import formatedLog, { LogType } from 'Contracts/functions/formated_log'

try {
  //Executa todos os workers dentro da função
  execWorkers()
  const text = 'Started workers with server'
  console.log(`\x1b[92m`, `\u2714 ${LogType.success} \u00BB\u00BB\u00BB ${text} 🚀\x1b[0m `)
} catch (error) {
  formatedLog({
    text: 'Não foi possível iniciar os workers',
    type: LogType.error,
    data: error,
    auth: {},
    request: null,
  })
}
