import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'

import constants from 'Contracts/constants/constants'

export default class CheckUserStatus {
  public async handle({ auth, response }: HttpContextContract, next: () => Promise<void>) {
    // code for middleware goes here. ABOVE THE NEXT CALL

    console.log('MIDDLEWARE')
    const userView = '[SIGIS].[dbo].[vw_AcsPostoVac_MB]'

    const user = await Database.from(userView)
      .select(constants.loginFields)
      .where('Id_userPostoVacinacao', auth.user!.id)
      .first()

    if (!user) {
      response.unauthorized({ code: 401, message: 'Acesso negado' })
      return
    }

    await next()
  }
}
