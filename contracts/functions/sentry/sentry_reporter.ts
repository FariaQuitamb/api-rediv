import Sentry from '@ioc:Adonis/Addons/Sentry'

const sentryReport = (message: string, user, tag: { key: string; value: string }) => {
  Sentry.setContext('api_context', {
    controller: 'PeopleController',
    method: 'store',
  })

  //Atribui uma tag para classificação
  Sentry.setTag(tag.key, tag.value)
  //Adiciona o user para identificação directa do problema
  Sentry.setUser({ id: user?.id, username: user?.username })

  Sentry.captureMessage(message)
}

export default sentryReport
