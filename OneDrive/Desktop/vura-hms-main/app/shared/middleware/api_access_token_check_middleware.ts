import ApiAccessToken from '#app/shared/api_access_token'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class ApiAccessTokenCheckMiddleware {
  async handle({ request, response }: HttpContext, next: NextFn) {
    /**
     * Middleware logic goes here (before the next call)
     */
    const accessToken = request.header('X-API-ACCESS-TOKEN')

    if (!accessToken) {
      return response.badRequest({ error: 'api access token header missing!' })
    }

    const apiToken = await ApiAccessToken.findBy({ token: accessToken })

    if (!apiToken) {
      return response.badRequest({ error: 'invalid api token' })
    }

    /**
     * Call next method in the pipeline and return its output
     */
    const output = await next()
    return output
  }
}

