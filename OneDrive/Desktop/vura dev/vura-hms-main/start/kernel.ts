/*
|--------------------------------------------------------------------------
| HTTP kernel file
|--------------------------------------------------------------------------
|
| The HTTP kernel file is used to register the middleware with the server
| or the router.
|
*/

import router from '@adonisjs/core/services/router'
import server from '@adonisjs/core/services/server'

/**
 * The error handler is used to convert an exception
 * to an HTTP response.
 */
server.errorHandler(() => import('../app/shared/exceptions/handler.ts'))

/**
 * The server middleware stack runs middleware on all the HTTP
 * requests, even if there is no route registered for
 * the request URL.
 */
server.use([
  () => import('@foadonis/maintenance/maintenance_middleware'),
  () => import('../app/shared/middleware/container_bindings_middleware.ts'),
  () => import('@adonisjs/static/static_middleware'),
  () => import('@adonisjs/vite/vite_middleware'),
  () => import('@adonisjs/inertia/inertia_middleware'),
  () => import('@adonisjs/cors/cors_middleware')
])

/**
 * The router middleware stack runs middleware on all the HTTP
 * requests with a registered route.
 */
router.use([
  () => import('@adonisjs/core/bodyparser_middleware'),
  () => import('@adonisjs/session/session_middleware'),
  () => import('@adonisjs/shield/shield_middleware'),
  () => import('@adonisjs/auth/initialize_auth_middleware'),
])

/**
 * Named middleware collection must be explicitly assigned to
 * the routes or the routes group.
 */
export const middleware = router.named({
  userCurrentFacilityCheck: () => import('../app/shared/middleware/user_current_facility_check_middleware.ts'),
  guest: () => import('../app/shared/middleware/guest_middleware.ts'),
  auth: () => import('../app/shared/middleware/auth_middleware.ts'),
  apiAccessTokenCheck: () => import('../app/shared/middleware/api_access_token_check_middleware.ts'),
  apiAdminAccessTokenCheck: () => import('../app/shared/middleware/api_admin_access_token_check_middleware.ts')
})
