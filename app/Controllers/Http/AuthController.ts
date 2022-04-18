// import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import Code from 'Contracts/enums/code'
import Hash from '@ioc:Adonis/Core/Hash'
import AuthValidator from 'App/Validators/AuthValidator'
import HttpStatusCode from 'Contracts/enums/HttpStatusCode'
export default class AuthController {
  public async login({ auth, response, request }: HttpContextContract) {
    const data = await request.validate(AuthValidator)

    try {
      const user = await User.query()
        .where('email', data.email)
        .where('isActive', 1)
        .whereNull('isDeleted')
        .first()

      if (!user) {
        return response.status(HttpStatusCode.OK).send({
          code: Code.ER_LOGIN,
          details: {},
          message: 'Login incorrecto',
        })
      }

      if (!(await Hash.verify(user.password, data.password))) {
        return response.status(HttpStatusCode.OK).send({
          code: Code.ER_LOGIN,
          details: {},
          message: 'Login incorrecto',
        })
      }

      const token = await auth.use('api').generate(user, {
        expiresIn: '10days',
        name: user.email,
      })

      // await user.load('institution')

      return response.status(HttpStatusCode.ACCEPTED).send({
        code: Code.SUCCESS,
        message: 'Login efectuado com sucesso',
        token,
        user,
      })
    } catch (error) {
      console.log(error)

      return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
        code: error.code,
        details: error,
        message: 'Ocorreu um erro ao efectuar o login',
      })
    }
  }

  public async logout({ auth, response }: HttpContextContract) {
    try {
      await auth.use('api').revoke()

      if (auth.use('api').isLoggedOut) {
        return response.status(HttpStatusCode.ACCEPTED).send({
          code: Code.SUCCESS,
          details: {},
          message: 'Logout efectuado',
        })
      } else {
        return response.status(HttpStatusCode.NOT_ACCEPTABLE).send({
          code: Code.ER_LOGOUT,
          details: {},
          message: 'Não foi possível efectuar logout',
        })
      }
    } catch (error) {
      console.log(error)
      return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
        code: error.code,
        details: error,
        message: 'Erro ao efectuar logout',
      })
    }
  }
}
