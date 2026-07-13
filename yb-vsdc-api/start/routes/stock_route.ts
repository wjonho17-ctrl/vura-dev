import router from '@adonisjs/core/services/router'
import middleware from '#start/kernel'

const StockController = () => import('#controllers/stock_controller')

router
  .group(() => {
    // Stock management
    router.post('/stock/update', [StockController, 'update']).use(middleware.auth())
    router.get('/stock', [StockController, 'list']).use(middleware.auth())
    router.get('/stock/:itemCode/balance', [StockController, 'balance']).use(middleware.auth())
    router.get('/stock/:itemCode/check', [StockController, 'check']).use(middleware.auth())

    // Stock alerts and reporting
    router.get('/stock/alerts/low', [StockController, 'lowStock']).use(middleware.auth())
    router.get('/stock/report', [StockController, 'report']).use(middleware.auth())

    // Stock synchronization
    router.get('/stock/sync-status', [StockController, 'syncStatus']).use(middleware.auth())
    router.post('/stock/sync-pending', [StockController, 'syncPending']).use(middleware.auth())
  })
  .prefix('/api')
