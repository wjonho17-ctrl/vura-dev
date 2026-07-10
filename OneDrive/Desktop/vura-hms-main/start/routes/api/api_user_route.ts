import { middleware } from "#start/kernel";
import router from "@adonisjs/core/services/router";

const ApiUserController = () => import('#app/shared/api/users_api_controller')

router.group(() => {
    router.get('/', [ApiUserController, 'index']).as('list')

    router.post('/store', [ApiUserController, 'store']).as('store')
    router.post('/assign/:facilityId', [ApiUserController, 'assign']).as('assign')
    router.post('/:id/send-welcome-email', [ApiUserController, 'send_welcome_email']).as('send_welcome_email')
})
    .prefix('api/staffs')
    .as('api.staffs')
    .middleware(middleware.apiAdminAccessTokenCheck())
