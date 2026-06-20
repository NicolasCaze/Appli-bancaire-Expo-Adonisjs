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
import AccountsController from '#controllers/accounts_controller'
import { middleware } from './kernel.js'
import PaymentsController from '#controllers/payments_controller'
import TransactionsController from '#controllers/transactions_controller'
import VirementsProgrammesController from '#controllers/virements_programmes_controller'

router.get('/users', [UsersController, 'index']).use(middleware.auth())
router.get('/accounts', [AccountsController, 'getMyAccount']).use(middleware.auth())
router.get('/payments', [PaymentsController, 'getMyPayments']).use(middleware.auth())
router.get('/transactions', [TransactionsController, 'getMyTransaction']).use(middleware.auth())
router.post('/transactions/create', [TransactionsController, 'createTransaction']).use(middleware.auth())
router.post('/create_users', [UsersController, 'createUsers'])
router.get('/virements-programmes', [VirementsProgrammesController, 'getMyVirementsProgrammes']).use(middleware.auth())
router.post('/virements-programmes/create', [VirementsProgrammesController, 'createVirementProgramme']).use(middleware.auth())
router.delete('/virements-programmes/:id', [VirementsProgrammesController, 'annulerVirementProgramme']).use(middleware.auth())
// Routes d'authentification
router.post('/auth/login', [AuthController, 'login'])
router.post('/auth/refresh', [AuthController, 'refresh'])
router.post('/auth/logout', [AuthController, 'logout'])
