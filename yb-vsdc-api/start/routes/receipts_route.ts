import router from '@adonisjs/core/services/router'
import middleware from '#start/kernel'

const ReceiptsController = () => import('#controllers/receipts_controller')

router
  .group(() => {
    // Receipt management
    router.post('/receipts', [ReceiptsController, 'create']).use(middleware.auth())
    router.get('/receipts', [ReceiptsController, 'list']).use(middleware.auth())
    router.get('/receipts/:id', [ReceiptsController, 'show']).use(middleware.auth())
    router.get('/receipts/:id/print', [ReceiptsController, 'print']).use(middleware.auth())
    router.get('/receipts/:id/pdf', [ReceiptsController, 'pdf']).use(middleware.auth())
    router.post('/receipts/:id/resend', [ReceiptsController, 'resend']).use(middleware.auth())

    // Receipt statistics
    router.get('/receipts/stats/summary', [ReceiptsController, 'stats']).use(middleware.auth())
  })
  .prefix('/api')
