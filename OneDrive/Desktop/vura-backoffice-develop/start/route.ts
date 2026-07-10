/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import '#start/routes/auth_route'
import '#start/routes/dashboard_route'
import '#start/routes/notification_route'


router.on('/').redirect('dashboard.index')