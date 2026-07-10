import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'


const PasswordResetController = () => import('#app/features/auth/password_reset_controller')

router.group(() => {
  router.get('/password/forgot', [PasswordResetController, 'forgot']).as('password.forgot')
  router.post('/password/send', [PasswordResetController, 'send']).as('password.send')
  router.get('/password/reset/:token', [PasswordResetController, 'reset']).as('password.reset')
  router.post('/password/store', [PasswordResetController, 'store']).as('password.store')
}).middleware([middleware.guest()])
