import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Person from 'App/Models/Person'
import Vaccination from 'App/Models/Vaccination'
import Vaccine from 'App/Models/Vaccine'
import VaccinationValidator from 'App/Validators/VaccinationValidator'

export default class VaccinationsController {
  // public async index({ response }: HttpContextContract) {}

  public async secondOrBooster({ response, request }: HttpContextContract) {
    const vaccinationData = await request.validate(VaccinationValidator)

    try {
      const person = await Person.find(vaccinationData.personId)

      /*const v = await Vaccination.create(vaccinationData)
      return v */

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
        //Se for primeira dose ou dose única , não deve ter outra vacina feita
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
          const PersonfirstDose = await Vaccination.query()
            .preload('person')
            //.preload('vaccine')
            .preload('dose', (queryDose) => {
              queryDose.where('Nome', '1ª Dose')
            })
            .where('Id_regIndividual', person.id)

          //Não permite que se tenha outro registro além de apenas 1 que deve ser da 1ª dose
          if (PersonfirstDose.length > 1) {
            console.log(
              'O utente possuí mais de 1 registro de vacina! - Se esperava apenas 1 registro de vacina'
            )
            return response.status(200).send({
              message:
                'O utente possuí mais de 1 registro de vacina, se esperava apenas 1 registro de vacina referente a 1ª dose !',
              code: '200',
              data: [],
            })
          }

          //Verifica se existe alguma vacina do utente
          if (PersonfirstDose.length > 0) {
            //Verifica se a vacina do utente tem a primeira dose
            if (!PersonfirstDose[0].dose) {
              console.log(
                'O utente ainda não fez a primeira dose! - O registro de vacina não possuí a 1ª Dose'
              )
              return response.status(200).send({
                message: 'O utente ainda não fez a primeira dose!',
                code: '200',
                data: [],
              })
            }
          } else {
            console.log('O utente ainda não fez a primeira dose! - Sem registro de vacina')
            return response.status(200).send({
              message: 'O utente ainda não fez a primeira dose!',
              code: '200',
              data: [],
            })
          }
        }

        //Mensagem para verificar os dados enviados
        //Caso não seja reforço e não seja vacinação pela primeira vez e nem pela segunda
      }

      if (vaccinationData.status === 'R') {
        //Verificar se tem o ciclo de vacinação completo segunda dose | dose única
        const personVaccinations = await Vaccination.query()
          .preload('person')
          .preload('dose', (queryDose) => {
            queryDose.where('Nome', '2ª Dose').orWhere('Nome', 'Dose Única')
          })
          .where('Id_regIndividual', person.id)
          .limit(10)

        var personDoses = personVaccinations.filter(function (vaccination) {
          return vaccination.dose?.name === 'Dose Única' || vaccination.dose?.name === '2ª Dose'
        })

        if (personDoses.length === 0) {
          console.log('O utente ainda não completou o ciclo de vacinação!')
          return response.status(200).send({
            message: 'O utente ainda não completou o ciclo de vacinação!',
            code: '200',
            data: [],
          })
        }
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

  public async store({ response, request }: HttpContextContract) {
    const vaccinationData = await request.validate(VaccinationValidator)

    try {
      const person = await Person.find(vaccinationData.personId)

      /*const v = await Vaccination.create(vaccinationData)
      return v */

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

      //
      //
      //
      //Verifica se a vacina existe
      //E se a dose selecionada pertence a vacina pré-selecionada
      //
      //
      //
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

      //
      //
      //
      /* Dose existe e pertence a vacina selecionada */
      //
      //
      //

      const selectedDose = vaccineDose.doses[0]

      //
      //
      //
      //Caso não esteja realizando dose de reforço  - 1ª ou 2ª dose
      //
      //
      //
      if (vaccinationData.status !== 'R') {
        //
        //
        //Verificação caso seja a primeira dose ou dose única
        //
        //Se for primeira dose ou dose única , não deve ter outra vacina feita
        //
        //
        //
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

        //
        //
        //Verificação caso seja a segunda dose
        //Caso esteja registrando a segunda dose
        //
        //
        //
        if (selectedDose.name === '2ª Dose') {
          const PersonfirstDose = await Vaccination.query()
            .preload('person')
            //.preload('vaccine')
            .preload('dose', (queryDose) => {
              queryDose.where('Nome', '1ª Dose')
            })
            .where('Id_regIndividual', person.id)

          //Não permite que se tenha outro registro além de apenas 1 que deve ser da 1ª dose

          if (PersonfirstDose.length > 1) {
            console.log(
              'O utente possuí mais de 1 registro de vacina! - Se esperava apenas 1 registro de vacina'
            )
            return response.status(200).send({
              message:
                'O utente possuí mais de 1 registro de vacina, se esperava apenas 1 registro de vacina referente a 1ª dose !',
              code: '200',
              data: [],
            })
          }

          /*Verifica se existe alguma vacina do utente*/
          if (PersonfirstDose.length > 0) {
            //Verifica se a vacina do utente tem a primeira dose
            if (!PersonfirstDose[0].dose) {
              console.log(
                'O utente ainda não fez a primeira dose! - O registro de vacina não possuí a 1ª Dose'
              )
              return response.status(200).send({
                message: 'O utente ainda não fez a primeira dose!',
                code: '200',
                data: [],
              })
            }
          } else {
            console.log('O utente ainda não fez a primeira dose! - Sem registro de vacina')
            return response.status(200).send({
              message: 'O utente ainda não fez a primeira dose!',
              code: '200',
              data: [],
            })
          }
        } else {
          //Mensagem para verificar os dados enviados
          //Caso não seja reforço e não seja vacinação pela primeira vez e nem pela segunda
          console.log('Dose escolhida  está fora das doses usadas como padrão!')
          return response.status(200).send({
            message: 'Dose escolhida  está fora das doses usadas como padrão!',
            code: '200',
            data: [],
          })
        }
      }

      //
      //
      //
      //Verificação para o caso de dose de reforço
      //
      //
      //

      if (vaccinationData.status === 'R') {
        //Verificar se tem o ciclo de vacinação completo segunda dose | dose única
        const personVaccinations = await Vaccination.query()
          .preload('person')
          .preload('dose', (queryDose) => {
            queryDose.where('Nome', '2ª Dose').orWhere('Nome', 'Dose Única')
          })
          .where('Id_regIndividual', person.id)
          .limit(10)

        var personDoses = personVaccinations.filter(function (vaccination) {
          return vaccination.dose?.name === 'Dose Única' || vaccination.dose?.name === '2ª Dose'
        })

        if (personDoses.length === 0) {
          console.log('O utente ainda não completou o ciclo de vacinação!')
          return response.status(200).send({
            message: 'O utente ainda não completou o ciclo de vacinação!',
            code: '200',
            data: [],
          })
        }
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
