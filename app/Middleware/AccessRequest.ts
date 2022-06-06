import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class AccessRequest {
  public async handle({ request, response }: HttpContextContract, next: () => Promise<void>) {
    // code for middleware goes here. ABOVE THE NEXT CALL

    console.log(`-> ${request.method()}: ${request.url()}`)

    const notAuthenticated = false

    if (notAuthenticated) {
      response.unauthorized({ error: 'Must be logged in' })
      return
    }

    await next()
  }
}
