/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import '#routes/landing_route'
import '#routes/auth_route'
import '#routes/dashboard_route'
import '#routes/api/api_route'
import '#routes/contact_route'
import '#routes/password_reset_route'

router.jobs()

router.attachments()

