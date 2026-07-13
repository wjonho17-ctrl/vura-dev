<template>
  <MainLayout>
    <div class="receipt-detail">
      <div class="page-header">
        <div>
          <router-link to="/receipts" class="back-link">
            <i class="pi pi-arrow-left"></i>
            Back to Receipts
          </router-link>
          <h1 v-if="receipt">Receipt #{{ receipt.invoiceNo }}</h1>
        </div>
        <div class="header-actions" v-if="receipt">
          <Button
            label="Print"
            icon="pi pi-print"
            class="p-button-rounded p-button-primary"
            @click="printReceipt"
          />
          <Button
            label="Download PDF"
            icon="pi pi-download"
            class="p-button-rounded p-button-info"
          />
          <Button
            label="Resend VSDC"
            icon="pi pi-send"
            class="p-button-rounded p-button-warning"
            @click="resendVSVC"
          />
        </div>
      </div>

      <div v-if="isLoading" class="loading-state">
        <ProgressBar mode="indeterminate" />
      </div>

      <div v-else-if="receipt" class="receipt-content">
        <!-- Receipt Header -->
        <Card class="receipt-card receipt-header-card">
          <div class="receipt-header">
            <div class="header-section">
              <div class="info-item">
                <span class="label">Receipt Type:</span>
                <Tag :value="getReceiptTypeLabel(receipt.receiptType)" :severity="getReceiptTypeSeverity(receipt.receiptType)" />
              </div>
              <div class="info-item">
                <span class="label">Date:</span>
                <span class="value">{{ formatDate(receipt.saleDate) }}</span>
              </div>
              <div class="info-item">
                <span class="label">Payment Method:</span>
                <span class="value">{{ getPaymentMethodLabel(receipt.paymentMethod) }}</span>
              </div>
            </div>

            <div class="header-section">
              <div class="info-item">
                <span class="label">Status:</span>
                <Badge :value="receipt.saleStatus === '02' ? 'Completed' : 'Pending'" :severity="receipt.saleStatus === '02' ? 'success' : 'warning'" />
              </div>
              <div class="info-item" v-if="receipt.ebmSaleData">
                <span class="label">VSDC ID:</span>
                <span class="value mono">{{ receipt.ebmSaleData.sdcId }}</span>
              </div>
              <div class="info-item" v-if="receipt.ebmSaleData">
                <span class="label">Receipt Signature:</span>
                <span class="value mono">{{ receipt.ebmSaleData.rcptSign }}</span>
              </div>
            </div>
          </div>
        </Card>

        <!-- Customer Information -->
        <Card class="receipt-card">
          <template #header>
            <div class="card-title">Customer Information</div>
          </template>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">Name:</span>
              <span class="value">{{ receipt.customerName }}</span>
            </div>
            <div class="info-item">
              <span class="label">TIN:</span>
              <span class="value">{{ receipt.customerTin || '—' }}</span>
            </div>
            <div class="info-item">
              <span class="label">Mobile:</span>
              <span class="value">{{ receipt.customerMobileNo || '—' }}</span>
            </div>
            <div class="info-item" v-if="receipt.receipt">
              <span class="label">Trade Name:</span>
              <span class="value">{{ receipt.receipt.tradeName || '—' }}</span>
            </div>
          </div>
        </Card>

        <!-- Items Table -->
        <Card class="receipt-card">
          <template #header>
            <div class="card-title">Items</div>
          </template>
          <DataTable :value="receipt.items || []" class="p-datatable-striped">
            <Column field="itemSeq" header="Seq" style="width: 60px" />
            <Column field="itemNm" header="Item Name" />
            <Column field="qty" header="Qty" style="width: 80px" />
            <Column field="prc" header="Price" style="width: 100px">
              <template #body="{ data }">
                RWF {{ formatNumber(data.prc) }}
              </template>
            </Column>
            <Column field="dcAmt" header="Discount" style="width: 100px">
              <template #body="{ data }">
                RWF {{ formatNumber(data.dcAmt || 0) }}
              </template>
            </Column>
            <Column field="taxTyCd" header="Tax Type" style="width: 80px" />
            <Column field="taxblAmt" header="Taxable" style="width: 100px">
              <template #body="{ data }">
                RWF {{ formatNumber(data.taxblAmt) }}
              </template>
            </Column>
            <Column field="taxAmt" header="Tax" style="width: 100px">
              <template #body="{ data }">
                RWF {{ formatNumber(data.taxAmt) }}
              </template>
            </Column>
            <Column field="totAmt" header="Total" style="width: 100px">
              <template #body="{ data }">
                <span class="font-bold">RWF {{ formatNumber(data.totAmt) }}</span>
              </template>
            </Column>
          </DataTable>
        </Card>

        <!-- Summary -->
        <Card class="receipt-card summary-card">
          <template #header>
            <div class="card-title">Summary</div>
          </template>
          <div class="summary-grid">
            <div class="summary-row">
              <span class="label">Item Count:</span>
              <span class="value">{{ receipt.totalItems }}</span>
            </div>
            <div class="summary-row">
              <span class="label">Subtotal (A):</span>
              <span class="value">RWF {{ formatNumber(receipt.taxblAmtA || 0) }}</span>
            </div>
            <div class="summary-row">
              <span class="label">Subtotal (B):</span>
              <span class="value">RWF {{ formatNumber(receipt.taxblAmtB || 0) }}</span>
            </div>
            <div class="summary-row">
              <span class="label">Subtotal (C):</span>
              <span class="value">RWF {{ formatNumber(receipt.taxblAmtC || 0) }}</span>
            </div>
            <div class="summary-row">
              <span class="label">Subtotal (D):</span>
              <span class="value">RWF {{ formatNumber(receipt.taxblAmtD || 0) }}</span>
            </div>
            <div class="summary-row">
              <span class="label">Total Tax (A):</span>
              <span class="value">RWF {{ formatNumber(receipt.taxAmtA || 0) }}</span>
            </div>
            <div class="summary-row">
              <span class="label">Total Tax (B):</span>
              <span class="value">RWF {{ formatNumber(receipt.taxAmtB || 0) }}</span>
            </div>
            <div class="summary-row">
              <span class="label">Total Tax (C):</span>
              <span class="value">RWF {{ formatNumber(receipt.taxAmtC || 0) }}</span>
            </div>
            <div class="summary-row">
              <span class="label">Total Tax (D):</span>
              <span class="value">RWF {{ formatNumber(receipt.taxAmtD || 0) }}</span>
            </div>
            <div class="summary-row highlight">
              <span class="label">Total Amount:</span>
              <span class="value">RWF {{ formatNumber(receipt.totalAmount) }}</span>
            </div>
          </div>
        </Card>

        <!-- VSDC Response (if available) -->
        <Card v-if="receipt.ebmSaleData" class="receipt-card">
          <template #header>
            <div class="card-title">VSDC Response</div>
          </template>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">Receipt Number:</span>
              <span class="value mono">{{ receipt.ebmSaleData.rcptNo }}</span>
            </div>
            <div class="info-item">
              <span class="label">Internal Data:</span>
              <span class="value mono" style="font-size: 0.75rem">{{ receipt.ebmSaleData.intrlData }}</span>
            </div>
            <div class="info-item">
              <span class="label">Publication Date:</span>
              <span class="value mono">{{ receipt.ebmSaleData.vsdcRcptPbctDate }}</span>
            </div>
            <div class="info-item">
              <span class="label">MRC Number:</span>
              <span class="value mono">{{ receipt.ebmSaleData.mrcNo }}</span>
            </div>
          </div>
        </Card>
      </div>

      <div v-else class="not-found">
        <i class="pi pi-info-circle"></i>
        <p>Receipt not found</p>
        <router-link to="/receipts">
          <Button label="Back to Receipts" />
        </router-link>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import MainLayout from '../../components/layout/MainLayout.vue'
import { receiptApi } from '../../api/receipt'

const router = useRouter()
const route = useRoute()
const toast = useToast()

const receipt = ref(null)
const isLoading = ref(false)

const receiptTypes = {
  S: { label: 'Normal Sale', severity: 'success' },
  R: { label: 'Refund', severity: 'warning' },
  T: { label: 'Training', severity: 'info' },
  P: { label: 'Proforma', severity: 'secondary' },
  C: { label: 'Copy', severity: 'info' },
}

const paymentMethods = {
  '01': 'Cash',
  '02': 'Credit Card',
  '03': 'Bank Check',
  '04': 'Mobile Payment',
  '05': 'Bank Transfer',
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
    hour: '2-digit',
    minute: '2-digit',
  })
}

async function loadReceipt() {
  try {
    isLoading.value = true
    const response = await receiptApi.getReceipt(route.params.id)

    if (response.success) {
      receipt.value = response.data
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load receipt',
      life: 3000,
    })
  } finally {
    isLoading.value = false
  }
}

function printReceipt() {
  window.open(`/receipts/${route.params.id}/print`, '_blank')
}

async function resendVSVC() {
  try {
    const response = await receiptApi.resendReceipt(route.params.id)

    if (response.success) {
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Receipt resent to VSDC',
        life: 3000,
      })
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.response?.data?.message || 'Failed to resend receipt',
      life: 3000,
    })
  }
}

onMounted(() => {
  loadReceipt()
})
</script>

<style scoped>
.receipt-detail {
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

.back-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--primary-color);
  text-decoration: none;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.back-link:hover {
  text-decoration: underline;
}

.page-header h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.loading-state {
  padding: 2rem;
}

.receipt-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.receipt-card {
  border-radius: 12px;
  overflow: hidden;
}

.receipt-card :deep(.p-card-header) {
  padding: 1.5rem;
  background-color: var(--primary-50);
  border-bottom: 1px solid var(--surface-border);
}

.card-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-color);
}

.receipt-header-card :deep(.p-card-body) {
  padding: 2rem;
}

.receipt-header {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.header-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  padding: 1.5rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-item .label {
  font-weight: 600;
  color: var(--text-color);
  font-size: 0.875rem;
}

.info-item .value {
  color: var(--text-color-secondary);
}

.info-item .mono {
  font-family: monospace;
  font-size: 0.85rem;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  padding: 1.5rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem;
  border-bottom: 1px solid var(--surface-border);
}

.summary-row .label {
  font-weight: 500;
  color: var(--text-color-secondary);
}

.summary-row .value {
  font-weight: 600;
  color: var(--text-color);
}

.summary-row.highlight {
  background-color: var(--primary-50);
  border-radius: 8px;
  border: none;
  padding: 1rem;
  grid-column: 1 / -1;
}

.summary-row.highlight .label {
  font-size: 1.125rem;
  color: var(--text-color);
}

.summary-row.highlight .value {
  font-size: 1.25rem;
  color: var(--primary-color);
}

.not-found {
  text-align: center;
  padding: 3rem 2rem;
}

.not-found i {
  font-size: 2rem;
  color: var(--text-color-secondary);
  display: block;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.not-found p {
  color: var(--text-color-secondary);
  margin-bottom: 1rem;
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

  .receipt-header {
    grid-template-columns: 1fr;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>
