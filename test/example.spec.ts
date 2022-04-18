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

  test.group('Example', () => {
    test('assert sum', (assert) => {
      assert.equal(2 + 2, 4)
    })
  })
  test('ensure home page works', async (assert) => {
    const { text } = await supertest(BASE_URL).get('/').expect(200)

    const { title } = JSON.parse(text)
    assert.exists(title)
    assert.equal(title, 'It Works!')
  })

  test('ensure user password gets hashed during save', async (assert) => {
    const user = new User()
    user.email = 'virk@adonisjs.com'
    user.password = 'secret'
    await user.save()

    assert.notEqual(user.password, 'secret')
  })

  //Single test execution
  /*
  test.only('ensure user password gets hashed during save', async (assert) => {
    const user = new User()
    user.email = 'virk@adonisjs.com'
    user.password = 'secret'
    await user.save()

    assert.notEqual(user.password, 'secret')
  })*/
})
