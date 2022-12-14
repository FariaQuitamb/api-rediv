import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import Person from 'App/Models/Person'
import Vaccination from 'App/Models/Vaccination'
import Vaccine from 'App/Models/Vaccine'
import VaccinationValidator from 'App/Validators/VaccinationValidator'
import constants from 'Contracts/constants/constants'
import HttpStatusCode from 'Contracts/enums/HttpStatusCode'
import formatError from 'Contracts/functions/format_error'
import formatHeaderInfo from 'Contracts/functions/format_header_info'
import formatUserInfo from 'Contracts/functions/format_user_info'
import geoLog from 'Contracts/functions/geo_log'
import logError from 'Contracts/functions/log_error'
import vaccinationLog from 'Contracts/functions/vaccination_log'
import moment from 'moment'

import Env from '@ioc:Adonis/Core/Env'
import getGeoLocation from 'Contracts/functions/get_geolocation'
import formatedLog, { LogType } from 'Contracts/functions/formated_log'

import isAfterToday from 'Contracts/functions/isafter_today'
import getEstimatedDate from 'Contracts/functions/vaccination/get_estimated_date'

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
  public version = Env.get('API_VERSION')

  public async store({ auth, response, request }: HttpContextContract) {
    const vaccinationData = await request.validate(VaccinationValidator)

    try {
      //Vacination Date verification  , cannot be after today (future)

      //Verifica se é necessário validar a data do futuro
      let checkFuture = true

      const previewsDate = vaccinationData.createdAt

      //Mudança : formatação da data

      vaccinationData.createdAt = moment(
        vaccinationData.createdAt,
        moment.ISO_8601,
        true
      ).toISOString()

      if (vaccinationData.createdAt === null) {
        checkFuture = false

        const today = moment()
        vaccinationData.createdAt = moment(today, moment.ISO_8601, true).toISOString()

        formatedLog({
          text: `A data do registo de vacinação  foi modificada para data de hoje por ser inválida ,  data inserida: ${previewsDate}  Data Final :  ${vaccinationData.createdAt} User: Id:${auth.user?.id} Name: ${auth.user?.name} Phone: ${auth.user?.phone} BI:${auth.user?.bi}`,
          data: vaccinationData,
          auth: auth,
          request: request,
          type: LogType.warning,
        })
      }

      if (checkFuture) {
        if (isAfterToday(vaccinationData.createdAt)) {
          vaccinationData.createdAt = moment().toISOString()

          formatedLog({
            text: `Registo de vacinação modificado para data de hoje data inserida: ${previewsDate} data final: ${vaccinationData.createdAt} User: Id:${auth.user?.id} Name: ${auth.user?.name} Phone: ${auth.user?.phone} BI:${auth.user?.bi}`,
            data: vaccinationData,
            auth: auth,
            request: request,
            type: LogType.warning,
          })
        }
      }

      //Default regMB set to S = Yes to Mobile Register
      vaccinationData.regMB = 'S'
      //13-06-2022 - Pais diferente de 0 coloca as vacinas de reforço como transcrita
      //Fix abaixo
      vaccinationData.vaccinationCountryId = 0

      //Added geolocation
      const geo = getGeoLocation(request.headers())
      vaccinationData.latitude = geo.latitude
      vaccinationData.longitude = geo.longitude

      //Mudança : formatação da data para ISO 8601
      vaccinationData.createdAt = moment(
        vaccinationData.createdAt,
        moment.ISO_8601,
        true
      ).toISOString()
      const person = await Person.find(vaccinationData.personId)
      //
      //Verificar se o registro individual está habilitado a receber a vacina
      //
      //RN [001]
      if (!person) {
        return response.status(HttpStatusCode.OK).send({
          message: 'Registro individual não encontrado',
          code: HttpStatusCode.OK,
          data: [],
        })
      }

      //RN [001]
      if (person.status !== 'C') {
        formatedLog({
          text: 'O status do registro individual é diferente de Confirmado',
          data: vaccinationData,
          auth: auth,
          request: request,
          type: LogType.warning,
        })
        return response.status(HttpStatusCode.OK).send({
          message: 'O registro individual não reúne condições para vacinação',
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
        formatedLog({
          text: 'A vacina selecionada não existe ou não está habilitada - visualizar != S',
          data: vaccinationData,
          auth: auth,
          request: request,
          type: LogType.warning,
          tag: { key: 'business', value: 'Configuração' },
          context: { controller: 'VaccinationsController', method: 'store' },
        })

        return response.status(HttpStatusCode.OK).send({
          message: 'A vacina selecionada não existe ou está fora de uso',
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

        if (vaccinationData.status === 'R') {
          formatedLog({
            text: 'O status da primeira vacina não pode ser R - reforço',
            data: vaccinationData,
            auth: auth,
            request: request,
            type: LogType.warning,
          })

          return response.status(HttpStatusCode.OK).send({
            message: 'Verifique o status enviado, não pode ser R-reforço',
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
              'Informe ao Administrador do Sistema, que não está configurada nenhuma Dose da Vacina',
            code: HttpStatusCode.OK,
            data: {},
          })
        }

        vaccinationData.doseId = vaccineFirstDose[0].Id_DoseVacina

        const vaccination = await Vaccination.create(vaccinationData)

        await vaccination.load('person')
        await vaccination.load('vaccine')
        await vaccination.load('dose')

        //Log de geolocalização - Telefone do utente
        await geoLog('P', vaccination.id, request)
        //Log de actividade - vacina primeira dose
        await vaccinationLog({
          userId: auth.user?.id as number,
          vaccinationId: vaccination.id,
          system: 'MB',
          job: 'Cadastrar',
          screen: `V:${this.version}-VaccinationController/store`,
          action: 'Cadastrar Vacina',
          observation: '1ª Dose',
          userPostoVaccination: vaccinationData.vaccinationPostId,
        })

        formatedLog({
          text: 'Utente vacinado com sucesso 1ª Dose',
          data: vaccinationData,
          auth: auth,
          request: request,
          type: LogType.success,
        })
        return response.status(HttpStatusCode.CREATED).send({
          message: 'Utente vacinado com sucesso',
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
        //Verifica se já realizou uma vacina no corrente dia
        //

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

              //Log de geolocalização - Telefone do utente
              await geoLog('S', vaccination.id, request)

              //Log de actividade - vacina segunda dose
              await vaccinationLog({
                userId: auth.user?.id as number,
                vaccinationId: vaccination.id,
                system: 'MB',
                job: 'Cadastrar',
                screen: `V:${this.version}-VaccinationController/store`,
                action: 'Cadastrar Vacina',
                observation: '2ª Dose',
                userPostoVaccination: vaccinationData.vaccinationPostId,
              })

              formatedLog({
                text: 'Utente vacinado com sucesso  2ª Dose',
                data: vaccinationData,
                auth: auth,
                request: request,
                type: LogType.success,
              })

              return response.status(HttpStatusCode.CREATED).send({
                message: 'Utente vacinado com sucesso',
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
                    'Informe ao Administrador do Sistema, que não está configurada nenhuma Dose ou Lote da Vacina',
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

              //Log de geolocalização - Telefone do utente
              await geoLog('S', vaccination.id, request)

              formatedLog({
                text: 'O utente está recebendo vacina errada',
                data: vaccinationData,
                auth: auth,
                request: request,
                type: LogType.warning,
              })

              //Log de actividade - vacina segunda dose errada
              await vaccinationLog({
                userId: auth.user?.id as number,
                vaccinationId: vaccination.id,
                system: 'MB',
                job: 'Cadastrar',
                screen: `V:${this.version}-VaccinationController/store`,
                action: 'Cadastrar Vacina',
                observation: '2ª Dose Vacina Errada',
                userPostoVaccination: vaccinationData.vaccinationPostId,
              })

              formatedLog({
                text: 'Utente vacinado com sucesso 2ª Dose Vacina Errada',
                data: vaccinationData,
                auth: auth,
                request: request,
                type: LogType.warning,
              })

              return response.status(HttpStatusCode.CREATED).send({
                message: 'Utente vacinado com sucesso',
                code: HttpStatusCode.CREATED,
                data: { vaccination: vaccination },
              })
            }
          } else {
            //Vacinando no intervalo de vacinação incorrecto

            // === Até 15 dias se é Registado ===
            // Reminder false for Day 7 to Day 22 When NumDays = 21
            // Verifica se o número de dias passados é inferior a 15 dias
            if (Math.abs(doseInfo.NumDias - doseInfo.NumDias2) < 15) {
              const estimated = getEstimatedDate(doseInfo.DataCad)

              formatedLog({
                text: `O intervalo entre as vacinass não permite adicionar uma nova , poderá receber aproximadamente dentro de ${estimated.daysTillVaccine} dias ( ${estimated.friendlyDate} ) `,
                data: vaccinationData,
                auth: auth,
                request: request,
                type: LogType.warning,
              })

              const message =
                estimated.daysTillVaccine === 0
                  ? 'Já recebeu vacina'
                  : `Já recebeu vacina, poderá receber uma nova aproximadamente dentro de ${estimated.daysTillVaccine} dias ( ${estimated.friendlyDate} )`

              return response.status(HttpStatusCode.OK).send({
                message: message,
                code: HttpStatusCode.OK,
                data: {},
              })
            }

            //Verifica se está recebendo a vacina correcta
            if (vaccinationData.vaccineId === doseInfo.Id_Vacina) {
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

              //Log de geolocalização - Telefone do utente
              await geoLog('S', vaccination.id, request)

              //Log de actividade - vacina segunda dose antecipada
              await vaccinationLog({
                userId: auth.user?.id as number,
                vaccinationId: vaccination.id,
                system: 'MB',
                job: 'Cadastrar',
                screen: `V:${this.version}-VaccinationController/store`,
                action: 'Cadastrar Vacina',
                observation: '2ª Dose Antecipada',
                userPostoVaccination: vaccinationData.vaccinationPostId,
              })

              formatedLog({
                text: 'Utente vacinado com sucesso 2ª Dose Antecipada',
                data: vaccinationData,
                auth: auth,
                request: request,
                type: LogType.warning,
              })

              return response.status(HttpStatusCode.CREATED).send({
                message: 'Utente vacinado com sucesso',
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
                    'Informe ao Administrador do Sistema, que não está configurada nenhuma Dose ou Lote da Vacina',
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

              //Log de geolocalização - Telefone do utente
              await geoLog('S', vaccination.id, request)

              //Log de actividade - vacina segunda dose errada e antecipada
              await vaccinationLog({
                userId: auth.user?.id as number,
                vaccinationId: vaccination.id,
                system: 'MB',
                job: 'Cadastrar',
                screen: ` V:${this.version}-VaccinationController/store`,
                action: 'Cadastrar Vacina',
                observation: '2ª Dose Vacina Errada-Antecipada',
                userPostoVaccination: vaccinationData.vaccinationPostId,
              })

              formatedLog({
                text: 'Utente vacinado com sucesso 2ª Dose Vacina Errada-Antecipada',
                data: vaccinationData,
                auth: auth,
                request: request,
                type: LogType.warning,
              })

              return response.status(HttpStatusCode.CREATED).send({
                message: 'Utente vacinado com sucesso',
                code: HttpStatusCode.CREATED,
                data: { vaccination: vaccination },
              })
            }
          }
        } else {
          formatedLog({
            text: 'O utente já recebeu vacina no dia de hoje',
            data: vaccinationData,
            auth: auth,
            request: request,
            type: LogType.warning,
          })
          return response.status(HttpStatusCode.OK).send({
            message: 'O utente já recebeu vacina no dia de hoje',
            code: HttpStatusCode.OK,
            data: {},
          })
        }
      } else {
        formatedLog({
          text: 'Ciclo de vacinação do utente está completo , pode apenas apanhar vacina de reforço',
          data: vaccinationData,
          auth: auth,
          request: request,
          type: LogType.warning,
        })
        return response.status(HttpStatusCode.OK).send({
          message:
            'Ciclo de vacinação do utente está completo , pode apenas apanhar vacina de reforço',
          code: HttpStatusCode.OK,
          data: {},
        })
      }
    } catch (error) {
      //Log de erro
      const deviceInfo = JSON.stringify(formatHeaderInfo(request))
      const data = JSON.stringify(vaccinationData)
      const userInfo = formatUserInfo(auth.user)
      const errorInfo = formatError(error)
      await logError({
        type: 'MB',
        page: 'VaccinationController/store',
        error: `User: ${userInfo}  Device: ${deviceInfo}  Dados: ${data}  ${errorInfo}`,
        request: request,
      })
      return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
        message: 'Ocorreu um erro no servidor ao vacinar utente',
        code: HttpStatusCode.INTERNAL_SERVER_ERROR,
        data: {},
      })
    }
  }

  public async booster({ auth, response, request }: HttpContextContract) {
    const vaccinationData = await request.validate(VaccinationValidator)

    try {
      //Vacination Date verification  , cannot be after today (future)

      //Verifica se é necessário validar a data do futuro
      let checkFuture = true

      const previewsDate = vaccinationData.createdAt

      //Mudança : formatação da data

      vaccinationData.createdAt = moment(
        vaccinationData.createdAt,
        moment.ISO_8601,
        true
      ).toISOString()

      if (vaccinationData.createdAt === null) {
        checkFuture = false

        const today = moment()
        vaccinationData.createdAt = moment(today, moment.ISO_8601, true).toISOString()

        formatedLog({
          text: `A data do registo de vacinação de reforço foi modificada para data de hoje por ser inválida ,  data inserida: ${previewsDate}  Data Final :  ${vaccinationData.createdAt} User: Id:${auth.user?.id} Name: ${auth.user?.name} Phone: ${auth.user?.phone} BI:${auth.user?.bi}`,
          data: vaccinationData,
          auth: auth,
          request: request,
          type: LogType.warning,
        })
      }

      if (checkFuture) {
        if (isAfterToday(vaccinationData.createdAt)) {
          vaccinationData.createdAt = moment().toISOString()

          formatedLog({
            text: `A data do registo de vacinação de reforço foi modificada para data de hoje por ser maior a data actual data inserida: ${previewsDate}  Data Final :  ${vaccinationData.createdAt} User: Id:${auth.user?.id} Name: ${auth.user?.name} Phone: ${auth.user?.phone} BI:${auth.user?.bi}`,
            data: vaccinationData,
            auth: auth,
            request: request,
            type: LogType.warning,
          })
        }
      }

      //Default regMB set to S = Yes to Mobile Register
      vaccinationData.regMB = 'S'

      //13-06-2022 - Pais diferente de 0 coloca as vacinas de reforço como transcrita
      //Fix abaixo
      vaccinationData.vaccinationCountryId = 0

      //Added geolocation
      const geo = getGeoLocation(request.headers())
      vaccinationData.latitude = geo.latitude
      vaccinationData.longitude = geo.longitude

      //Mudança : formatação da data para ISO 8601
      vaccinationData.createdAt = moment(
        vaccinationData.createdAt,
        moment.ISO_8601,
        true
      ).toISOString()

      //Verificar o status enviado

      if (vaccinationData.status !== 'R') {
        formatedLog({
          text: 'O status deve ser R para vacina de reforço',
          data: vaccinationData,
          auth: auth,
          request: request,
          type: LogType.warning,
        })

        return response.status(HttpStatusCode.OK).send({
          message: 'Verifique o status da vacinação enviado, deve ser R para reforço',
          code: HttpStatusCode.OK,
          data: {},
        })
      }

      const person = await Person.find(vaccinationData.personId)
      //
      //Verificar se o registro individual está habilitado a receber a vacina
      //
      //RN [001]
      if (!person) {
        return response.status(HttpStatusCode.OK).send({
          message: 'Registro individual não encontrado',
          code: HttpStatusCode.OK,
          data: [],
        })
      }

      //RN [001]
      if (person.status !== 'C') {
        formatedLog({
          text: 'O status do registro individual é diferente de Confirmado',
          data: { vaccinationData, person },
          auth: auth,
          request: request,
          type: LogType.warning,
        })

        return response.status(HttpStatusCode.OK).send({
          message: 'O registro individual não reúne condições para vacinação',
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
        formatedLog({
          text: 'A vacina selecionada não existe ou não está habilitada - visualizar != S',
          data: vaccinationData,
          auth: auth,
          request: request,
          type: LogType.error,
          tag: { key: 'business', value: 'Configuração' },
          context: { controller: 'VaccinationsController', method: 'booster' },
        })
        return response.status(HttpStatusCode.OK).send({
          message: 'A vacina selecionada não existe ou está fora de uso',
          code: HttpStatusCode.OK,
          data: [],
        })
      }

      //Inicio
      //Verificação do ciclo de vacinação
      //Busca quantas doses a vacina do utente requer para completar
      //o ciclo de vacinação e busca quantas doses o utente já tomou .

      //Na verificação do ciclo e vacinação , não são contabilizadas vacinas de reforço (Status R) e vacina diferente  (Status V)
      const numDose = await Database.rawQuery(constants.getNumDoses, [vaccinationData.personId])

      if (numDose.length === 0) {
        formatedLog({
          text: 'Houve um erro no registro de vacinação , não foi possível retornar o número de doses da vacina e quantas o utente já tomou',
          data: vaccinationData,
          auth: auth,
          request: request,
          type: LogType.warning,
        })

        return response.status(HttpStatusCode.OK).send({
          message: 'Não é possível adicionar dose de reforço neste utente ',
          code: HttpStatusCode.OK,
          data: [],
        })
      }

      const doses = numDose[0]

      if (doses.NumDoseVac !== doses.NumVac) {
        formatedLog({
          text: 'O utente ainda não tem o ciclo de vacinação completo',
          data: vaccinationData,
          auth: auth,
          request: request,
          type: LogType.warning,
        })
        return response.status(HttpStatusCode.OK).send({
          message: 'O utente ainda não tem o ciclo de vacinação completo',
          code: HttpStatusCode.OK,
          data: [],
        })
      }

      const getBoosterDoses = await Database.rawQuery(constants.sqlBooster, [
        vaccinationData.personId,
      ])

      // Verifica se o utente já realizou alguma vacina de reforço

      if (getBoosterDoses.length === 0) {
        //Não possui vacina de reforço , nunca realizou reforço

        const numDays = await Database.rawQuery(constants.getNumDiasBooster, [
          vaccinationData.personId,
        ])

        //Verifica se foi retornada alguma informação
        if (numDays.length === 0) {
          formatedLog({
            text: 'Erro ao obter o número de dias entre as vacinações',
            data: vaccinationData,
            auth: auth,
            request: request,
            type: LogType.warning,
          })
          return response.status(HttpStatusCode.OK).send({
            message: 'Ocorreu um erro inesperado',
            code: HttpStatusCode.OK,
            data: [],
          })
        }

        //Verifica se o número de dias entre as vacinas é superior a 15 dias
        if (numDays[0].Dado > 15) {
          //Retorna a primeira dose da vacina
          const firstDose = await Database.rawQuery(constants.getFirstDose, [
            vaccinationData.vaccineId,
          ])

          //Verifica se existe dose disponível
          if (firstDose.length === 0) {
            formatedLog({
              text: 'Erro não existe dose disponível da vacina',
              data: vaccinationData,
              auth: auth,
              request: request,
              type: LogType.error,
            })

            return response.status(HttpStatusCode.OK).send({
              message:
                'Informe ao Administrador do Sistema, que não esta configurada nenhuma Dose da Vacina',
              code: HttpStatusCode.OK,
              data: [],
            })
          }

          //Inserindo vacina de reforço
          const vaccination = await Vaccination.create(vaccinationData)

          await vaccination.load('person')
          await vaccination.load('vaccine')
          await vaccination.load('dose')

          //Log de geolocalização - Telefone do utente
          await geoLog('R', vaccination.id, request)

          //Log de actividade - vacina de reforço
          await vaccinationLog({
            userId: auth.user?.id as number,
            vaccinationId: vaccination.id,
            system: 'MB',
            job: 'Cadastrar',
            screen: `V:${this.version}-VaccinationController/booster`,
            action: 'Cadastrar Vacina',
            observation: 'Vacina de reforço',
            userPostoVaccination: vaccinationData.vaccinationPostId,
          })
          // const fields = formatHeaders(vaccination.id, '999999999', headers)

          // await regVaccinationLog(fields)

          formatedLog({
            text: 'Utente vacinado com sucesso Vacina de reforço',
            data: vaccinationData,
            auth: auth,
            request: request,
            type: LogType.success,
          })

          return response.status(HttpStatusCode.CREATED).send({
            message: 'Utente vacinado com sucesso',
            code: HttpStatusCode.CREATED,
            data: { vaccination: vaccination },
          })
        } else {
          formatedLog({
            text: 'Tempo necessário para receber a Vacina de Reforço é de 15 dias depois do registo de vacinação',
            data: vaccinationData,
            auth: auth,
            request: request,
            type: LogType.warning,
          })
          return response.status(HttpStatusCode.OK).send({
            message:
              'Tempo necessário para receber a Vacina de Reforço é de 15 dias depois do registo de vacinação',
            code: HttpStatusCode.OK,
            data: {},
          })
        }
      }

      //Já tem alguma vacina de reforço

      const boosterInfo = getBoosterDoses[0] as DoseInfo

      if (boosterInfo.PrxDose !== 0) {
        //Verifica se o registro de reforço existente foi feito na data actual
        if (boosterInfo.DataCad === boosterInfo.dtHoje) {
          formatedLog({
            text: 'Já recebeu vacina , realizou vacina de reforço no corrente dia',
            data: vaccinationData,
            auth: auth,
            request: request,
            type: LogType.warning,
          })
          return response.status(HttpStatusCode.OK).send({
            message: 'O utente já recebeu vacina no dia de hoje',
            code: HttpStatusCode.OK,
            data: {},
          })
        }

        //Verifica o número de dias restantes ...
        if (boosterInfo.NumDiasRestante >= 0) {
          //Verificar se é a vacina correcta

          if (boosterInfo.Id_Vacina === vaccinationData.vaccineId) {
            //Inserindo vacina de reforço correcta

            //Modifica a dose a ser tomada
            vaccinationData.doseId = boosterInfo.PrxDose
            const vaccination = await Vaccination.create(vaccinationData)

            await vaccination.load('person')
            await vaccination.load('vaccine')
            await vaccination.load('dose')

            //Log de geolocalização - Telefone do utente
            await geoLog('R', vaccination.id, request)

            //Log de actividade - vacina de reforço
            await vaccinationLog({
              userId: auth.user?.id as number,
              vaccinationId: vaccination.id,
              system: 'MB',
              job: 'Cadastrar',
              screen: ` V:${this.version}-VaccinationController/booster`,
              action: 'Cadastrar Vacina',
              observation: 'Adição de mais uma vacina de reforço do utente',
              userPostoVaccination: vaccinationData.vaccinationPostId,
            })

            formatedLog({
              text: 'Adição de mais uma vacina de reforço do utente realizada com sucesso',
              data: vaccinationData,
              auth: auth,
              request: request,
              type: LogType.warning,
            })

            return response.status(HttpStatusCode.CREATED).send({
              message: 'Utente vacinado com sucesso',
              code: HttpStatusCode.CREATED,
              data: { vaccination: vaccination },
            })
          } else {
            //Inserindo vacina de reforço incorrecta

            //1 - Pegar a segunda dose da vacina
            //2 - Pegar um lote aleatório da vacina

            //Busca a segunda dose da vacina errada selecionada
            const wrongVaccineSecondDose = await Database.rawQuery(constants.getVaccineSecondDose, [
              vaccinationData.vaccineId,
            ])
            // Buscar lote da vacina errada
            const wrongVaccineLote = await Database.rawQuery(constants.getLoteVaccine, [
              vaccinationData.vaccineId,
            ])

            //Verifica se está disponível uma segunda dose da vacina errada  e se possui lote disponível
            if (wrongVaccineSecondDose.length === 0 || wrongVaccineLote.length === 0) {
              return response.status(HttpStatusCode.OK).send({
                message:
                  'Informe ao Administrador do Sistema, que não está configurada nenhuma Dose ou Lote da Vacina',
                code: HttpStatusCode.OK,
                data: {},
              })
            }
            //Mudar a dose e lote
            vaccinationData.doseId = wrongVaccineSecondDose[0].Id_DoseVacina
            vaccinationData.lotId = wrongVaccineLote[0].Id_LoteVacina
            vaccinationData.numLot = wrongVaccineLote[0].NumLote

            formatedLog({
              text: 'Recebendo dose de reforço da vacina errada',
              data: vaccinationData,
              auth: auth,
              request: request,
              type: LogType.warning,
            })

            //Não se atribui um status especifico para vacina de reforço incorrecta

            //Inserindo vacina de reforço
            const vaccination = await Vaccination.create(vaccinationData)

            await vaccination.load('person')
            await vaccination.load('vaccine')
            await vaccination.load('dose')

            //Log de geolocalização - Telefone do utente
            await geoLog('R', vaccination.id, request)

            //Log de actividade - vacina de reforço errada
            await vaccinationLog({
              userId: auth.user?.id as number,
              vaccinationId: vaccination.id,
              system: 'MB',
              job: 'Cadastrar',
              screen: 'VaccinationController/booster',
              action: 'Cadastrar Vacina',
              observation: 'Recebeu vacina de reforço errada',
              userPostoVaccination: vaccinationData.vaccinationPostId,
            })

            formatedLog({
              text: 'Utente vacinado com sucesso, mas recebeu vacina de reforço errada ',
              data: vaccinationData,
              auth: auth,
              request: request,
              type: LogType.warning,
            })

            return response.status(HttpStatusCode.CREATED).send({
              message: 'Utente vacinado com sucesso',
              code: HttpStatusCode.CREATED,
              data: { vaccination: vaccination },
            })
          }
        } else {
          // === Até 15 dias se é Registado ===
          // Verifica se o número de dias passados é inferior a 15 dias

          if (Math.abs(boosterInfo.NumDias - boosterInfo.NumDias2) < 15) {
            const estimated = getEstimatedDate(boosterInfo.DataCad)

            formatedLog({
              text: `O intervalo entre as vacinass não permite adicionar uma nova dose de reforço , poderá receber aproximadamente dentro de ${estimated.daysTillVaccine} dias ( ${estimated.friendlyDate} ) `,
              data: vaccinationData,
              auth: auth,
              request: request,
              type: LogType.warning,
            })

            //Verifica se os dias restantes é iguala 0
            const message =
              estimated.daysTillVaccine === 0
                ? 'Já recebeu vacina'
                : `Já recebeu vacina, poderá receber uma nova aproximadamente dentro de ${estimated.daysTillVaccine} dias ( ${estimated.friendlyDate} )`

            return response.status(HttpStatusCode.OK).send({
              message: message,
              code: HttpStatusCode.OK,
              data: {},
            })
          }

          //Verifica se é a vacina correcta
          if (boosterInfo.Id_Vacina === vaccinationData.vaccineId) {
            //Inserindo vacina de reforço correcta

            //Modifica a dose a ser tomada
            vaccinationData.doseId = boosterInfo.PrxDose
            const vaccination = await Vaccination.create(vaccinationData)

            await vaccination.load('person')
            await vaccination.load('vaccine')
            await vaccination.load('dose')

            //Log de geolocalização - Telefone do utente
            await geoLog('R', vaccination.id, request)

            //Log de actividade - vacina de reforço antes do tempo , mas dentro de 15 dias
            await vaccinationLog({
              userId: auth.user?.id as number,
              vaccinationId: vaccination.id,
              system: 'MB',
              job: 'Cadastrar',
              screen: 'VaccinationController/booster',
              action: 'Cadastrar Vacina',
              observation: 'Vacina de reforço antes do tempo mas,  dentro de 15 dias',
              userPostoVaccination: vaccinationData.vaccinationPostId,
            })

            formatedLog({
              text: 'Vacinando utente fora do tempo estimado com vacina correcta',
              data: vaccinationData,
              auth: auth,
              request: request,
              type: LogType.warning,
            })

            return response.status(HttpStatusCode.CREATED).send({
              message: 'Utente vacinado com sucesso',
              code: HttpStatusCode.CREATED,
              data: { vaccination: vaccination },
            })
          } else {
            //Inserindo vacina de reforço incorrecta

            //1 - Pegar a segunda dose da vacina
            //2 - Pegar um lote aleatório da vacina

            //Busca a segunda dose da vacina errada selecionada
            const wrongVaccineSecondDose = await Database.rawQuery(constants.getVaccineSecondDose, [
              vaccinationData.vaccineId,
            ])
            // Buscar lote da vacina errada
            const wrongVaccineLote = await Database.rawQuery(constants.getLoteVaccine, [
              vaccinationData.vaccineId,
            ])

            //Verifica se está disponível uma segunda dose da vacina errada  e se possui lote disponível
            if (wrongVaccineSecondDose.length === 0 || wrongVaccineLote.length === 0) {
              return response.status(HttpStatusCode.OK).send({
                message:
                  'Informe ao Administrador do Sistema, que não está configurada nenhuma Dose ou Lote da Vacina',
                code: HttpStatusCode.OK,
                data: {},
              })
            }
            //Mudar a dose e lote
            vaccinationData.doseId = wrongVaccineSecondDose[0].Id_DoseVacina
            vaccinationData.lotId = wrongVaccineLote[0].Id_LoteVacina
            vaccinationData.numLot = wrongVaccineLote[0].NumLote

            formatedLog({
              text: 'Recebendo dose de reforço da vacina errada antes do tempo estipulado',
              data: vaccinationData,
              auth: auth,
              request: request,
              type: LogType.warning,
            })

            //Não se atribui um status especifico para vacina de reforço incorrecta

            //Inserindo vacina de reforço
            const vaccination = await Vaccination.create(vaccinationData)

            await vaccination.load('person')
            await vaccination.load('vaccine')
            await vaccination.load('dose')

            //Log de geolocalização - Telefone do utente
            await geoLog('R', vaccination.id, request)

            //Log de actividade - Vacina de reforço errada antes do tempo mas,  dentro de 15 dias
            await vaccinationLog({
              userId: auth.user?.id as number,
              vaccinationId: vaccination.id,
              system: 'MB',
              job: 'Cadastrar',
              screen: 'VaccinationController/booster',
              action: 'Cadastrar Vacina',
              observation: 'Vacina de reforço errada antes do tempo mas,  dentro de 15 dias',
              userPostoVaccination: vaccinationData.vaccinationPostId,
            })

            formatedLog({
              text: 'Vacinando utente fora do tempo estimado com vacina errada',
              data: vaccinationData,
              auth: auth,
              request: request,
              type: LogType.warning,
            })

            return response.status(HttpStatusCode.CREATED).send({
              message: 'Utente vacinado com sucesso',
              code: HttpStatusCode.CREATED,
              data: { vaccination: vaccination },
            })
          }
        }

        //unreached
      } else {
        formatedLog({
          text: 'Já recebeu vacina , não tem próxima dose',
          data: vaccinationData,
          auth: auth,
          request: request,
          type: LogType.warning,
        })

        return response.status(HttpStatusCode.OK).send({
          message: 'Já recebeu vacina',
          code: HttpStatusCode.OK,
          data: {},
        })
      }
    } catch (error) {
      //Log de erro

      const deviceInfo = JSON.stringify(formatHeaderInfo(request))
      const data = JSON.stringify(Vaccination)
      const userInfo = formatUserInfo(auth.user)
      const errorInfo = formatError(error)
      await logError({
        type: 'MB',
        page: 'VaccinationController/booster',
        error: `User: ${userInfo} Device: ${deviceInfo} Dados: ${data} ${errorInfo}`,
        request: request,
      })
      return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
        message: 'Ocorreu um erro no servidor ao vacinar utente',
        code: HttpStatusCode.INTERNAL_SERVER_ERROR,
        data: {},
      })
    }
  }
}
