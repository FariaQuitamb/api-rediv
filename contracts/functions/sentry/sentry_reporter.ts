import Sentry from '@ioc:Adonis/Addons/Sentry'

const sentryReport = (
  message: string,
  user,
  context: { controller: string; method: string },
  tag: { key: string; value: string }
) => {
  Sentry.setContext('api_context', {
    controller: context.controller,
    method: context.method,
  })

  //Atribui uma tag para classificação
  Sentry.setTag(tag.key, tag.value)
  //Adiciona o user para identificação directa do problema

  if (user !== null || user !== undefined) {
    Sentry.setUser({ id: user?.id, username: user?.username })
  }

  Sentry.captureMessage(message)
}

export default sentryReport
