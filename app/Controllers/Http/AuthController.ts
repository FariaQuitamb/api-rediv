// import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import Env from '@ioc:Adonis/Core/Env'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import { Md5 } from 'ts-md5'
import AuthValidator from 'App/Validators/AuthValidator'

import { string } from '@ioc:Adonis/Core/Helpers'
import HttpStatusCode from 'Contracts/enums/HttpStatusCode'
import formatError from 'Contracts/functions/format_error'
import logError from 'Contracts/functions/log_error'

import logRegister from 'Contracts/functions/log_register'
import Database from '@ioc:Adonis/Lucid/Database'
import constants from 'Contracts/constants/constants'
import formatUserInfo from 'Contracts/functions/format_user_info'
import formatHeaderInfo from 'Contracts/functions/format_header_info'
import ApiTokenCustom from 'App/Models/ApiTokenCustom'

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
        const version = Env.get('API_VERSION')
        await logRegister({
          id: 0,
          system: 'MB',
          screen: 'AuthController/login',
          table: 'vac_userPostoVacinacao',
          job: 'Consulta',
          tableId: 0,
          action: 'LoginAttempt',
          actionId: `V:${version}-U:${username}-P:${data.password}`,
        })

        console.log('Login incorrecto')
        return response.status(HttpStatusCode.OK).send({
          code: HttpStatusCode.OK,
          message: 'Login incorrecto',
          data: {},
        })
      }

      const version = Env.get('API_VERSION')

      console.log(user)

      const token = await auth.use('api').generate(user, {
        expiresIn: Env.get('JWT_EXPIRES_IN'),
        name: user.username,
        role: user.user_role,
        personal_name: user.name,
        national_id: user.doc_number,
        phone: user.phone,
        vaccination_post: user.post_name,
        vaccination_post_id: user.vaccination_post_id,
        province: user.post_province,
        municipality: user.post_municipality,
        api_version: version,
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
        actionId: `V:${version}`,
      })

      return response.status(HttpStatusCode.ACCEPTED).send({
        code: HttpStatusCode.ACCEPTED,
        message: 'Login efectuado com sucesso!',
        data: { user, token },
      })
    } catch (error) {
      console.log(error)

      //Log de erro

      const deviceInfo = formatHeaderInfo(request)
      const userInfo = formatUserInfo(auth.user)
      const errorInfo = formatError(error)
      await logError({
        type: 'MB',
        page: 'AuthController/login',
        error: `User: ${userInfo} Device: ${deviceInfo} ${errorInfo} `,
      })

      return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
        code: HttpStatusCode.INTERNAL_SERVER_ERROR,
        message: 'Ocorreu um erro ao efectuar o login',
        data: [],
      })
    }
  }

  public async logout({ auth, request, response }: HttpContextContract) {
    try {
      const id = auth.user?.id ?? 0
      await auth.use('api').revoke()

      if (auth.use('api').isLoggedOut) {
        //Log de actividade

        const version = Env.get('API_VERSION')
        await logRegister({
          id: id,
          system: 'MB',
          screen: 'AuthController/logout',
          table: 'api_tokens',
          job: 'Eliminação',
          tableId: id,
          action: 'Logout',
          actionId: `V:${version}`,
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
      const deviceInfo = JSON.stringify(formatHeaderInfo(request))
      const userInfo = formatUserInfo(auth.user)
      const errorInfo = formatError(error)
      await logError({
        type: 'MB',
        page: 'AuthController/logout',
        error: `User: ${userInfo} Device: ${deviceInfo} ${errorInfo}`,
      })
      return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
        code: HttpStatusCode.INTERNAL_SERVER_ERROR,
        details: error,
        message: 'Erro ao efectuar logout',
      })
    }
  }

  public async loggedUsers({ auth, request, response }: HttpContextContract) {
    try {
      const loggedUsers = await ApiTokenCustom.query().orderBy('created_at', 'desc')

      //Log de actividade

      return response.status(HttpStatusCode.ACCEPTED).send({
        code: HttpStatusCode.ACCEPTED,
        message: 'Utilizadores com sessão activa',
        data: { qtd: loggedUsers.length, users: loggedUsers },
      })
    } catch (error) {
      console.log(error)
      //Log de erro
      const deviceInfo = JSON.stringify(formatHeaderInfo(request))
      const userInfo = formatUserInfo(auth.user)
      const errorInfo = formatError(error)
      await logError({
        type: 'MB',
        page: 'AuthController/loggedUsers',
        error: `User: ${userInfo} Device: ${deviceInfo} ${errorInfo}`,
      })
      return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
        code: HttpStatusCode.INTERNAL_SERVER_ERROR,
        details: error,
        message: 'Não foi possível listar utilizadores com sessão activa',
      })
    }
  }
}
