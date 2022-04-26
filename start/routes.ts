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
import vaccinationLog from 'Contracts/functions/vaccination_log'

Route.get('/', async () => {
  /*
  const log = await vaccinationLog({
    userId: 1,
    vaccinationId: 23,
    system: 'API_MB',
    job: 'Cadastrar',
    screen: 'VaccinationController/store',
    action: 'Cadastrar Vacina',
    observation: '',
    userPostoVaccination: 1,
  })

  return log
*/
  return { hello: 'world', title: 'It Works!' }
})

Route.get('health', async ({ response }) => {
  const report = await HealthCheck.getReport()
  return report.healthy ? response.ok(report) : response.badRequest(report)
})

//Auth Login
Route.post('auth/login', 'AuthController.login')

Route.group(() => {
  Route.get('auth/logout', 'AuthController.logout')
  //Preload Route
  Route.get('preload', 'PreloadsController.index')
  //Person
  Route.post('people', 'PeopleController.store')
  Route.post('people/search', 'PeopleController.list')
  //Vaccination
  Route.post('vaccination/', 'VaccinationsController.store')
  Route.post('vaccination/booster', 'VaccinationsController.booster')
}).middleware('auth:api')
