import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const AuthController = () => import('#controllers/auth_controller')

router
  .group(() => {
    router.get('/login', [AuthController, 'index']).as('index').middleware(middleware.guest())
    router.post('/login', [AuthController, 'login']).as('login').middleware(middleware.guest())

    router.post('/logout', [AuthController, 'logout']).as('logout').middleware(middleware.auth())
  })
  .as('auth')
