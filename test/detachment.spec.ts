import User from 'App/Models/User'
import test from 'japa'
import supertest from 'supertest'
import Database from '@ioc:Adonis/Lucid/Database'

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`

test.group('Welcome', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  /*
  test('ensure detachment list is returned', async (assert) => {
    const { text } = await supertest(BASE_URL).get('/detachments').expect(200)

    const { title } = JSON.parse(text)
    assert.exists(title)
    assert.equal(title, 'It Works!')
  })
*/
})
