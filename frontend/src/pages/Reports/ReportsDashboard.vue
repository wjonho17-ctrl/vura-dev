<template>
  <MainLayout>
    <div class="reports-dashboard">
      <div class="page-header">
        <div>
          <h1>Reports</h1>
          <p class="page-description">X, Z, and PLU reports for compliance and analytics</p>
        </div>
        <div class="header-actions">
          <Button
            label="Refresh"
            icon="pi pi-refresh"
            class="p-button-rounded p-button-info"
            @click="loadReports"
          />
          <Button label="Export" icon="pi pi-download" class="p-button-rounded p-button-secondary" />
        </div>
      </div>

      <TabView class="reports-tabs">
        <!-- X Report Tab -->
        <TabPanel header="X Report (Daily)" left-icon="pi pi-file-pdf">
          <Card class="report-card">
            <template #header>
              <div class="card-title">Daily X Report (Current Day)</div>
            </template>

            <div class="report-content">
              <div class="report-info">
                <div class="info-item">
                  <span class="label">Report Date:</span>
                  <span class="value">{{ currentDate }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Report Type:</span>
                  <span class="value">X Report (Non-Fiscal)</span>
                </div>
                <div class="info-item">
                  <span class="label">Receipt Count:</span>
                  <span class="value">{{ reports.xReport?.receiptCount || 0 }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Refund Count:</span>
                  <span class="value">{{ reports.xReport?.refundCount || 0 }}</span>
                </div>
              </div>

              <div class="report-summary">
                <div class="summary-item">
                  <span class="label">Total Sales:</span>
                  <span class="value">RWF {{ formatNumber(reports.xReport?.totalSales || 0) }}</span>
                </div>
                <div class="summary-item">
                  <span class="label">Total Refunds:</span>
                  <span class="value negative">-RWF {{ formatNumber(reports.xReport?.totalRefunds || 0) }}</span>
                </div>
                <div class="summary-item">
                  <span class="label">Net Sales:</span>
                  <span class="value highlight">RWF {{ formatNumber((reports.xReport?.totalSales || 0) - (reports.xReport?.totalRefunds || 0)) }}</span>
                </div>
                <div class="summary-item">
                  <span class="label">Total Tax:</span>
                  <span class="value">RWF {{ formatNumber(reports.xReport?.totalTax || 0) }}</span>
                </div>
              </div>

              <div class="report-breakdown">
                <h4>Sales by Tax Type:</h4>
                <div class="breakdown-grid">
                  <div class="breakdown-item">
                    <span class="type">Tax Type A (0%)</span>
                    <span class="amount">RWF {{ formatNumber(reports.xReport?.taxTypeA || 0) }}</span>
                  </div>
                  <div class="breakdown-item">
                    <span class="type">Tax Type B (18%)</span>
                    <span class="amount">RWF {{ formatNumber(reports.xReport?.taxTypeB || 0) }}</span>
                  </div>
                  <div class="breakdown-item">
                    <span class="type">Tax Type C (0%)</span>
                    <span class="amount">RWF {{ formatNumber(reports.xReport?.taxTypeC || 0) }}</span>
                  </div>
                  <div class="breakdown-item">
                    <span class="type">Tax Type D (0%)</span>
                    <span class="amount">RWF {{ formatNumber(reports.xReport?.taxTypeD || 0) }}</span>
                  </div>
                </div>
              </div>

              <div class="report-actions">
                <Button
                  label="Print X Report"
                  icon="pi pi-print"
                  class="p-button-primary"
                  @click="printXReport"
                />
                <Button label="Export PDF" icon="pi pi-download" class="p-button-info" />
              </div>
            </div>
          </Card>
        </TabPanel>

        <!-- Z Report Tab -->
        <TabPanel header="Z Report (Closing)" left-icon="pi pi-file-excel">
          <Card class="report-card">
            <template #header>
              <div class="card-title">Daily Z Report (Fiscal Close)</div>
            </template>

            <Message severity="info" text="Z Report (Closing Report) can only be generated at end of business day. This resets daily counters." />

            <div class="report-content">
              <div class="report-info">
                <div class="info-item">
                  <span class="label">Report Date:</span>
                  <span class="value">{{ currentDate }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Report Type:</span>
                  <span class="value">Z Report (Fiscal Closing)</span>
                </div>
                <div class="info-item">
                  <span class="label">Status:</span>
                  <Tag value="Ready to Close" severity="warning" />
                </div>
                <div class="info-item">
                  <span class="label">Total Receipts:</span>
                  <span class="value">{{ reports.zReport?.totalReceipts || 0 }}</span>
                </div>
              </div>

              <div class="report-summary">
                <div class="summary-item">
                  <span class="label">Daily Total Sales:</span>
                  <span class="value">RWF {{ formatNumber(reports.zReport?.totalSales || 0) }}</span>
                </div>
                <div class="summary-item">
                  <span class="label">Daily Total Refunds:</span>
                  <span class="value negative">-RWF {{ formatNumber(reports.zReport?.totalRefunds || 0) }}</span>
                </div>
                <div class="summary-item">
                  <span class="label">Daily Net Sales:</span>
                  <span class="value highlight">RWF {{ formatNumber((reports.zReport?.totalSales || 0) - (reports.zReport?.totalRefunds || 0)) }}</span>
                </div>
                <div class="summary-item">
                  <span class="label">Daily Total Tax:</span>
                  <span class="value">RWF {{ formatNumber(reports.zReport?.totalTax || 0) }}</span>
                </div>
              </div>

              <div class="report-breakdown">
                <h4>Daily Cumulative by Tax Type:</h4>
                <div class="breakdown-grid">
                  <div class="breakdown-item">
                    <span class="type">Type A (0%)</span>
                    <span class="amount">RWF {{ formatNumber(reports.zReport?.taxTypeA || 0) }}</span>
                  </div>
                  <div class="breakdown-item">
                    <span class="type">Type B (18%)</span>
                    <span class="amount">RWF {{ formatNumber(reports.zReport?.taxTypeB || 0) }}</span>
                  </div>
                  <div class="breakdown-item">
                    <span class="type">Type C (0%)</span>
                    <span class="amount">RWF {{ formatNumber(reports.zReport?.taxTypeC || 0) }}</span>
                  </div>
                  <div class="breakdown-item">
                    <span class="type">Type D (0%)</span>
                    <span class="amount">RWF {{ formatNumber(reports.zReport?.taxTypeD || 0) }}</span>
                  </div>
                </div>
              </div>

              <div class="report-warning">
                <i class="pi pi-exclamation-circle"></i>
                <p>
                  Closing the day will reset daily counters. Make sure all transactions are finalized
                  before proceeding.
                </p>
              </div>

              <div class="report-actions">
                <Button label="Preview Z Report" icon="pi pi-eye" class="p-button-secondary" />
                <Button
                  label="Close Day & Generate Z"
                  icon="pi pi-check"
                  class="p-button-danger"
                  @click="confirmCloseDay"
                />
              </div>
            </div>
          </Card>
        </TabPanel>

        <!-- PLU Report Tab -->
        <TabPanel header="PLU Report" left-icon="pi pi-list">
          <Card class="report-card">
            <template #header>
              <div class="card-title">Price Look Up (PLU) Report</div>
            </template>

            <div class="report-content">
              <Message severity="info" text="PLU Report shows all items configured in the system with their codes and prices." />

              <DataTable :value="reports.pluItems || []" class="p-datatable-striped" paginator :rows="10">
                <Column field="itemCode" header="Item Code" style="width: 120px" />
                <Column field="itemName" header="Item Name" />
                <Column field="classificationCode" header="Classification" style="width: 150px" />
                <Column field="price" header="Price" style="width: 100px">
                  <template #body="{ data }">
                    RWF {{ formatNumber(data.price) }}
                  </template>
                </Column>
                <Column field="quantity" header="Stock" style="width: 80px" />
                <Column field="lastUpdated" header="Updated" style="width: 120px">
                  <template #body="{ data }">
                    {{ formatDate(data.lastUpdated) }}
                  </template>
                </Column>
              </DataTable>

              <div class="report-actions">
                <Button label="Print PLU Report" icon="pi pi-print" class="p-button-primary" />
                <Button label="Export to PDF" icon="pi pi-download" class="p-button-info" />
              </div>
            </div>
          </Card>
        </TabPanel>

        <!-- Summary Tab -->
        <TabPanel header="Summary" left-icon="pi pi-chart-bar">
          <Card class="report-card">
            <template #header>
              <div class="card-title">Summary Statistics</div>
            </template>

            <div class="summary-stats">
              <div class="stat-box">
                <div class="stat-label">Total Transactions</div>
                <div class="stat-number">{{ reports.summary?.totalTransactions || 0 }}</div>
              </div>
              <div class="stat-box">
                <div class="stat-label">Total Revenue</div>
                <div class="stat-number">RWF {{ formatNumber(reports.summary?.totalRevenue || 0) }}</div>
              </div>
              <div class="stat-box">
                <div class="stat-label">Total Tax Collected</div>
                <div class="stat-number">RWF {{ formatNumber(reports.summary?.totalTaxCollected || 0) }}</div>
              </div>
              <div class="stat-box">
                <div class="stat-label">Avg Transaction Value</div>
                <div class="stat-number">RWF {{ formatNumber(reports.summary?.avgValue || 0) }}</div>
              </div>
            </div>
          </Card>
        </TabPanel>
      </TabView>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import MainLayout from '../../components/layout/MainLayout.vue'

const toast = useToast()

const reports = ref({
  xReport: {},
  zReport: {},
  pluItems: [],
  summary: {},
})

const currentDate = computed(() => {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

function formatNumber(num) {
  return new Intl.NumberFormat('en-US').format(Math.round(num))
}

function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', {
    year: '2-digit',
    month: 'short',
    day: 'numeric',
  })
}

async function loadReports() {
  try {
    // Mock data for now - in production this would call the API
    reports.value = {
      xReport: {
        receiptCount: 45,
        refundCount: 3,
        totalSales: 2500000,
        totalRefunds: 150000,
        totalTax: 380000,
        taxTypeA: 0,
        taxTypeB: 2500000,
        taxTypeC: 0,
        taxTypeD: 0,
      },
      zReport: {
        totalReceipts: 45,
        totalSales: 2500000,
        totalRefunds: 150000,
        totalTax: 380000,
        taxTypeA: 0,
        taxTypeB: 2500000,
        taxTypeC: 0,
        taxTypeD: 0,
      },
      pluItems: [
        { itemCode: 'ITEM001', itemName: 'Product A', classificationCode: 'RW2NTBA0001', price: 5000, quantity: 50, lastUpdated: new Date() },
        { itemCode: 'ITEM002', itemName: 'Product B', classificationCode: 'RW2NTBA0002', price: 10000, quantity: 30, lastUpdated: new Date() },
      ],
      summary: {
        totalTransactions: 48,
        totalRevenue: 2350000,
        totalTaxCollected: 380000,
        avgValue: 48958,
      },
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load reports',
      life: 3000,
    })
  }
}

function printXReport() {
  window.print()
}

function confirmCloseDay() {
  toast.add({
    severity: 'warn',
    summary: 'Confirm',
    detail: 'Z Report functionality coming soon. Contact admin for daily close.',
    life: 4000,
  })
}

onMounted(() => {
  loadReports()
})
</script>

<style scoped>
.reports-dashboard {
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

.reports-tabs {
  margin-top: 1rem;
}

.report-card {
  border-radius: 12px;
  overflow: hidden;
}

.report-card :deep(.p-card-header) {
  padding: 1.5rem;
  background-color: var(--primary-50);
}

.card-title {
  font-size: 1.125rem;
  font-weight: 600;
}

.report-content {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.report-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-item .label {
  font-weight: 500;
  color: var(--text-color-secondary);
}

.info-item .value {
  font-weight: 600;
  color: var(--text-color);
  font-family: monospace;
}

.report-summary {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  padding: 1.5rem;
  background-color: var(--primary-50);
  border-radius: 8px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem;
}

.summary-item .label {
  font-weight: 500;
  color: var(--text-color);
}

.summary-item .value {
  font-weight: 700;
  color: var(--primary-color);
}

.summary-item .value.negative {
  color: #dc2626;
}

.summary-item .value.highlight {
  color: #22c55e;
  font-size: 1.1rem;
}

.report-breakdown {
  padding: 1.5rem;
  background-color: var(--surface-50);
  border-radius: 8px;
}

.report-breakdown h4 {
  margin: 0 0 1rem 0;
  font-size: 0.95rem;
  font-weight: 600;
}

.breakdown-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.breakdown-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem;
  background-color: white;
  border-radius: 6px;
  border-left: 4px solid var(--primary-color);
}

.breakdown-item .type {
  font-size: 0.875rem;
  color: var(--text-color-secondary);
}

.breakdown-item .amount {
  font-weight: 600;
  color: var(--text-color);
}

.report-warning {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background-color: #fef3c7;
  border-radius: 8px;
  border-left: 4px solid #f59e0b;
}

.report-warning i {
  color: #f59e0b;
  flex-shrink: 0;
}

.report-warning p {
  margin: 0;
  color: #92400e;
}

.report-actions {
  display: flex;
  gap: 1rem;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  padding: 1.5rem;
}

.stat-box {
  padding: 1.5rem;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-700) 100%);
  border-radius: 8px;
  color: white;
}

.stat-label {
  font-size: 0.875rem;
  opacity: 0.9;
  margin-bottom: 0.5rem;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
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

  .report-summary {
    grid-template-columns: 1fr;
  }

  .report-info {
    grid-template-columns: 1fr;
  }

  .report-actions {
    flex-direction: column;
  }

  .report-actions :deep(button) {
    width: 100%;
  }
}
</style>
