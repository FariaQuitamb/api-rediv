import { Queue, QueueEvents } from 'bullmq'
import { cuid } from '@ioc:Adonis/Core/Helpers'
import RedisConfig from 'Config/redis_config'

interface Activity {
  id: number
  system: string
  screen: string
  table: string
  job: string
  tableId: number
  action: string
  actionId: string
}

const queueName = 'activitylog'

const queue = new Queue(queueName, {
  connection: RedisConfig,
})
const queueEvents = new QueueEvents(queueName, {
  connection: RedisConfig,
})

queueEvents.on('progress', async ({ jobId }) => {
  console.info(`process in ${queueName} is in progress ${jobId}`)
})

queueEvents.on('active', async ({ jobId }) => {
  console.info(`process in ${queueName} started ${jobId}`)
})
queueEvents.on('completed', ({ jobId }) => {
  console.info(`process in ${queueName} completed ${jobId}`)
})

queueEvents.on('failed', ({ jobId }) => {
  console.info(`process in ${queueName} failed ${jobId}`)
})

export default async function addActivityLogJob(data: any) {
  //Necessário enviar o ID único do Job
  const jobId = cuid()
  await queue.add('addActivity', data, { jobId })
  console.log(
    `Nova tarefa adicionada na pilha de execução  Tabela: ${data.table}  Id Tabela :  ${data.tableId} 📚`
  )
  return queue
}
