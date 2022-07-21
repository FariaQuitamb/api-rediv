import Env from '@ioc:Adonis/Core/Env'

const RedisConfig = {
  host: Env.get('BULLMQ_REDIS_HOST') ?? '127.0.0.1',
  port: Env.get('BULLMQ_REDIS_PORT') ?? 6379,
}

export default RedisConfig
