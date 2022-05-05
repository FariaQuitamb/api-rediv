// import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import Env from '@ioc:Adonis/Core/Env'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import { Md5 } from 'ts-md5'
import AuthValidator from 'App/Validators/AuthValidator'

import { string } from '@ioc:Adonis/Core/Helpers'
import HttpStatusCode from 'Contracts/enums/HttpStatusCode'
import formatError from 'Contracts/functions/format_error'
import logError from 'Contracts/functions/log_error'

import LoggedUser from 'App/Models/LoggedUser'
import logRegister from 'Contracts/functions/log_register'
import Database from '@ioc:Adonis/Lucid/Database'
import constants from 'Contracts/constants/constants'
import formatUserInfo from 'Contracts/functions/format_user_info'
export default class AuthController {
  public async login({ auth, response, request }: HttpContextContract) {
    const data = await request.validate(AuthValidator)
    try {
      const username = string.escapeHTML(data.username)

      const userView = '[SIGIS].[dbo].[vw_AcsPostoVac_MB]'
      const md5 = Md5.hashStr(data.password)

      const user = await Database.from(userView)
        .select(constants.loginFields)
        .where('Utilizador', username)
        .where('Senha', md5)
        .first()

      if (!user) {
        await logRegister({
          id: 0,
          system: 'MB',
          screen: 'AuthController/login',
          table: 'vac_userPostoVacinacao',
          job: 'Consulta',
          tableId: 0,
          action: 'LoginAttempt',
          actionId: `U:${username}-P:${data.password}`,
        })

        console.log('Login incorrecto')
        return response.status(HttpStatusCode.OK).send({
          code: HttpStatusCode.OK,
          message: 'Login incorrecto',
          data: {},
        })
      }

      const token = await auth.use('api').generate(user, {
        expiresIn: Env.get('JWT_EXPIRES_IN'),
        name: user.username,
      })

      const id = auth.user?.id ?? 0
      //Log de actividade
      await logRegister({
        id: id,
        system: 'MB',
        screen: 'AuthController/login',
        table: 'vac_userPostoVacinacao',
        job: 'Consulta',
        tableId: id,
        action: 'Login',
        actionId: '',
      })

      return response.status(HttpStatusCode.ACCEPTED).send({
        code: HttpStatusCode.ACCEPTED,
        message: 'Login efectuado com sucesso!',
        data: { user, token },
      })
    } catch (error) {
      console.log(error)

      //Log de erro

      const userInfo = formatUserInfo(auth.user)
      const errorInfo = formatError(error)
      await logError({
        type: 'MB',
        page: 'AuthController/login',
        error: `User: ${userInfo} ${errorInfo}`,
      })

      return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
        code: HttpStatusCode.INTERNAL_SERVER_ERROR,
        message: 'Ocorreu um erro ao efectuar o login',
        data: [],
      })
    }
  }

  public async logout({ auth, response }: HttpContextContract) {
    try {
      const id = auth.user?.id ?? 0
      await auth.use('api').revoke()

      if (auth.use('api').isLoggedOut) {
        //Log de actividade

        await logRegister({
          id: id,
          system: 'MB',
          screen: 'AuthController/logout',
          table: 'api_tokens',
          job: 'Eliminação',
          tableId: id,
          action: 'Logout',
          actionId: '',
        })

        return response.status(HttpStatusCode.ACCEPTED).send({
          code: HttpStatusCode.ACCEPTED,
          message: 'Logout efectuado',
          data: [],
        })
      } else {
        return response.status(HttpStatusCode.NOT_ACCEPTABLE).send({
          code: HttpStatusCode.NOT_ACCEPTABLE,
          message: 'Não foi possível efectuar logout',
        })
      }
    } catch (error) {
      console.log(error)
      //Log de erro
      const userInfo = formatUserInfo(auth.user)
      const errorInfo = formatError(error)
      await logError({
        type: 'MB',
        page: 'AuthController/logout',
        error: `User: ${userInfo} ${errorInfo}`,
      })
      return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
        code: HttpStatusCode.INTERNAL_SERVER_ERROR,
        details: error,
        message: 'Erro ao efectuar logout',
      })
    }
  }

  public async loggedUsers({ auth, response }: HttpContextContract) {
    try {
      const loggedUsers = await LoggedUser.query()

      //Log de actividade

      /*
      await logRegister({
        id: auth.user?.id ?? 0,
        system: 'MB',
        screen: 'AuthController/loggedUsers',
        table: 'api_tokens',
        job: 'Consulta',
        tableId: 0,
        action: 'loggedUsers',
        actionId: '',
      })*/

      return response.status(HttpStatusCode.ACCEPTED).send({
        code: HttpStatusCode.ACCEPTED,
        message: 'Utilizadores com sessão activa',
        data: { qtd: loggedUsers.length, users: loggedUsers },
      })
    } catch (error) {
      console.log(error)
      //Log de erro
      const userInfo = formatUserInfo(auth.user)
      const errorInfo = formatError(error)
      await logError({
        type: 'MB',
        page: 'AuthController/loggedUsers',
        error: `User: ${userInfo} ${errorInfo}`,
      })
      return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
        code: HttpStatusCode.INTERNAL_SERVER_ERROR,
        details: error,
        message: 'Não foi possível listar utilizadores com sessão activa',
      })
    }
  }
}
