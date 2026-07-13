<template>
  <MainLayout>
    <div class="classification-manager">
      <div class="page-header">
        <div>
          <h1>Item Classification</h1>
          <p class="page-description">Manage UNSPSC classification codes for products</p>
        </div>
        <div class="header-actions">
          <Button
            label="Add Classification"
            icon="pi pi-plus"
            class="p-button-rounded p-button-primary"
            @click="showAddDialog = true"
          />
          <Button label="Sync Codes" icon="pi pi-refresh" class="p-button-rounded p-button-info" />
        </div>
      </div>

      <Card class="filter-card">
        <div class="filter-row">
          <div class="filter-group">
            <label>Search Code/Name</label>
            <InputText
              v-model="searchText"
              placeholder="Search classifications..."
              @input="applyFilter"
              class="w-full"
            />
          </div>
          <div class="filter-group">
            <label>Category</label>
            <Dropdown
              v-model="filters.category"
              :options="categoryOptions"
              option-label="label"
              option-value="value"
              placeholder="All Categories"
              @change="applyFilter"
              class="w-full"
            />
          </div>
          <div class="filter-group">
            <label>Items Assigned</label>
            <Dropdown
              v-model="filters.hasItems"
              :options="[
                { label: 'All', value: null },
                { label: 'Assigned', value: true },
                { label: 'Unassigned', value: false },
              ]"
              option-label="label"
              option-value="value"
              @change="applyFilter"
              class="w-full"
            />
          </div>
        </div>
      </Card>

      <Card class="content-card">
        <template #header>
          <div class="card-header">
            <h3>Classifications</h3>
            <Badge :value="`Total: ${totalClassifications}`" />
          </div>
        </template>

        <DataTable
          :value="classifications"
          :loading="isLoading"
          paginator
          :rows="20"
          striped-rows
          responsive-layout="scroll"
          expandable-rows
          :expanded-rows="expandedRows"
          @row-expand="onRowExpand"
          class="p-datatable-striped"
        >
          <Column :expander="true" style="width: 3rem" />
          <Column field="classificationCode" header="UNSPSC Code" style="width: 150px">
            <template #body="{ data }">
              <span class="mono">{{ data.classificationCode }}</span>
            </template>
          </Column>
          <Column field="classificationName" header="Classification Name" />
          <Column field="category" header="Category" style="width: 120px">
            <template #body="{ data }">
              <Badge :value="data.category" />
            </template>
          </Column>
          <Column field="itemCount" header="Items" style="width: 100px">
            <template #body="{ data }">
              <span v-if="data.itemCount > 0" class="item-count">{{ data.itemCount }}</span>
              <span v-else class="text-secondary">—</span>
            </template>
          </Column>
          <Column field="isActive" header="Status" style="width: 100px">
            <template #body="{ data }">
              <Tag
                :value="data.isActive ? 'Active' : 'Inactive'"
                :severity="data.isActive ? 'success' : 'secondary'"
              />
            </template>
          </Column>
          <Column header="Actions" style="width: 120px">
            <template #body="{ data }">
              <div class="action-buttons">
                <Button
                  icon="pi pi-pencil"
                  class="p-button-rounded p-button-sm p-button-text"
                  @click="editClassification(data)"
                />
                <Button
                  icon="pi pi-eye"
                  class="p-button-rounded p-button-sm p-button-text"
                  @click="viewItems(data)"
                />
                <Button
                  icon="pi pi-trash"
                  class="p-button-rounded p-button-sm p-button-text p-button-danger"
                  @click="deleteClassification(data)"
                />
              </div>
            </template>
          </Column>
          <template #expansion="{ data }">
            <div class="expansion-content">
              <div class="expansion-section">
                <h4>Details</h4>
                <div class="details-grid">
                  <div class="detail-item">
                    <span class="label">Description:</span>
                    <span class="value">{{ data.description || 'No description' }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">Tax Rate:</span>
                    <span class="value">{{ data.taxRate }}%</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">Created:</span>
                    <span class="value">{{ formatDate(data.createdAt) }}</span>
                  </div>
                </div>
              </div>

              <div class="expansion-section" v-if="data.itemCount > 0">
                <h4>Assigned Items ({{ data.itemCount }})</h4>
                <DataTable :value="data.items || []" class="nested-table">
                  <Column field="itemCode" header="Item Code" style="width: 120px" />
                  <Column field="itemName" header="Item Name" />
                  <Column field="quantity" header="Qty" style="width: 80px" />
                  <Column field="price" header="Price" style="width: 100px">
                    <template #body="{ data: item }">
                      RWF {{ formatNumber(item.price) }}
                    </template>
                  </Column>
                </DataTable>
              </div>

              <div class="expansion-section" v-else>
                <Message severity="info" text="No items assigned to this classification" />
              </div>
            </div>
          </template>
        </DataTable>
      </Card>

      <!-- Add/Edit Classification Dialog -->
      <Dialog
        v-model:visible="showAddDialog"
        :header="editingId ? 'Edit Classification' : 'Add Classification'"
        :modal="true"
        class="p-dialog-centered"
        style="width: 90vw; max-width: 700px"
      >
        <div class="form-content">
          <div class="form-row">
            <div class="form-group">
              <label>UNSPSC Code *</label>
              <InputText
                v-model="newClassification.classificationCode"
                class="w-full"
                placeholder="RW2NTBA0001"
              />
            </div>
            <div class="form-group">
              <label>Classification Name *</label>
              <InputText
                v-model="newClassification.classificationName"
                class="w-full"
                placeholder="Product category name"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Category *</label>
              <Dropdown
                v-model="newClassification.category"
                :options="categoryOptions"
                option-label="label"
                option-value="value"
                class="w-full"
              />
            </div>
            <div class="form-group">
              <label>Tax Rate (%)</label>
              <InputNumber v-model="newClassification.taxRate" :step="0.01" placeholder="0" />
            </div>
          </div>

          <div class="form-group">
            <label>Description</label>
            <textarea v-model="newClassification.description" class="form-textarea" rows="3" />
          </div>

          <div class="form-group">
            <Checkbox v-model="newClassification.isActive" binary />
            <label for="isActive" class="ml-2">Active</label>
          </div>
        </div>
        <template #footer>
          <Button label="Cancel" text @click="showAddDialog = false" />
          <Button label="Save" @click="saveClassification" />
        </template>
      </Dialog>

      <!-- View Items Dialog -->
      <Dialog
        v-model:visible="showItemsDialog"
        header="Assigned Items"
        :modal="true"
        class="p-dialog-centered"
        style="width: 90vw; max-width: 800px"
      >
        <div v-if="selectedClassification">
          <div class="items-header">
            <h4>{{ selectedClassification.classificationName }} ({{ selectedClassification.itemCount }} items)</h4>
            <Button label="Assign Items" icon="pi pi-plus" size="small" />
          </div>

          <DataTable :value="selectedClassification.items || []" paginator :rows="10">
            <Column field="itemCode" header="Item Code" style="width: 120px" />
            <Column field="itemName" header="Item Name" />
            <Column field="quantity" header="Qty" style="width: 80px" />
            <Column field="price" header="Price" style="width: 100px">
              <template #body="{ data }">
                RWF {{ formatNumber(data.price) }}
              </template>
            </Column>
            <Column field="stockValue" header="Stock Value" style="width: 120px">
              <template #body="{ data }">
                RWF {{ formatNumber(data.quantity * data.price) }}
              </template>
            </Column>
            <Column header="Actions" style="width: 100px">
              <template #body="{ data }">
                <Button
                  icon="pi pi-trash"
                  class="p-button-rounded p-button-sm p-button-text p-button-danger"
                  @click="unassignItem(data)"
                />
              </template>
            </Column>
          </DataTable>
        </div>
        <template #footer>
          <Button label="Close" text @click="showItemsDialog = false" />
        </template>
      </Dialog>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import MainLayout from '../../components/layout/MainLayout.vue'

const toast = useToast()

const classifications = ref([
  {
    id: 1,
    classificationCode: 'RW2NTBA0001',
    classificationName: 'Beverages',
    category: 'Food & Beverage',
    itemCount: 5,
    isActive: true,
    description: 'Alcoholic and non-alcoholic beverages',
    taxRate: 18,
    createdAt: new Date('2024-01-15'),
    items: [
      { itemCode: 'ITEM001', itemName: 'Water', quantity: 100, price: 2000 },
      { itemCode: 'ITEM002', itemName: 'Soda', quantity: 50, price: 3000 },
    ],
  },
  {
    id: 2,
    classificationCode: 'RW2NTBA0002',
    classificationName: 'Electronics',
    category: 'Technology',
    itemCount: 0,
    isActive: true,
    description: 'Electronic devices and accessories',
    taxRate: 18,
    createdAt: new Date('2024-01-20'),
    items: [],
  },
])

const searchText = ref('')
const isLoading = ref(false)
const showAddDialog = ref(false)
const showItemsDialog = ref(false)
const totalClassifications = ref(classifications.value.length)
const expandedRows = ref([])
const editingId = ref(null)
const selectedClassification = ref(null)

const filters = ref({
  category: null,
  hasItems: null,
})

const categoryOptions = [
  { label: 'Food & Beverage', value: 'Food & Beverage' },
  { label: 'Technology', value: 'Technology' },
  { label: 'Clothing', value: 'Clothing' },
  { label: 'Healthcare', value: 'Healthcare' },
  { label: 'Other', value: 'Other' },
]

const newClassification = ref({
  classificationCode: '',
  classificationName: '',
  category: null,
  taxRate: 18,
  description: '',
  isActive: true,
})

function applyFilter() {
  isLoading.value = true
  setTimeout(() => {
    isLoading.value = false
  }, 300)
}

function formatNumber(num) {
  return new Intl.NumberFormat('en-US').format(Math.round(num))
}

function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function onRowExpand(event) {
  if (!expandedRows.value.find(r => r.id === event.data.id)) {
    expandedRows.value = [event.data, ...expandedRows.value]
  } else {
    expandedRows.value = expandedRows.value.filter(r => r.id !== event.data.id)
  }
}

function editClassification(classification) {
  editingId.value = classification.id
  newClassification.value = { ...classification }
  showAddDialog.value = true
}

function viewItems(classification) {
  selectedClassification.value = classification
  showItemsDialog.value = true
}

function deleteClassification(classification) {
  toast.add({
    severity: 'warn',
    summary: 'Confirm',
    detail: `Delete ${classification.classificationName}?`,
    life: 3000,
  })
}

function unassignItem(item) {
  toast.add({
    severity: 'info',
    summary: 'Info',
    detail: `Unassign ${item.itemName}?`,
    life: 3000,
  })
}

function saveClassification() {
  if (!newClassification.value.classificationCode || !newClassification.value.classificationName) {
    toast.add({
      severity: 'warning',
      summary: 'Warning',
      detail: 'Please fill in all required fields',
      life: 3000,
    })
    return
  }

  if (editingId.value) {
    const idx = classifications.value.findIndex(c => c.id === editingId.value)
    if (idx >= 0) {
      classifications.value[idx] = { ...classifications.value[idx], ...newClassification.value }
    }
  } else {
    classifications.value.push({
      ...newClassification.value,
      id: Date.now(),
      itemCount: 0,
      items: [],
    })
  }

  toast.add({
    severity: 'success',
    summary: 'Success',
    detail: editingId.value ? 'Classification updated' : 'Classification added',
    life: 3000,
  })

  showAddDialog.value = false
  editingId.value = null
  newClassification.value = {
    classificationCode: '',
    classificationName: '',
    category: null,
    taxRate: 18,
    description: '',
    isActive: true,
  }
}

onMounted(() => {
  totalClassifications.value = classifications.value.length
})
</script>

<style scoped>
.classification-manager {
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

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.mono {
  font-family: monospace;
}

.item-count {
  background-color: var(--primary-50);
  color: var(--primary-color);
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-weight: 600;
}

.text-secondary {
  color: var(--text-color-secondary);
}

.expansion-content {
  padding: 1.5rem;
  background-color: var(--surface-50);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.expansion-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.expansion-section h4 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-color);
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.75rem;
  background-color: white;
  border-radius: 6px;
}

.detail-item .label {
  font-weight: 500;
  font-size: 0.875rem;
  color: var(--text-color-secondary);
}

.detail-item .value {
  color: var(--text-color);
}

.nested-table {
  font-size: 0.875rem;
}

.items-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.items-header h4 {
  margin: 0;
  font-size: 1rem;
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  font-size: 0.875rem;
}

.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--surface-border);
  border-radius: 6px;
  font-family: inherit;
  font-size: 0.875rem;
}

.w-full {
  width: 100%;
}

.ml-2 {
  margin-left: 0.5rem;
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

  .form-row {
    grid-template-columns: 1fr;
  }

  .details-grid {
    grid-template-columns: 1fr;
  }
}
</style>
