import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Vaccination from 'App/Models/Vaccination'
import VaccinationValidator from 'App/Validators/VaccinationValidator'

export default class VaccinationsController {
  // public async index({ response }: HttpContextContract) {}
  public async store({ response, request }: HttpContextContract) {
    const vaccinationData = await request.validate(VaccinationValidator)

    try {
      const vaccination = await Vaccination.create(vaccinationData)

      return vaccination
    } catch (error) {
      console.log(error)
    }
  }
}
