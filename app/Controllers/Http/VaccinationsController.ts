import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Person from 'App/Models/Person'
import Vaccination from 'App/Models/Vaccination'
import VaccinationValidator from 'App/Validators/VaccinationValidator'

export default class VaccinationsController {
  // public async index({ response }: HttpContextContract) {}
  public async store({ response, request }: HttpContextContract) {
    const vaccinationData = await request.validate(VaccinationValidator)

    try {
      const person = await Person.find(vaccinationData.personId)

      if (!person) {
        return response.status(200).send({
          message: 'Registro individual não encontrado!',
          code: '200',
          data: [],
        })
      }

      const vaccination = await Vaccination.create(vaccinationData)

      await vaccination.load('person')

      return response.status(201).send({
        message: 'Utente vacinado com sucesso!',
        code: 201,
        data: { vaccination: vaccination },
      })
    } catch (error) {
      console.log(error)
      return response.status(500).send({
        message: 'Ocorreu um erro no servidor!',
        code: '500',
        data: [],
      })
    }
  }
}
