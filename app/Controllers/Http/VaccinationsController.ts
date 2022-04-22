import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import Person from 'App/Models/Person'
import Vaccination from 'App/Models/Vaccination'
import Vaccine from 'App/Models/Vaccine'
import VaccinationValidator from 'App/Validators/VaccinationValidator'
import constants from 'Contracts/constants/constants'
import HttpStatusCode from 'Contracts/enums/HttpStatusCode'

interface DoseInfo {
  Id_regVacinacao: number
  Id_Dose: number
  NumDias: number
  PrxDose: number
  Id_Vacina: number
  DtProxDose: string
  DataCad: string
  NumDiasRestante: number
  NumDias2: number
  dtHoje: string
}
export default class VaccinationsController {
  public async store({ response, request }: HttpContextContract) {
    const vaccinationData = await request.validate(VaccinationValidator)

    try {
      const person = await Person.find(vaccinationData.personId)
      //
      //Verificar se o registro individual está habilitado a receber a vacina
      //
      //RN [001]
      if (!person) {
        return response.status(HttpStatusCode.OK).send({
          message: 'Registro individual não encontrado!',
          code: HttpStatusCode.OK,
          data: [],
        })
      }

      //RN [001]
      if (person.status !== 'C') {
        console.log('O status do registro individual é diferente de C')
        return response.status(HttpStatusCode.OK).send({
          message: 'O registro individual não reúne condições para vacinação!',
          code: HttpStatusCode.OK,
          data: [],
        })
      }

      //
      //Verificações da vacina e dose da vacina
      //
      const vaccineDose = await Vaccine.query()
        .preload('doses', (queryDose) => {
          queryDose.where('Id_DoseVacina', vaccinationData.doseId).where('Visualizar', 'S')
        })
        .where('Id_Vacina', vaccinationData.vaccineId)
        .where('Visualizar', 'S')
        .first()

      //Verifica se a vacina selecionada existe
      if (!vaccineDose) {
        console.log('A vacina selecionada não existe ou não está habilitada! - visualizar != S')
        return response.status(HttpStatusCode.OK).send({
          message: 'A vacina selecionada não existe ou está fora de uso!',
          code: HttpStatusCode.OK,
          data: [],
        })
      }

      //Busca a informação da vacina do utente e se tem segunda dose para tomar
      const takenDoses = await Database.rawQuery(constants.sqlFirstSecondDose, [
        vaccinationData.personId,
      ])

      //
      //1ª Dose e Dose Única
      //Caso não tenha feito nenhuma vacina até o momento
      //

      if (takenDoses.length === 0) {
        //Verificar o status enviado

        if (vaccinationData.status !== 'N') {
          console.log('O status da primeira vacina não pode ser diferente de N')
          return response.status(HttpStatusCode.OK).send({
            message: 'Verifique o status da vacinação enviado!',
            code: HttpStatusCode.OK,
            data: {},
          })
        }

        //Buscar primeira dose da vacina selecionada
        //Pega a primeira dose da vacina
        const vaccineFirstDose = await Database.rawQuery(constants.getFirstDose, [
          vaccinationData.vaccineId,
        ])

        //Verifica se existe a dose da vacina
        if (vaccineFirstDose.length === 0) {
          return response.status(HttpStatusCode.OK).send({
            message:
              'Informe ao Administrador do Sistema, que não está configurada nenhuma Dose da Vacina!',
            code: HttpStatusCode.OK,
            data: {},
          })
        }

        vaccinationData.doseId = vaccineFirstDose[0].Id_DoseVacina

        const vaccination = await Vaccination.create(vaccinationData)

        await vaccination.load('person')
        await vaccination.load('vaccine')
        await vaccination.load('dose')

        return response.status(HttpStatusCode.CREATED).send({
          message: 'Utente vacinado com sucesso!',
          code: HttpStatusCode.CREATED,
          data: { vaccination: vaccination },
        })
      }

      //
      //2ª Dose
      //Caso tenha próxima dose
      //

      const doseInfo = takenDoses[0] as DoseInfo

      if (doseInfo.PrxDose !== 0) {
        //
        //
        //

        //Verifica se já realizou uma vacina no corrente dia
        if (doseInfo.DataCad !== doseInfo.dtHoje) {
          //Verifica se está inserindo a vacina no intervalo de vacinação correcto

          if (doseInfo.NumDiasRestante >= 0) {
            //Vacinando no intervalo de vacinação correcto
            //Verifica se está recebendo a vacina correcta
            if (vaccinationData.vaccineId === doseInfo.Id_Vacina) {
              //Recebendo a vacina correcta
              //Gravando a Dose na Data Correcta e Vacina correcta

              vaccinationData.doseId = doseInfo.PrxDose

              const vaccination = await Vaccination.create(vaccinationData)

              await vaccination.load('person')
              await vaccination.load('vaccine')
              await vaccination.load('dose')

              return response.status(HttpStatusCode.CREATED).send({
                message: 'Utente vacinado com sucesso!',
                code: HttpStatusCode.CREATED,
                data: { vaccination: vaccination },
              })
            } else {
              //
              //
              //Recebendo vacina errada
              //
              //
              //Busca a segunda dose da vacina errada selecionada
              const wrongVaccineSecondDose = await Database.rawQuery(
                constants.getVaccineSecondDose,
                [vaccinationData.vaccineId]
              )
              // Buscar lote da vacina errada
              const wrongVaccineLote = await Database.rawQuery(constants.getLoteVaccine, [
                vaccinationData.vaccineId,
              ])

              //Verifica se está disponível uma segunda dose da vacina errada  e se possui lote disponível
              if (wrongVaccineSecondDose.length === 0 || wrongVaccineLote.length === 0) {
                return response.status(HttpStatusCode.OK).send({
                  message:
                    'Informe ao Administrador do Sistema, que não está configurada nenhuma Dose ou Lote da Vacina!',
                  code: HttpStatusCode.OK,
                  data: {},
                })
              }

              //Mudar a dose e lote
              vaccinationData.doseId = wrongVaccineSecondDose[0].Id_DoseVacina
              vaccinationData.lotId = wrongVaccineLote[0].Id_LoteVacina
              vaccinationData.numLot = wrongVaccineLote[0].NumLote

              //Mudar status para V - vacina errada
              vaccinationData.status = 'V'

              const vaccination = await Vaccination.create(vaccinationData)

              await vaccination.load('person')
              await vaccination.load('vaccine')
              await vaccination.load('dose')

              console.log('Utente está recebendo vacina errada')

              return response.status(HttpStatusCode.CREATED).send({
                message: 'Utente vacinado com sucesso!',
                code: HttpStatusCode.CREATED,
                data: { vaccination: vaccination },
              })
            }
          } else {
            //Vacinando no intervalo de vacinação incorrecto

            // === Até 15 dias se é Registado ===
            // Reminder false for Day 7 to Day 22 When NumDays = 21
            // Verifica se o número de dias passados é maior que 15 dias
            if (Math.abs(doseInfo.NumDias - doseInfo.NumDias2) > 15) {
              console.log('O intervalo entre as vacinas não permite adicionar uma nova!')
              return response.status(HttpStatusCode.OK).send({
                message: 'Já recebeu vacina!',
                code: HttpStatusCode.OK,
                data: {},
              })
            }

            //Verifica se está recebendo a vacina correcta
            if (vaccinationData.vaccineId === doseInfo.Id_Vacina) {
              //
              //
              //Recebendo vacina correcta antes do tempo estipulado
              //
              //

              vaccinationData.doseId = doseInfo.PrxDose
              vaccinationData.status = 'D'

              const vaccination = await Vaccination.create(vaccinationData)

              await vaccination.load('person')
              await vaccination.load('vaccine')
              await vaccination.load('dose')

              return response.status(HttpStatusCode.CREATED).send({
                message: 'Utente vacinado com sucesso!',
                code: HttpStatusCode.CREATED,
                data: { vaccination: vaccination },
              })
            } else {
              //Recebendo vacina errada antes do tempo previsto

              //
              //
              //Recebendo vacina errada
              //
              //
              //Busca a segunda dose da vacina errada selecionada
              const wrongVaccineSecondDose = await Database.rawQuery(
                constants.getVaccineSecondDose,
                [vaccinationData.vaccineId]
              )
              // Buscar lote da vacina errada
              const wrongVaccineLote = await Database.rawQuery(constants.getLoteVaccine, [
                vaccinationData.vaccineId,
              ])

              //Verifica se está disponível uma segunda dose da vacina errada  e se possui lote disponível
              if (wrongVaccineSecondDose.length === 0 || wrongVaccineLote.length === 0) {
                return response.status(HttpStatusCode.OK).send({
                  message:
                    'Informe ao Administrador do Sistema, que não está configurada nenhuma Dose ou Lote da Vacina!',
                  code: HttpStatusCode.OK,
                  data: {},
                })
              }

              //Mudar a dose e lote
              vaccinationData.doseId = wrongVaccineSecondDose[0].Id_DoseVacina
              vaccinationData.lotId = wrongVaccineLote[0].Id_LoteVacina
              vaccinationData.numLot = wrongVaccineLote[0].NumLote

              //Mudar status para V - vacina errada
              vaccinationData.status = 'V'

              const vaccination = await Vaccination.create(vaccinationData)

              await vaccination.load('person')
              await vaccination.load('vaccine')
              await vaccination.load('dose')

              console.log('Utente está recebendo vacina diferente  antes do tempo previsto')

              return response.status(HttpStatusCode.CREATED).send({
                message: 'Utente vacinado com sucesso!',
                code: HttpStatusCode.CREATED,
                data: { vaccination: vaccination },
              })
            }
          }
        } else {
          return response.status(HttpStatusCode.OK).send({
            message: 'Já recebeu Vacina!',
            code: HttpStatusCode.OK,
            data: {},
          })
        }
      } else {
        return response.status(HttpStatusCode.CREATED).send({
          message: 'O utente não tem próxima dose a tomar!',
          code: HttpStatusCode.CREATED,
          data: {},
        })
      }
    } catch (error) {
      console.log(error)
      return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
        message: 'Ocorreu um erro no servidor ao vacinar utente!',
        code: HttpStatusCode.INTERNAL_SERVER_ERROR,
        data: {},
      })
    }
  }
}
