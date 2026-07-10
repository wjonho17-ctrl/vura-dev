import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const PrescriptionApisController = () => import('#app/features/prescriptions/prescription_api_controller')
router
  .group(() => {
    router.get('/search', [PrescriptionApisController, 'search']).as('search')
    router.post('/sell', [PrescriptionApisController, 'sell']).as('sell')
  })
  .prefix('api/prescription')
  .as('api.prescription')
  .middleware(middleware.apiAccessTokenCheck())
  