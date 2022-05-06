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
import regVaccinationLog from 'Contracts/functions/reg_vaccination_log'
import formatDeviceInfo from 'Contracts/functions/format_device_info'
import geoLog from 'Contracts/functions/geo_log'

Route.get('/', async ({ request }) => {
  return { hello: 'world', title: 'It Works!' }
})

Route.get('health', async ({ response }) => {
  const report = await HealthCheck.getReport()
  return report.healthy ? response.ok(report) : response.badRequest(report)
})

//Auth Login
Route.post('auth/login', 'AuthController.login')

Route.group(() => {
  //Auth
  Route.get('auth/logout', 'AuthController.logout')
  Route.get('auth/logged', 'AuthController.loggedUsers')
  //Preload Route
  Route.get('preload', 'PreloadsController.index')
  //Person
  Route.post('people', 'PeopleController.store')
  Route.post('people/search', 'PeopleController.list')
  Route.post('people/check', 'PeopleController.checkPerson')
  //Vaccination
  Route.post('vaccination/', 'VaccinationsController.store')
  Route.post('vaccination/booster', 'VaccinationsController.booster')
  //Logs

  Route.post('logs/error', 'LogsController.getErrorLogs')
  Route.post('logs/activity', 'LogsController.getLogs')
  Route.post('logs/vaccine', 'LogsController.getVaccineLogs')
  Route.post('logs/vaccine/geo', 'LogsController.getVaccineGeoLogs')
}).middleware('auth:api')
