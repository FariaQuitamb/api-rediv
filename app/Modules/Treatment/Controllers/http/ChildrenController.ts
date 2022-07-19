import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Person from 'App/Models/Person'
import BusinessCode from 'Contracts/enums/BusinessCode'
import HttpStatusCode from 'Contracts/enums/HttpStatusCode'
import formatedLog, { LogType } from 'Contracts/functions/formated_log'
import formatError from 'Contracts/functions/format_error'
import formatHeaderInfo from 'Contracts/functions/format_header_info'
import formatUserInfo from 'Contracts/functions/format_user_info'
import isAfterToday from 'Contracts/functions/isafter_today'
import logError from 'Contracts/functions/log_error'
import logRegister from 'Contracts/functions/log_register'
import moment from 'moment'
import ChildValidator from '../../Validators/ChildValidator'
import Env from '@ioc:Adonis/Core/Env'

export default class ChildrenController {
  public async index({}: HttpContextContract) {}

  public async store({ auth, response, request }: HttpContextContract) {
    const childData = await request.validate(ChildValidator)
    try {
      //Valor padrão para comorbilidade

      childData.coMorbidity = 'NÃO'

      if (childData.cardNumber.length > 10) {
        formatedLog({
          text: 'Número do cartão muito longo',
          data: childData,
          auth: auth,
          request: request,
          type: LogType.warning,
        })
        return response.status(HttpStatusCode.OK).send({
          message: 'Número do cartão muito longo',
          code: HttpStatusCode.CREATED,
          data: [],
        })
      }

      const agePartes = childData.birthday.split(' ')

      if (agePartes.length === 0) {
        formatedLog({
          text: `A informação da idade não está no formato esperado Ex: ("10 M"  ou  "2 A")`,
          data: childData,
          auth: auth,
          request: request,
          type: LogType.warning,
        })

        //Utente registado com sucesso
        return response.status(HttpStatusCode.OK).send({
          message: 'A informação da idade não está no formato esperado Ex: ("10 M"  ou  "2 A")',
          code: HttpStatusCode.OK,
          data: childData,
        })
      }

      if (agePartes[1] !== 'M' && agePartes[1] !== 'A') {
        childData.birthday = moment().format('YYYY-MM-DD')

        formatedLog({
          text: `A informação da idade não está no formato esperado Ex: ("10 M"  ou  "2 A") , aplicando data actual como idade`,
          data: childData,
          auth: auth,
          request: request,
          type: LogType.warning,
        })
      }

      if (agePartes.length === 0) {
        formatedLog({
          text: `A informação da idade não está no formato esperado Ex: ("10 M"  ou  "2 A")`,
          data: childData,
          auth: auth,
          request: request,
          type: LogType.warning,
        })

        //Utente registado com sucesso
        return response.status(HttpStatusCode.OK).send({
          message: 'A informação da idade não está no formato esperado Ex: ("10 M"  ou  "2 A")',
          code: HttpStatusCode.OK,
          data: childData,
        })
      }

      const value = Number(agePartes[0])

      if (agePartes[1] === 'M') {
        childData.birthday = moment().subtract(value, 'months').format('YYYY-MM-DD')
      }
      if (agePartes[1] === 'A') {
        childData.birthday = moment().subtract(value, 'years').format('YYYY-MM-DD')
      }

      console.log(childData.birthday)

      if (childData.name === undefined || childData.name === ' ') {
        childData.name = childData.cardNumber
        formatedLog({
          text: 'Registo de utente sem nome',
          data: childData,
          auth: auth,
          request: request,
          type: LogType.warning,
        })
      }

      //Verifica se é necessário validar a data do futuro
      let checkFuture = true

      const previewsDate = childData.dataCad

      //Mudança : formatação da data

      childData.dataCad = moment(childData.dataCad, moment.ISO_8601, true).utc(true).toISOString()

      if (childData.dataCad === null) {
        checkFuture = false

        const today = moment().utc(true)
        childData.dataCad = moment(today, moment.ISO_8601, true).toISOString()

        formatedLog({
          text: `A data do registo infantil simplificado foi modificada para data de hoje por ser inválida ,  data Inserida: ${previewsDate}  Data Final :  ${childData.dataCad} User: Id:${auth.user?.id} Name: ${auth.user?.name} Phone: ${auth.user?.phone} BI:${auth.user?.bi}`,
          data: childData,
          auth: auth,
          request: request,
          type: LogType.warning,
        })
      }

      if (checkFuture) {
        if (isAfterToday(childData.dataCad)) {
          childData.dataCad = moment().utc(true).toISOString()
          formatedLog({
            text: `A data do registo infantil simplificado foi modificada para data de hoje por ser maior a data actual data inserida: ${previewsDate}  Data Final :  ${childData.dataCad} User: Id:${auth.user?.id} Name: ${auth.user?.name} Phone: ${auth.user?.phone} BI:${auth.user?.bi}`,
            data: childData,
            auth: auth,
            request: request,
            type: LogType.warning,
          })
        }
      }

      //Verifica se existe um utente com o número de documento enviado
      const childExists = await Person.query()
        .where('NCartao', childData.cardNumber)
        .timeout(60000)
        .first()

      if (childExists) {
        return response.status(HttpStatusCode.OK).send({
          message: 'Já existe um utente registrado com esse número de cartão',
          code: BusinessCode.FOUND_INDIVIDUAL,
          data: childExists,
        })
      }

      //const child = await Person.create(childData)

      const person = new Person()
      //Adiciona utente usando transação para garantir que o registo suba e que tenha codigo associado
      //A inserção possuí um timeout de 60000 ms
      const insertedChild = await person.transactionInsertChild(childData, 60000)

      //Caso não tenha inserido o utente
      if (insertedChild.length === 0) {
        formatedLog({
          text: 'Não foi  possível realizar o registo infantil simplificado',
          type: LogType.error,
          data: insertedChild,
          auth: auth,
          request: request,
        })
        return response.status(HttpStatusCode.OK).send({
          message: 'Não foi  possível realizar o registo infantil simplificado',
          code: HttpStatusCode.OK,
          data: [],
        })
      }

      const personInfo = insertedChild[0]

      const version = Env.get('API_VERSION')
      //Log de actividade
      await logRegister({
        id: auth.user?.id ?? 0,
        system: 'MB',
        screen: 'ChildrenController/store',
        table: 'regIndividual',
        job: 'Cadastrar',
        tableId: personInfo.Id_regIndividual,
        action: 'Registo de Utente Menor',
        actionId: `V:${version}`,
      })

      formatedLog({
        text: 'Registo infantil simplificado realizado com sucesso',
        type: LogType.success,
        data: personInfo,
        auth: auth,
        request: request,
      })

      const child = {
        id: personInfo.Id_regIndividual,
        institution_id: personInfo.Id_regInstituicao,
        name: personInfo.Nome,
        phone: personInfo.Telefone,
        birthday: moment(personInfo.dtNascimento).format('YYYY-MM-DD'),
        father_name: personInfo.NomePai,
        mother_name: personInfo.NomeMae,
        card_number: personInfo.NCartao,
        genre: personInfo.Genero,
        nationality_id: personInfo.Id_Nacionalidade,
        province_id: personInfo.Id_provincia,
        municipality_id: personInfo.Id_Municipio,
        category_id: personInfo.Id_Categoria,
        code: personInfo.Codigo,
        status: personInfo.Status,
        sector_id: personInfo.Id_Setor,
        code_number: personInfo.CodigoNum,
        comorbility: personInfo.Comorbilidade,
      }

      //Utente registado com sucesso
      return response.status(HttpStatusCode.CREATED).send({
        message: 'Registo infantil simplificado realizado com sucesso',
        code: HttpStatusCode.CREATED,
        data: child,
      })
    } catch (error) {
      const childStr = JSON.stringify(childData)

      const deviceInfo = JSON.stringify(formatHeaderInfo(request))
      const userInfo = formatUserInfo(auth.user)
      const errorInfo = formatError(error)

      await logError({
        type: 'MB',
        page: ' ChildrenController/store',
        error: `User:${userInfo} Device: ${deviceInfo} Dados : ${childStr} - ${errorInfo}`,
        request: request,
      })

      const substring = 'Timeout: Request failed to complete in'

      if (errorInfo.includes(substring)) {
        formatedLog({
          text: 'Não foi possível completar a operação dentro do tempo esperado',
          type: LogType.warning,
          data: childData,
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

  public async update({}: HttpContextContract) {}
}
