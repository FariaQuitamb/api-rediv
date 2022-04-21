import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import Person from 'App/Models/Person'
import Vaccination from 'App/Models/Vaccination'
import Vaccine from 'App/Models/Vaccine'
import VaccinationValidator from 'App/Validators/VaccinationValidator'
import constants from 'Contracts/constants/constants'
import HttpStatusCode from 'Contracts/enums/HttpStatusCode'

export default class VaccinationsController {
  public async store({ response, request }: HttpContextContract) {
    const vaccinationData = await request.validate(VaccinationValidator)

    try {
      //
      //Verifica se a vacina existe
      //E se a dose selecionada pertence a vacina pré-selecionada
      //
      const vaccineDose = await Vaccine.query()
        .preload('doses', (queryDose) => {
          queryDose.where('Id_DoseVacina', vaccinationData.doseId).where('Visualizar', 'S')
        })
        .where('Id_Vacina', vaccinationData.vaccineId)
        .where('Visualizar', 'S')
        .first()

      //Verifica se a vacina selecionada existe
      if (vaccineDose) {
        //Verifica se a dose selecionada pertence a vacina pré-selecionada
        if (vaccineDose.doses.length === 0) {
          console.log(
            'A dose selecionada não pertence a essa vacina ou dose não habilitada - visualizar != S !'
          )
          return response.status(HttpStatusCode.OK).send({
            message: 'A dose selecionada não pertence a essa vacina ou dose fora de uso!',
            code: HttpStatusCode.OK,
            data: [],
          })
        }
      } else {
        console.log('A vacina selecionada não existe ou não está habilitada! - visualizar != S')
        return response.status(HttpStatusCode.OK).send({
          message: 'A vacina selecionada não existe ou  fora de uso!',
          code: HttpStatusCode.OK,
          data: [],
        })
      }

      //Busca a informação da vacina do utente e se tem segunda dose para tomar
      const takenDoses = await Database.rawQuery(constants.sqlFirstSecondDose, [
        vaccinationData.personId,
      ])

      //Caso não tenha feito nenhuma vacina até o momento
      if (takenDoses.length === 0) {
        //Buscar primeira dose da vacina selecionada
      }
    } catch (error) {
      console.log(error)
    }
  }
}
