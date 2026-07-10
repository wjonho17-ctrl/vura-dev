import { createTuyau } from '@tuyau/client'
import { api } from '../../.adonisjs/api'


export default createTuyau({
  api,
  baseUrl: import.meta.env.VITE_DOMAIN,
  headers: {
    'X-TUYAU': 'tuyau'
  },
  timeout: 1000 * 60
})