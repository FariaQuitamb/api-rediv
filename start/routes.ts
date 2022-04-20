/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'
import HealthCheck from '@ioc:Adonis/Core/HealthCheck'
import Vaccination from 'App/Models/Vaccination'

Route.get('/', async () => {
  const data = Vaccination.query().preload('person').preload('vaccine').preload('user').limit(100)

  return data
  //return { hello: 'world', title: 'It Works!' }
})

Route.get('health', async ({ response }) => {
  const report = await HealthCheck.getReport()
  return report.healthy ? response.ok(report) : response.badRequest(report)
})

//Auth Login
Route.post('auth/login', 'AuthController.login')

Route.get('preload', 'PreloadsController.index')
Route.resource('people', 'PeopleController')
Route.post('vaccination/first', 'VaccinationsController.store')
Route.post('vaccination/secondorbooster', 'VaccinationsController.secondOrBooster')

Route.group(() => {
  Route.get('auth/logout', 'AuthController.logout')
  Route.get('auth/logged', 'AuthController.show')
}).middleware('auth:api')
