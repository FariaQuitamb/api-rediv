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

import Env from '@ioc:Adonis/Core/Env'

import AppliedTreatment from 'App/Modules/Treatment/Models/AppliedTreatment'
import Vaccination from 'App/Models/Vaccination'

Route.get('/', async () => {
  const vaccinations = await Vaccination.query().preload('vaccine').preload('dose')

  const treatments = await AppliedTreatment.query()
    .preload('treatment', (query) => query.preload('vaccine').preload('prevention'))
    .preload('vaccinationPost', (query) => query.preload('province'))

  return { hello: 'world', title: 'It Works', vaccinations, treatments }
})

//MAIN WRAPPER
Route.group(() => {
  Route.get('/health', async ({ response }) => {
    const report = await HealthCheck.getReport()
    return report.healthy ? response.ok(report) : response.badRequest(report)
  })

  //Auth Login
  Route.post('auth/login', 'AuthController.login')

  Route.group(() => {
    //Auth + Users
    Route.get('auth/logout', 'AuthController.logout')
    Route.post('auth/logged', 'AuthController.loggedUsers')
    Route.post('auth/logged_users', 'AuthController.loggedUsersView')
    Route.post('auth/about_usage', 'AuthController.aboutIUsage')

    Route.post('user_work', 'UsersController.userWork')
    Route.post('user_treatments', 'UsersController.userWorkTreatment')

    //Preload Route
    Route.get('preload', 'PreloadsController.index')
    Route.get('symptoms', 'PreloadsController.symptomsList')

    //Person
    Route.post('people', 'PeopleController.store')
    Route.post('people/search', 'PeopleController.search')
    Route.post('people/vaccines', 'PeopleController.searchVaccines')
    Route.post('people/vaccines_by_id', 'PeopleController.searchVaccinesById')
    Route.post('people/check', 'PeopleController.checkPerson')
    Route.put('people/:id', 'PeopleController.update')

    //RANKING - for covid old aproach
    Route.post('ranking', 'VaccinationRanksController.rankUser')

    //RANKING - for treatment new aproach
    Route.post('ranking_treatment', 'VaccinationRanksController.rankUserTreatment')
    //
    Route.get('locations_rank', 'VaccinationRanksController.locationsRank')

    //Vaccination
    Route.post('vaccination/', 'VaccinationsController.store')
    Route.post('vaccination/booster', 'VaccinationsController.booster')

    //ADVERSE EVENTS ROUTES
    Route.post('adverse_event', 'AdverseNotificationsController.store')
    Route.post('person_events', 'AdverseNotificationsController.personAdverseCases')

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
    Route.post('accesses/search', 'ApiAcessesController.search')

    //MESSAGE ROUTES

    Route.post('usermessages', 'VaccinationMessagesController.getMessage')
    Route.post('viewmessage', 'VaccinationMessagesController.viewMessage')

    //MOBILE APP VERSION AND INSTALLATION
    Route.post('mobile_version', 'ConfigsController.changeAppVersion')
    Route.post('installations', 'AppInstallationsController.index')
  }).middleware('auth:api')

  Route.post('install', 'AppInstallationsController.store')

  //Rota para obter versão actual da aplicação
  Route.get('mobile_version', 'ConfigsController.getMobileVersion')

  //Rede de Confiança

  Route.group(() => {
    Route.get('today', 'TrustNetworksController.today')
    Route.get('general', 'TrustNetworksController.inGeneral')
    Route.get('overtime', 'TrustNetworksController.withOneOrMoreRecord')
    Route.post('ispartner', 'TrustNetworksController.isTrustPartner')
    Route.get('vaccination_post', 'TrustNetworksController.vaccinationPostLocations')
    Route.get('vaccination_places', 'TrustNetworksController.vaccinationPlaces')
  })
    .prefix('trust')
    .middleware('auth:api')

  //////////////
}).prefix(Env.get('API_VERSION'))
