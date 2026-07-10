/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const AuthController = () => import('#app/features/auth/auth_controller')

router
  .group(() => {
    router
      .group(() => {
        router.get('/login', [AuthController, 'login_view']).as('login.view')
        router.post('/login', [AuthController, 'login']).as('login')
        router.post('/login_with_email', [AuthController, 'login_with_email']).as('login.with.email')
      })
      .middleware(middleware.guest())

    router
      .group(() => {
        router.post('/logout', [AuthController, 'logout']).as('logout')
      })
      .middleware(middleware.auth())
  })
  .as('auth')
