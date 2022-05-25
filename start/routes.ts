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
import VaccinationMessage from 'App/Models/VaccinationMessage'
import VaccinationPostMessage from 'App/Models/VaccinationPostMessage'
import moment from 'moment'
import VaccinationPostUserMessage from 'App/Models/VaccinationPostUserMessage'

Route.get('/', async () => {
  const msg = await VaccinationMessage.query()
  const postMsg = await VaccinationPostMessage.query().preload('messages', (query) =>
    query.preload('archives')
  )
  const userMsg = await VaccinationPostUserMessage.query().preload('messages', (query) =>
    query.preload('archives')
  )
  return { postMsg, userMsg, hello: 'world', title: 'It Works!' }
})

Route.get('v2/health', async ({ response }) => {
  const report = await HealthCheck.getReport()
  return report.healthy ? response.ok(report) : response.badRequest(report)
})

//Auth Login
Route.post('v2/auth/login', 'AuthController.login')

Route.group(() => {
  //Auth
  Route.get('auth/logout', 'AuthController.logout')
  Route.post('auth/logged', 'AuthController.loggedUsers')
  Route.post('auth/logged_users', 'AuthController.loggedUsersView')
  //Preload Route
  Route.get('preload', 'PreloadsController.index')
  //Person
  Route.post('people', 'PeopleController.store')
  Route.post('people/search', 'PeopleController.list')
  Route.post('people/check', 'PeopleController.checkPerson')

  //RANKING
  Route.post('ranking', 'PeopleController.getUserRankNational')

  //Vaccination
  Route.post('vaccination/', 'VaccinationsController.store')
  Route.post('vaccination/booster', 'VaccinationsController.booster')

  //Goals
  Route.post('goals/postgoal', 'GoalsController.getVaccinationPostGoal')

  //Logs
  Route.post('logs/error', 'LogsController.getErrorLogs')
  Route.post('logs/activity', 'LogsController.getLogs')
  Route.post('logs/vaccine', 'LogsController.getVaccineLogs')
  Route.post('logs/vaccine/geo', 'LogsController.getVaccineGeoLogs')
  //API ACCESS ROUTE

  Route.post('accesses/list', 'ApiAcessesController.index')
  Route.post('accesses', 'ApiAcessesController.store')
  Route.post('accesses/state', 'ApiAcessesController.changeState')
})
  .prefix('v2')
  .middleware('auth:api')
