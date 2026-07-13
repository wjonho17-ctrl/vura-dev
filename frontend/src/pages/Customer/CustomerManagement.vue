<template>
  <MainLayout>
    <div class="customer-management">
      <div class="page-header">
        <div>
          <h1>Customer Management</h1>
          <p class="page-description">Manage customer profiles and information</p>
        </div>
        <div class="header-actions">
          <Button
            label="Add Customer"
            icon="pi pi-plus"
            class="p-button-rounded p-button-primary"
            @click="showAddDialog = true"
          />
          <Button label="Import" icon="pi pi-download" class="p-button-rounded p-button-info" />
        </div>
      </div>

      <Card class="filter-card">
        <div class="filter-row">
          <div class="filter-group">
            <label>Search</label>
            <InputText
              v-model="searchText"
              placeholder="Search by name or TIN..."
              @input="applyFilter"
              class="w-full"
            />
          </div>
          <div class="filter-group">
            <label>City</label>
            <InputText v-model="filters.city" placeholder="Filter by city" @input="applyFilter" class="w-full" />
          </div>
          <div class="filter-group">
            <label>Status</label>
            <Dropdown
              v-model="filters.status"
              :options="[
                { label: 'All', value: null },
                { label: 'Active', value: 'active' },
                { label: 'Inactive', value: 'inactive' },
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
            <h3>Customers</h3>
            <Badge :value="`Total: ${totalCustomers}`" />
          </div>
        </template>

        <DataTable
          :value="customers"
          :loading="isLoading"
          paginator
          :rows="20"
          striped-rows
          responsive-layout="scroll"
          class="p-datatable-striped"
        >
          <Column field="name" header="Customer Name" />
          <Column field="tin" header="TIN" style="width: 120px">
            <template #body="{ data }">
              <span class="mono">{{ data.tin || '—' }}</span>
            </template>
          </Column>
          <Column field="mobileNo" header="Mobile" style="width: 120px" />
          <Column field="city" header="City" style="width: 100px" />
          <Column field="purchaseCount" header="Purchases" style="width: 100px">
            <template #body="{ data }">
              <Badge :value="data.purchaseCount || 0" />
            </template>
          </Column>
          <Column field="totalSpent" header="Total Spent" style="width: 120px">
            <template #body="{ data }">
              RWF {{ formatNumber(data.totalSpent || 0) }}
            </template>
          </Column>
          <Column field="status" header="Status" style="width: 100px">
            <template #body="{ data }">
              <Tag
                :value="data.status === 'active' ? 'Active' : 'Inactive'"
                :severity="data.status === 'active' ? 'success' : 'secondary'"
              />
            </template>
          </Column>
          <Column header="Actions" style="width: 120px">
            <template #body="{ data }">
              <div class="action-buttons">
                <Button
                  icon="pi pi-eye"
                  class="p-button-rounded p-button-sm p-button-text"
                  @click="viewCustomer(data)"
                />
                <Button
                  icon="pi pi-pencil"
                  class="p-button-rounded p-button-sm p-button-text"
                  @click="editCustomer(data)"
                />
                <Button
                  icon="pi pi-trash"
                  class="p-button-rounded p-button-sm p-button-text p-button-danger"
                  @click="deleteCustomer(data)"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </Card>

      <Dialog
        v-model:visible="showAddDialog"
        header="Add New Customer"
        :modal="true"
        class="p-dialog-centered"
        style="width: 90vw; max-width: 600px"
      >
        <div class="form-content">
          <div class="form-row">
            <div class="form-group">
              <label>Name *</label>
              <InputText v-model="newCustomer.name" class="w-full" placeholder="Customer name" />
            </div>
            <div class="form-group">
              <label>TIN</label>
              <InputText v-model="newCustomer.tin" class="w-full" placeholder="Tax ID" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Mobile</label>
              <InputText v-model="newCustomer.mobileNo" class="w-full" placeholder="07XXXXXXXX" />
            </div>
            <div class="form-group">
              <label>Email</label>
              <InputText v-model="newCustomer.email" class="w-full" type="email" placeholder="email@example.com" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>City</label>
              <InputText v-model="newCustomer.city" class="w-full" placeholder="City" />
            </div>
            <div class="form-group">
              <label>District</label>
              <InputText v-model="newCustomer.district" class="w-full" placeholder="District" />
            </div>
          </div>
          <div class="form-group">
            <label>Address</label>
            <textarea v-model="newCustomer.address" class="form-textarea" placeholder="Street address" rows="3" />
          </div>
        </div>
        <template #footer>
          <Button label="Cancel" text @click="showAddDialog = false" />
          <Button label="Add Customer" @click="addCustomer" />
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

const customers = ref([
  {
    id: 1,
    name: 'John Doe',
    tin: '123456789',
    mobileNo: '0780000001',
    city: 'Kigali',
    district: 'Gasabo',
    purchaseCount: 12,
    totalSpent: 2500000,
    status: 'active',
  },
  {
    id: 2,
    name: 'Jane Smith',
    tin: '987654321',
    mobileNo: '0780000002',
    city: 'Kigali',
    district: 'Kicukiro',
    purchaseCount: 8,
    totalSpent: 1800000,
    status: 'active',
  },
])

const searchText = ref('')
const isLoading = ref(false)
const showAddDialog = ref(false)
const totalCustomers = ref(customers.value.length)

const filters = ref({
  city: '',
  status: null,
})

const newCustomer = ref({
  name: '',
  tin: '',
  mobileNo: '',
  email: '',
  city: '',
  district: '',
  address: '',
})

function applyFilter() {
  // Mock filter logic
  isLoading.value = true
  setTimeout(() => {
    isLoading.value = false
  }, 300)
}

function formatNumber(num) {
  return new Intl.NumberFormat('en-US').format(Math.round(num))
}

function viewCustomer(customer) {
  toast.add({
    severity: 'info',
    summary: 'Info',
    detail: `View details for ${customer.name}`,
    life: 3000,
  })
}

function editCustomer(customer) {
  newCustomer.value = { ...customer }
  showAddDialog.value = true
}

function deleteCustomer(customer) {
  toast.add({
    severity: 'warn',
    summary: 'Confirm',
    detail: `Delete ${customer.name}?`,
    life: 3000,
  })
}

async function addCustomer() {
  if (!newCustomer.value.name) {
    toast.add({
      severity: 'warning',
      summary: 'Warning',
      detail: 'Customer name is required',
      life: 3000,
    })
    return
  }

  customers.value.push({
    ...newCustomer.value,
    id: Date.now(),
    purchaseCount: 0,
    totalSpent: 0,
    status: 'active',
  })

  toast.add({
    severity: 'success',
    summary: 'Success',
    detail: 'Customer added successfully',
    life: 3000,
  })

  showAddDialog.value = false
  newCustomer.value = {
    name: '',
    tin: '',
    mobileNo: '',
    email: '',
    city: '',
    district: '',
    address: '',
  }
}

onMounted(() => {
  totalCustomers.value = customers.value.length
})
</script>

<style scoped>
.customer-management {
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

.mono {
  font-family: monospace;
}

.w-full {
  width: 100%;
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
}
</style>
