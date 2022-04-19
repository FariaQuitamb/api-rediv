// import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import Code from 'Contracts/enums/code'
import AuthValidator from 'App/Validators/AuthValidator'
import HttpStatusCode from 'Contracts/enums/HttpStatusCode'
import { base64, safeEqual } from '@ioc:Adonis/Core/Helpers'
export default class AuthController {
  public async login({ auth, response, request }: HttpContextContract) {
    const data = await request.validate(AuthValidator)
    try {
      const user = await User.query()
        .where('Utilizador', data.username)
        .whereNot('Flag', 'X')
        .first()

      if (!user) {
        console.log('Login incorrecto')
        return response.status(200).send({
          code: 200,
          message: 'Login incorrecto',
          data: {},
        })
      }

      const b64 = base64.encode(data.password)

      if (!safeEqual(b64, user.password)) {
        console.log('Login incorrecto')
        return response.status(200).send({
          code: 200,
          message: 'Login incorrecto',
          data: {},
        })
      }

      console.log(user.username)

      const token = await auth.use('api').generate(user, {
        expiresIn: '10days',
        name: user.username,
      })

      await user?.load('vaccinationPost')
      return response
        .status(202)
        .send({ code: 202, message: 'Login efectuado com sucesso!', data: { user, token } })
    } catch (error) {
      console.log(error)
      return response.status(500).send({
        code: 500,
        message: 'Ocorreu um erro ao efectuar o login',
        data: [],
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
