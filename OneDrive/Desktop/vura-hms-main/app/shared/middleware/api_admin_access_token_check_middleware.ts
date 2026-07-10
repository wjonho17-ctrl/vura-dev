import ApiAccessToken from '#app/shared/api_access_token'
import ApiAdminAccessToken from '#app/shared/api_admin_access_token'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class ApiAccessTokenCheckMiddleware {
  async handle({ request, response }: HttpContext, next: NextFn) {
    /**
     * Middleware logic goes here (before the next call)
     */
    const accessToken = request.header('X-ADMIN-API-ACCESS-TOKEN')

    if (!accessToken) {
      return response.badRequest({ error: 'api admin access token header missing!' })
    }

    const apiToken = await ApiAdminAccessToken.findBy({ token: accessToken })

    if (!apiToken) {
      return response.badRequest({ error: 'invalid api admin token' })
    }

    /**
     * Call next method in the pipeline and return its output
     */
    const output = await next()
    return output
  }
}

