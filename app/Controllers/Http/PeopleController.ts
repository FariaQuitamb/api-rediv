import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Person from 'App/Models/Person'
import PersonValidator from 'App/Validators/PersonValidator'

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
          return response.status(500).send({
            message: 'Utente sem documento , digite o nome do pai!',
            code: '200',
            data: [],
          })
        }
        //Verifica se foi enviado o nome da mãe
        if (personData.motherName === undefined || personData.motherName === '') {
          return response.status(500).send({
            message: 'Utente sem documento , digite o nome da mãe!',
            code: '200',
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
          return response.status(500).send({
            message: 'Já existe um utente registrado com esse número de documento!',
            code: '200',
            data: [],
          })
        }
      } else {
        //  Caso não tenha documento
        //Verifica se existe um utente com o nome ,
        //nome do pai , mãe e data de nascimento enviada

        const exists = await Person.query()

          .where('nome', personData.name)
          .where('NomePai', personData.fatherName)
          .where('NomeMae', personData.motherName)
          .where('dtNascimento', personData.birthday)
          .limit(1)

        if (exists.length > 0) {
          return response.status(500).send({
            message:
              'Já existe um utente registrado com  o mesmo nome , pai , mãe e data de nascimento!',
            code: '200',
            data: [],
          })
        }
      }

      const person = await Person.create(personData)

      //Caso não tenha inserido o utente
      if (!person) {
        return response.status(200).send({
          message: 'Não foi possível registrar o utente!',
          code: 200,
          data: [],
        })
      }

      //Utente inserido com sucesso
      return response.status(201).send({
        message: 'Utente registrado com sucesso!',
        code: 201,
        data: { utente: person },
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
