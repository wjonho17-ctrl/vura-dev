import Cell from '#models/cell'
import District from '#models/district'
import Province from '#models/province'
import Sector from '#models/sector'
import Village from '#models/village'
import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import LocationAction from '../actions/location_action.js'
import { flashInertiaError, flashInertiaToastSuccess } from '../helpers/toast_notification_helper.js'
import stringHelpers from '@adonisjs/core/helpers/string'

export default class LocationsController {

  async list({ inertia, request, response }: HttpContext) {
    try {
      const { provinceId, districtId, sectorId, cellId } = request.qs()

      const [provinces, districts, sectors, cells, villages] = await Promise.all([
        Province.all(),
        provinceId ? District.query().where({ provinceId }) : [],
        districtId ? Sector.query().where({ districtId }) : [],
        sectorId ? Cell.query().where({ sectorId }) : [],
        cellId ? Village.query().where({ cellId }) : []
      ])

      if (request.isTuyau) {
        return { provinces, districts, sectors, cells, villages }
      }

      return inertia.render('dashboard/location', { provinces, districts, sectors, cells, villages })
    } catch (error: any) {
      console.error(error)
      if (request.isTuyau) return response.badRequest('cannot fetch location')
      return inertia.render('dashboard/location', { provinces: [], districts: [], sectors: [], cells: [], villages: [] })
    }
  }

  async add({ request, response, session, inertia }: HttpContext) {
    const validator = vine.compile(vine.object({
      name: vine.string().trim().maxLength(100).transform(v => stringHelpers.capitalCase(v)),
      coordinates: vine.string().trim().regex(/^-?\d{1,3}(\.\d+)?,\s*-?\d{1,3}(\.\d+)?$/).optional(),
      type: vine.enum(['province', 'district', 'sector', 'cell', 'village']),
      provinceId: vine.number(),
      districtId: vine.number(),
      sectorId: vine.number(),
      cellId: vine.number(),
      longitude: vine.number(),
      latitude: vine.number()
    }))

    const { name, ...payload } = await request.validateUsing(validator)

    try {

      const [lat, long] = payload.coordinates ? payload.coordinates.split(',') : []
      const longitude = payload.coordinates ? parseFloat(long) : payload.longitude
      const latitude = payload.coordinates ? parseFloat(lat) : payload.latitude

      const data = { name, longitude, latitude }

      if (payload.type === 'province') {
        await LocationAction.createProvince(data)
      } else if (payload.type === 'district') {
        await LocationAction.createDistrict(payload.provinceId, data)
      } else if (payload.type === 'sector') {
        await LocationAction.createSector(payload.districtId, data)
      }
      else if (payload.type === 'cell') {
        await LocationAction.createCell(payload.sectorId, data)
      }
      else if (payload.type === 'village') {
        await LocationAction.createVillage(payload.cellId, data)
      }

    } catch (error: any) {
      console.error(error)
      flashInertiaError(session, error?.msg || `Cannot add ${payload.type}`)
    } finally {
      return response.redirect().withQs().back()
    }

  }
}
