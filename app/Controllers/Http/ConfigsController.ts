import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import fs from 'fs/promises'
import path from 'path'

export default class ConfigsController {
  public async getMobileVersion({}: HttpContextContract) {
    console.log(__dirname)
    const fileName = path.resolve('../../../', 'mobile_version.json')
    console.log(`PATH IS : ${fileName}`)
    try {
      const data = await fs.readFile(fileName, 'utf8')
      console.log(data)
      const content = 'Some content!'
      await fs.writeFile(fileName, content)
      console.log('Wrote some content!')
      const newData = await fs.readFile(fileName, 'utf8')
      console.log(newData)
    } catch (err) {
      console.log(err)
    }
  }

  public async changeAppVersion({}: HttpContextContract) {}

  public async store({}: HttpContextContract) {}

  public async show({}: HttpContextContract) {}

  public async edit({}: HttpContextContract) {}

  public async update({}: HttpContextContract) {}

  public async destroy({}: HttpContextContract) {}
}
