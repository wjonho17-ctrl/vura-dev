<script setup lang="ts">
import { InsuranceProductSyncResponse } from '#types/api/medbook/insurance_products_type'
import { useForm } from '@inertiajs/vue3'
import { useFileDialog } from '@vueuse/core'
import { useToast } from 'primevue'
import readXlsxFile, { Schema } from 'read-excel-file'
import { computed, ref } from 'vue'
import tuyau from '~/app/tuyau'
import { showToastError, showToastInfo, showToastSuccess } from '~/helpers/toast_helper'

const emit = defineEmits(['saved'])

const isVisible = defineModel<boolean>({ required: false, default: false })

const isProductImporting = ref(false)

const TOAST_GROUP = 'excel-table-error'

//#region variables
const excelEditorSchema: Schema = {
  drugCode: {
    column: 'DRUG CODE',
    type: String,
    required: true,
  },

  genericDescription: {
    column: 'GENERIC DESCRIPTION',
    type: String,
    required: true,
  },

  designation: {
    column: 'DESIGNATION',
    type: String,
    required: true,
  },

  instructions: {
    column: 'INSTRUCTIONS',
    type: String,
  },

  sellingUnit: {
    column: 'SELLING UNIT',
    type: String,
    required: true
  },

  price: {
    column: 'PRICE',
    type: Number,
  }
}
//#endregion

//#region states

//#region hooks
const toast = useToast()

const productImportForm = useForm({
  products: [] as any[],
  isSynced: false
})

const { open, reset, onChange } = useFileDialog({
  accept:
    'application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // Set to accept only image files
})

const canUpload = computed(() => (productImportForm.isSynced) && productImportForm.products.every(p => p.reviewed))
const totalRemaingProducts = computed(() => productImportForm.products.filter(p => !p.reviewed).length)

//#endregion

//#region methods
onChange((files) => {
  if (files) {
    importAsExcel(files[0]).then(() => {
      isVisible.value = true
      handleSync()
    })
  }
})

function handleUploadExcel() {
  productImportForm.post(tuyau.$route('dashboard.insurance.products.store').path, {
    preserveState: true,
    onSuccess(page) {
      console.log(page)
      showToastSuccess({ toast, detail: `${productImportForm.products.length} products imported`, group: TOAST_GROUP })
      productImportForm.resetAndClearErrors()
      emit('saved')
      isVisible.value = false
      handleHide()
    },
    onError(errors) {

      if (Array.isArray(errors?.error) && errors?.error[0]?.message) {
        const message = errors.error[0].message
        const rule = errors.error[0].rule
        const fields = errors.error[0].field.split('.')
        let errorMessage = `row ${+fields[1] + 1} ${rule} ${fields[2]}`

        showToastError({ toast, detail: `${message}\n${errorMessage}`, group: TOAST_GROUP })
        return
      }

      showToastError({ toast, detail: 'Cannot save many products. please contact support!', group: TOAST_GROUP })
    },
    onFinish() {
      reset()
    },
  })
}

async function importAsExcel(file: any) {
  isProductImporting.value = true

  try {
    const { schema, sheet } = { schema: excelEditorSchema, sheet: 1 }

    if (!schema && !sheet) {
      showToastError({ toast, detail: 'Select right action to import insurance products!' })
      return
    }

    const { rows, errors } = await readXlsxFile(file, { schema, sheet, trim: true })

    if (errors && errors.length > 0) {

      showToastError({ toast, detail: `[${errors[0].row}]: " ${errors[0].column}"  ${errors[0].error}`, group: TOAST_GROUP })
      return
    }

    if (rows.length <= 0) {
      throw { msg: 'No valid header found' }
    }

    const headers = Object.keys(rows[0])

    const productsFormated = rows.map(data => {
      const obj: Record<string, any> = {}
      for (const header of headers) {

        obj[header] = data[header]
      }

      return obj
    })

    productImportForm.products = productsFormated.map((p: any) => ({ ...p, reviewed: false, suggestions: [], productId: null })) as any

  } catch (error: any) {
    console.error(error)
    reset()

    showToastError({ toast, detail: error?.msg || 'format not supported! please use valid excel format.', group: TOAST_GROUP })
  }

  isProductImporting.value = false
}

function handleImportExcel() {
  open({ reset: true })
}

function handleHide() {
  productImportForm.products = []
  productImportForm.isSynced = false
}


async function handleSync() {
  productImportForm.processing = true

  try {
    const products = productImportForm.products

    console.log('PP', products)
    const data = await tuyau.dashboard.insurance.products.sync.$post({ products }).unwrap() as any

    productImportForm.products = data.products


    productImportForm.isSynced = true
    showToastInfo({ toast, detail: 'Products synced. please review result!', group: TOAST_GROUP })
  } catch (error: any) {
    console.error(error)
    productImportForm.isSynced = false
    showToastError({ toast, detail: error?.value?.error || 'Cannot sync products', group: TOAST_GROUP })
  } finally {
    productImportForm.processing = false
  }

}

const rowClass = (data: InsuranceProductSyncResponse) => {
  return [{ 'bg-yellow-400/40!': !data.reviewed }];
}

//#endregion
</script>
<template>
  <Toast position="top-center" :group="TOAST_GROUP"></Toast>
  <!-- excel sheet -->
  <Drawer @hide="handleHide" v-model:visible="isVisible" header="Medicine Importation" position="full"
    :showCloseIcon="!productImportForm.processing || isProductImporting">
    <div class="card flex flex-wrap gap-4 items-center justify-end pb-4">
      <Button :disabled="productImportForm.products.length <= 0 || productImportForm.processing || isProductImporting"
        :loading="productImportForm.processing" @click="handleUploadExcel()" label="Upload"></Button>
    </div>

    <DataTable :value="productImportForm.products" :rowClass>
      <template #header>
        <Message v-if="productImportForm.isSynced && canUpload" severity="success">You can upload products now!
        </Message>
        <Message v-else-if="productImportForm.isSynced" severity="warn">{{ totalRemaingProducts }}
          Product{{ totalRemaingProducts > 1 ? 's' : '' }} are not reviewed</Message>
      </template>

      <Column header="Drug Code" field="drugCode"></Column>
      <Column header="Designation" field="designation"></Column>
      <Column header="System Product" v-if="productImportForm.isSynced">
        <template #body="{ data }">
          <Select v-if="productImportForm.isSynced" v-model="data.productId" @value-change="data.reviewed = true"
            option-label="name" option-value="productId" :options="data.suggestions"></Select>
          <Message v-else severity="warn" size="small">Please sync first</Message>
        </template>
      </Column>
      <Column header="Generic Description" field="genericDescription"></Column>
      <Column header="Instructions" field="instructions"></Column>
      <Column header="Selling Unit" field="sellingUnit"></Column>
      <Column header="Price" field="price"></Column>
      <!--     
        "drugCode": "A01AA01001",
        "composition": "Sodium Fluoride",
        "designation": "ELMEX SENSITIVE TUBE 50ml 2 AT 6YRS",
        "instructions": "DT",
        "sellingUnit": "TUBE",
        "price": 9345,
        "productId": null,
        "suggestions": []
    -->

    </DataTable>
  </Drawer>

  <Button label="Import" icon="pi pi-upload" severity="secondary" @click="handleImportExcel"></Button>

</template>
