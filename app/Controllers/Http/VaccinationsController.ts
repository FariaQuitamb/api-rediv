import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Person from 'App/Models/Person'
import Vaccination from 'App/Models/Vaccination'
import Vaccine from 'App/Models/Vaccine'
import VaccinationValidator from 'App/Validators/VaccinationValidator'

export default class VaccinationsController {
  // public async index({ response }: HttpContextContract) {}
  public async store({ response, request }: HttpContextContract) {
    const vaccinationData = await request.validate(VaccinationValidator)

    try {
      const person = await Person.find(vaccinationData.personId)

      //RN [001]
      if (!person) {
        return response.status(200).send({
          message: 'Registro individual não encontrado!',
          code: '200',
          data: [],
        })
      }

      //RN [001]
      if (person.status !== 'C') {
        console.log('O status do registro individual é diferente de C')
        return response.status(200).send({
          message: 'O registro individual não reune condições para vacinação!',
          code: '200',
          data: [],
        })
      }

      //Verifica se a vacina existe
      //E se a dose selecionada pertence a vacina pré-selecionada

      const vaccineDose = await Vaccine.query()
        .preload('doses', (queryDose) => {
          queryDose.where('Id_DoseVacina', vaccinationData.doseId)
        })
        .where('Id_Vacina', vaccinationData.vaccineId)
        .first()

      //Verifica se a vacina selecionada existe
      if (vaccineDose) {
        //Verifica se a dose selecionada pertence a vacina pré-selecionada
        if (vaccineDose.doses.length === 0) {
          console.log('A dose selecionada não pertence a essa vacina!')
          return response.status(200).send({
            message: 'A dose selecionada não pertence a essa vacina!',
            code: '200',
            data: [],
          })
        }
      } else {
        console.log('A vacina selecionada não existe!')
        return response.status(200).send({
          message: 'A vacina selecionada não existe!',
          code: '200',
          data: [],
        })
      }
      /* Dose existe e pertence a vacina selecionada */

      // Verifica se o utente já tomou essa dose da vacina

      const selectedDose = vaccineDose.doses[0]

      //Caso não esteja realizando dose de reforço
      if (vaccinationData.status !== 'R') {
        //
        //Se for primeira dose ou dose única , não deve ter outra vacinafeita
        if (selectedDose.name === '1ª Dose' || selectedDose.name === 'Dose Única') {
          const personVaccinations = await Vaccination.query()
            .preload('person')
            //.preload('vaccine')
            .where('Id_regIndividual', person.id)
            .limit(1000)
          //Verifica se já possuí vacina
          if (personVaccinations.length > 0) {
            console.log(`O utente já possuí vacina não pode adicionar a ${selectedDose.name}!`)
            return response.status(200).send({
              message: `O utente já possuí vacina não pode adicionar a ${selectedDose.name}!`,
              code: '200',
              data: [],
            })
          }
        }

        //Caso esteja registrando a segunda dose
        if (selectedDose.name === '2ª Dose') {
          const personVaccinations = await Vaccination.query()
            .preload('person')
            .preload('vaccine')
            .preload('dose')
            .where('Id_regIndividual', person.id)
            //.where('Id_Dose', vaccinationData.doseId)
            .limit(1000)

          return { segundaDose: personVaccinations }
        }
      }

      if (selectedDose.name !== 'Dose Única') {
        const personVaccinations = await Vaccination.query()
          .preload('person')
          .preload('vaccine')
          .preload('dose')
          .where('Id_regIndividual', person.id)
          .where('Id_Dose', vaccinationData.doseId)
          .limit(1000)

        return personVaccinations
      }

      return 'Dose Única'

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
