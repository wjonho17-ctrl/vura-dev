import { createRouter, createWebHistory } from 'vue-router'
import Landing from '../pages/Landing.vue'
import Login from '../pages/Login.vue'
import Dashboard from '../pages/Dashboard.vue'
import AdminDashboard from '../pages/AdminDashboard.vue'
import NotFound from '../pages/NotFound.vue'
import CreateReceipt from '../pages/Receipt/CreateReceipt.vue'
import ReceiptList from '../pages/Receipt/ReceiptList.vue'
import ReceiptDetail from '../pages/Receipt/ReceiptDetail.vue'
import StockDashboard from '../pages/Stock/StockDashboard.vue'
import ReportsDashboard from '../pages/Reports/ReportsDashboard.vue'
import CustomerManagement from '../pages/Customer/CustomerManagement.vue'
import ItemClassificationManager from '../pages/ItemClassification/ItemClassificationManager.vue'
import { state, refreshUser } from '../stores/appStore'

const routes = [
  { path: '/', name: 'Landing', component: Landing },
  { path: '/login', name: 'Login', component: Login },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard, meta: { requiresAuth: true } },
  { path: '/admin/dashboard', name: 'AdminDashboard', component: AdminDashboard, meta: { requiresAuth: true, requiresAdmin: true } },

  // Receipt routes
  { path: '/receipts/create', name: 'CreateReceipt', component: CreateReceipt, meta: { requiresAuth: true } },
  { path: '/receipts', name: 'ReceiptList', component: ReceiptList, meta: { requiresAuth: true } },
  { path: '/receipts/:id', name: 'ReceiptDetail', component: ReceiptDetail, meta: { requiresAuth: true } },

  // Stock routes
  { path: '/stock', name: 'StockDashboard', component: StockDashboard, meta: { requiresAuth: true } },

  // Report routes
  { path: '/reports', name: 'ReportsDashboard', component: ReportsDashboard, meta: { requiresAuth: true } },

  // Customer routes
  { path: '/customers', name: 'CustomerManagement', component: CustomerManagement, meta: { requiresAuth: true } },

  // Item Classification routes
  { path: '/classifications', name: 'ItemClassificationManager', component: ItemClassificationManager, meta: { requiresAuth: true } },

  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to, from, next) => {
  const authenticated = !!state.token
  const isAdmin = state.isAdmin

  if (authenticated && !state.user && !state.isAdmin) {
    try {
      await refreshUser()
    } catch (_) {
      // ignore failures during silent refresh
    }
  }

  if (to.meta.requiresAuth && !authenticated) {
    return next({ path: '/login' })
  }

  if (to.meta.requiresAdmin && !isAdmin) {
    return next({ path: authenticated ? '/dashboard' : '/login' })
  }

  if (to.path === '/login' && authenticated) {
    return next({ path: isAdmin ? '/admin/dashboard' : '/dashboard' })
  }

  return next()
})

export default router
