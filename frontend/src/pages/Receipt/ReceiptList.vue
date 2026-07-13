<template>
  <MainLayout>
    <div class="receipt-list">
      <div class="page-header">
        <div>
          <h1>Receipts & History</h1>
          <p class="page-description">View all receipts and transaction history</p>
        </div>
        <div class="header-actions">
          <Button
            label="New Receipt"
            icon="pi pi-plus"
            class="p-button-rounded p-button-primary"
            @click="navigateTo('/receipts/create')"
          />
          <Button
            label="Export"
            icon="pi pi-download"
            class="p-button-rounded p-button-info"
          />
        </div>
      </div>

      <!-- Filters -->
      <Card class="filter-card">
        <div class="filter-row">
          <div class="filter-group">
            <label>Receipt Type</label>
            <Dropdown
              v-model="filters.receiptType"
              :options="receiptTypeOptions"
              option-label="label"
              option-value="value"
              placeholder="All Types"
              @change="applyFilters"
              class="w-full"
            />
          </div>
          <div class="filter-group">
            <label>Date Range</label>
            <Calendar
              v-model="filters.dateRange"
              selection-mode="range"
              :range-placeholder="`${filters.dateFrom} - ${filters.dateTo}`"
              @change="applyFilters"
              class="w-full"
            />
          </div>
          <div class="filter-group">
            <label>Customer Name</label>
            <InputText
              v-model="filters.customerName"
              placeholder="Search customer..."
              @input="applyFilters"
              class="w-full"
            />
          </div>
          <div class="filter-group">
            <label>Receipt No</label>
            <InputNumber
              v-model="filters.receiptNo"
              placeholder="Search receipt #"
              @change="applyFilters"
              class="w-full"
            />
          </div>
        </div>
      </Card>

      <!-- Receipts Table -->
      <Card class="table-card">
        <template #header>
          <div class="card-title">
            Transaction History
            <Badge :value="`Total: ${totalReceipts}`" class="ml-2" />
          </div>
        </template>

        <DataTable
          :value="receipts"
          :loading="isLoading"
          paginator
          :rows="pageSize"
          :total-records="totalReceipts"
          :lazy="true"
          @page="onPage"
          :row-hover="true"
          striped-rows
          responsive-layout="scroll"
          class="p-datatable-striped"
        >
          <Column field="receiptNo" header="Receipt #" style="width: 100px">
            <template #body="{ data }">
              <Tag :value="`#${data.invoiceNo}`" severity="info" />
            </template>
          </Column>

          <Column field="receiptType" header="Type" style="width: 80px">
            <template #body="{ data }">
              <Tag
                :value="getReceiptTypeLabel(data.receiptType)"
                :severity="getReceiptTypeSeverity(data.receiptType)"
              />
            </template>
          </Column>

          <Column field="customerName" header="Customer" style="width: 150px">
            <template #body="{ data }">
              <div class="customer-info">
                <div class="name">{{ data.customerName }}</div>
                <div class="tin" v-if="data.customerTin">TIN: {{ data.customerTin }}</div>
              </div>
            </template>
          </Column>

          <Column field="totalAmount" header="Amount" style="width: 120px">
            <template #body="{ data }">
              <div class="amount">RWF {{ formatNumber(data.totalAmount) }}</div>
            </template>
          </Column>

          <Column field="saleDate" header="Date" style="width: 110px">
            <template #body="{ data }">
              {{ formatDate(data.saleDate) }}
            </template>
          </Column>

          <Column field="paymentMethod" header="Payment" style="width: 80px">
            <template #body="{ data }">
              {{ getPaymentMethodLabel(data.paymentMethod) }}
            </template>
          </Column>

          <Column field="saleStatus" header="Status" style="width: 80px">
            <template #body="{ data }">
              <Badge
                :value="data.saleStatus === '02' ? 'Completed' : 'Pending'"
                :severity="data.saleStatus === '02' ? 'success' : 'warning'"
              />
            </template>
          </Column>

          <Column header="Actions" style="width: 120px">
            <template #body="{ data }">
              <div class="action-buttons">
                <Button
                  icon="pi pi-eye"
                  class="p-button-rounded p-button-sm p-button-text"
                  @click="viewReceipt(data)"
                  v-tooltip="'View Details'"
                />
                <Button
                  icon="pi pi-print"
                  class="p-button-rounded p-button-sm p-button-text"
                  @click="printReceipt(data)"
                  v-tooltip="'Print'"
                />
                <Button
                  icon="pi pi-download"
                  class="p-button-rounded p-button-sm p-button-text"
                  @click="downloadPDF(data)"
                  v-tooltip="'Download PDF'"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </Card>

      <!-- Summary Stats -->
      <div class="stats-grid">
        <Card class="stat-card">
          <template #header>
            <div class="stat-icon" style="background: linear-gradient(135deg, #3b82f6, #1d4ed8)">
              <i class="pi pi-shopping-bag" />
            </div>
          </template>
          <div class="stat-content">
            <div class="stat-label">Total Receipts</div>
            <div class="stat-value">{{ totalReceipts }}</div>
          </div>
        </Card>

        <Card class="stat-card">
          <template #header>
            <div class="stat-icon" style="background: linear-gradient(135deg, #22c55e, #15803d)">
              <i class="pi pi-inbox" />
            </div>
          </template>
          <div class="stat-content">
            <div class="stat-label">Total Sales</div>
            <div class="stat-value">RWF {{ formatNumber(totalSales) }}</div>
          </div>
        </Card>

        <Card class="stat-card">
          <template #header>
            <div class="stat-icon" style="background: linear-gradient(135deg, #f59e0b, #d97706)">
              <i class="pi pi-check" />
            </div>
          </template>
          <div class="stat-content">
            <div class="stat-label">Total Tax</div>
            <div class="stat-value">RWF {{ formatNumber(totalTax) }}</div>
          </div>
        </Card>

        <Card class="stat-card">
          <template #header>
            <div class="stat-icon" style="background: linear-gradient(135deg, #ec4899, #be123c)">
              <i class="pi pi-chart-line" />
            </div>
          </template>
          <div class="stat-content">
            <div class="stat-label">Avg Transaction</div>
            <div class="stat-value">RWF {{ formatNumber(avgTransaction) }}</div>
          </div>
        </Card>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import MainLayout from '../../components/layout/MainLayout.vue'
import { receiptApi } from '../../api/receipt'

const router = useRouter()
const toast = useToast()

const receipts = ref([])
const isLoading = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const totalReceipts = ref(0)

const filters = ref({
  receiptType: null,
  dateRange: null,
  dateFrom: null,
  dateTo: null,
  customerName: '',
  receiptNo: null,
})

const receiptTypeOptions = [
  { label: 'Normal Sale', value: 'S' },
  { label: 'Refund', value: 'R' },
  { label: 'Training', value: 'T' },
  { label: 'Proforma', value: 'P' },
  { label: 'Copy', value: 'C' },
]

const paymentMethods = {
  '01': 'Cash',
  '02': 'Credit Card',
  '03': 'Bank Check',
  '04': 'Mobile Payment',
  '05': 'Bank Transfer',
}

const receiptTypes = {
  S: { label: 'Normal Sale', severity: 'success' },
  R: { label: 'Refund', severity: 'warning' },
  T: { label: 'Training', severity: 'info' },
  P: { label: 'Proforma', severity: 'secondary' },
  C: { label: 'Copy', severity: 'info' },
}

const totalSales = computed(() => {
  return receipts.value.reduce((sum, r) => sum + (r.totalAmount || 0), 0)
})

const totalTax = computed(() => {
  return receipts.value.reduce((sum, r) => sum + (r.totalTaxAmount || 0), 0)
})

const avgTransaction = computed(() => {
  return totalReceipts.value > 0 ? totalSales.value / totalReceipts.value : 0
})

async function loadReceipts() {
  try {
    isLoading.value = true
    const response = await receiptApi.getReceipts(currentPage.value, pageSize.value)

    if (response.success) {
      receipts.value = response.data.data
      totalReceipts.value = response.data.total
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load receipts',
      life: 3000,
    })
  } finally {
    isLoading.value = false
  }
}

function onPage(event) {
  currentPage.value = event.page + 1
  loadReceipts()
}

function applyFilters() {
  currentPage.value = 1
  loadReceipts()
}

function getReceiptTypeLabel(type) {
  return receiptTypes[type]?.label || type
}

function getReceiptTypeSeverity(type) {
  return receiptTypes[type]?.severity || 'secondary'
}

function getPaymentMethodLabel(method) {
  return paymentMethods[method] || method
}

function formatNumber(num) {
  return new Intl.NumberFormat('en-US').format(Math.round(num))
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

async function viewReceipt(receipt) {
  router.push(`/receipts/${receipt.id}`)
}

function printReceipt(receipt) {
  window.open(`/receipts/${receipt.id}/print`, '_blank')
}

function downloadPDF(receipt) {
  window.open(`/receipts/${receipt.id}/pdf`, '_blank')
}

function navigateTo(path) {
  router.push(path)
}

onMounted(() => {
  loadReceipts()
})
</script>

<style scoped>
.receipt-list {
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

.filter-card {
  border-radius: 12px;
}

.filter-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  padding: 1.5rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-weight: 500;
  font-size: 0.875rem;
  color: var(--text-color);
}

.table-card {
  border-radius: 12px;
  overflow: hidden;
}

.card-title {
  font-size: 1.125rem;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.customer-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.customer-info .name {
  font-weight: 500;
  color: var(--text-color);
}

.customer-info .tin {
  font-size: 0.75rem;
  color: var(--text-color-secondary);
}

.amount {
  font-weight: 600;
  color: var(--primary-color);
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
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

  .filter-row {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
