<script setup lang="ts">
import type Product from '#models/product';
import type { InsuranceResponse } from '#types/api/medbook/insurance_type';
import type { InsuranceType } from '#types/insurance_type';
import { router, useForm } from '@inertiajs/vue3';
import { useToast } from 'primevue';
import { onMounted, ref } from 'vue';
import tuyau from '~/app/tuyau';
import ImagesUploader from '~/components/ImagesUploader.vue';
import InputErrorMessage from '~/components/InputErrorMessage.vue';
import PorductInsuranceList from '~/components/partials/dashboard/product/PorductInsuranceList.vue';
import { useAsyncBarcodeReader } from '~/composables/barcode';
import { getAllCountries, getProductClassifications } from '~/helpers';
import { showToastError, showToastSuccess } from '~/helpers/toast_helper';

const props = defineProps<{
    productToEdit?: Product
    insurances: InsuranceResponse[]
}>()

const createProductForm = useForm({
    productId: props.productToEdit?.id || undefined,
    imagesToRemove: [] as string[],
    images: [] as File[],
    barcode: props.productToEdit?.barcode || '',
    brandName: props.productToEdit?.brandName || '',
    classification: props.productToEdit?.classification || '',
    composition: props.productToEdit?.composition || '',
    strength: props.productToEdit?.strength || '',
    dosageForm: props.productToEdit?.dosageForm || '',
    fdaRegNo: props.productToEdit?.fdaRegNo || '',
    fdaPack: props.productToEdit?.fdaPack || '',
    fdaShelfLife: props.productToEdit?.fdaShelfLife || '',
    fdaManufacturer: props.productToEdit?.fdaManufacturer || '',
    fdaCountry: props.productToEdit?.fdaCountry || '',
    fdaMah: props.productToEdit?.fdaMah || '',
    fdaLtr: props.productToEdit?.fdaLtr || '',
    insuranceDrugCode: props.productToEdit?.insuranceDrugCode || '',
    fdaRegDate: props.productToEdit?.fdaRegDate ? new Date(props.productToEdit.fdaRegDate.toString()) : undefined,
    fdaExpiry: props.productToEdit?.fdaExpiry ? new Date(props.productToEdit.fdaExpiry.toString()) : undefined,
    insuranceInfo: props.productToEdit?.insuranceInfo?.data || {
        designation: '',
        genericDescription: '',
        instructions: '',
        sellingUnit: '',
    },
    insurances: (props.productToEdit?.insurances?.map(i => ({ type: i.type, price: i.price })) || []) as { type: InsuranceType, price: number }[],
    ebmClassification: props.productToEdit?.ebmClassification || '',
})

const isFdaInfoFormVisible = ref(!!props.productToEdit)
const isInsuranceInfoFormVisible = ref(!!props.productToEdit)
const isEbmInfoFormVisible = ref(!!props.productToEdit)

const toast = useToast()

const countries = getAllCountries()

const classifications = getProductClassifications()

const { generator } = useAsyncBarcodeReader()

onMounted(async () => {
    for await (const input of generator) {
        if (input.source == 'barcode') {
            createProductForm.barcode = input.value
        }
    }
})

function handleFormSubmit() {
    const url = props.productToEdit
        ? tuyau.$route('dashboard.products.update').path
        : tuyau.$route('dashboard.products.create').path

    createProductForm.post(url, {
        onSuccess() {
            createProductForm.resetAndClearErrors()
            showToastSuccess({ toast, detail: props.productToEdit ? 'product updated successfully!' : 'product added successfully!' })
            if (props.productToEdit) router.get('')
        },
        onError(error) {
            console.error(error)
            showToastError({ toast, detail: error?.message || 'Cannot not add product' })
        }
    })
}

function handleImageToRemove(name: string) {
    createProductForm.imagesToRemove.push(name)
}

</script>

<template>
    <Toast></Toast>
    <h2>{{ productToEdit ? 'Edit' : 'New' }} Product</h2>
    <div class="lg:flex w-full gap-10">
        <div class="space-y-4! w-full">
            <h3 class="flex gap-2 items-center">General Infos</h3>
            <div class="flex flex-col gap-2 w-full">
                <label for="">Barcode (optional)</label>
                <InputText fluid v-model="createProductForm.barcode" placeholder="Enter brand name"></InputText>
                <InputErrorMessage :error="createProductForm.errors.barcode"></InputErrorMessage>
            </div>
            <div class="flex flex-col gap-2 w-full">
                <label for="">Brand Name</label>
                <InputText fluid v-model="createProductForm.brandName" placeholder="Enter brand name"></InputText>
                <InputErrorMessage :error="createProductForm.errors.brandName"></InputErrorMessage>
            </div>
            <div class="flex flex-col gap-2">
                <label for="">Composition</label>
                <InputText v-model="createProductForm.composition" placeholder="Enter composition"></InputText>
                <InputErrorMessage :error="createProductForm.errors.composition"></InputErrorMessage>
            </div>
            <div class="flex flex-col gap-2">
                <label for="">Classification</label>
                <Select v-model="createProductForm.classification" placeholder="select classification"
                    :options="classifications" option-label="label" option-value="value"></Select>
                <InputErrorMessage :error="createProductForm.errors.classification"></InputErrorMessage>
            </div>
            <div class="flex gap-4">
                <div class="flex flex-col gap-2">
                    <label for="">Strength</label>
                    <InputText v-model="createProductForm.strength" placeholder="Enter strength"></InputText>
                    <InputErrorMessage :error="createProductForm.errors.strength"></InputErrorMessage>
                </div>
                <div class="flex flex-col gap-2">
                    <label for="">Dodage Form</label>
                    <InputText v-model="createProductForm.dosageForm" placeholder="Enter dosage form"></InputText>
                    <InputErrorMessage :error="createProductForm.errors.dosageForm"></InputErrorMessage>
                </div>
            </div>

            <div>
                <ImagesUploader label="Images (optionals)" @image-removed="handleImageToRemove" :max-image="4"
                    v-model="createProductForm.images"
                    :old-images="productToEdit?.images ? (productToEdit.images.map(image => ({ name: image.name, url: image.url })).filter(image => image.url !== undefined) as any[]) : []">
                </ImagesUploader>
                <InputErrorMessage :error="createProductForm.errors.images"></InputErrorMessage>
            </div>
        </div>

        <div class="space-y-4! w-full">
            <h3 class="flex gap-2 items-center">
                <span>Fda Infos</span>
                <ToggleSwitch v-model="isFdaInfoFormVisible"></ToggleSwitch>
            </h3>
            <template v-if="isFdaInfoFormVisible">
                <div class="flex flex-col gap-2 w-full">
                    <label for="">Reg N<sup>o</sup></label>
                    <InputText fluid v-model="createProductForm.fdaRegNo" placeholder="Enter Reg No"></InputText>
                    <InputErrorMessage :error="createProductForm.errors.fdaRegNo"></InputErrorMessage>
                </div>
                <div class="flex flex-col gap-2">
                    <label for="">Manufacturer</label>
                    <InputText v-model="createProductForm.fdaManufacturer" placeholder="Enter manufacturer name">
                    </InputText>
                    <InputErrorMessage :error="createProductForm.errors.fdaManufacturer"></InputErrorMessage>
                </div>
                <div class="flex flex-col gap-2">
                    <label for="">Country</label>
                    <Select filter v-model="createProductForm.fdaCountry" placeholder="Select country"
                        :options="countries"></Select>
                    <InputErrorMessage :error="createProductForm.errors.fdaCountry"></InputErrorMessage>
                </div>
                <div class="flex gap-4">
                    <div class="flex flex-col gap-2">
                        <label for="">Pack</label>
                        <InputText v-model="createProductForm.fdaPack" placeholder="Enter Pack"></InputText>
                        <InputErrorMessage :error="createProductForm.errors.fdaPack"></InputErrorMessage>
                    </div>
                    <div class="flex flex-col gap-2">
                        <label for="">Shelf Life</label>
                        <InputText v-model="createProductForm.fdaShelfLife" placeholder="Enter shelf life"></InputText>
                        <InputErrorMessage :error="createProductForm.errors.fdaShelfLife"></InputErrorMessage>
                    </div>
                </div>

                <div class="flex gap-4">
                    <div class="flex flex-col gap-2">
                        <label for="">MAH</label>
                        <InputText v-model="createProductForm.fdaMah" placeholder="Enter MAH"></InputText>
                        <InputErrorMessage :error="createProductForm.errors.fdaMah"></InputErrorMessage>
                    </div>
                    <div class="flex flex-col gap-2">
                        <label for="">LTR</label>
                        <InputText :disabled="!!productToEdit && !!productToEdit.pharmacyId"
                            v-model="createProductForm.fdaLtr" placeholder="Enter LTR"></InputText>
                        <InputErrorMessage :error="createProductForm.errors.fdaLtr"></InputErrorMessage>
                    </div>
                </div>

                <div class="flex gap-4">
                    <div class="flex flex-col gap-2">
                        <label for="">Reg. Date</label>
                        <DatePicker v-model="createProductForm.fdaRegDate" placeholder="Registration date"></DatePicker>
                        <InputErrorMessage :error="createProductForm.errors.fdaRegDate"></InputErrorMessage>
                    </div>
                    <div class="flex flex-col gap-2">
                        <label for="">Expiry</label>
                        <DatePicker v-model="createProductForm.fdaExpiry" placeholder="Expiry"></DatePicker>
                        <InputErrorMessage :error="createProductForm.errors.fdaExpiry"></InputErrorMessage>
                    </div>
                </div>
            </template>
        </div>
        <div class="space-y-4! w-full">
            <h3 class="flex gap-2 items-center">
                <span>Insurance Infos</span>
                <ToggleSwitch v-model="isInsuranceInfoFormVisible"></ToggleSwitch>
            </h3>
            <template v-if="isInsuranceInfoFormVisible">
                <div class="flex flex-col gap-2 w-full">
                    <label for="">Drug Code</label>
                    <InputText
                        @input="createProductForm.insuranceDrugCode = createProductForm.insuranceDrugCode.toUpperCase()"
                        fluid v-model="createProductForm.insuranceDrugCode" placeholder="Enter code">
                    </InputText>
                    <InputErrorMessage :error="createProductForm.errors['insuranceDrugCode']"></InputErrorMessage>
                </div>
                <div class="flex flex-col gap-2 w-full">
                    <label for="">Designation</label>
                    <InputText fluid v-model="createProductForm.insuranceInfo.designation"
                        placeholder="Enter designation">
                    </InputText>
                    <InputErrorMessage :error="createProductForm.errors['insuranceInfo.designation']">
                    </InputErrorMessage>
                </div>
                <div class="flex flex-col gap-2 w-full">
                    <label for="">Generic Description</label>
                    <InputText fluid v-model="createProductForm.insuranceInfo.genericDescription"
                        placeholder="Enter generic description"></InputText>
                    <InputErrorMessage :error="createProductForm.errors['insuranceInfo.genericDescription']">
                    </InputErrorMessage>
                </div>
                <div class="flex gap-4">
                    <div class="flex flex-col gap-2 w-full">
                        <label for="">Instructions</label>
                        <InputText fluid v-model="createProductForm.insuranceInfo.instructions"
                            placeholder="Enter instructions"></InputText>
                        <InputErrorMessage :error="createProductForm.errors['insuranceInfo.instructions']">
                        </InputErrorMessage>
                    </div>
                    <div class="flex flex-col gap-2 w-full">
                        <label for="">Selling Unit</label>
                        <InputText fluid v-model="createProductForm.insuranceInfo.sellingUnit"
                            placeholder="Enter selling unit">
                        </InputText>
                        <InputErrorMessage :error="createProductForm.errors['insuranceInfo.sellingUnit']">
                        </InputErrorMessage>
                    </div>
                </div>
                <div class="flex flex-col gap-2 w-full">
                    <label for="">Insurance List</label>
                    <PorductInsuranceList :insuranceDrugCode="createProductForm.insuranceDrugCode"
                        :product-insurance-info="createProductForm.insuranceInfo" v-model="createProductForm.insurances"
                        :insurances></PorductInsuranceList>
                </div>
            </template>
            <!-- ebm -->
            <h4 class="flex gap-2 items-center">
                <span>EBM Infos</span>
                <ToggleSwitch v-model="isEbmInfoFormVisible"></ToggleSwitch>
            </h4>
            <template v-if="isEbmInfoFormVisible">
                <div class="flex flex-col gap-2">
                    <label for="">Classification code</label>
                    <InputText v-model="createProductForm.ebmClassification" placeholder="Enter classification code">
                    </InputText>
                    <InputErrorMessage :error="createProductForm.errors.ebmClassification"></InputErrorMessage>
                </div>
            </template>
        </div>
    </div>
    <div class="w-full flex justify-end py-4!">
        <Button :disabled="createProductForm.processing" :loading="createProductForm.processing"
            :label="productToEdit ? 'Update' : 'Save'" icon="pi pi-check" @click="handleFormSubmit"
            form="new-client"></Button>
    </div>

</template>
