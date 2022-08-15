// import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import Env from '@ioc:Adonis/Core/Env'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import { Md5 } from 'ts-md5'
import AuthValidator from 'App/Validators/AuthValidator'

import { string } from '@ioc:Adonis/Core/Helpers'
import HttpStatusCode from 'Contracts/enums/HttpStatusCode'
import formatError from 'Contracts/functions/format_error'
import logError from 'Contracts/functions/log_error'

import Database from '@ioc:Adonis/Lucid/Database'
import constants from 'Contracts/constants/constants'
import formatUserInfo from 'Contracts/functions/format_user_info'
import formatHeaderInfo from 'Contracts/functions/format_header_info'
import ApiTokenCustom from 'App/Models/ApiTokenCustom'
import generateQuery from 'Contracts/functions/generate_query'
import LoggedUserValidator from 'App/Validators/LoggedUserValidator'
import LoggedUserViewValidator from 'App/Validators/LoggedUserViewValidator'
import deviceInfo from 'Contracts/functions/device_info '
import formatedLog, { LogType } from 'Contracts/functions/formated_log'
import addActivityLogJob from 'App/bullmq/queue/queue'
import LoggedUserActivityValidator from 'App/Validators/LoggedUserActivityValidator'

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
        const log = {
          id: 0,
          system: 'MB',
          screen: 'AuthController/login',
          table: 'vac_userPostoVacinacao',
          job: 'Consulta',
          tableId: 0,
          action: 'LoginAttempt',
          actionId: `V:${version}`,
        }

        await addActivityLogJob(log)

        formatedLog({
          text: 'Login incorrecto',
          data: data,
          auth: auth,
          request: request,
          type: LogType.error,
          tag: { key: 'exceptions', value: 'Erros' },
          context: { controller: 'AuthController', method: 'login' },
        })

        return response.status(HttpStatusCode.OK).send({
          code: HttpStatusCode.OK,
          message: 'Login incorrecto',
          data: {},
        })
      }

      const version = Env.get('API_VERSION')

      const headers = request.headers()
      const device = deviceInfo(headers)

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
        commune: '',
        latitude: device?.latitude,
        longitude: device?.longitude,
        mac_address: device?.mac,
        app_version: device.version,
      })

      const id = auth.user?.id ?? 0
      //Log de actividade
      const log = {
        id: id,
        system: 'MB',
        screen: 'AuthController/login',
        table: 'vac_userPostoVacinacao',
        job: 'Consulta',
        tableId: id,
        action: 'Login',
        actionId: `V:${version}`,
      }
      await addActivityLogJob(log)

      formatedLog({
        text: 'Login efectuado com sucesso',
        data: { user: data.username },
        auth: auth,
        request: request,
        type: LogType.success,
      })

      return response.status(HttpStatusCode.ACCEPTED).send({
        code: HttpStatusCode.ACCEPTED,
        message: 'Login efectuado com sucesso',
        data: { user, token },
      })
    } catch (error) {
      //Log de erro

      const deviceInfo = formatHeaderInfo(request)
      const userInfo = formatUserInfo(auth.user)
      const errorInfo = formatError(error)
      await logError({
        type: 'MB',
        page: 'AuthController/login',
        error: `User: ${userInfo} Device: ${deviceInfo} ${errorInfo} `,
        request: request,
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
        const log = {
          id: id,
          system: 'MB',
          screen: 'AuthController/logout',
          table: 'api_tokens',
          job: 'Eliminação',
          tableId: id,
          action: 'Logout',
          actionId: `V:${version}`,
        }

        await addActivityLogJob(log)

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
      //Log de erro
      const deviceInfo = JSON.stringify(formatHeaderInfo(request))
      const userInfo = formatUserInfo(auth.user)
      const errorInfo = formatError(error)
      await logError({
        type: 'MB',
        page: 'AuthController/logout',
        error: `User: ${userInfo} Device: ${deviceInfo} ${errorInfo}`,
        request: request,
      })
      return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
        code: HttpStatusCode.INTERNAL_SERVER_ERROR,
        details: error,
        message: 'Erro ao efectuar logout',
      })
    }
  }

  public async loggedUsers({ auth, request, response }: HttpContextContract) {
    const searchData = await request.validate(LoggedUserValidator)
    try {
      const fields: Array<{ field: string; value: any }> = [
        { field: 'id', value: searchData.id },
        { field: 'user_id', value: searchData.userId },
        { field: 'name', value: searchData.username },

        { field: 'expires_at', value: searchData.expiresAt },
        { field: 'created_at', value: searchData.sessionDate },

        { field: 'personal_name', value: searchData.personalName },
        { field: 'national_id', value: searchData.nationalID },

        { field: 'phone', value: searchData.phone },

        { field: 'role', value: searchData.role },

        { field: 'vaccination_post', value: searchData.vaccinationPost },

        { field: 'vaccination_post_id', value: searchData.vaccinationPostId },

        { field: 'province', value: searchData.province },
        { field: 'municipality', value: searchData.municipality },

        { field: 'latitude', value: searchData.latitude },
        { field: 'longitude', value: searchData.longitude },

        { field: 'mac_address', value: searchData.mac },

        { field: 'api_version', value: searchData.apiVersion },
        { field: 'app_version', value: searchData.appVersion },
      ]

      const query = generateQuery(fields)

      const loggedUsers = await ApiTokenCustom.query()
        .whereRaw(query)
        .orderBy('created_at', 'desc')
        .paginate(searchData.page, searchData.limit)

      return response.status(HttpStatusCode.OK).send({
        message: 'Usuários com login activo na API : ' + query,
        code: HttpStatusCode.OK,
        data: loggedUsers,
      })
    } catch (error) {
      //Log de erro
      const deviceInfo = JSON.stringify(formatHeaderInfo(request))
      const userInfo = formatUserInfo(auth.user)
      const errorInfo = formatError(error)
      await logError({
        type: 'MB',
        page: 'AuthController/loggedUsers',
        error: `User: ${userInfo} Device: ${deviceInfo} ${errorInfo}`,
        request: request,
      })
      return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
        code: HttpStatusCode.INTERNAL_SERVER_ERROR,
        details: error,
        message: 'Não foi possível listar utilizadores com sessão activa',
      })
    }
  }

  public async loggedUsersView({ auth, request, response }: HttpContextContract) {
    const searchData = await request.validate(LoggedUserViewValidator)
    try {
      const fields: Array<{ field: string; value: any }> = [
        { field: 'id', value: searchData.id },
        { field: 'Id_userPostoVacinacao', value: searchData.userId },
        { field: 'Utilizador', value: searchData.username },

        { field: 'expires_at', value: searchData.expiresAt },
        { field: 'created_at', value: searchData.sessionDate },

        { field: 'Nome', value: searchData.personalName },

        { field: 'BI', value: searchData.nationalID },

        { field: 'Telefone', value: searchData.phone },

        { field: 'Funcao', value: searchData.role },

        { field: 'Posto', value: searchData.vaccinationPost },

        { field: 'Id_postoVacinacao', value: searchData.vaccinationPostId },

        { field: 'ProvPosto', value: searchData.province },
        { field: 'MunicPosto', value: searchData.municipality },
        { field: 'api_version', value: searchData.apiVersion },
        { field: 'app_version', value: searchData.appVersion },

        /*  { field: 'Latitude', value: searchData.latitude },
        { field: 'Longitude', value: searchData.longitude },*/

        { field: 'NomeResp', value: searchData.postManagerName },
        { field: 'BIResp', value: searchData.postManagerNationalId },
        { field: 'TelResp', value: searchData.postManagerPhone },
      ]

      const query = generateQuery(fields)

      const loggedUsers = await Database.from(constants.mainSource)
        .select(constants.loggedUserFields)
        .joinRaw(constants.sources)
        .whereRaw(query)
        .orderBy('id', 'desc')
        .paginate(searchData.page, searchData.limit)

      return response.status(HttpStatusCode.OK).send({
        message: 'Usuários com login activo na API : ' + query,
        code: HttpStatusCode.OK,
        data: loggedUsers,
      })
    } catch (error) {
      //Log de erro
      const deviceInfo = JSON.stringify(formatHeaderInfo(request))
      const userInfo = formatUserInfo(auth.user)
      const errorInfo = formatError(error)
      await logError({
        type: 'MB',
        page: 'AuthController/loggedUsers',
        error: `User: ${userInfo} Device: ${deviceInfo} ${errorInfo} `,
        request: request,
      })
      return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
        code: HttpStatusCode.INTERNAL_SERVER_ERROR,
        details: error,
        message: 'Não foi possível listar utilizadores com sessão activa',
      })
    }
  }

  public async aboutIUsage({ auth, request, response }: HttpContextContract) {
    const searchData = await request.validate(LoggedUserActivityValidator)
    try {
      const fields: Array<{ field: string; value: any }> = [
        { field: '[ID_Login]', value: searchData.userId },
        { field: '[SIGIS].[dbo].[vac_userPostoVacinacao].[Nome]', value: searchData.personalName },
        {
          field: '[SIGIS].[dbo].[vac_userPostoVacinacao].[Utilizador]',
          value: searchData.username,
        },
        { field: '[BI]', value: searchData.nationalID },
        { field: '[Telefone]', value: searchData.phone },
        { field: '[SIGIS].[dbo].[vac_tipoFuncPostoVac].[Nome]', value: searchData.role },
        { field: '[NomeEM] ', value: searchData.postName },
        { field: '[NomeResp] ', value: searchData.postManagerName },
        { field: '[BIResp] ', value: searchData.postManagerNationalId },
        { field: '[TelResp]', value: searchData.postManagerPhone },
        { field: '[SIGIS].[dbo].[Provincia].[Nome]', value: searchData.province },
        { field: '[SIGIS].[dbo].[Municipio].[Nome]', value: searchData.municipality },
        { field: 'Data', value: searchData.date },
      ]

      let query = generateQuery(fields)

      //Logged in
      const loggedUsers = await Database.from(constants.mainTable)

        .select(constants.userFields)
        .where('Sistema', 'MB')
        .where('Acao', 'Login')
        .joinRaw(constants.userJoinQuery)
        .whereRaw(query)
        .orderBy('Data', 'desc')
        .paginate(searchData.page, searchData.limit)

      //Active

      let newQuery = query.replace('[Data]', '[created_at]')

      newQuery = newQuery.replace('[ID_Login]', '[Id_userPostoVacinacao]')
      newQuery = newQuery.replace(
        '[SIGIS].[dbo].[vac_userPostoVacinacao].[Utilizador]',
        '[Utilizador]'
      )

      newQuery = newQuery.replace('[SIGIS].[dbo].[vac_userPostoVacinacao].[Nome]', '[Nome]')

      newQuery = newQuery.replace('[SIGIS].[dbo].[vac_tipoFuncPostoVac].[Nome]', '[Funcao]')

      newQuery = newQuery.replace('[NomeEM]', '[Posto]')
      newQuery = newQuery.replace('[SIGIS].[dbo].[Provincia].[Nome]', '[ProvPosto]')

      newQuery = newQuery.replace('[SIGIS].[dbo].[Municipio].[Nome]', '[MunicPosto]')

      const activeUsers = await Database.from(constants.mainSource)
        .select(constants.loggedUserFields)
        .joinRaw(constants.sources)
        .whereRaw(newQuery)
        .orderBy('id', 'desc')
        .paginate(searchData.page, searchData.limit)

      //Logged out

      const loggedOutUsers = await Database.from(constants.mainTable)

        .select(constants.userFields)
        .where('Sistema', 'MB')
        .where('Acao', 'Logout')
        .joinRaw(constants.userJoinQuery)
        .whereRaw(query)
        .orderBy('Data', 'desc')
        .paginate(searchData.page, searchData.limit)

      /*
  --Quantos fizeram login
  --Quantos activos  
  --Quantos  fizeram logout
        */

      const info = {
        loggged_in: loggedUsers.total,
        active: activeUsers.total,
        logged_out: loggedOutUsers.total,

        userListByAboveCategory: {
          loggged_in: loggedUsers.toJSON(),
          active: activeUsers.toJSON(),
          logged_out: loggedOutUsers.toJSON(),
        },
      }

      return response.status(HttpStatusCode.OK).send({
        message: 'Situação dos utilizadores LogQuery :' + query + 'ApiTokensQuery :' + newQuery,
        code: HttpStatusCode.OK,
        data: info,
      })
    } catch (error) {
      //Log de erro
      const deviceInfo = JSON.stringify(formatHeaderInfo(request))
      const userInfo = formatUserInfo(auth.user)
      const errorInfo = formatError(error)
      await logError({
        type: 'MB',
        page: 'AuthController/aboutUsers',
        error: `User: ${userInfo} Device: ${deviceInfo} ${errorInfo} `,
        request: request,
      })
      return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
        code: HttpStatusCode.INTERNAL_SERVER_ERROR,
        details: error,
        message: 'Não foi possível obter informação sobre os utilizadores',
      })
    }
  }
}
