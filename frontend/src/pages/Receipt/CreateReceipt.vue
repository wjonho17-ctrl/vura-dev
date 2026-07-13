<template>
  <MainLayout>
    <div class="create-receipt">
      <div class="page-header">
        <h1>Create Receipt</h1>
        <p class="page-description">Generate a new receipt and sync with VSDC</p>
      </div>

      <div class="receipt-form-container">
        <Card class="receipt-card">
          <template #header>
            <div class="card-title">Receipt Information</div>
          </template>

          <form @submit.prevent="handleSubmit">
            <!-- Receipt Type Selection -->
            <div class="form-row">
              <div class="form-group">
                <label for="receiptType">Receipt Type</label>
                <Dropdown
                  id="receiptType"
                  v-model="formData.receiptType"
                  :options="receiptTypes"
                  option-label="label"
                  option-value="value"
                  class="w-full"
                  @change="onReceiptTypeChange"
                />
              </div>
              <div class="form-group">
                <label for="paymentMethod">Payment Method</label>
                <Dropdown
                  id="paymentMethod"
                  v-model="formData.paymentMethod"
                  :options="paymentMethods"
                  option-label="label"
                  option-value="value"
                  class="w-full"
                />
              </div>
            </div>

            <!-- Customer Information -->
            <div class="form-section">
              <h3>Customer Information</h3>
              <div class="form-row">
                <div class="form-group">
                  <label for="customerName">Customer Name *</label>
                  <InputText
                    id="customerName"
                    v-model="formData.customerName"
                    class="w-full"
                    placeholder="Enter customer name"
                  />
                </div>
                <div class="form-group">
                  <label for="customerTin">TIN</label>
                  <InputText
                    id="customerTin"
                    v-model="formData.customerTin"
                    class="w-full"
                    placeholder="Customer TIN"
                  />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="customerMobileNo">Mobile Number</label>
                  <InputText
                    id="customerMobileNo"
                    v-model="formData.customerMobileNo"
                    class="w-full"
                    placeholder="07XXXXXXXX"
                  />
                </div>
                <div class="form-group" v-if="formData.receiptType === 'R'">
                  <label for="refundReasonCode">Refund Reason</label>
                  <Dropdown
                    id="refundReasonCode"
                    v-model="formData.refundReasonCode"
                    :options="refundReasons"
                    option-label="label"
                    option-value="value"
                    class="w-full"
                  />
                </div>
              </div>
            </div>

            <!-- Business Information -->
            <div class="form-section">
              <h3>Business Information</h3>
              <div class="form-row">
                <div class="form-group">
                  <label for="tradeName">Trade Name</label>
                  <InputText
                    id="tradeName"
                    v-model="formData.tradeName"
                    class="w-full"
                    placeholder="Business name"
                  />
                </div>
                <div class="form-group">
                  <label for="address">Address</label>
                  <InputText
                    id="address"
                    v-model="formData.address"
                    class="w-full"
                    placeholder="Business address"
                  />
                </div>
              </div>

              <div class="form-group">
                <label for="remarks">Remarks</label>
                <textarea
                  id="remarks"
                  v-model="formData.remarks"
                  class="form-input"
                  rows="2"
                  placeholder="Additional remarks"
                />
              </div>
            </div>

            <!-- Items Section -->
            <div class="form-section">
              <div class="items-header">
                <h3>Items</h3>
                <Button
                  label="Add Item"
                  icon="pi pi-plus"
                  @click="addItem"
                  class="p-button-rounded p-button-sm p-button-info"
                />
              </div>

              <div v-if="formData.items.length === 0" class="empty-state">
                <i class="pi pi-inbox"></i>
                <p>No items added yet</p>
              </div>

              <div v-else class="items-list">
                <div v-for="(item, index) in formData.items" :key="index" class="item-row">
                  <div class="item-controls">
                    <Button
                      icon="pi pi-trash"
                      @click="removeItem(index)"
                      class="p-button-rounded p-button-danger p-button-sm p-button-text"
                    />
                  </div>

                  <div class="item-fields">
                    <div class="form-group">
                      <label>Item Code</label>
                      <InputText
                        v-model="item.code"
                        class="w-full"
                        placeholder="ITEM001"
                      />
                    </div>

                    <div class="form-group">
                      <label>Classification Code *</label>
                      <InputText
                        v-model="item.classificationCode"
                        class="w-full"
                        placeholder="RW2NTBA0001"
                      />
                    </div>

                    <div class="form-group">
                      <label>Item Name *</label>
                      <InputText
                        v-model="item.name"
                        class="w-full"
                        placeholder="Product name"
                      />
                    </div>

                    <div class="form-group">
                      <label>Quantity *</label>
                      <InputNumber
                        v-model="item.quantity"
                        :step="0.01"
                        placeholder="0"
                      />
                    </div>

                    <div class="form-group">
                      <label>Price *</label>
                      <InputNumber
                        v-model="item.price"
                        :step="0.01"
                        placeholder="0"
                      />
                    </div>

                    <div class="form-group">
                      <label>Discount %</label>
                      <InputNumber
                        v-model="item.discountRate"
                        :step="0.01"
                        :min="0"
                        :max="100"
                        placeholder="0"
                      />
                    </div>

                    <div class="form-group">
                      <label>Tax Type *</label>
                      <Dropdown
                        v-model="item.taxationType"
                        :options="taxTypes"
                        class="w-full"
                      />
                    </div>

                    <div class="form-group">
                      <label>Barcode</label>
                      <InputText
                        v-model="item.barcode"
                        class="w-full"
                        placeholder="Optional barcode"
                      />
                    </div>

                    <div class="form-group">
                      <label>Expiration Date</label>
                      <Calendar
                        v-model="item.expirationDate"
                        date-format="yy-mm-dd"
                        placeholder="Select date"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Summary -->
            <Card v-if="formData.items.length > 0" class="summary-card">
              <template #header>
                <div class="summary-header">Receipt Summary</div>
              </template>
              <div class="summary-grid">
                <div class="summary-item">
                  <span class="label">Total Items:</span>
                  <span class="value">{{ formData.items.length }}</span>
                </div>
                <div class="summary-item">
                  <span class="label">Subtotal:</span>
                  <span class="value">RWF {{ subtotal.toFixed(2) }}</span>
                </div>
                <div class="summary-item">
                  <span class="label">Tax Amount:</span>
                  <span class="value">RWF {{ taxAmount.toFixed(2) }}</span>
                </div>
                <div class="summary-item highlight">
                  <span class="label">Total Amount:</span>
                  <span class="value">RWF {{ totalAmount.toFixed(2) }}</span>
                </div>
              </div>
            </Card>

            <!-- Error Message -->
            <Message v-if="errorMessage" severity="error" :text="errorMessage" class="mt-3" />

            <!-- Submit Buttons -->
            <div class="form-actions">
              <Button
                label="Cancel"
                icon="pi pi-times"
                class="p-button-rounded p-button-secondary"
                @click="resetForm"
              />
              <Button
                label="Create Receipt"
                icon="pi pi-check"
                class="p-button-rounded p-button-primary"
                type="submit"
                :loading="isSubmitting"
                :disabled="formData.items.length === 0 || isSubmitting"
              />
            </div>
          </form>
        </Card>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import MainLayout from '../../components/layout/MainLayout.vue'
import { receiptApi } from '../../api/receipt'
import { stockApi } from '../../api/stock'

const router = useRouter()
const toast = useToast()

const receiptTypes = [
  { label: 'Normal Sale (NS)', value: 'S' },
  { label: 'Normal Refund (NR)', value: 'R' },
  { label: 'Training (TS)', value: 'T' },
  { label: 'Proforma (PS)', value: 'P' },
  { label: 'Copy (CS)', value: 'C' },
]

const paymentMethods = [
  { label: 'Cash', value: '01' },
  { label: 'Credit Card', value: '02' },
  { label: 'Bank Check', value: '03' },
  { label: 'Mobile Payment', value: '04' },
  { label: 'Bank Transfer', value: '05' },
]

const refundReasons = [
  { label: 'Damaged Product', value: '01' },
  { label: 'Wrong Item', value: '02' },
  { label: 'Quality Issue', value: '03' },
  { label: 'Customer Request', value: '04' },
]

const taxTypes = ['A', 'B', 'C', 'D']

const formData = ref({
  customerName: '',
  customerTin: '',
  customerMobileNo: '',
  paymentMethod: '01',
  receiptType: 'S',
  refundReasonCode: '',
  remarks: '',
  tradeName: '',
  address: '',
  items: [],
})

const errorMessage = ref('')
const isSubmitting = ref(false)

const subtotal = computed(() => {
  return formData.value.items.reduce((sum, item) => {
    const discount = (item.price * (item.discountRate || 0)) / 100
    return sum + item.price * item.quantity - discount
  }, 0)
})

const taxAmount = computed(() => {
  return formData.value.items.reduce((sum, item) => {
    const discount = (item.price * (item.discountRate || 0)) / 100
    const taxableAmount = item.price * item.quantity - discount
    const taxRate = getTaxRate(item.taxationType)
    return sum + (taxableAmount * taxRate) / 100
  }, 0)
})

const totalAmount = computed(() => {
  return subtotal.value + taxAmount.value
})

function getTaxRate(taxType) {
  const rates = { A: 0, B: 18, C: 0, D: 0 }
  return rates[taxType] || 0
}

function addItem() {
  formData.value.items.push({
    code: '',
    classificationCode: '',
    name: '',
    quantity: 1,
    price: 0,
    discountRate: 0,
    taxationType: 'B',
    barcode: '',
    expirationDate: '',
  })
}

function removeItem(index) {
  formData.value.items.splice(index, 1)
}

function onReceiptTypeChange() {
  if (formData.value.receiptType === 'R') {
    // For refunds, ask for original invoice number
    formData.value.refundReasonCode = ''
  }
}

async function handleSubmit() {
  try {
    errorMessage.value = ''

    if (!formData.value.customerName) {
      errorMessage.value = 'Customer name is required'
      return
    }

    if (formData.value.items.length === 0) {
      errorMessage.value = 'At least one item is required'
      return
    }

    // Validate items
    for (const item of formData.value.items) {
      if (!item.classificationCode || !item.name || item.quantity <= 0 || item.price < 0) {
        errorMessage.value = 'All items must have valid classification code, name, quantity, and price'
        return
      }
    }

    isSubmitting.value = true

    const response = await receiptApi.createReceipt({
      customerName: formData.value.customerName,
      customerTin: formData.value.customerTin || undefined,
      customerMobileNo: formData.value.customerMobileNo || undefined,
      paymentMethod: formData.value.paymentMethod,
      receiptType: formData.value.receiptType,
      refundReasonCode: formData.value.refundReasonCode || undefined,
      remarks: formData.value.remarks || undefined,
      tradeName: formData.value.tradeName || undefined,
      address: formData.value.address || undefined,
      items: formData.value.items,
    })

    if (response.success) {
      toast.add({
        severity: 'success',
        summary: 'Receipt Created',
        detail: `Receipt #${response.data.receiptNo} created successfully`,
        life: 3000,
      })

      // Sync stock if it's a sale or refund
      if (formData.value.receiptType === 'S' || formData.value.receiptType === 'R') {
        await syncStock()
      }

      // Navigate to receipt details after a short delay
      setTimeout(() => {
        router.push('/receipts')
      }, 1500)
    }
  } catch (error) {
    errorMessage.value = error.response?.data?.message || error.message || 'Failed to create receipt'
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: errorMessage.value,
      life: 5000,
    })
  } finally {
    isSubmitting.value = false
  }
}

async function syncStock() {
  try {
    for (const item of formData.value.items) {
      const action = formData.value.receiptType === 'R' ? 'IN' : 'OUT'
      await stockApi.updateStock({
        itemCode: item.code || item.name,
        itemName: item.name,
        quantity: item.quantity,
        price: item.price,
        classificationCode: item.classificationCode,
        action,
      })
    }
  } catch (error) {
    console.warn('Stock sync warning:', error.message)
    // Don't fail receipt creation if stock sync fails
  }
}

function resetForm() {
  formData.value = {
    customerName: '',
    customerTin: '',
    customerMobileNo: '',
    paymentMethod: '01',
    receiptType: 'S',
    refundReasonCode: '',
    remarks: '',
    tradeName: '',
    address: '',
    items: [],
  }
  errorMessage.value = ''
}
</script>

<style scoped>
.create-receipt {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.page-header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.page-header h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
}

.page-description {
  margin: 0;
  color: var(--text-color-secondary);
}

.receipt-form-container {
  flex: 1;
}

.receipt-card {
  border-radius: 12px;
  overflow: hidden;
}

.receipt-card :deep(.p-card-header) {
  padding: 1.5rem;
  background-color: var(--primary-color);
  color: white;
}

.card-title {
  font-weight: 600;
  font-size: 1.125rem;
}

form {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--surface-border);
  border-radius: 6px;
  font-family: inherit;
  font-size: 0.875rem;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  background-color: var(--surface-50);
  border-radius: 8px;
}

.form-section h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.items-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.items-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.empty-state {
  text-align: center;
  padding: 3rem 2rem;
  color: var(--text-color-secondary);
}

.empty-state i {
  font-size: 2rem;
  display: block;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.item-row {
  padding: 1.5rem;
  background-color: white;
  border: 1px solid var(--surface-border);
  border-radius: 8px;
  display: flex;
  gap: 1rem;
}

.item-controls {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.item-fields {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.summary-card {
  border-radius: 12px;
  overflow: hidden;
  background-color: var(--primary-50);
}

.summary-card :deep(.p-card-header) {
  padding: 1.5rem;
  background-color: var(--primary-color);
  color: white;
}

.summary-header {
  font-weight: 600;
  font-size: 1rem;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  padding: 1.5rem;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: white;
  border-radius: 8px;
}

.summary-item.highlight {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-700) 100%);
  color: white;
  font-weight: 600;
}

.summary-item .label {
  color: var(--text-color-secondary);
  font-size: 0.875rem;
}

.summary-item .value {
  font-weight: 600;
  font-size: 1.125rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid var(--surface-border);
}

@media (max-width: 768px) {
  form {
    padding: 1rem;
  }

  .item-fields {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }
}
</style>
