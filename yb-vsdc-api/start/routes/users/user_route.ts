import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
import '#start/routes/users/user_branch_route'
import '#start/routes/users/user_auth_route'
import '#start/routes/users/user_transaction_route'
import '#start/routes/users/user_report_route'
import '#start/routes/users/user_receipt_route'
import '#start/routes/users/user_stock_route'
import '#start/routes/users/user_code_route'
import '#start/routes/users/user_notice_route'
import '#start/routes/users/user_cash_route'
import '#start/routes/users/user_queue_route'

const UsersController = () => import('#controllers/users/users_controller')
const TaxConfigsController = () => import('#controllers/users/tax_configs_controller')

router
  .group(() => {
    router.post('/user/init', [UsersController, 'init'])
    router.post('/user/info', [UsersController, 'info'])
    router.patch('/user/edit', [UsersController, 'edit'])
    router.get('/customers/:branchId', [UsersController, 'customer_find'])
    router.get('/items/classification/:branchId', [UsersController, 'items_classification'])

    router.post('/purchasecode', [UsersController, 'purchase_code'])
    
    router.post('/user/mrc', [UsersController, 'updateMrc'])
    router.get('/config/tax', [TaxConfigsController, 'index'])
    router.patch('/config/tax/:id', [TaxConfigsController, 'update'])
  })
  .middleware(middleware.auth({ guards: ['api', 'admin'] }))
