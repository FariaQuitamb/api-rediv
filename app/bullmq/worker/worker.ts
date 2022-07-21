import { Worker } from 'bullmq'
import logRegister from 'Contracts/functions/log_register'
import RedisConfig from 'Config/redis_config'

const queueName = 'queue'

const processor = async (job) => {
  const log = job.data
  await new Promise((resolve) => setTimeout(resolve, 3000))

  console.log('Worker in action on job ' + JSON.stringify(job))
  try {
    await logRegister({
      id: log.id,
      system: log.system,
      screen: log.screen,
      table: log.table,
      job: log.job,
      tableId: log.tableId,
      action: log.action,
      actionId: log.actionId,
    })
  } catch (error) {
    console.log('Erro ao executar job')
    console.log(error)
  }
  return job.data
}

function ActivityLogWorker() {
  console.log('O worker do job de log de actividades foi iniciado com sucesso 🚀')
  const worker = new Worker(queueName, processor, {
    connection: RedisConfig,
    concurrency: 10,
  })

  return worker
}

export default function execWorkers() {
  ActivityLogWorker()
}
