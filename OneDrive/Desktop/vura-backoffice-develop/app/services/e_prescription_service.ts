import env from "#start/env";
import ky from "ky";

const api = ky.create({
  prefixUrl: `${env.get('E_PRESCRIPTION_API_LINK')}/api`,
  headers: {
    'X-ADMIN-API-ACCESS-TOKEN': env.get('VURA_E_PRESCRIPTION_API_TOKEN'),
    'Content-Type': 'application/json'
  }
})

export class EPrescriptionService {
  // Your code here

  listStaffs(json?: { page?: number, perPage?: number }) {
    return api.get('staffs').json()
  }

  storeDoctor(body: any) {
    return api.post('staffs/store', { body }).json()
  }

  listFacilities(query?: { page?: number, perPage?: number }) {
    const qs = new URLSearchParams()

    if (query) {
      for (const [key, value] of Object.entries(query)) {
        qs.set(key, value.toString())
      }
    }

    return api.get('facilities?' + qs.toString()).json()
  }

  storeFacility(json: any) {
    return api.post('facilities/store', { json }).json()
  }

  sendStaffWelcomeEmail(userId: string) {
    return api.post(`staffs/${userId}/send-welcome-email`).json()
  }

  updateFacility(json: any) {
    return api.post(`facilities/update`, { json }).json()
  }
}
