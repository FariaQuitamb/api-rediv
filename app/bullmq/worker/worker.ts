import { Worker } from 'bullmq'
import logRegister from 'Contracts/functions/log_register'
import path from 'path'

const queueName = 'queue'

const processor = async (job) => {
  await new Promise((resolve) => setTimeout(resolve, 3000))

  console.log('Worker in action on job ' + JSON.stringify(job))
  try {
    await logRegister({
      id: 43 ?? 0,
      system: 'WORKER',
      screen: 'PeopleController/store',
      table: 'regIndividual',
      job: 'Cadastrar',
      tableId: 123,
      action: 'Registro de Utente',
      actionId: `V:hhh`,
    })
  } catch (error) {
    console.log('Erro ao executar job')
    console.log(error)
  }
  return job.data
}

export default function createWorker() {
  console.log('Inited work for queue')
  const worker = new Worker(queueName, processor, {
    connection: {
      host: '127.0.0.1',
      port: 6379,
    },
    concurrency: 10,
  })

  return worker
}

/*
export default function createWorker() {
  const processorFile = path.join(__dirname, 'processor.ts')
  const worker = new Worker(queueName, processorFile, {
    connection: {
      host: '127.0.0.1',
      port: 6379,
    },
  })
}

*/
