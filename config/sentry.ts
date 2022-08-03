import { SentryConfig } from '@ioc:Adonis/Addons/Sentry'
import Env from '@ioc:Adonis/Core/Env'

export default {
  dsn: Env.get('SENTRY_DSN'),
  enabled: true,
  environment: Env.get('NODE_ENV'),
} as SentryConfig
