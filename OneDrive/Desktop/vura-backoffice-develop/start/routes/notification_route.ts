import { middleware } from "#start/kernel"
import router from "@adonisjs/core/services/router"

const NotificationsController = () => import('#controllers/notifications_controller')

router
    .group(() => {
        router.get('/list', [NotificationsController, 'list']).as('list')
        router.post('/read/:id', [NotificationsController, 'read']).as('read')
    })
    .as('notifications')
    .prefix('notifications')
    .middleware(middleware.auth())