<script setup lang="ts">
import type Product from '#models/product';
import { MedbookProductOverviewResponse } from '#types/api/medbook/stat_type';
import OverviewPharmacyTable from '~/components/partials/dashboard/overview/OverviewPharmacyTable.vue';
import { useFiltering } from '~/composables/filtering';

defineProps<{
    province?: string
    district?: string
    product: Product
    branches: MedbookProductOverviewResponse
}>()

const { qs, applyFilter, isFiltering, handlePageChange } = useFiltering<{
    wholesalerName?: string
    retailerName?: string
    wholesalerPage?: number
    retailerPage?: number
}>()

</script>

<template>
    <div class="card">
        <div class="flex items-center justify-between mb-6">
            <h4 class="m-0">{{ product.brandName }}</h4>
        </div>

        <Message>
            Finding whoelsaler and retailer in <span class="font-bold text-lg">{{ province || '' }}</span>
            {{ province ? 'province' : 'all provinces' }} {{ district ? 'and' : '' }}
            <span class="font-bold text-lg">{{ district || '' }}</span> {{ district ? 'district' : '' }}
        </Message>
    </div>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-7">
        <!-- wholesaler -->
        <OverviewPharmacyTable title="Wholesalers" :province="province" :district="district"
            :branches="branches.wholesaler" :is-filtering="isFiltering" @filter="applyFilter"
            @page-change="handlePageChange($event, 'wholesalerPage')" v-model:name="qs.wholesalerName">
        </OverviewPharmacyTable>

        <!-- retailer -->
        <OverviewPharmacyTable title="Retailers" :province="province" :district="district" :branches="branches.retailer"
            :is-filtering="isFiltering" @filter="applyFilter" @page-change="handlePageChange($event, 'retailerPage')"
            v-model:name="qs.retailerName">
        </OverviewPharmacyTable>

    </div>
</template>
