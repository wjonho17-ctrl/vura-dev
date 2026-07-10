<script setup lang="ts">
import type { InsuranceResponse } from '#types/api/medbook/insurance_type';
import { InsuranceProductInfo, InsuranceType } from '#types/insurance_type';
import { FilterMatchMode } from '@primevue/core/api';
import { computed, onMounted, ref } from 'vue';

const props = defineProps<{
    insurances: InsuranceResponse[]
    insuranceDrugCode: string
    productInsuranceInfo: InsuranceProductInfo
}>()

const productInsurances = defineModel<{ type: InsuranceType, price: number }[]>({ required: true })
const isVisible = ref(false)
const selectedProducts = ref<InsuranceResponse[]>([])
const filters = ref({
    name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
})
const insurancePriceForAll = ref(0)
const insurancePrices = ref<{ type: InsuranceType, price: number }[]>([])

const isInsuranceHasSamePrices = computed(() => {
    const insuranceSelectedTypes = selectedProducts.value.map(pI => pI.type)
    const insuranceSelectedPrices = insurancePrices.value.filter(({ type }) => insuranceSelectedTypes.includes(type))
    return insuranceSelectedPrices.every(({ price }) => price === insuranceSelectedPrices[0].price)
})

function handleShow() {
    const selectedTypes = productInsurances.value.map(pI => +pI.type)
    selectedProducts.value = props.insurances.filter(i => selectedTypes.includes(i.type))

    const proicesToInclude = props.insurances.map(({ type }) => ({ type, price: 0 })).filter(insurance => !productInsurances.value.map(pI => pI.type).includes(insurance.type))
    insurancePrices.value = productInsurances.value.concat(proicesToInclude)
}

function handleUpdate() {
    productInsurances.value = selectedProducts.value.map(({ type }) => ({ type, price: insurancePrices.value.find(pI => pI.type == type)?.price || 0 }))
    isVisible.value = false
}

function handleUpdateAllPrice() {
    insurancePrices.value = insurancePrices.value.map(({ type }) => ({ type, price: insurancePriceForAll.value }))
}

function handleUpdatePrice(type: InsuranceType, price: number) {
    const insuranceToUpdate = selectedProducts.value.find(pI => pI.type == type)

    if (!insuranceToUpdate) return

    insurancePrices.value = insurancePrices.value.filter(v => v.type != type).concat([{ type, price }])
}

</script>
<template>
    <Drawer @show="handleShow" v-model:visible="isVisible" dataKey="type" header="Product Insurance List"
        position="right" class="w-full! md:w-1/2! xl:w-2/4!">
        <DataTable v-model:selection="selectedProducts" filter filter-display="row" v-model:filters="filters"
            :value="insurances">
            <template #header>
                <div class="grid grid-cols-4 items-start">
                    <p>Drug Code: {{ insuranceDrugCode }}</p>
                    <p class="max-w-52 text-ellipsis">Instructions: {{ productInsuranceInfo.instructions }}</p>
                    <p class="max-w-52 text-ellipsis">Selling Unit: {{ productInsuranceInfo.sellingUnit }}</p>
                    <p class="max-w-52 text-ellipsis col-span-2">Designation: {{ productInsuranceInfo.designation }}</p>
                    <p class="max-w-52 text-ellipsis col-span-2">Generic Description: {{
                        productInsuranceInfo.genericDescription }}</p>
                </div>
            </template>

            <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>

            <Column field="Logo">
                <template #body="{ data }">
                    <Avatar class="*:object-contain!" v-if="data.logoUrl" :image="data.logoUrl" shape="circle"
                        size="large"></Avatar>
                </template>
            </Column>
            <Column field="name" header="Name" :show-filter-menu="false">
                <template #body="{ data }">
                    <div class="flex flex-col">
                        <span>{{ data.name }}</span>
                        <small>{{ data.fullname }}</small>
                    </div>
                </template>
                <template #filter="{ filterModel, filterCallback }">
                    <InputText v-model="filterModel.value" type="text" @input="filterCallback()"
                        placeholder="Search by name" />
                </template>
            </Column>
            <Column header="Price" field="price" :show-filter-menu="false">
                <template #filter>
                    <InputGroup v-if="selectedProducts.length > 1">
                        <InputNumber v-model="insurancePriceForAll" mode="currency" currency="RWF" locale="en-US">
                        </InputNumber>
                        <Button label="Update" @click="handleUpdateAllPrice" icon="pi pi-dollar"></Button>
                    </InputGroup>
                </template>
                <template #body="{ data }">
                    <InputNumber v-if="selectedProducts.find(pI => pI.type == data.type)"
                        :default-value="insurancePrices.find(pI => pI.type == data.type)?.price || 0"
                        @update:model-value="handleUpdatePrice(data.type, $event)" mode="currency" currency="RWF"
                        locale="en-US">
                    </InputNumber>
                </template>
            </Column>
        </DataTable>

        <template #footer>
            <div class="flex justify-end gap-4">
                <Button severity="danger" @click="isVisible = false" label="cancel"></Button>
                <Button @click="handleUpdate" label="save"></Button>
            </div>
        </template>
    </Drawer>

    <Button @click="isVisible = true" outlined>
        <template #default>
            <span v-if="productInsurances.length <= 0">Not Selected</span>
            <span v-else-if="productInsurances.length == insurances.length">All Selected</span>
            <template v-else>
                <Chip class="text-xs!" v-for="insurance in productInsurances.slice(0, 3)">
                    {{insurances.find(i => i.type == insurance.type)?.name}}
                </Chip>
                <Chip v-if="productInsurances.length > 3" class="text-xs!"> +{{ Math.max(0, productInsurances.length -
                    3) }}</Chip>
            </template>
        </template>
    </Button>
</template>
