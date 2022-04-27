import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import Person from 'App/Models/Person'
import PersonValidator from 'App/Validators/PersonValidator'
import SearchValidator from 'App/Validators/SearchValidator'
import HttpStatusCode from 'Contracts/enums/HttpStatusCode'
import formatError from 'Contracts/functions/format_error'
import generateCode from 'Contracts/functions/generate_code'
import logError from 'Contracts/functions/log_error'
import logRegister from 'Contracts/functions/log_register'

export default class PeopleController {
  public async index({ response }: HttpContextContract) {
    const data = await Person.query().limit(200)
    return response.send(data)
  }

  public async store({ auth, response, request }: HttpContextContract) {
    const personData = await request.validate(PersonValidator)
    try {
      let hasDocNumber = true

      //Verifica se o utente tem número de documento
      if (personData.docNumber === undefined || personData.docNumber === '') {
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
        const exists = await Person.query().where('docNum', personData.docNumber).limit(1)

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
          .limit(1)

        if (exists.length > 0) {
          return response.status(HttpStatusCode.OK).send({
            message:
              'Já existe um utente registrado com  o mesmo nome , pai , mãe e data de nascimento!',
            code: HttpStatusCode.OK,
            data: exists,
          })
        }
      }

      const person = await Person.create(personData)

      //Caso não tenha inserido o utente
      if (!person) {
        return response.status(HttpStatusCode.OK).send({
          message: 'Não foi possível registrar o utente!',
          code: HttpStatusCode.OK,
          data: [],
        })
      }

      //Gerar a referência - codigo
      //Para o caso de utente sem BI gerar  PM-Referência
      const code = generateCode(person.id.toString())

      //Verifica se possui documento , caso tenha actualiza apenas o codigo ,
      // caso não tenha actualiza o codigo e o docNum
      if (hasDocNumber) {
        person.merge({ code: code }).save()
      } else {
        //Caso não tenha documento de identificação
        person.merge({ code: code, docNumber: 'PM' + code }).save()
      }

      //Log de actividade

      await logRegister({
        id: auth.user?.id ?? 0,
        system: 'MB',
        screen: 'PeopleController/store',
        table: 'regIndividual',
        job: 'Cadastrar',
        tableId: person.id,
        action: 'Registro de Utente',
        actionId: person.id.toString(),
      })

      //Utente inserido com sucesso
      return response.status(HttpStatusCode.CREATED).send({
        message: 'Utente registrado com sucesso!',
        code: HttpStatusCode.CREATED,
        data: { utente: person },
      })
    } catch (error) {
      console.log(error)
      //Log de erro
      const errorInfo = formatError(error)
      await logError({ type: 'MB', page: 'PeopleController/store', error: errorInfo })
      return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
        message: 'Ocorreu um erro no servidor!',
        code: HttpStatusCode.INTERNAL_SERVER_ERROR,
        data: [],
      })
    }
  }

  public async list({ response, request }: HttpContextContract) {
    const searchView = '[SIGIS].[dbo].[vw_ListaVacinados_MB]'
    const searchData = await request.validate(SearchValidator)

    //Expressões regulares
    const regexLetterAccent = /^[a-záàâãéèêíïóôõöúçñ ]+$/i
    const regexNumberOnly = /^\d+$/

    const hasLetter = /[a-zA-Z]/
    const hasNumber = /[0-9]/

    try {
      const search = searchData.search

      //Pesquisa pelo - Nome
      if (search.match(regexLetterAccent)) {
        //Wildcard para pesquisa
        const wildCard = `%${search}%`
        const data = await Database.from(searchView)
          .where('Nome', 'LIKE', wildCard)
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
          .where('Telefone', search)
          .paginate(searchData.page, searchData.limit)
        return response.status(HttpStatusCode.ACCEPTED).send({
          message: 'Resultados da consulta por número de telefone!',
          code: HttpStatusCode.ACCEPTED,
          data,
        })
      }

      //Pesquisa pelo número de telefone - Mudar para 13
      if (search.match(regexNumberOnly) && search.length === 10) {
        const data = await Database.from(searchView)
          .where('CodigoNum', search)
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
          .where('docNum', search)
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
      console.log(error)
      //Log de erro
      const errorInfo = formatError(error)
      await logError({ type: 'MB', page: 'PeopleController/list', error: errorInfo })
      return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
        message: 'Ocorreu um erro no servidor!',
        code: HttpStatusCode.INTERNAL_SERVER_ERROR,
        data: [],
      })
    }
  }
}
