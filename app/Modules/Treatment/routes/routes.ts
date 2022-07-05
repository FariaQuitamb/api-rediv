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

/////TREATMENT MODULES

Route.group(() => {
  Route.group(() => {
    Route.get('load_routine', 'RoutinesController.routinePreload')

    //Children stuffs
    Route.post('children', 'ChildrenController.store')
  }).namespace('App/Modules/Treatment/Controllers/http')

  //////////////
})
  .middleware('auth:api')
  .prefix(Env.get('API_VERSION'))
