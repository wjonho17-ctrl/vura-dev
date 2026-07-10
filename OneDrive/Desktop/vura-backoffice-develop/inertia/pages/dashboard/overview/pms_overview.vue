<script setup lang="ts">
import type District from '#models/district';
import type Province from '#models/province';
import type { MedbookOverviewStatsResponse } from '#types/api/medbook/stat_type';
import OverviewProductTable from '~/components/partials/dashboard/overview/OverviewProductTable.vue';
import OverviewTabs from '~/components/partials/dashboard/overview/OverviewTabs.vue';
import StatsWidget from '~/components/partials/dashboard/overview/StatsWidget.vue';
import { useFiltering } from '~/composables/filtering';

defineProps<{
    stats: MedbookOverviewStatsResponse
    provinces: Province[]
    districts: District[]
}>()


const { qs, isFiltering, applyFilter, clear } = useFiltering<{
    wholesalerProductName?: string
    retailerProductName?: string
    provinceId?: number
    districtId?: number
}>()

</script>

<template>
    <div class="card">
        <div class="flex items-center justify-between mb-6">
            <h4 class="m-0">Pharmacy Management System</h4>
            <Skeleton v-if="isFiltering" width="20rem" height="2rem"></Skeleton>
            <OverviewTabs v-else></OverviewTabs>
        </div>
    </div>
    <div class="grid grid-cols-[2fr_1fr] gap-4">
        <div>
            <Toolbar class="mb-4!">
                <template #start>
                    <Select :loading="isFiltering" @value-change="applyFilter" v-model="qs.provinceId"
                        optionLabel="name" optionValue="id" :options="provinces" placeholder="Select a province"
                        @valueChange="qs.districtId = undefined" showClear></Select>
                    <Select :loading="isFiltering" class="ml-3!" @value-change="applyFilter" v-model="qs.districtId"
                        optionLabel="name" optionValue="id" :options="districts" placeholder="Select a district"
                        showClear></Select>
                </template>

                <template #end>
                    <Button :loading="isFiltering" :disabled="isFiltering" @click="clear" icon="pi pi-filter-slash"
                        severity="secondary"></Button>
                </template>
            </Toolbar>

            <!-- wholesaler -->
            <OverviewProductTable title="Wholesaller Low Stock" :products="stats.products.wholesaler" :qs="qs"
                :isWolesaler="true" :isFiltering="isFiltering" @filter="applyFilter"
                v-model:productName="qs.wholesalerProductName">
            </OverviewProductTable>

            <!-- retailter -->
            <OverviewProductTable title="Retailer Low Stock" :products="stats.products.retailer" :qs="qs"
                :isFiltering="isFiltering" @filter="applyFilter" v-model:productName="qs.retailerProductName">
            </OverviewProductTable>

        </div>

        <div>
            <div class="grid grid-cols-2 content-start justify-start gap-2 sticky top-1/10 right-0">
                <Skeleton v-if="isFiltering" class="col-span-2" height="100vh"></Skeleton>
                <template v-else>
                    <StatsWidget v-for="data in stats.pharmacies" :label="data.label" :total="data.total"
                        :icon="data.icon" />
                    <StatsWidget v-for="data in stats.orders" :color="data.color" :label="data.label"
                        :total="data.total" :icon="data.icon"
                        :description="{ top: data.amount.toLocaleString() + ' RWF' }" />
                </template>
            </div>
        </div>
    </div>
</template>
