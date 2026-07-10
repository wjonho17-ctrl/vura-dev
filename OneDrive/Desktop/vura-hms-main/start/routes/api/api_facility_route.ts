import { middleware } from "#start/kernel";
import router from "@adonisjs/core/services/router";

const ApiFacilityController = () => import('#app/features/facilities/api_facilities_controller')

router.group(() => {
    router.get('/', [ApiFacilityController, 'index']).as('list')
    router.post('/store', [ApiFacilityController, 'store']).as('store')
    router.post('/update', [ApiFacilityController, 'update']).as('update')
})
    .prefix('api/facilities')
    .as('api.facilities')
    .middleware(middleware.apiAdminAccessTokenCheck())
