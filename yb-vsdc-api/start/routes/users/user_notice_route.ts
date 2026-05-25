import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const UserNoticesController = () => import('#controllers/users/users_notices_controller')

router
  .group(() => {
    router.get('/', [UserNoticesController, 'select'])
  })
  .prefix('/notices')
  .middleware(middleware.auth({ guards: ['api'] }))
