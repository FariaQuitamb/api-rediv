import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import DocType from 'App/Models/DocType'
import Nationality from 'App/Models/Nationality'
import Province from 'App/Models/Province'
import Vaccine from 'App/Models/Vaccine'

export default class PreloadsController {
  public async index({ response }: HttpContextContract) {
    try {
      const provinces = await Province.query().preload('municipalities')

      const nationalities = await Nationality.all()

      const docTypes = await DocType.all()

      const vaccines = await Vaccine.query().preload('lots').preload('doses')

      if (!provinces) {
        return response.status(200).send({
          code: 200,
          message: 'Não foi possível obter os dados das províncias',
          data: [],
        })
      }

      if (!nationalities) {
        return response.status(200).send({
          code: 200,
          message: 'Não foi possível obter os dados das nacionalidades',
          data: [],
        })
      }

      if (!docTypes) {
        return response.status(200).send({
          code: 200,
          message: 'Não foi possível obter os tipos de documento',
          data: [],
        })
      }

      if (!vaccines) {
        return response.status(200).send({
          code: 200,
          message: 'Não foi possível obter os dados das vacinas',
          data: [],
        })
      }

      return response.send({ provinces, nationalities, docTypes, vaccines })
    } catch (error) {
      console.log(error)
      return response.status(200).send({
        code: 200,
        message: 'Ocorreu um erro ao  obter os dados de pré-carregamento',
        data: [],
      })
    }
  }
}
