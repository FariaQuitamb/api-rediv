import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Person from 'App/Models/Person'
import PersonValidator from 'App/Validators/PersonValidator'
import HttpStatusCode from 'Contracts/enums/HttpStatusCode'
import generateCode from 'Contracts/functions/generate_code'

export default class PeopleController {
  public async index({ response }: HttpContextContract) {
    const data = await Person.query().limit(200)
    return response.send(data)
  }

  public async store({ response, request }: HttpContextContract) {
    const personData = await request.validate(PersonValidator)
    try {
      let hasDocNumber = true

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
        //Verifica se existe um utente com o nome ,
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
            data: [],
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
        person.merge({ code: code, docNumber: 'PM' + code }).save()
      }

      //Utente inserido com sucesso
      return response.status(HttpStatusCode.CREATED).send({
        message: 'Utente registrado com sucesso!',
        code: HttpStatusCode.CREATED,
        data: { utente: person },
      })
    } catch (error) {
      console.log(error)
      return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
        message: 'Ocorreu um erro no servidor!',
        code: HttpStatusCode.INTERNAL_SERVER_ERROR,
        data: [],
      })
    }
  }
}
