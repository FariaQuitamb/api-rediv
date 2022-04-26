import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import DocType from 'App/Models/DocType'
import Nationality from 'App/Models/Nationality'
import Province from 'App/Models/Province'
import Vaccine from 'App/Models/Vaccine'
import HttpStatusCode from 'Contracts/enums/HttpStatusCode'
import logRegister from 'Contracts/functions/log_register'

export default class PreloadsController {
  public async index({ auth, response }: HttpContextContract) {
    try {
      const provinces = await Province.query().preload('municipalities')

      const nationalities = await Nationality.all()

      const docTypes = await DocType.all()

      const vaccines = await Vaccine.query().preload('lots').preload('doses')

      if (!provinces) {
        return response.status(HttpStatusCode.OK).send({
          code: HttpStatusCode.OK,
          message: 'Não foi possível obter os dados das províncias',
          data: [],
        })
      }

      if (!nationalities) {
        return response.status(HttpStatusCode.OK).send({
          code: HttpStatusCode.OK,
          message: 'Não foi possível obter os dados das nacionalidades',
          data: [],
        })
      }

      if (!docTypes) {
        return response.status(HttpStatusCode.OK).send({
          code: HttpStatusCode.OK,
          message: 'Não foi possível obter os tipos de documento',
          data: [],
        })
      }

      if (!vaccines) {
        return response.status(HttpStatusCode.OK).send({
          code: HttpStatusCode.OK,
          message: 'Não foi possível obter os dados das vacinas',
          data: [],
        })
      }

      //Log de actividade

      await logRegister({
        id: auth.user?.id ?? 0,
        system: 'API_MB',
        screen: 'PreloadController/index',
        table: 'Provincia/Municipio/Tipo documentos/Vacinas',
        job: 'Consulta',
        tableId: 0,
        action: 'Pré-carregamento',
        actionId: '',
      })

      return response.status(HttpStatusCode.ACCEPTED).send({
        message: 'Dados de pré-carregamento!',
        code: HttpStatusCode.ACCEPTED,
        data: { provinces, nationalities, docTypes, vaccines },
      })
    } catch (error) {
      console.log(error)
      return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
        code: HttpStatusCode.INTERNAL_SERVER_ERROR,
        message: 'Ocorreu um erro ao  obter os dados de pré-carregamento',
        data: [],
      })
    }
  }
}
