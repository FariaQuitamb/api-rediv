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

import Env from '@ioc:Adonis/Core/Env'

/////INVENTORY MODULES

Route.group(() => {
  Route.group(() => {
    //Manufaturer Stuffs
    Route.get('manufacturers', 'ManufacturerController.index')

    //Manufaturer_models Stuffs
    Route.get('equipment_models', 'CampaignsController.index')

    //Types Stuffs
    Route.get('equipment_types', 'EquipmentTypesController.index')

    //Regis Stuffs
    Route.post('register_equipaments', 'ApplyTreatmentsController.store')

    //
  }).namespace('App/Modules/Inventory/Controllers/http').prefix('inventory')

  //////////////
})
  .middleware('auth:api')
  .prefix(Env.get('API_VERSION'))
