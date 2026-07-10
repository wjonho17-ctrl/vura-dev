<script setup lang="ts">
import { InsuranceResponse } from '#types/api/medbook/insurance_type';
import { useForm } from '@inertiajs/vue3';
import debounce from 'lodash.debounce';
import { useDialog } from 'primevue';
import { defineAsyncComponent, ref } from 'vue';
import tuyau from '~/app/tuyau';
import Pagination from '~/components/pagination.vue';
import ProductImport from '~/components/partials/dashboard/product/ProductImport.vue';
import { getProductClassificationFromValue, getProductClassifications, isInsuranceProductAsSamePrice } from '~/helpers';

defineProps<{
    products: { meta: any, data: any[] },
    insurances: InsuranceResponse[]
}>()

const dialog = useDialog();

const ImageListDialog = defineAsyncComponent(() => import('~/components/ImageListDialog.vue'))

const classifications = getProductClassifications()

const filterForm = useForm({
    brandName: '',
    composition: ''
})

const showImages = (urls: string[]) => {
    console.log(urls)
    dialog.open(ImageListDialog, {
        props: {
            header: 'Product Images',
            modal: true,
            dismissableMask: true,
            style: 'max-width: 80%'
        },
        data: {
            urls
        }
    });
}

const handleFilter = debounce(() => {
    filterForm.get('', {
        preserveState: true,
        replace: true
    });
}, 400)

</script>

<template>
    <Toast></Toast>
    <DynamicDialog></DynamicDialog>

    <div>
        <div class="card">
            <Toolbar class="mb-6">
                <template #start>
                    <Link class="mr-3!" :href="tuyau.$route('dashboard.products.new').path">
                    <Button label="New" icon="pi pi-plus" severity="secondary"></Button>
                    </Link>
                    <!-- product import -->
                    <ProductImport></ProductImport>
                </template>

                <template #end>
                    <!-- <Button label="Export" icon="pi pi-upload" severity="secondary" @click="exportCSV($event)" /> -->
                </template>
            </Toolbar>

            <DataTable ref="dt" filter-display="row" :value="products.data" dataKey="id" :paginator="true"
                :rows="products.meta?.perPage">
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <h4 class="m-0">Manage Products</h4>
                        <div class="flex gap-4 items-center">
                            <!-- <Select @valueChange="handleSearch" optionLabel="label" v-model="filterForm.roleId"
                                optionValue="value"
                                :options="[{ label: 'ALL', value: -1 }, ...CLIENT_ROLES_OPTIONS]"></Select>
                            <IconField>
                                <InputIcon>
                                    <i class="pi pi-search" />
                                </InputIcon>
                                <InputText :maxlength="100" @input="handleSearch" v-model="filterForm.searchQuery"
                                    placeholder="Search..." />
                            </IconField> -->
                        </div>
                    </div>
                </template>

                <Column header="Images" class="w-16!">
                    <template #body="{ data }">
                        <div class="flex justify-center items-center">
                            <template v-if="data.images && data.images.length >= 1">
                                <div class="relative group">
                                    <Button class="absolute hidden inset-0 group-hover:block" unstyled
                                        @click="showImages(data.images.map((d: any) => d.url))" severity="contrast"
                                        icon="pi pi-eye"></Button>
                                    <Image :src="data.images[0].url"
                                        class="*:rounded-full! *:object-cover! *:w-16! *:h-16!" alt="Image" />
                                </div>
                            </template>
                            <svg v-else class="w-16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="11" fill="#F1F5F9" />

                                <rect x="10" y="8" width="8" height="10" rx="1.5" fill="#94A3B8" />
                                <circle cx="12.5" cy="10.5" r="1" fill="#E2E8F0" />
                                <circle cx="15.5" cy="10.5" r="1" fill="#E2E8F0" />
                                <circle cx="12.5" cy="13" r="1" fill="#E2E8F0" />
                                <circle cx="15.5" cy="13" r="1" fill="#E2E8F0" />
                                <circle cx="12.5" cy="15.5" r="1" fill="#E2E8F0" />
                                <circle cx="15.5" cy="15.5" r="1" fill="#E2E8F0" />

                                <path d="M7 5H11V6H7V5Z" fill="#CBD5E1" />
                                <rect x="6.5" y="3.5" width="5" height="1.5" rx="0.5" fill="#64748B" />

                                <path
                                    d="M6 6C6 5.44772 6.44772 5 7 5H11C11.5523 5 12 5.44772 12 6V17C12 18.1046 11.1046 19 10 19H8C6.89543 19 6 18.1046 6 17V6Z"
                                    fill="#F97316" />

                                <rect x="6" y="8" width="6" height="7" fill="white" fill-opacity="0.9" />

                                <rect x="8.5" y="10" width="1" height="3" fill="#22C55E" />
                                <rect x="7.5" y="11" width="3" height="1" fill="#22C55E" />
                            </svg>
                        </div>
                    </template>
                </Column>

                <Column header="Brand Name" field="brandName">
                    <template #filter>
                        <InputText type="search" :loading="filterForm.processing" :readonly="filterForm.processing"
                            v-model="filterForm.brandName" @input="handleFilter" placeholder="Search by Brand Name"
                            class="p-inputtext-sm w-full" />
                    </template>
                    <template #body="{ data }">
                        <div class="flex flex-col">
                            <span>{{ data.brandName }}</span>
                            <span class="text-sm">{{ data.insuranceInfo?.data?.designation }}</span>
                        </div>
                    </template>
                </Column>

                <Column header="Composition" field="composition">
                    <template #filter>
                        <InputText type="search" :loading="filterForm.processing" :readonly="filterForm.processing"
                            v-model="filterForm.composition" @input="handleFilter" placeholder="Search by Brand Name"
                            class="p-inputtext-sm w-full" />
                    </template>

                    <template #body="{ data }">
                        <div class="grid grid-rows-2">
                            <span>{{ data.composition }}</span>
                            <span class="text-sm order-2">{{ data.insuranceInfo?.data?.genericDescription }}</span>
                        </div>
                    </template>
                </Column>

                <Column header="Insurance">
                    <template #body="{ data }">
                        <template v-if="data.insurances && data.insurances?.length > 1">
                            <span class="flex justify-center" v-if="isInsuranceProductAsSamePrice(data.insurances)">RWF {{ data.insurances[0].price }}</span>
                            <div class="w-full flex items-center justify-center">
                                <Chip class="mx-1!" v-for="insurance in data.insurances.slice(0, 2)">
                                    <div class="flex flex-col items-center">
                                        <span class="text-xs"> {{insurances.find(i => i.type ==
                                            insurance.type)?.name}}</span>
                                        <small v-if="!isInsuranceProductAsSamePrice(data.insurances)" class="text-xs">{{
                                            insurance.price }}</small>
                                    </div>

                                </Chip>
                                <Chip v-if="data.insurances.length > 2" class="text-xs!">
                                    +{{ Math.max(0, data.insurances.length - 2) }}
                                </Chip>
                            </div>
                        </template>
                        <span v-else="productInsurances.length <= 0">N/A</span>
                    </template>
                </Column>

                <Column header="Infos">
                    <template #body="{ data }">
                        <span>{{ data.strength }}</span>
                        <span>{{ data.dosageForm }}</span>
                    </template>
                </Column>

                <Column header="Classification">
                    <template #body="{ data }">
                        {{ getProductClassificationFromValue(classifications, data.classification) }}
                    </template>
                </Column>

                <Column>
                    <template #body="{ data }">
                        <Link :href="tuyau.$url('dashboard.products.edit', { params: { id: data.id } })">
                        <Button icon="pi pi-pencil" rounded outlined severity="info"></Button>
                        </Link>
                    </template>
                </Column>

                <template #paginatorcontainer>
                    <Pagination :meta="products.meta"></Pagination>
                </template>

            </DataTable>
        </div>
    </div>
</template>