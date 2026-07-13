<template>
  <MainLayout>
    <div class="stock-dashboard">
      <div class="page-header">
        <div>
          <h1>Stock Management</h1>
          <p class="page-description">Manage inventory and real-time stock synchronization</p>
        </div>
        <div class="header-actions">
          <Button
            label="Add Stock"
            icon="pi pi-plus"
            class="p-button-rounded p-button-primary"
            @click="showAddStockDialog = true"
          />
          <Button
            label="Sync Pending"
            icon="pi pi-refresh"
            class="p-button-rounded p-button-info"
            @click="syncPending"
          />
          <Button
            label="Export"
            icon="pi pi-download"
            class="p-button-rounded p-button-secondary"
          />
        </div>
      </div>

      <!-- Stats -->
      <div class="stats-grid">
        <Card class="stat-card">
          <template #header>
            <div class="stat-icon" style="background: linear-gradient(135deg, #3b82f6, #1d4ed8)">
              <i class="pi pi-box" />
            </div>
          </template>
          <div class="stat-content">
            <div class="stat-label">Total Items</div>
            <div class="stat-value">{{ report?.totalItems || 0 }}</div>
          </div>
        </Card>

        <Card class="stat-card">
          <template #header>
            <div class="stat-icon" style="background: linear-gradient(135deg, #22c55e, #15803d)">
              <i class="pi pi-inbox" />
            </div>
          </template>
          <div class="stat-content">
            <div class="stat-label">Total Quantity</div>
            <div class="stat-value">{{ report?.totalQuantity || 0 }}</div>
          </div>
        </Card>

        <Card class="stat-card">
          <template #header>
            <div class="stat-icon" style="background: linear-gradient(135deg, #f59e0b, #d97706)">
              <i class="pi pi-exclamation-triangle" />
            </div>
          </template>
          <div class="stat-content">
            <div class="stat-label">Low Stock Items</div>
            <div class="stat-value">{{ report?.lowStockItems || 0 }}</div>
          </div>
        </Card>

        <Card class="stat-card">
          <template #header>
            <div class="stat-icon" style="background: linear-gradient(135deg, #8b5cf6, #6d28d9)">
              <i class="pi pi-check-circle" />
            </div>
          </template>
          <div class="stat-content">
            <div class="stat-label">Synced Items</div>
            <div class="stat-value">{{ report?.syncedItems || 0 }}</div>
          </div>
        </Card>
      </div>

      <!-- Stock List -->
      <Card class="content-card">
        <template #header>
          <div class="card-header">
            <h3>Inventory</h3>
            <InputText
              v-model="searchText"
              placeholder="Search items..."
              @input="applyFilters"
              class="search-input"
            />
          </div>
        </template>

        <DataTable
          :value="stockItems"
          :loading="isLoading"
          paginator
          :rows="20"
          striped-rows
          responsive-layout="scroll"
          class="p-datatable-striped"
        >
          <Column field="itemCode" header="Item Code" style="width: 120px" />
          <Column field="itemName" header="Item Name" />
          <Column field="quantity" header="Quantity" style="width: 100px">
            <template #body="{ data }">
              <div :class="['qty-badge', data.quantity < 10 ? 'low' : 'normal']">
                {{ data.quantity }}
              </div>
            </template>
          </Column>
          <Column field="price" header="Price" style="width: 100px">
            <template #body="{ data }">
              RWF {{ formatNumber(data.price) }}
            </template>
          </Column>
          <Column header="Stock Value" style="width: 120px">
            <template #body="{ data }">
              RWF {{ formatNumber(data.quantity * data.price) }}
            </template>
          </Column>
          <Column field="syncStatus" header="Sync Status" style="width: 100px">
            <template #body="{ data }">
              <Badge
                :value="data.syncStatus || 'PENDING'"
                :severity="getSyncStatusSeverity(data.syncStatus)"
              />
            </template>
          </Column>
          <Column field="lastSyncDate" header="Last Sync" style="width: 120px">
            <template #body="{ data }">
              <span class="text-sm">{{ formatDate(data.lastSyncDate) }}</span>
            </template>
          </Column>
          <Column header="Actions" style="width: 120px">
            <template #body="{ data }">
              <div class="action-buttons">
                <Button
                  icon="pi pi-pencil"
                  class="p-button-rounded p-button-sm p-button-text"
                  @click="editStock(data)"
                  v-tooltip="'Edit'"
                />
                <Button
                  icon="pi pi-refresh"
                  class="p-button-rounded p-button-sm p-button-text"
                  @click="syncItem(data)"
                  v-tooltip="'Sync'"
                  :disabled="data.syncStatus === 'SYNCED'"
                />
                <Button
                  icon="pi pi-trash"
                  class="p-button-rounded p-button-sm p-button-text p-button-danger"
                  @click="deleteStock(data)"
                  v-tooltip="'Delete'"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </Card>

      <!-- Add/Edit Stock Dialog -->
      <Dialog
        v-model:visible="showAddStockDialog"
        header="Add Stock"
        :modal="true"
        class="p-dialog-centered"
        style="width: 90vw; max-width: 600px"
      >
        <div class="stock-form">
          <div class="form-group">
            <label>Item Code *</label>
            <InputText v-model="newStock.itemCode" class="w-full" placeholder="ITEM001" />
          </div>
          <div class="form-group">
            <label>Item Name *</label>
            <InputText v-model="newStock.itemName" class="w-full" placeholder="Product name" />
          </div>
          <div class="form-group">
            <label>Classification Code *</label>
            <InputText
              v-model="newStock.classificationCode"
              class="w-full"
              placeholder="RW2NTBA0001"
            />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Quantity *</label>
              <InputNumber v-model="newStock.quantity" :step="1" placeholder="0" />
            </div>
            <div class="form-group">
              <label>Price *</label>
              <InputNumber v-model="newStock.price" :step="0.01" placeholder="0" />
            </div>
          </div>
          <div class="form-group">
            <label>Action *</label>
            <Dropdown
              v-model="newStock.action"
              :options="[
                { label: 'Stock In', value: 'IN' },
                { label: 'Stock Out', value: 'OUT' },
              ]"
              option-label="label"
              option-value="value"
              class="w-full"
            />
          </div>
        </div>
        <template #footer>
          <Button label="Cancel" text @click="showAddStockDialog = false" />
          <Button label="Add Stock" @click="addStock" />
        </template>
      </Dialog>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import MainLayout from '../../components/layout/MainLayout.vue'
import { stockApi } from '../../api/stock'

const toast = useToast()

const stockItems = ref([])
const report = ref(null)
const isLoading = ref(false)
const searchText = ref('')
const showAddStockDialog = ref(false)

const newStock = ref({
  itemCode: '',
  itemName: '',
  classificationCode: '',
  quantity: 0,
  price: 0,
  action: 'IN',
})

async function loadStock() {
  try {
    isLoading.value = true
    const response = await stockApi.getStock(1, 100, searchText.value)

    if (response.success) {
      stockItems.value = response.data.data || []
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load stock items',
      life: 3000,
    })
  } finally {
    isLoading.value = false
  }
}

async function loadReport() {
  try {
    const response = await stockApi.getStockReport()

    if (response.success) {
      report.value = response.data
    }
  } catch (error) {
    console.warn('Failed to load report:', error)
  }
}

function applyFilters() {
  loadStock()
}

function getSyncStatusSeverity(status) {
  const severities = {
    SYNCED: 'success',
    PENDING: 'warning',
    FAILED: 'danger',
  }
  return severities[status] || 'info'
}

function formatNumber(num) {
  return new Intl.NumberFormat('en-US').format(Math.round(num))
}

function formatDate(date) {
  if (!date || date === 'Never') return 'Never'
  return new Date(date).toLocaleDateString('en-US', {
    year: '2-digit',
    month: 'short',
    day: 'numeric',
  })
}

async function addStock() {
  try {
    if (!newStock.value.itemCode || !newStock.value.itemName || !newStock.value.classificationCode) {
      toast.add({
        severity: 'warning',
        summary: 'Warning',
        detail: 'Please fill in all required fields',
        life: 3000,
      })
      return
    }

    const response = await stockApi.updateStock({
      itemCode: newStock.value.itemCode,
      itemName: newStock.value.itemName,
      quantity: newStock.value.quantity,
      price: newStock.value.price,
      classificationCode: newStock.value.classificationCode,
      action: newStock.value.action,
    })

    if (response.success) {
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Stock updated successfully',
        life: 3000,
      })
      showAddStockDialog.value = false
      newStock.value = {
        itemCode: '',
        itemName: '',
        classificationCode: '',
        quantity: 0,
        price: 0,
        action: 'IN',
      }
      loadStock()
      loadReport()
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.response?.data?.message || 'Failed to add stock',
      life: 3000,
    })
  }
}

async function editStock(stock) {
  newStock.value = { ...stock }
  showAddStockDialog.value = true
}

async function deleteStock(stock) {
  toast.add({
    severity: 'info',
    summary: 'Info',
    detail: 'Delete functionality coming soon',
    life: 3000,
  })
}

async function syncItem(stock) {
  try {
    await stockApi.syncPending()
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Stock synced successfully',
      life: 3000,
    })
    loadStock()
    loadReport()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to sync stock',
      life: 3000,
    })
  }
}

async function syncPending() {
  try {
    isLoading.value = true
    await stockApi.syncPending()
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'All pending items synced',
      life: 3000,
    })
    loadStock()
    loadReport()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to sync pending items',
      life: 3000,
    })
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadStock()
  loadReport()
})
</script>

<style scoped>
.stock-dashboard {
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
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: white;
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
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-color);
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
  gap: 1rem;
}

.card-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
}

.search-input {
  width: 250px;
}

.qty-badge {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  text-align: center;
}

.qty-badge.normal {
  background-color: var(--primary-50);
  color: var(--primary-color);
}

.qty-badge.low {
  background-color: #fecaca;
  color: #dc2626;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.stock-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: var(--text-color);
  font-size: 0.875rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.w-full {
  width: 100%;
}

.text-sm {
  font-size: 0.875rem;
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

  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .search-input {
    width: 100%;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
