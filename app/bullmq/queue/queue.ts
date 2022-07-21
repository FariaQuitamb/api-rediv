import { Queue, QueueEvents } from 'bullmq'
import { cuid } from '@ioc:Adonis/Core/Helpers'

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

const data: Activity = {
  id: 1,
  system: 'WORKER',
  screen: 'Jobs',
  table: 'RegIndividual',
  job: 'Bullmq',
  tableId: 134,
  action: 'Add',
  actionId: 'Bullmq',
}

const queueName = 'queue'

const queue = new Queue(queueName, {
  connection: {
    host: '127.0.0.1',
    port: 6379,
  },
})
const queueEvents = new QueueEvents(queueName, {
  connection: {
    host: '127.0.0.1',
    port: 6379,
  },
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

export default async function addJobs() {
  //Necessário enviar o ID único do Job
  const jobId = cuid()
  await queue.add('addActivity' + jobId, data, { jobId })

  console.log('Added new job in queue')
  return queue
}
