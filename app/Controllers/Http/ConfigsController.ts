import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import MobileVersionValidator from 'App/Validators/MobileVersionValidator copy'
import HttpStatusCode from 'Contracts/enums/HttpStatusCode'
import formatError from 'Contracts/functions/format_error'
import formatHeaderInfo from 'Contracts/functions/format_header_info'
import formatUserInfo from 'Contracts/functions/format_user_info'
import logError from 'Contracts/functions/log_error'
import fs from 'fs/promises'
import path from 'path'

export default class ConfigsController {
  public async changeAppVersion({ auth, request, response }: HttpContextContract) {
    const versionData = await request.validate(MobileVersionValidator)
    try {
      const fileName = path.resolve(__dirname, '../../../', 'json', 'mobile_version.json')
      const content = { mobile_app_version: versionData.mobileVersion }
      const str = JSON.stringify(content)

      await fs.writeFile(fileName, str)

      const newData = await fs.readFile(fileName, 'utf8')
      const version = JSON.parse(newData)

      console.log('\x1b[1m\x1b[102m\x1b[97mVersão actual da aplicação mobile modificada!\x1b[0m')

      console.log('\x1b[2m', '\x1b[31m', '\x1b[44m', 'Sample Text', '\x1b[0m')

      return response.status(HttpStatusCode.CREATED).send({
        message: 'Versão actual da aplicação mobile modificada!',
        code: HttpStatusCode.CREATED,
        data: { version: version?.mobile_app_version },
      })
    } catch (error) {
      const deviceInfo = JSON.stringify(formatHeaderInfo(request))
      const userInfo = formatUserInfo(auth.user)
      const errorInfo = formatError(error)

      await logError({
        type: 'MB',
        page: 'ConfigsController/changeAppVersion',
        error: `User:${userInfo} Device: ${deviceInfo} - ${errorInfo}`,
      })

      return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
        message: 'Não foi possível modificar a versão actual da aplicação mobile!',
        code: HttpStatusCode.INTERNAL_SERVER_ERROR,
        data: [],
      })
    }
  }

  public async getMobileVersion({ auth, request, response }: HttpContextContract) {
    try {
      const fileName = path.resolve(__dirname, '../../../', 'json', 'mobile_version.json')

      const newData = await fs.readFile(fileName, 'utf8')
      const version = JSON.parse(newData)

      console.log('\x1b[36m', 'sometext', '\x1b[0m')
      console.log("\nI'm the normal output")
      console.log("\x1b[31mAnd now I'm red!")
      console.log('Shoot, why am I still red?')
      console.log('I need to \x1b[0mreset my console to get back to normal')
      console.log(
        'Colors \x1b[32mcan \x1b[33mchange \x1b[35min \x1b[36mthe \x1b[34msame \x1b[0mlog'
      )
      console.log(
        '\x1b[1mBRIGHT colors \x1b[32mare \x1b[33mbolded \x1b[35mand \x1b[36mbrighter \x1b[0m'
      )
      console.log('\x1b[2mDIM colors \x1b[32mare \x1b[33mdarker \x1b[0m')
      console.log('and of course, \x1b[41mwe have \x1b[30m\x1b[43mbackground colors\x1b[0m')
      console.log(
        '\x1b[7mReverse \x1b[32mswap \x1b[33mforeground \x1b[35mand \x1b[36mbackground\x1b[0m'
      )
      console.log(
        '\x1b[8m\x1b[41mthis [1mtext \x1b[43mis hidden \x1b[42mbut the background\x1b[42m still comes \x1b[45mthrough\x1b[0m'
      )
      console.log(
        '\x1b[4mgetting  \x1b[1mfancy with underlines \x1b[30m\x1b[3m\x1b[105mand italics\x1b[0m'
      )
      console.log(
        ' \x1b[36m \x1b[1mVersão actual da aplicação mobile : ' + version?.mobile_app_version
      )
      return response.status(HttpStatusCode.OK).send({
        message: 'Versão actual da aplicação mobile : ' + version?.mobile_app_version,
        code: HttpStatusCode.OK,
        data: { version: version?.mobile_app_version },
      })
    } catch (error) {
      const deviceInfo = JSON.stringify(formatHeaderInfo(request))
      const userInfo = formatUserInfo(auth.user)
      const errorInfo = formatError(error)

      await logError({
        type: 'MB',
        page: 'ConfigsController/getMobileVersion',
        error: `User:${userInfo} Device: ${deviceInfo} - ${errorInfo}`,
      })

      return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
        message: 'Não foi possível obter a versão actual da aplicação mobile!',
        code: HttpStatusCode.INTERNAL_SERVER_ERROR,
        data: [],
      })
    }
  }

  public async store({}: HttpContextContract) {}

  public async show({}: HttpContextContract) {}

  public async edit({}: HttpContextContract) {}

  public async update({}: HttpContextContract) {}

  public async destroy({}: HttpContextContract) {}
}
