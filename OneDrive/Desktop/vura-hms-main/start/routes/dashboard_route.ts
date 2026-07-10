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

const DashboardController = () => import('#app/features/dashboard/dashboard_controller')

router
  .group(() => {
    router.get('/overview', [DashboardController, 'overview']).as('overview')
    router.get('/prescription/creation/view', [DashboardController, 'prescription_creation_view']).as('prescription.creation.view')
    router.post('/prescription/create', [DashboardController, 'prescription_create']).as('prescription.create')

    router.get('/prescription/print/:id', [DashboardController, 'prescription_print']).as('prescription.print')

    router.post('/facility/switch', [DashboardController, 'facility_switch']).as('facility.switch')
    
    //#endregion
  })
  .as('dashboard')
  .prefix('dashboard')
  .middleware([
    middleware.auth({ guards: ['web'] }),
    middleware.userCurrentFacilityCheck()
  ])
  
  router
  .group(() => {
    router.get('/facility/pick/list', [DashboardController, 'facility_pick_list']).as('facility.pick.list')
    router.post('/facility/join/:facilityId', [DashboardController, 'facility_join']).as('facility.join')
  })
  .middleware([
    middleware.auth({ guards: ['web'] })
  ])
