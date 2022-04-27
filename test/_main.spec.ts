//import User from 'App/Models/User'
import test from 'japa'
//import supertest from 'supertest'
import Database from '@ioc:Adonis/Lucid/Database'

//const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`

test.group('Welcome', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  /*
  test('ensure data is preloaded', async (assert) => {
    const { text } = await supertest(BASE_URL)
      .post('/provinces')
      .set('Accept', 'application/json')
      .send({ provinceName: 'Luanda' })
      .expect(202)

    // const { provinceName } = JSON.stringify(text)
    // assert.exists(provinceName)
  })*/
})
