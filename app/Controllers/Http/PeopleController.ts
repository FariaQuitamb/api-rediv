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
import logRegister from 'Contracts/functions/log_register'
import moment from 'moment'
import Env from '@ioc:Adonis/Core/Env'
import GetUserRank from 'App/Validators/getUserRank'
import getUserRank from 'Contracts/functions/get_user_rank'
import formatedLog, { LogType } from 'Contracts/functions/formated_log'
import isAfterToday from 'Contracts/functions/isafter_today'

export default class PeopleController {
  public async store({ auth, response, request }: HttpContextContract) {
    const personData = await request.validate(PersonValidator)
    try {
      let hasDocNumber = true

      if (isAfterToday(personData.dataCad)) {
        const previewsDate = personData.dataCad
        personData.dataCad = moment().toISOString()
        formatedLog(
          `A data do registo individual foi modificada para data de hoje! Data Inserida: ${previewsDate} User: Id:${auth.user?.id} Name: ${auth.user?.name} Phone: ${auth.user?.phone} BI:${auth.user?.bi}`,
          LogType.warning
        )
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

        formatedLog(
          'Data de nascimento errada foi modificada : ' + sentDate + ' ==> ' + personData.birthday,
          LogType.warning
        )
      }

      //END-CORRECÇÃO PARA DATA ERRADA

      //Verifica se o utente tem número de documento
      if (personData.docNumber === undefined || personData.docNumber === ' ') {
        hasDocNumber = false

        //Verifica se foi enviado o nome do pai
        if (personData.fatherName === undefined || personData.fatherName === '') {
          return response.status(HttpStatusCode.OK).send({
            message: 'Utente sem documento , digite o nome do pai!',
            code: HttpStatusCode.OK,
            data: [],
          })
        }
        //Verifica se foi enviado o nome da mãe
        if (personData.motherName === undefined || personData.motherName === '') {
          return response.status(HttpStatusCode.OK).send({
            message: 'Utente sem documento , digite o nome da mãe!',
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
          .limit(1)

        if (exists.length > 0) {
          return response.status(HttpStatusCode.OK).send({
            message: 'Já existe um utente registrado com esse número de documento!',
            code: HttpStatusCode.OK,
            data: [],
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
          formatedLog(
            'Já existe um utente registrado com  o mesmo nome , pai , mãe e data de nascimento!: ',
            LogType.warning
          )
          return response.status(HttpStatusCode.OK).send({
            message:
              'Já existe um utente registrado com  o mesmo nome , pai , mãe e data de nascimento!',
            code: HttpStatusCode.OK,
            data: exists,
          })
        }
      }

      //Mudança : formatação da data
      //const dateBefore = personData.dataCad
      personData.dataCad = moment(personData.dataCad, moment.ISO_8601, true).toISOString()
      //const dateAfter = personData.dataCad

      if (personData.dataCad === null) {
        //Log de erro
        const personJson = JSON.stringify(personData)
        const deviceInfo = JSON.stringify(formatHeaderInfo(request))
        const userInfo = formatUserInfo(auth.user)

        await logError({
          type: 'MB',
          page: 'PeopleController/store',
          error: `User:${userInfo} Device: ${deviceInfo} Dados : ${personJson} `,
        })
        return response.status(HttpStatusCode.OK).send({
          message: 'Data de  cadastro inválida!',
          code: HttpStatusCode.OK,
          data: {},
        })
      }

      const person = new Person()
      //Adiciona utente usando transação para garantir que o registo suba e que tenha codigo associado
      //A inserção possuí um timeout de 60000 ms
      const insertedPerson = await person.transactionInsert(hasDocNumber, personData, 60000)

      const personInfo = insertedPerson[0]

      //Caso não tenha inserido o utente
      if (insertedPerson.length === 0) {
        formatedLog('Não foi possível registrar o utente!', LogType.error)
        return response.status(HttpStatusCode.OK).send({
          message: 'Não foi possível registrar o utente!',
          code: HttpStatusCode.OK,
          data: [],
        })
      }

      const version = Env.get('API_VERSION')
      //Log de actividade
      await logRegister({
        id: auth.user?.id ?? 0,
        system: 'MB',
        screen: 'PeopleController/store',
        table: 'regIndividual',
        job: 'Cadastrar',
        tableId: personInfo.Id_regIndividual,
        action: 'Registro de Utente',
        actionId: `V:${version}-ID:${personInfo.Id_regIndividual.toString()}`,
      })

      formatedLog('Novo utente registrado com sucesso!', LogType.success)
      //Utente inserido com sucesso
      return response.status(HttpStatusCode.CREATED).send({
        message: 'Utente registrado com sucesso!',
        code: HttpStatusCode.CREATED,
        data: { utente: personInfo },
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
      })

      const substring = 'Timeout: Request failed to complete in'

      if (errorInfo.includes(substring)) {
        //console.log('Não foi possível completar a operação dentro do tempo esperado!')

        formatedLog(
          'Não foi possível completar a operação dentro do tempo esperado!',
          LogType.warning
        )

        return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
          message: 'Não foi possível completar a operação dentro do tempo esperado!',
          code: HttpStatusCode.INTERNAL_SERVER_ERROR,
          data: [],
        })
      }

      return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
        message: 'Ocorreu um erro no servidor!',
        code: HttpStatusCode.INTERNAL_SERVER_ERROR,
        data: [],
      })
    }
  }

  public async list({ auth, response, request }: HttpContextContract) {
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
          return response.status(HttpStatusCode.OK).send({
            message: 'Pesquisa geral requer envio do id do município!',
            code: HttpStatusCode.ACCEPTED,
            data: {},
          })
        }
        const data = await Database.from(searchView)
          .where('Id_Municipio', searchData.municipalityId as number)
          .select(constants.searchPeopleFields)
          .limit(searchData.limit)
        return response.status(HttpStatusCode.ACCEPTED).send({
          message: 'Resultados da consulta geral',
          code: HttpStatusCode.ACCEPTED,
          data,
        })
      }

      //Pesquisa pelo - Nome
      if (search.match(regexLetterAccent)) {
        if (searchData.limit > 100) {
          return response.status(HttpStatusCode.ACCEPTED).send({
            message: 'A consulta por nome aceita retornar apenas 100 registros no máximo!',
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
        return response.status(HttpStatusCode.ACCEPTED).send({
          message: 'Resultados da consulta por nome!',
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
        return response.status(HttpStatusCode.ACCEPTED).send({
          message: 'Resultados da consulta por número de telefone!',
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
        return response.status(HttpStatusCode.ACCEPTED).send({
          message: 'Resultados da consulta por codigoNum!',
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
        return response.status(HttpStatusCode.ACCEPTED).send({
          message: 'Resultados da consulta por docNum!',
          code: HttpStatusCode.ACCEPTED,
          data,
        })
      }

      //Pesquisa pelo docNum - Caso seja apenas número ou seja número e letra simultaneamente

      return response.status(HttpStatusCode.OK).send({
        message: 'Nenhum resultado encontrado!',
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
      })

      const substring = 'Timeout: Request failed to complete in'

      if (errorInfo.includes(substring)) {
        //console.log('Não foi possível completar a operação dentro do tempo esperado!')

        formatedLog(
          'Não foi possível completar a operação dentro do tempo esperado!',
          LogType.warning
        )

        return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
          message: 'Não foi possível completar a operação dentro do tempo esperado!',
          code: HttpStatusCode.INTERNAL_SERVER_ERROR,
          data: [],
        })
      }

      return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
        message: 'Ocorreu um erro no servidor!',
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
          return response.status(HttpStatusCode.OK).send({
            message: 'Já existe um utente registrado com esse código!',
            code: HttpStatusCode.OK,
            data: { person, vacinationCicle },
          })
        } else {
          return response.status(HttpStatusCode.OK).send({
            message: 'Utente não encontrado!',
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
          return response.status(HttpStatusCode.OK).send({
            message: 'Utente sem documento , digite o nome do utente!',
            code: HttpStatusCode.OK,
            data: [],
          })
        }

        //Verifica se foi enviada a data de nascimento
        if (personData.name === undefined || personData.name === '') {
          return response.status(HttpStatusCode.OK).send({
            message: 'Utente sem documento , digite a data de nascimento do utente!',
            code: HttpStatusCode.OK,
            data: [],
          })
        }

        //Verifica se foi enviado o nome do pai
        if (personData.fatherName === undefined || personData.fatherName === '') {
          return response.status(HttpStatusCode.OK).send({
            message: 'Utente sem documento , digite o nome do pai!',
            code: HttpStatusCode.OK,
            data: [],
          })
        }
        //Verifica se foi enviado o nome da mãe
        if (personData.motherName === undefined || personData.motherName === '') {
          return response.status(HttpStatusCode.OK).send({
            message: 'Utente sem documento , digite o nome da mãe!',
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
          return response.status(HttpStatusCode.OK).send({
            message: 'Já existe um utente registrado com esse número de documento!',
            code: HttpStatusCode.OK,
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

          formatedLog(
            `O utilizador inseriu a data de nascimento errada!  Data: ${previousDate} Utilizador:${userInfo}`,
            LogType.warning
          )
          /*  return response.status(HttpStatusCode.CONFLICT).send({
            message: 'Data de nascimento mal formada!',
            code: HttpStatusCode.OK,
            data: [],
          })*/
        }

        const person = await Person.query()
          .where('nome', personData.name as string)
          .where('NomePai', personData.fatherName as string)
          .where('NomeMae', personData.motherName as string)
          .where('dtNascimento', personData.birthday as string)
          .timeout(60000)
          .first()

        if (person) {
          return response.status(HttpStatusCode.OK).send({
            message:
              'Já existe um utente registrado com  o mesmo nome , pai , mãe e data de nascimento!',
            code: HttpStatusCode.OK,
            data: person,
          })
        }
      }

      return response.status(HttpStatusCode.NOT_FOUND).send({
        message: 'Registro de utente não encontrado!',
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
      })

      const substring = 'Timeout: Request failed to complete in'

      if (errorInfo.includes(substring)) {
        //console.log('Não foi possível completar a operação dentro do tempo esperado!')

        formatedLog(
          'Não foi possível completar a operação dentro do tempo esperado!',
          LogType.warning
        )

        return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
          message: 'Não foi possível completar a operação dentro do tempo esperado!',
          code: HttpStatusCode.INTERNAL_SERVER_ERROR,
          data: [],
        })
      }

      return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
        message: 'Ocorreu um erro no servidor!',
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

      formatedLog(error, LogType.error)

      const errorInfo = formatError(error)

      const deviceInfo = JSON.stringify(formatHeaderInfo(request))
      const userInfo = formatUserInfo(auth.user)

      await logError({
        type: 'MB',
        page: 'PeopleController/rankUser',
        error: `User: ${userInfo} Device: ${deviceInfo}  ${errorInfo}`,
      })
      return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
        message: 'Ocorreu um erro no servidor!',
        code: HttpStatusCode.INTERNAL_SERVER_ERROR,
        data: [],
      })
    }
  }
}
