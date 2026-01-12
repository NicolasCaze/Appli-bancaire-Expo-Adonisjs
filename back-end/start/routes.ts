/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/
import router from '@adonisjs/core/services/router'

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

import UsersController from '../app/controllers/users_controller.js'
import AuthController from '../app/controllers/auth_controller.js'
import { middleware } from './kernel.js'

router.get('/users', [UsersController, 'index']).use(middleware.auth())
router.post('/create_users', [UsersController, 'createUsers'])
// Routes d'authentification
router.post('/auth/login', [AuthController, 'login'])
router.post('/auth/refresh', [AuthController, 'refresh'])
router.post('/auth/logout', [AuthController, 'logout'])
