import Database from '@ioc:Adonis/Lucid/Database'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import generateCode from 'Contracts/functions/generate_code'

export default class Person extends BaseModel {
  public static table = 'vac_regIndividual'

  @column({ isPrimary: true, columnName: 'Id_regIndividual' })
  public id: number

  @column({ columnName: 'Id_regInstituicao' })
  public institutionId: number

  @column({ columnName: 'Nome' })
  public name: string

  @column({ columnName: 'Telefone' })
  public phone: string

  @column({ columnName: 'Email' })
  public email: string

  @column({ columnName: 'Genero' })
  public genre: string

  @column({ columnName: 'dtNascimento' })
  public birthday: string

  @column({ columnName: 'Id_tipoDocumento' })
  public doctypeId: number
  @column({ columnName: 'docNum' })
  public docNumber: string

  @column({ columnName: 'Id_Nacionalidade' })
  public nationalityId: number

  @column({ columnName: 'Id_provincia' })
  public provinceId: number
  @column({ columnName: 'Id_Municipio' })
  public municipalityId: number
  @column({ columnName: 'Id_Categoria' })
  public categoryId: number

  @column({ columnName: 'Codigo' })
  public code: string

  @column({ columnName: 'Status' })
  public status: string

  @column({ columnName: 'DataCad' })
  public dataCad: string

  @column({ columnName: 'FlagRegSimp' })
  public flagRegSimp: string

  /*Não foi inserida no corpo da requisição para inserção*/
  @column({ columnName: 'Id_regDoencas' })
  public regDiseaseId: string

  @column({ columnName: 'Id_Setor' })
  public sectorId: number

  @column({ columnName: 'Comorbilidade' })
  public coMorbidity: string

  @column({ columnName: 'Observacao' })
  public observation: string

  @column({ columnName: 'WebAlt' })
  public webAlt: string

  @column({ columnName: 'NomePai' })
  public fatherName: string

  @column({ columnName: 'NomeMae' })
  public motherName: string
  @column({ columnName: 'Certificacao' })
  public certification: string
  @column({ columnName: 'CodigoNum' })
  public codeNumber: string

  @column({ columnName: 'NCartao' })
  public cardNumber: string

  public async transactionInsert(hasDocNumber, personData, timeout) {
    let newPerson
    await Database.transaction(async (trx) => {
      newPerson = await trx
        .table('vac_regIndividual')
        .returning([
          'Id_regIndividual',
          'Id_regInstituicao',
          'Nome',
          'Telefone',
          'dtNascimento',
          'NomePai',
          'NomeMae',
        ])
        .insert({
          Id_regInstituicao: personData.institutionId,
          Nome: personData.name,
          NomePai: personData.fatherName,
          NomeMae: personData.motherName,
          Telefone: personData.phone,
          Email: personData.email,
          Genero: personData.genre,
          dtNascimento: personData.birthday,
          Id_tipoDocumento: personData.doctypeId,
          docNum: personData.docNumber,
          Id_Nacionalidade: personData.nationalityId,
          Id_provincia: personData.provinceId,
          Id_Municipio: personData.municipalityId,
          Id_Categoria: personData.categoryId,
          Status: personData.status,
          DataCad: personData.dataCad,
          FlagRegSimp: personData.flagRegSimp,
          Id_Setor: personData.sectorId,
          Comorbilidade: personData.coMorbidity,
          Observacao: personData.observation,
          CodigoNum: personData.codeNumber,
        })
        .timeout(timeout)

      if (newPerson.length > 0) {
        const id = newPerson[0].Id_regIndividual

        //Gerar a referência - codigo
        //Para o caso de utente sem BI gerar  PM-Referência
        const code = generateCode(id.toString())

        //Verifica se possui documento , caso tenha actualiza apenas o codigo ,
        // caso não tenha actualiza o codigo e o docNum
        if (hasDocNumber) {
          await trx
            .from('vac_regIndividual')
            .where('Id_regIndividual', id)
            .update({ Codigo: code })
            .timeout(timeout)
        } else {
          //Caso não tenha documento de identificação
          await trx
            .from('vac_regIndividual')
            .where('Id_regIndividual', id)
            .update({ Codigo: code, docNum: 'PM' + code })
            .timeout(timeout)
        }
      }
    })

    return newPerson
  }
}
