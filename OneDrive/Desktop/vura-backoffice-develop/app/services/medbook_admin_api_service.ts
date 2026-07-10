import env from '#start/env'
import ky from 'ky'
import BranchApiSerivce from './medbook/branch_api_service.js'
import ClientApiSerivce from './medbook/client_api_service.js'
import EmployeeApiSerivce from './medbook/employee_api_service.js'
import InsuranceApiSerivce from './medbook/insurance_api_service.js'
import InsuranceProductApiSerivce from './medbook/insurance_products_api_service.js'
import LocationApiSerivce from './medbook/location_api_service.js'
import PharmacyApiSerivce from './medbook/pharmacy_api_service.js'
import TransporterApiSerivce from './medbook/transporter_api_service.js'
import NotificationApiSerivce from './medbook/notification_api_service.js'
import StatsApiSerivce from './medbook/stats_api_service.js'
import ProductApiSerivce from './medbook/stats_api_product.js'
import BasicAdsApiSerivce from './medbook/basic_ads_api_service.js'
import SettingApiSerivce from './medbook/settings_api_service.js'

const api = ky.create({
  prefixUrl: env.get('MEDBOOK_AMDIN_API_DOMAIN') + '/api/v1/back',
  timeout: 1_000 * 60 * 3,
  headers: {
    'Content-Type': 'application/json',
    'X-ADMIN-ACCESS-TOKEN': env.get('MEDBOOK_ADMIN_API_TOKEN'),
  },
})

export class MedbookAdminApiService {
  // Your code here
  get clients() {
    return new ClientApiSerivce(api)
  }

  get employees() {
    return new EmployeeApiSerivce(api)
  }

  get locations() {
    return new LocationApiSerivce(api)
  }

  get transporters() {
    return new TransporterApiSerivce(api)
  }

  get pharmacies() {
    return new PharmacyApiSerivce(api)
  }

  get branchies() {
    return new BranchApiSerivce(api)
  }

  get insuranceProducts() {
    return new InsuranceProductApiSerivce(api)
  }

  get insurances() {
    return new InsuranceApiSerivce(api)
  }

  get notifications() {
    return new NotificationApiSerivce(api)
  }

  get stats() {
    return new StatsApiSerivce(api)
  }

  get products() {
    return new ProductApiSerivce(api)
  }

  get basicAds() {
    return new BasicAdsApiSerivce(api)
  }

  get settings() {
    return new SettingApiSerivce(api)
  }
}
