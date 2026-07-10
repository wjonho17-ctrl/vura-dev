<script setup lang="ts">
import { useForm } from '@inertiajs/vue3'
import { useFileDialog } from '@vueuse/core'
import { useToast } from 'primevue'
import readXlsxFile, { Schema } from 'read-excel-file'
import { useTemplateRef } from 'vue'
import tuyau from '~/app/tuyau'
import { getAllCountries, getProductClassifications } from '~/helpers'
import { showToastError, showToastSuccess } from '~/helpers/toast_helper'

const emit = defineEmits(['onSaveManyStock'])

const isVisible = defineModel<boolean>({ required: false, default: false })

const TOAST_GROUP = 'excel-table-error'

//#region variables
const excelEditorSchema: Schema = {
  brandName: {
    column: 'BRAND NAME',
    type: String,
    required: true,
  },

  composition: {
    column: 'COMPOSITION',
    type: String,
  },

  classification: {
    column: 'CLASSIFICATION',
    type: String,
    required: true,
    oneOf: getProductClassifications().map(c => c.value),
  },

  strenght: {
    column: 'STRENGHT',
    type: String,
  },

  dosageForm: {
    column: 'DOSAGE FORM',
    type: String,
  },

  fdaRegNo: {
    column: 'REG NO',
    type: String,
  },

  fdaManufacturer: {
    column: 'Manufacturer',
    type: String,
  },

  fdaCountry: {
    column: 'Country',
    type: String,
    oneOf: getAllCountries(),
  },

  fdaPack: {
    column: 'PACK',
    type: String,
  },

  fdaLtr: {
    column: 'LTR',
    type: String,
  },

  fdaRegDate: {
    column: 'REG DATE',
    type: Date,
  },

  fdaExpiry: {
    column: 'EXPIRY',
    type: Date,
  },

  insuranceCode: {
    column: 'INSURANCE CODE',
    type: String,
  },

  instructions: {
    column: 'INSTRUCTIONS',
    type: String,
  },

  insurancePrice: {
    column: 'INSURANCE PRICE',
    type: Number,
  },

  ebmClassification: {
    column: 'EBM CLASSIFICATION CODE',
    type: String,
  },
};
//#endregion

//#region states

//#endregion
const excelEditor = useTemplateRef<any>('excel-editor')

//#region hooks
const toast = useToast()

const productImportForm = useForm({
  products: [{}] as any[],
})

const { open, reset, onChange } = useFileDialog({
  accept:
    'application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // Set to accept only image files
})

//#endregion

//#region methods
onChange((files) => {
  if (files) importAsExcel(files[0])
})

function handleUploadExcel() {
  productImportForm.post(tuyau.$route('dashboard.products.create.many').path, {
    preserveState: true,
    onSuccess(page) {
      console.log(page)
      showToastSuccess({ toast, detail: `${productImportForm.products.length} products imported`, group: TOAST_GROUP })
      productImportForm.resetAndClearErrors()
      emit('onSaveManyStock')
      isVisible.value = false
    },
    onError(errors) {
      console.error(errors)
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
  try {
    const { rows, errors } = await readXlsxFile(file, { schema: excelEditorSchema })

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

    productImportForm.products = productsFormated


  } catch (error: any) {
    console.error(error)
    reset()

    showToastError({ toast, detail: error?.msg || 'format not supported! please use valid excel format.', group: TOAST_GROUP })
  }
}

function handleImportEXcel() {
  open({ reset: true })
}

//#endregion
</script>
<template>
  <Toast position="top-center" :group="TOAST_GROUP"></Toast>
  <!-- excel sheet -->
  <Drawer v-model:visible="isVisible" header="Medicine Importation" position="full"
    :showCloseIcon="!productImportForm.processing">
    <div class="card flex flex-wrap gap-4 items-center justify-between pb-4">
      <div class="space-x-6">
        <Button type="button" label="Import" outlined @click="handleImportEXcel" severity="contrast"
          :disabled="productImportForm.processing"></Button>
        <Button type="button" label="Delete All" outlined @click="productImportForm.products = [{}]" severity="danger"
          :disabled="productImportForm.processing"></Button>
        <Button type="button" label="Delete" outlined @click="excelEditor.deleteSelectedRecords()" severity="danger"
          :disabled="productImportForm.processing"></Button>
      </div>
      <Button :disabled="productImportForm.products.length <= 0 || productImportForm.processing"
        :loading="productImportForm.processing" @click="handleUploadExcel" label="Upload"></Button>
    </div>

    <div class="w-full">
   
    </div>
  </Drawer>
  <!-- end -->
  
  <Button label="Import" icon="pi pi-upload" severity="secondary" @click="isVisible = true"></Button>
</template>
