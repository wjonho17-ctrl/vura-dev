<script setup lang="ts">
import { MedbookOverviewStatsResponse } from '#types/api/medbook/stat_type';
import tuyau from '~/app/tuyau';

defineProps<{
    products: MedbookOverviewStatsResponse['products']['wholesaler']
    isFiltering?: boolean
    qs: any
    isWolesaler?: boolean
    title: string
}>()

defineEmits<{
    filter: [input: string]
}>()

const productName = defineModel<string | undefined>('productName', { required: true })

</script>
<template>
    <div class="card">
        <div class="flex items-center justify-between mb-6">
            <h4 class="m-0">{{ title }}</h4>
        </div>
        <DataTable :value="products" :loading="isFiltering">
            <template #header>
                <div class="flex gap-4 items-center">
                    <IconField>
                        <InputIcon>
                            <i class="pi pi-search"></i>
                        </InputIcon>
                        <InputText type="search" :loading="isFiltering" :readonly="isFiltering" v-model="productName"
                            @input="$emit('filter', '' + $event)" placeholder="Search product" />
                    </IconField>
                </div>
            </template>
            <Column field="name" header="Product"></Column>
            <Column field="quantity" class="text-center!">
                <template #header>
                    <span class="text-center font-semibold w-full">Qty.</span>
                </template>
            </Column>
            <Column header="Action" class="w-1">
                <template #body="{ data }">
                    <Link v-if="data.quantity > 0"
                        :href="tuyau.$url('dashboard.overview.product', { query: { isWolesaler, ...qs }, params: { id: data.productId } })">
                    <Button icon="pi pi-search" rounded text></Button>
                    </Link>
                </template>
            </Column>
        </DataTable>
    </div>
</template>