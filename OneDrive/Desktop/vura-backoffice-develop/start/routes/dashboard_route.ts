import { middleware } from "#start/kernel";
import router from "@adonisjs/core/services/router";

const PharmaciesController = () => import('#controllers/pharmacies_controller')
const BranchesController = () => import('#controllers/branches_controller')
const TransportersController = () => import('#controllers/transporters_controller')
const LocationsController = () => import('#controllers/locations_controller')
const PrescriptionsController = () => import('#controllers/prescriptions_controller')
const ProductsController = () => import('#controllers/products_controller')
const DashboardController = () => import('#controllers/dashboard_controller')
const BasicAdsController = () => import('#controllers/basic_ads_controller')
const InsuranceProductsController = () => import('#controllers/insurance_products_controller')
const InsurancesController = () => import('#controllers/insurances_controller')
const NotificationsController = () => import('#controllers/notifications_controller')
const AppSettingsController = () => import('#controllers/app_settings_controller')

router.group(() => {
  router.get('/', [DashboardController, 'index']).as('index')

  //overview
  router.get('/overview', [DashboardController, 'overview']).as('overview')
  router.get('/overview/product/:id', [DashboardController, 'product_overview']).as('overview.product')

  //pharmacies
  router.post('/pharmacies/store', [PharmaciesController, 'store']).as('pharamacies.store')
  router.post('/pharmacies/update', [PharmaciesController, 'update']).as('pharamacies.update')

  router.get('/pharmacies/list', [PharmaciesController, 'list']).as('pharmacies.list')
  router.get('/pharmacies/new', [PharmaciesController, 'new_view']).as('pharmacies.new.view')
  router.get('/pharmacies/edit/:id', [PharmaciesController, 'edit']).as('pharmacies.edit')
  router.get('/pharmacies/:id/representative', [PharmaciesController, 'representative_view']).as('pharamacies.representative.view')

  //branches
  router.get('/pharmacies/branches/:id', [BranchesController, 'branches_view']).as('branches.view')

  //transporters
  router.get('/transporters', [TransportersController, 'list']).as('transporters.list')
  router.post('/transporters/store', [TransportersController, 'store']).as('transporters.store')
  router.post('/transporters/update', [TransportersController, 'update']).as('transporters.update')

  //locations
  router.get('/locations/list', [LocationsController, 'list']).as('locations.list')
  router.post('/locations/add', [LocationsController, 'add']).as('locations.add')

  //doctors
  router.get('/staffs/list', [PrescriptionsController, 'list_staffs']).as('staffs.list')
  router.get('/staffs/new', [PrescriptionsController, 'new_staff']).as('staffs.new')
  router.post('/staffs/create', [PrescriptionsController, 'create_staff']).as('staffs.create')
  router.get('/staffs/edit/:id', [PrescriptionsController, 'edit_staff']).as('staffs.edit')
  router.post('/staffs/update', [PrescriptionsController, 'update_staff']).as('staffs.update')

  //facilities
  router.get('/facilities/list', [PrescriptionsController, 'list_facilities']).as('facilities.list')
  router.get('/facilities/new', [PrescriptionsController, 'new_facility']).as('facilities.new')
  router.post('/facilities/create', [PrescriptionsController, 'create_facility']).as('facilities.create')
  router.get('/facilities/edit/:id', [PrescriptionsController, 'edit_facility']).as('facilities.edit')
  router.post('/facilities/update', [PrescriptionsController, 'update_facility']).as('facilities.update')

  //products
  router.get('/products/list', [ProductsController, 'list']).as('products.list')
  router.get('/products/new', [ProductsController, 'new_product']).as('products.new')
  router.post('/products/create/many', [ProductsController, 'create_many']).as('products.create.many')
  router.post('/products/create', [ProductsController, 'create']).as('products.create')
  router.get('/products/edit/:id', [ProductsController, 'edit']).as('products.edit')
  router.post('/products/update', [ProductsController, 'update']).as('products.update')

  //insurance products
  router.get('/insurance/index', [InsurancesController, 'index']).as('insurance.index')

  router.post('/insurance/products/store', [InsuranceProductsController, 'store']).as('insurance.products.store')
  router.post('/insurance/products/delete', [InsuranceProductsController, 'delete']).as('insurance.products.delete')
  router.post('/insurance/products/sync', [InsuranceProductsController, 'sync']).as('insurance.products.sync')

  //nottifications
  router.get('/notifications', [NotificationsController, 'index']).as('notifications.list')

  //basic ads

  //overview
  router.get('/ads/basic', [BasicAdsController, 'list']).as('ads.basic.list')
  router.post('/ads/basic/check', [BasicAdsController, 'check_client']).as('ads.basic.check.client')
  router.post('/ads/basic/store', [BasicAdsController, 'store']).as('ads.basic.store')
  router.post('/ads/basic/delete/:id', [BasicAdsController, 'destroy']).as('ads.basic.delete')
  // router.get('/overview/product/:id', [DashboardController, 'product_overview']).as('overview.product')


  //settings
  router.get('/settings', [AppSettingsController, 'list']).as('settings.list')
  router.post('/settings/active', [AppSettingsController, 'active']).as('settings.active')
})
  .as('dashboard')
  .prefix('/dashboard')
  .middleware(middleware.auth())