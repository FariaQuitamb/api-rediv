import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import HttpStatusCode from 'Contracts/enums/HttpStatusCode'
import formatedLog, { LogType } from 'Contracts/functions/formated_log'
import Env from '@ioc:Adonis/Core/Env'
import Equipment from '../../Models/Equipment'
import EquipmentValidator from '../../Validators/EquipmentValidator'
import addActivityLogJob from 'App/bullmq/queue/queue'
import logError from 'Contracts/functions/log_error'
import formatError from 'Contracts/functions/format_error'
import formatHeaderInfo from 'Contracts/functions/format_header_info'
import formatUserInfo from 'Contracts/functions/format_user_info'

export default class EquipmentController {
  public async index({}: HttpContextContract) {}

  public async store({auth, response, request }: HttpContextContract) {
    const equipmentData = await request.validate(EquipmentValidator)
    try {
      const equipmentSaved = await Equipment.create(equipmentData)
      const version = Env.get('API_VERSION')

      const log = {
        id: auth.user?.id ?? 0,
        system: 'MB',
        screen: 'EquipmentController/store',
        table: 'reg_Equipamento',
        job: 'Cadastrar',
        tableId: equipmentSaved.id,
        action: 'Registo de equipamento',
        actionId: `V:${version}`,
      }
      await addActivityLogJob(log)

      formatedLog({
        text: 'equipamento registado com sucesso',
        type: LogType.success,
        data: equipmentSaved,
        auth: auth,
        request: request,
      })

      //Utente registado com sucesso
      return response.status(HttpStatusCode.CREATED).send({
        message: 'equipamento registado com sucesso',
        code: HttpStatusCode.CREATED,
        data: equipmentSaved,
      })
    } catch (error) {
      const userInfo = formatUserInfo(auth.user)
      const equipmentStr = JSON.stringify(equipmentData)

      const deviceInfo = JSON.stringify(formatHeaderInfo(request))
      const errorInfo = formatError(error)

      await logError({
        type: 'MB',
        page: 'EquipmentController/store',
        error: `User:${userInfo} Device: ${deviceInfo} Dados : ${equipmentStr} - ${errorInfo}`,
        request: request,
      })

      const substring = 'Timeout: Request failed to complete in'

      if (errorInfo.includes(substring)) {
        formatedLog({
          text: 'Não foi possível realizar a operação de registo de equipamento dentro do tempo esperado',
          type: LogType.warning,
          data: equipmentData,
          auth: auth,
          request: request,
        })

        return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
          message: 'Não foi possível completar a operação dentro do tempo esperado',
          code: HttpStatusCode.INTERNAL_SERVER_ERROR,
          data: [],
        })
      }

      return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
        message: 'Ocorreu um erro no servidor',
        code: HttpStatusCode.INTERNAL_SERVER_ERROR,
        data: [],
      })
    }
  }

  public async show({}: HttpContextContract) {}

  public async edit({}: HttpContextContract) {}

  public async update({}: HttpContextContract) {}

  public async destroy({}: HttpContextContract) {}
}



