import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import Person from 'App/Models/Person'
import CheckPersonValidator from 'App/Validators/CheckPersonValidator'
import PersonValidator from 'App/Validators/PersonValidator'
import SearchValidator from 'App/Validators/SearchValidator'
import constants from 'Contracts/constants/constants'
import HttpStatusCode from 'Contracts/enums/HttpStatusCode'
import formatError from 'Contracts/functions/format_error'
import formatHeaderInfo from 'Contracts/functions/format_header_info'
import formatUserInfo from 'Contracts/functions/format_user_info'
import logError from 'Contracts/functions/log_error'
import moment from 'moment'
import Env from '@ioc:Adonis/Core/Env'
import GetUserRank from 'App/Validators/getUserRank'
import getUserRank from 'Contracts/functions/get_user_rank'
import formatedLog, { LogType } from 'Contracts/functions/formated_log'
import isAfterToday from 'Contracts/functions/isafter_today'
import BusinessCode from 'Contracts/enums/BusinessCode'
import constantQueries from 'Contracts/constants/constant_queries'
import personVaccines from 'Contracts/functions/person_vaccines'
import listPersonVaccines from 'Contracts/functions/list_persons_vaccines'
import SearchByIdValidator from 'App/Validators/SearchByIdValidator'
import PersonUpdateValidator from 'App/Validators/PersonUpdateValidator'
import addActivityLogJob from 'App/bullmq/queue/queue'

export default class PeopleController {
  public async store({ auth, response, request }: HttpContextContract) {
    const personData = await request.validate(PersonValidator)

    try {
      let hasDocNumber = true

      //Verifica se é necessário validar a data do futuro
      let checkFuture = true

      const previewsDate = personData.dataCad

      //Mudança : formatação da data
      //const dateBefore = personData.dataCad

      personData.dataCad = moment(personData.dataCad, moment.ISO_8601, true).toISOString()

      if (personData.dataCad === null) {
        checkFuture = false

        const today = moment()
        personData.dataCad = moment(today, moment.ISO_8601, true).toISOString()

        formatedLog({
          text: `A data do registo individual foi modificada para data de hoje por ser inválida ,  data Inserida: ${previewsDate}  Data Final :  ${personData.dataCad} User: Id:${auth.user?.id} Name: ${auth.user?.name} Phone: ${auth.user?.phone} BI:${auth.user?.bi}`,
          data: personData,
          auth: auth,
          request: request,
          type: LogType.warning,
          tag: { key: 'warning', value: 'Alertas' },
          context: { controller: 'PeopleController', method: 'store' },
        })
      }

      if (checkFuture) {
        if (isAfterToday(personData.dataCad)) {
          personData.dataCad = moment().toISOString()
          formatedLog({
            text: `A data do registo individual foi modificada para data de hoje por ser maior a data actual data inserida: ${previewsDate}  Data Final :  ${personData.dataCad} User: Id:${auth.user?.id} Name: ${auth.user?.name} Phone: ${auth.user?.phone} BI:${auth.user?.bi}`,
            data: personData,
            auth: auth,
            request: request,
            type: LogType.warning,
            tag: { key: 'warning', value: 'Alertas' },
            context: { controller: 'PeopleController', method: 'store' },
          })
        }
      }

      //START - CORRECÇÃO PARA DATA ERRADA
      const dateParts = personData.birthday.split('-')

      const hasMonthError = parseInt(dateParts[1]) < 1 || parseInt(dateParts[1]) > 12

      const hasDayError = parseInt(dateParts[2]) < 1 || parseInt(dateParts[2]) > 31

      let receivedDate = moment(new Date(personData.birthday), moment.ISO_8601, true)

      if (receivedDate.toISOString() === null) {
        const sentDate = personData.birthday

        const month = hasMonthError ? '01' : dateParts[1]
        const day = hasDayError ? '01' : dateParts[2]

        const changedDate = `${dateParts[0]}-${month}-${day}`

        receivedDate = moment(new Date(changedDate), moment.ISO_8601, true)

        personData.birthday = receivedDate.format(moment.HTML5_FMT.DATE)

        formatedLog({
          text:
            'Data de nascimento errada foi modificada : ' +
            sentDate +
            ' ==> ' +
            personData.birthday,
          data: personData,
          auth: auth,
          request: request,
          type: LogType.warning,
          tag: { key: 'warning', value: 'Alertas' },
          context: { controller: 'PeopleController', method: 'store' },
        })
      }

      //END-CORRECÇÃO PARA DATA ERRADA

      //MANTER A DATA CASO NÃO TENHA SOFRIDO MODIFICAÇÃO

      //Verifica se o utente tem número de documento
      if (personData.docNumber === undefined || personData.docNumber === ' ') {
        hasDocNumber = false

        //Verifica se foi enviado o nome do pai
        if (personData.fatherName === undefined || personData.fatherName === '') {
          return response.status(HttpStatusCode.OK).send({
            message: 'Utente sem documento , digite o nome do pai',
            code: HttpStatusCode.OK,
            data: [],
          })
        }
        //Verifica se foi enviado o nome da mãe
        if (personData.motherName === undefined || personData.motherName === '') {
          return response.status(HttpStatusCode.OK).send({
            message: 'Utente sem documento , digite o nome da mãe',
            code: HttpStatusCode.OK,
            data: [],
          })
        }
      }

      //Verifica se possui documento

      if (hasDocNumber) {
        //Caso tenha documento
        //Verifica se existe um utente com o número de documento enviado
        const exists = await Person.query()
          .where('docNum', personData.docNumber as string)
          .timeout(60000)
          .first()

        if (exists) {
          return response.status(HttpStatusCode.OK).send({
            message: 'Já existe um utente registrado com esse número de documento',
            code: BusinessCode.FOUND_INDIVIDUAL,
            data: exists,
          })
        }
      } else {
        //  Caso não tenha documento
        //Verifica se existe um utente com esse nome ,
        //nome do pai , mãe e data de nascimento enviada

        const exists = await Person.query()
          .where('nome', personData.name)
          .where('NomePai', personData.fatherName as string)
          .where('NomeMae', personData.motherName as string)
          .where('dtNascimento', personData.birthday)
          .timeout(60000)
          .first()

        if (exists) {
          formatedLog({
            text: 'Já existe um utente registrado com  o mesmo nome , pai , mãe e data de nascimento',
            data: personData,
            auth: auth,
            request: request,
            type: LogType.warning,
            tag: { key: 'warning', value: 'Alertas' },
            context: { controller: 'PeopleController', method: 'store' },
          })

          return response.status(HttpStatusCode.OK).send({
            message:
              'Já existe um utente registrado com  o mesmo nome , pai , mãe e data de nascimento',
            code: BusinessCode.FOUND_INDIVIDUAL,
            data: exists,
          })
        }
      }

      const person = new Person()
      //Adiciona utente usando transação para garantir que o registo suba e que tenha codigo associado
      //A inserção possuí um timeout de 60000 ms
      const insertedPerson = await person.transactionInsert(hasDocNumber, personData, 60000)

      //Caso não tenha inserido o utente
      if (insertedPerson.length === 0) {
        formatedLog({
          text: 'Não foi possível registrar o utente',
          type: LogType.error,
          data: personData,
          auth: auth,
          request: request,
        })
        return response.status(HttpStatusCode.OK).send({
          message: 'Não foi possível registrar o utente',
          code: HttpStatusCode.OK,
          data: [],
        })
      }

      const personInfo = insertedPerson[0]

      const finalFormatedPerson = {
        id: personInfo.Id_regIndividual,
        institution_id: personInfo.Id_regInstituicao,
        name: personInfo.Nome,
        phone: personInfo.Telefone,
        birthday: personInfo.dtNascimento,
        father_name: personInfo.NomePai,
        mother_name: personInfo.NomeMae,
        code: personInfo.Codigo,
      }

      const version = Env.get('API_VERSION')
      //Log de actividade
      const log = {
        id: auth.user?.id ?? 0,
        system: 'MB',
        screen: 'PeopleController/store',
        table: 'regIndividual',
        job: 'Cadastrar',
        tableId: personInfo.Id_regIndividual,
        action: 'Registro de Utente',
        actionId: `V:${version}`,
      }

      //Job para tratar a inserção de log

      await addActivityLogJob(log)

      formatedLog({
        text: 'Novo utente registrado com sucesso',
        type: LogType.success,
        data: personInfo,
        auth: auth,
        request: request,
      })
      //Utente inserido com sucesso
      return response.status(HttpStatusCode.CREATED).send({
        message: 'Utente registrado com sucesso',
        code: HttpStatusCode.CREATED,
        data: { utente: finalFormatedPerson },
      })
    } catch (error) {
      //console.log(error)

      const personJson = JSON.stringify(personData)

      //Log de erro

      const deviceInfo = JSON.stringify(formatHeaderInfo(request))
      const userInfo = formatUserInfo(auth.user)
      const errorInfo = formatError(error)

      await logError({
        type: 'MB',
        page: 'PeopleController/store',
        error: `User:${userInfo} Device: ${deviceInfo} Dados : ${personJson} - ${errorInfo}`,
        request: request,
      })

      const substring = 'Timeout: Request failed to complete in'

      if (errorInfo.includes(substring)) {
        formatedLog({
          text: 'Não foi possível completar a operação dentro do tempo esperado',
          type: LogType.warning,
          data: personData,
          auth: auth,
          request: request,
          tag: { key: 'timeout', value: 'Timeout' },
          context: { controller: 'PeopleController', method: 'store' },
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

  public async update({ auth, response, request, params }: HttpContextContract) {
    const personData = await request.validate(PersonUpdateValidator)

    try {
      const person = await Person.find(params.id)

      if (!person) {
        return response.status(HttpStatusCode.OK).send({
          message: 'Utente não encontrado',
          code: HttpStatusCode.OK,
          data: [],
        })
      }

      //START - CORRECÇÃO PARA DATA ERRADA
      const dateParts = personData.birthday.split('-')

      const hasMonthError = parseInt(dateParts[1]) < 1 || parseInt(dateParts[1]) > 12

      const hasDayError = parseInt(dateParts[2]) < 1 || parseInt(dateParts[2]) > 31

      let receivedDate = moment(new Date(personData.birthday), moment.ISO_8601, true)

      if (receivedDate.toISOString() === null) {
        const sentDate = personData.birthday

        const month = hasMonthError ? '01' : dateParts[1]
        const day = hasDayError ? '01' : dateParts[2]

        const changedDate = `${dateParts[0]}-${month}-${day}`

        receivedDate = moment(new Date(changedDate), moment.ISO_8601, true)

        personData.birthday = receivedDate.format(moment.HTML5_FMT.DATE)

        formatedLog({
          text:
            'Data de nascimento errada foi modificada : ' +
            sentDate +
            ' ==> ' +
            personData.birthday,
          data: personData,
          auth: auth,
          request: request,
          type: LogType.warning,
          tag: { key: 'warning', value: 'Alertas' },
          context: { controller: 'PeopleController', method: 'store' },
        })
      }

      //END-CORRECÇÃO PARA DATA ERRADA

      //MANTER A DATA CASO NÃO TENHA SOFRIDO MODIFICAÇÃO

      //Verifica se o utente tem número de documento
      if (personData.docNumber === undefined || personData.docNumber === ' ') {
        //Verifica se foi enviado o nome do pai
        if (personData.fatherName === undefined || personData.fatherName === '') {
          return response.status(HttpStatusCode.OK).send({
            message: 'Utente sem documento , digite o nome do pai',
            code: HttpStatusCode.OK,
            data: [],
          })
        }
        //Verifica se foi enviado o nome da mãe
        if (personData.motherName === undefined || personData.motherName === '') {
          return response.status(HttpStatusCode.OK).send({
            message: 'Utente sem documento , digite o nome da mãe',
            code: HttpStatusCode.OK,
            data: [],
          })
        }
      }

      person.merge(personData)

      await person.save()

      const version = Env.get('API_VERSION')
      //Log de actividade
      const log = {
        id: auth.user?.id ?? 0,
        system: 'MB',
        screen: 'PeopleController/updates',
        table: 'regIndividual',
        job: 'Actualizar',
        tableId: person.id,
        action: 'Actualização de Utente',
        actionId: `V:${version}`,
      }

      //Queue aproach
      await addActivityLogJob(log)

      formatedLog({
        text: 'Actualização do utente feita com sucesso',
        type: LogType.success,
        data: person,
        auth: auth,
        request: request,
      })
      //Utente inserido com sucesso
      return response.status(HttpStatusCode.CREATED).send({
        message: 'Utente registrado com sucesso',
        code: HttpStatusCode.CREATED,
        data: { utente: person },
      })
    } catch (error) {
      //console.log(error)

      const personJson = JSON.stringify(personData)

      //Log de erro

      const deviceInfo = JSON.stringify(formatHeaderInfo(request))
      const userInfo = formatUserInfo(auth.user)
      const errorInfo = formatError(error)

      await logError({
        type: 'MB',
        page: 'PeopleController/update',
        error: `User:${userInfo} Device: ${deviceInfo} Dados : ${personJson} - ${errorInfo}`,
        request: request,
      })

      const substring = 'Timeout: Request failed to complete in'

      if (errorInfo.includes(substring)) {
        formatedLog({
          text: 'Não foi possível completar a operação dentro do tempo esperado',
          type: LogType.warning,
          data: personData,
          auth: auth,
          request: request,
          tag: { key: 'timeout', value: 'Timeout' },
          context: { controller: 'PeopleController', method: 'update' },
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

  public async search({ auth, response, request }: HttpContextContract) {
    const searchView = '[SIGIS].[dbo].[vw_ListaVacinados_MB]'
    const searchData = await request.validate(SearchValidator)

    //Expressões regulares
    const regexLetterAccent = /^[a-záàâãéèêíïóôõöúçñ ]+$/i
    const regexNumberOnly = /^\d+$/

    const hasLetter = /[a-zA-Z]/
    const hasNumber = /[0-9]/

    try {
      const search = searchData.search
      const municipalityId = searchData.municipalityId

      //Pesquisa de preenchimento dos dados de pré-carregamento
      if (search === 'FILL_OFFLINE_DB') {
        if (municipalityId === undefined) {
          formatedLog({
            text: 'Tentativa de pesquisa para preenchimento de dados offline sem envio do municipio',
            data: searchData,
            auth: auth,
            request: request,
            type: LogType.warning,
            tag: { key: 'warning', value: 'Alertas' },
            context: { controller: 'PeopleController', method: 'list' },
          })
          return response.status(HttpStatusCode.OK).send({
            message: 'Pesquisa geral requer envio do id do município',
            code: HttpStatusCode.ACCEPTED,
            data: {},
          })
        }
        const data = await Database.from(searchView)
          .where('Id_Municipio', searchData.municipalityId as number)
          .select(constants.searchPeopleFields)
          .limit(searchData.limit)

        formatedLog({
          text: 'Pesquisa para preenchimento de dados offline do município feita com sucesso',
          data: searchData,
          auth: auth,
          request: request,
          type: LogType.success,
        })

        return response.status(HttpStatusCode.ACCEPTED).send({
          message: 'Resultados da consulta geral',
          code: HttpStatusCode.ACCEPTED,
          data,
        })
      }

      //Pesquisa pelo - Nome
      if (search.match(regexLetterAccent)) {
        if (searchData.limit > 100) {
          formatedLog({
            text: 'Tentativa de pesquisa por nome , com pedido de retorno  acima de 100 registos',
            data: searchData,
            auth: auth,
            request: request,
            type: LogType.warning,
            tag: { key: 'warning', value: 'Alertas' },
            context: { controller: 'PeopleController', method: 'list' },
          })
          return response.status(HttpStatusCode.ACCEPTED).send({
            message: 'A consulta por nome aceita retornar apenas 100 registros no máximo',
            code: HttpStatusCode.ACCEPTED,
            data: {},
          })
        }

        //Wildcard para pesquisa
        const wildCard = `'%${search}%'`
        const data = await Database.from(searchView)
          .select(constants.searchPeopleFields)
          .whereRaw(`Nome COLLATE SQL_Latin1_General_CP1_CI_AS LIKE ${wildCard}`)
          .timeout(60000)
          .orderBy('DataCad', 'desc')
          .paginate(searchData.page, searchData.limit)
        formatedLog({
          text: 'Pesquisa por nome realizada com sucesso',
          data: searchData,
          auth: auth,
          request: request,
          type: LogType.success,
        })
        return response.status(HttpStatusCode.ACCEPTED).send({
          message: 'Resultados da consulta por nome',
          code: HttpStatusCode.ACCEPTED,
          data,
        })
      }

      //Pesquisa pelo número de telefone
      if (search.match(regexNumberOnly) && search.length === 9) {
        const data = await Database.from(searchView)
          .select(constants.searchPeopleFields)
          .where('Telefone', search)
          .orderBy('DataCad', 'desc')
          .paginate(searchData.page, searchData.limit)

        formatedLog({
          text: 'Pesquisa por número de telefone realizada com sucesso',
          data: searchData,
          auth: auth,
          request: request,
          type: LogType.success,
        })
        return response.status(HttpStatusCode.ACCEPTED).send({
          message: 'Resultados da consulta por número de telefone',
          code: HttpStatusCode.ACCEPTED,
          data,
        })
      }

      //Pesquisa pelo CodigoNum
      if (search.match(regexNumberOnly) && search.length === 10) {
        const data = await Database.from(searchView)
          .select(constants.searchPeopleFields)
          .where('CodigoNum', search)
          .orderBy('DataCad', 'desc')
          .paginate(searchData.page, searchData.limit)

        formatedLog({
          text: 'Pesquisa  por codigoNum  realizada com sucesso',
          data: searchData,
          auth: auth,
          request: request,
          type: LogType.success,
        })

        return response.status(HttpStatusCode.ACCEPTED).send({
          message: 'Resultados da consulta por codigoNum',
          code: HttpStatusCode.ACCEPTED,
          data,
        })
      }

      //Pesquisa pelo docNum - Caso seja apenas número ou seja número e letra simultaneamente
      if (search.match(regexNumberOnly) || (search.match(hasLetter) && search.match(hasNumber))) {
        const data = await Database.from(searchView)
          .select(constants.searchPeopleFields)
          .where('docNum', search)
          .orderBy('DataCad', 'desc')
          .paginate(searchData.page, searchData.limit)
        formatedLog({
          text: 'Pesquisa  por docNum realizada com sucesso',
          data: searchData,
          auth: auth,
          request: request,
          type: LogType.success,
        })
        return response.status(HttpStatusCode.ACCEPTED).send({
          message: 'Resultados da consulta por docNum',
          code: HttpStatusCode.ACCEPTED,
          data,
        })
      }

      //Pesquisa pelo docNum - Caso seja apenas número ou seja número e letra simultaneamente
      formatedLog({
        text: 'Nenhum resultado encontrado',
        data: searchData,
        auth: auth,
        request: request,
        type: LogType.warning,
      })
      return response.status(HttpStatusCode.OK).send({
        message: 'Nenhum resultado encontrado',
        code: HttpStatusCode.OK,
        data: {},
      })
    } catch (error) {
      //console.log(error)
      //Log de erro
      const searchInfo = JSON.stringify(searchData)
      const deviceInfo = JSON.stringify(formatHeaderInfo(request))
      const userInfo = formatUserInfo(auth.user)
      const errorInfo = formatError(error)
      await logError({
        type: 'MB',
        page: 'v2:PeopleController/list',
        error: `User: ${userInfo} Device: ${deviceInfo} Dados: ${searchInfo} ${errorInfo}`,
        request: request,
      })

      const substring = 'Timeout: Request failed to complete in'

      if (errorInfo.includes(substring)) {
        formatedLog({
          text: 'Não foi possível completar a operação dentro do tempo esperado',
          type: LogType.warning,
          data: searchData,
          auth: auth,
          request: request,
          tag: { key: 'timeout', value: 'Erros' },
          context: { controller: 'PeopleController', method: 'list' },
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

  public async checkPerson({ auth, response, request }: HttpContextContract) {
    const personData = await request.validate(CheckPersonValidator)
    try {
      //Verifica se a pesquisa é por código

      if (personData.code !== undefined && personData.code !== '') {
        const person = await Person.query()
          .where('Codigo', personData.code as string)
          .timeout(60000)
          .first()

        if (person) {
          const numDose = await Database.rawQuery(constants.getNumDoses, [person.id]).timeout(60000)

          let vacinationCicle = 'N'

          if (numDose.length !== 0) {
            const doses = numDose[0]

            if (doses.NumDoseVac === doses.NumVac) {
              vacinationCicle = 'S'
            }
          }

          formatedLog({
            text: `Utente encontrado pesquisando pelo código : ${personData.code} `,
            data: person,
            auth: auth,
            request: request,
            type: LogType.success,
          })
          return response.status(HttpStatusCode.OK).send({
            message: 'Já existe um utente registrado com esse código',
            code: HttpStatusCode.OK,
            data: { person, vacinationCicle },
          })
        } else {
          formatedLog({
            text: `Código do utente não encontrado :${personData.code}`,
            data: personData,
            auth: auth,
            request: request,
            type: LogType.warning,
          })
          return response.status(HttpStatusCode.OK).send({
            message: 'Utente não encontrado',
            code: HttpStatusCode.OK,
            data: [],
          })
        }
      }

      ///PESQUISA POR BI E POR NOME , NOME PAI , NOME MÃE E DATA NASCIMENTO
      let hasDocNumber = true

      //Verifica se  tem número de documento
      if (personData.docNumber === undefined || personData.docNumber === '') {
        hasDocNumber = false

        //Verifica se foi enviado o nome
        if (personData.name === undefined || personData.name === '') {
          formatedLog({
            text: `Foi realizada pesquisa de utente sem documento faltando o nome`,
            data: personData,
            auth: auth,
            request: request,
            type: LogType.warning,
          })
          return response.status(HttpStatusCode.OK).send({
            message: 'Utente sem documento , digite o nome do utente',
            code: HttpStatusCode.OK,
            data: [],
          })
        }

        //Verifica se foi enviada a data de nascimento
        if (personData.birthday === undefined || personData.birthday === '') {
          formatedLog({
            text: `Foi realizada pesquisa de utente sem documento faltando a data de nascimento`,
            data: personData,
            auth: auth,
            request: request,
            type: LogType.warning,
          })
          return response.status(HttpStatusCode.OK).send({
            message: 'Utente sem documento , digite a data de nascimento do utente',
            code: HttpStatusCode.OK,
            data: [],
          })
        }

        //Verifica se foi enviado o nome do pai
        if (personData.fatherName === undefined || personData.fatherName === '') {
          formatedLog({
            text: `Foi realizada pesquisa de utente sem documento faltando o nome do pai`,
            data: personData,
            auth: auth,
            request: request,
            type: LogType.warning,
          })
          return response.status(HttpStatusCode.OK).send({
            message: 'Utente sem documento , digite o nome do pai',
            code: HttpStatusCode.OK,
            data: [],
          })
        }
        //Verifica se foi enviado o nome da mãe
        if (personData.motherName === undefined || personData.motherName === '') {
          formatedLog({
            text: `Foi realizada pesquisa de utente sem documento faltando o nome da mãe`,
            data: personData,
            auth: auth,
            request: request,
            type: LogType.warning,
          })
          return response.status(HttpStatusCode.OK).send({
            message: 'Utente sem documento , digite o nome da mãe',
            code: HttpStatusCode.OK,
            data: [],
          })
        }
      }

      //Verifica se possui documento

      if (hasDocNumber) {
        //Caso tenha documento
        //Verifica se existe um utente com o número de documento enviado
        const person = await Person.query()
          .where('docNum', personData.docNumber as string)
          .first()

        if (person) {
          formatedLog({
            text: `Utente encontrado pesquisando pelo número de documento  ${personData.docNumber}`,
            data: person,
            auth: auth,
            request: request,
            type: LogType.success,
          })
          return response.status(HttpStatusCode.OK).send({
            message: 'Já existe um utente registrado com esse número de documento',
            code: BusinessCode.FOUND_INDIVIDUAL,
            data: person,
          })
        }
      } else {
        //  Caso não tenha documento
        //Verifica se existe um utente com esse nome ,
        //nome do pai , mãe e data de nascimento enviada

        //VERIFICAR DATA

        const previousDate = personData.birthday

        personData.birthday = moment(personData.birthday, moment.ISO_8601, true).toISOString()

        if (personData.birthday === null) {
          const userInfo = formatUserInfo(auth.user)

          formatedLog({
            text: `O utilizador inseriu a data de nascimento errada na pesquisa  Data: ${previousDate} Utilizador:${userInfo}`,
            data: personData,
            auth: auth,
            request: request,
            type: LogType.warning,
          })
        }

        const person = await Person.query()
          .where('nome', personData.name as string)
          .where('NomePai', personData.fatherName as string)
          .where('NomeMae', personData.motherName as string)
          .where('dtNascimento', personData.birthday as string)
          .timeout(60000)
          .first()

        if (person) {
          formatedLog({
            text: `Utente encontrado pesquisando pelo nome próprio, pai , mãe e data de nascimento`,
            data: person,
            auth: auth,
            request: request,
            type: LogType.success,
          })
          return response.status(HttpStatusCode.OK).send({
            message:
              'Já existe um utente registrado com  o mesmo nome , pai , mãe e data de nascimento',
            code: BusinessCode.FOUND_INDIVIDUAL,
            data: person,
          })
        }
      }

      formatedLog({
        text: `Registro de utente não encontrado por nenhuma das formas de pesquisa`,
        data: personData,
        auth: auth,
        request: request,
        type: LogType.warning,
      })

      return response.status(HttpStatusCode.NOT_FOUND).send({
        message: 'Registro de utente não encontrado',
        code: HttpStatusCode.NOT_FOUND,
        data: {},
      })
    } catch (error) {
      //console.log(error)
      //Log de erro

      const errorInfo = formatError(error)

      const deviceInfo = JSON.stringify(formatHeaderInfo(request))
      const data = JSON.stringify(personData)
      const userInfo = formatUserInfo(auth.user)

      await logError({
        type: 'MB',
        page: 'PeopleController/checkPerson',
        error: `User: ${userInfo} Device: ${deviceInfo}  Dados: ${data} ${errorInfo}`,
        request: request,
      })

      const substring = 'Timeout: Request failed to complete in'

      if (errorInfo.includes(substring)) {
        formatedLog({
          text: 'Não foi possível completar a operação dentro do tempo esperado',
          data: personData,
          auth: auth,
          request: request,
          type: LogType.warning,
          tag: { key: 'timeout', value: 'Timeout' },
          context: { controller: 'PeopleController', method: 'checkPerson' },
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

  public async rankUser({ auth, response, request }: HttpContextContract) {
    const searchData = await request.validate(GetUserRank)
    try {
      const topUsers = await Database.rawQuery(constants.rankingQueryNational, [searchData.top])

      const provinceTopUsers = await Database.rawQuery(constants.rankingQueryProvince, [
        searchData.top,
        searchData.provinceId,
      ])

      const municipalityTopUsers = await Database.rawQuery(constants.rankingQueryMunicipality, [
        searchData.top,
        searchData.municipalityId,
      ])

      const rankNational = getUserRank(topUsers, searchData.userId)
      const rankProvince = getUserRank(provinceTopUsers, searchData.userId)
      const rankMunicipality = getUserRank(municipalityTopUsers, searchData.userId)

      return response.status(HttpStatusCode.ACCEPTED).send({
        message: `Ranking do utilizador`,
        code: HttpStatusCode.ACCEPTED,
        data: { rankNational, rankProvince, rankMunicipality },
      })
    } catch (error) {
      //console.log(error)
      //Log de erro

      formatedLog({
        text: error,
        data: {},
        auth: auth,
        request: request,
        type: LogType.error,
        tag: { key: 'timeout', value: 'Timeout' },
        context: { controller: 'PeopleController', method: 'rankUser' },
      })

      const errorInfo = formatError(error)

      const deviceInfo = JSON.stringify(formatHeaderInfo(request))
      const userInfo = formatUserInfo(auth.user)

      await logError({
        type: 'MB',
        page: 'PeopleController/rankUser',
        error: `User: ${userInfo} Device: ${deviceInfo}  ${errorInfo}`,
        request: request,
      })
      return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
        message: 'Ocorreu um erro no servidor',
        code: HttpStatusCode.INTERNAL_SERVER_ERROR,
        data: [],
      })
    }
  }

  public async searchVaccines({ auth, response, request }: HttpContextContract) {
    const searchData = await request.validate(SearchValidator)

    //Expressões regulares

    const regexNumberOnly = /^\d+$/

    const hasLetter = /[a-zA-Z]/
    const hasNumber = /[0-9]/

    try {
      const search = searchData.search

      //Pesquisa pelo CodigoNum
      if (search.match(regexNumberOnly) && search.length === 10) {
        console.log('CODIGO NUM')
        const covidVaccines = await Database.from(constantQueries.vaccinationMainTable)
          .select(constantQueries.vaccinationFields)
          .joinRaw(constantQueries.vaccinationSources)
          .where('CodigoNum', search)
          .orderBy('[SIGIS].[dbo].[vac_regVacinacao].[DataCad]', 'desc')

        const treatments = await Database.from(constantQueries.treatmentMainTable)
          .select(constantQueries.treatmentsFields)
          .joinRaw(constantQueries.treatmentSources)
          .where('CodigoNum', search)
          .orderBy('[SIGIS].[dbo].[vac_vacTratamento].[DataCad]', 'desc')

        if (!(covidVaccines.length > 0 || treatments.length > 0)) {
          formatedLog({
            text: 'O utente não existe na lista de vacinados , pesquisa por código númerico',
            data: searchData,
            auth: auth,
            request: request,
            type: LogType.success,
          })
          return response.status(HttpStatusCode.ACCEPTED).send({
            message: 'O utente não existe na lista de vacinados',
            code: HttpStatusCode.NOT_FOUND,
            data: [],
          })
        }

        const data = personVaccines(covidVaccines, treatments)

        formatedLog({
          text: 'Pesquisa  por codigoNum  realizada com sucesso',
          data: searchData,
          auth: auth,
          request: request,
          type: LogType.success,
        })

        return response.status(HttpStatusCode.ACCEPTED).send({
          message: 'Resultados da consulta por codigoNum',
          code: HttpStatusCode.ACCEPTED,
          data: {
            person: data.person,
            vaccines: data.vaccines /*, reports: notifications.vaccines*/,
          },
        })
      }

      //Pesquisa pelo telefone
      if (search.match(regexNumberOnly) && search.length === 9) {
        console.log('Pesquisa por telefone')
        const covidVaccines = await Database.from(constantQueries.vaccinationMainTable)
          .select(constantQueries.vaccinationFields)
          .joinRaw(constantQueries.vaccinationSources)
          .where('Telefone', search)
          .orderBy('[SIGIS].[dbo].[vac_regVacinacao].[DataCad]', 'desc')

        const treatments = await Database.from(constantQueries.treatmentMainTable)
          .select(constantQueries.treatmentsFields)
          .joinRaw(constantQueries.treatmentSources)
          .where('Telefone', search)
          .orderBy('[SIGIS].[dbo].[vac_vacTratamento].[DataCad]', 'desc')

        const data = listPersonVaccines(covidVaccines, treatments)

        formatedLog({
          text: 'Pesquisa  por codigoNum  realizada com sucesso',
          data: searchData,
          auth: auth,
          request: request,
          type: LogType.success,
        })

        return response.status(HttpStatusCode.ACCEPTED).send({
          message: 'Resultados da consulta por número do documento',
          code: HttpStatusCode.ACCEPTED,
          data: {
            vaccines: data /*, reports: notifications.vaccines*/,
          },
        })
      }

      //Pesquisa pelo docNum - Caso seja apenas número ou seja número e letra simultaneamente
      if (search.match(regexNumberOnly) || (search.match(hasLetter) && search.match(hasNumber))) {
        const covidVaccines = await Database.from(constantQueries.vaccinationMainTable)
          .select(constantQueries.vaccinationFields)
          .joinRaw(constantQueries.vaccinationSources)
          .where('docNum', search)
          .orderBy('[SIGIS].[dbo].[vac_regVacinacao].[DataCad]', 'desc')

        const treatments = await Database.from(constantQueries.treatmentMainTable)
          .select(constantQueries.treatmentsFields)
          .joinRaw(constantQueries.treatmentSources)
          .where('docNum', search)
          .orderBy('[SIGIS].[dbo].[vac_vacTratamento].[DataCad]', 'desc')

        if (!(covidVaccines.length > 0 || treatments.length > 0)) {
          formatedLog({
            text: 'O utente não existe na lista de vacinados , pesquisa por número do documento',
            data: searchData,
            auth: auth,
            request: request,
            type: LogType.success,
          })
          return response.status(HttpStatusCode.ACCEPTED).send({
            message: 'O utente não existe na lista de vacinados',
            code: HttpStatusCode.NOT_FOUND,
            data: [],
          })
        }

        const data = personVaccines(covidVaccines, treatments)

        formatedLog({
          text: 'Pesquisa  por codigoNum  realizada com sucesso',
          data: searchData,
          auth: auth,
          request: request,
          type: LogType.success,
        })

        return response.status(HttpStatusCode.ACCEPTED).send({
          message: 'Resultados da consulta por número do documento',
          code: HttpStatusCode.ACCEPTED,
          data: {
            person: data.person,
            vaccines: data.vaccines /*, reports: notifications.vaccines*/,
          },
        })
      }

      formatedLog({
        text: 'O utente não existe na lista de vacinados , pesquisa fora dos campos padrão',
        data: searchData,
        auth: auth,
        request: request,
        type: LogType.error,
      })
      return response.status(HttpStatusCode.ACCEPTED).send({
        message: 'O utente não existe na lista de vacinados',
        code: HttpStatusCode.NOT_FOUND,
        data: [],
      })
    } catch (error) {
      //console.log(error)
      //Log de erro
      const searchInfo = JSON.stringify(searchData)
      const deviceInfo = JSON.stringify(formatHeaderInfo(request))
      const userInfo = formatUserInfo(auth.user)
      const errorInfo = formatError(error)
      await logError({
        type: 'MB',
        page: 'v2:PeopleController/searchVaccines',
        error: `User: ${userInfo} Device: ${deviceInfo} Dados: ${searchInfo} ${errorInfo}`,
        request: request,
      })

      const substring = 'Timeout: Request failed to complete in'

      if (errorInfo.includes(substring)) {
        formatedLog({
          text: 'Não foi possível completar a operação dentro do tempo esperado',
          type: LogType.warning,
          data: searchData,
          auth: auth,
          request: request,
          tag: { key: 'timeout', value: 'Erros' },
          context: { controller: 'PeopleController', method: 'list' },
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

  public async searchVaccinesById({ auth, response, request }: HttpContextContract) {
    const searchData = await request.validate(SearchByIdValidator)

    //Expressões regulares

    try {
      const search = searchData.id

      //Pesquisa pelo CodigoNum

      const covidVaccines = await Database.from(constantQueries.vaccinationMainTable)
        .select(constantQueries.vaccinationFields)
        .joinRaw(constantQueries.vaccinationSources)
        .where('[vac_regIndividual].[Id_regIndividual]', search)
        .orderBy('[SIGIS].[dbo].[vac_regVacinacao].[DataCad]', 'desc')

      const treatments = await Database.from(constantQueries.treatmentMainTable)
        .select(constantQueries.treatmentsFields)
        .joinRaw(constantQueries.treatmentSources)
        .where('[vac_regIndividual].[Id_regIndividual]', search)
        .orderBy('[SIGIS].[dbo].[vac_vacTratamento].[DataCad]', 'desc')

      if (!(covidVaccines.length > 0 || treatments.length > 0)) {
        formatedLog({
          text: 'O utente não existe na lista de vacinados , pesquisa por id do utente',
          data: searchData,
          auth: auth,
          request: request,
          type: LogType.success,
        })
        return response.status(HttpStatusCode.ACCEPTED).send({
          message: 'O utente não existe na lista de vacinados',
          code: HttpStatusCode.NOT_FOUND,
          data: [],
        })
      }

      const data = personVaccines(covidVaccines, treatments)

      formatedLog({
        text: 'Pesquisa  por codigoNum  realizada com sucesso',
        data: searchData,
        auth: auth,
        request: request,
        type: LogType.success,
      })

      return response.status(HttpStatusCode.ACCEPTED).send({
        message: 'Resultados da consulta por codigoNum',
        code: HttpStatusCode.ACCEPTED,
        data: {
          person: data.person,
          vaccines: data.vaccines /*, reports: notifications.vaccines*/,
        },
      })
    } catch (error) {
      //console.log(error)
      //Log de erro
      const searchInfo = JSON.stringify(searchData)
      const deviceInfo = JSON.stringify(formatHeaderInfo(request))
      const userInfo = formatUserInfo(auth.user)
      const errorInfo = formatError(error)
      await logError({
        type: 'MB',
        page: 'v2:PeopleController/searchVaccines',
        error: `User: ${userInfo} Device: ${deviceInfo} Dados: ${searchInfo} ${errorInfo}`,
        request: request,
      })

      const substring = 'Timeout: Request failed to complete in'

      if (errorInfo.includes(substring)) {
        formatedLog({
          text: 'Não foi possível completar a operação dentro do tempo esperado',
          type: LogType.warning,
          data: searchData,
          auth: auth,
          request: request,
          tag: { key: 'timeout', value: 'Erros' },
          context: { controller: 'PeopleController', method: 'list' },
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
}
