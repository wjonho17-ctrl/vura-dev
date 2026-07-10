import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class UserCurrentFacilityCheckMiddleware {
  async handle({ auth, response }: HttpContext, next: NextFn) {
    /**
     * Middleware logic goes here (before the next call)
     */
    if (!auth.user?.currentHeathFacility) {
      return response.redirect().toRoute('facility.pick.list')
    }

    /**
     * Call next method in the pipeline and return its output
     */
    const output = await next()
    return output
  }
}