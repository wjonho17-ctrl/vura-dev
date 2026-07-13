<template>
  <MainLayout>
    <div class="operator-dashboard">
      <div class="page-header">
        <div>
          <h1>Dashboard</h1>
          <p class="page-description">Welcome to your VSDC management console</p>
        </div>
        <div class="header-actions">
          <Button
            label="New Sale"
            icon="pi pi-plus"
            class="p-button-rounded p-button-primary p-button-lg"
            @click="startNewSale"
          />
          <Button
            label="Reports"
            icon="pi pi-chart-bar"
            class="p-button-rounded p-button-info p-button-lg"
          />
        </div>
      </div>

      <Message
        v-if="userProfile?.isTrainingMode"
        severity="warning"
        icon="pi pi-exclamation-triangle"
        text="Training mode is enabled"
      />

      <div class="stats-grid">
        <Card class="stat-card">
          <template #header>
            <div class="stat-icon stat-icon--blue">
              <i class="pi pi-shopping-bag" />
            </div>
          </template>
          <div class="stat-content">
            <div class="stat-label">Today's Sales</div>
            <div class="stat-value">RWF 0</div>
            <div class="stat-trend">
              <i class="pi pi-arrow-up" style="color: #22c55e" />
              <span>0 transactions</span>
            </div>
          </div>
        </Card>

        <Card class="stat-card">
          <template #header>
            <div class="stat-icon stat-icon--green">
              <i class="pi pi-users" />
            </div>
          </template>
          <div class="stat-content">
            <div class="stat-label">Total Customers</div>
            <div class="stat-value">0</div>
            <div class="stat-trend">
              <i class="pi pi-arrow-right" style="color: #6b7280" />
              <span>No change</span>
            </div>
          </div>
        </Card>

        <Card class="stat-card">
          <template #header>
            <div class="stat-icon stat-icon--orange">
              <i class="pi pi-package" />
            </div>
          </template>
          <div class="stat-content">
            <div class="stat-label">Stock Items</div>
            <div class="stat-value">0</div>
            <div class="stat-trend">
              <i class="pi pi-arrow-right" style="color: #6b7280" />
              <span>No change</span>
            </div>
          </div>
        </Card>

        <Card class="stat-card">
          <template #header>
            <div class="stat-icon stat-icon--red">
              <i class="pi pi-inbox" />
            </div>
          </template>
          <div class="stat-content">
            <div class="stat-label">Pending Notices</div>
            <div class="stat-value">0</div>
            <div class="stat-trend">
              <i class="pi pi-check-circle" style="color: #22c55e" />
              <span>All clear</span>
            </div>
          </div>
        </Card>
      </div>

      <div class="content-grid">
        <Card class="content-card">
          <template #header>
            <div class="card-header">
              <h3>Device Information</h3>
            </div>
          </template>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Device ID</span>
              <span class="info-value">{{ userProfile?.device || '—' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Business Name</span>
              <span class="info-value">{{ userProfile?.name || '—' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">TIN</span>
              <span class="info-value">{{ userProfile?.tin || '—' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Branch</span>
              <span class="info-value">{{ userProfile?.branch || '—' }}</span>
            </div>
          </div>
        </Card>

        <Card class="content-card">
          <template #header>
            <div class="card-header">
              <h3>Quick Actions</h3>
            </div>
          </template>
          <div class="quick-actions">
            <Button
              label="New Invoice"
              icon="pi pi-file-pdf"
              class="p-button-rounded p-button-text w-full"
              @click="navigateTo('/invoice')"
            />
            <Button
              label="Manage Stock"
              icon="pi pi-shopping-cart"
              class="p-button-rounded p-button-text w-full"
              @click="navigateTo('/stock')"
            />
            <Button
              label="Customer List"
              icon="pi pi-users"
              class="p-button-rounded p-button-text w-full"
              @click="navigateTo('/customers')"
            />
            <Button
              label="View Reports"
              icon="pi pi-chart-bar"
              class="p-button-rounded p-button-text w-full"
              @click="navigateTo('/reports')"
            />
          </div>
        </Card>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { state } from '../stores/appStore'
import MainLayout from '../components/layout/MainLayout.vue'

const router = useRouter()
const userProfile = computed(() => state.user)

function startNewSale() {
  router.push('/invoice')
}

function navigateTo(path) {
  router.push(path)
}
</script>

<style scoped>
.operator-dashboard {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
}

.page-header h1 {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-color);
}

.page-description {
  margin: 0;
  color: var(--text-color-secondary);
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  border-radius: 12px;
  overflow: hidden;
}

.stat-card :deep(.p-card-header) {
  padding: 0;
}

.stat-icon {
  width: 100%;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  color: white;
}

.stat-icon--blue {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
}

.stat-icon--green {
  background: linear-gradient(135deg, #22c55e 0%, #15803d 100%);
}

.stat-icon--orange {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.stat-icon--red {
  background: linear-gradient(135deg, #ef4444 0%, #991b1b 100%);
}

.stat-content {
  padding: 1.5rem;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-color-secondary);
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-color);
  margin-bottom: 0.75rem;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-color-secondary);
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

.content-card {
  border-radius: 12px;
  overflow: hidden;
}

.content-card :deep(.p-card-header) {
  padding: 1.5rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.card-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-label {
  font-size: 0.875rem;
  color: var(--text-color-secondary);
  font-weight: 500;
}

.info-value {
  font-size: 1rem;
  color: var(--text-color);
  font-weight: 600;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
  }

  .header-actions {
    width: 100%;
  }

  .header-actions :deep(button) {
    flex: 1;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .content-grid {
    grid-template-columns: 1fr;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
