<script setup lang="ts">
import NotificationsWidget from '~/components/partials/dashboard/overview/NotificationsWidget.vue';
import RecentSalesWidget from '~/components/partials/dashboard/overview/RecentSalesWidget.vue';
import RevenueStreamWidget from '~/components/partials/dashboard/overview/RevenueStreamWidget.vue';
import StatsWidget from '~/components/partials/dashboard/overview/StatsWidget.vue';
import type { MedbookGlobalBasicStatsResponse } from '#types/api/medbook/stat_type';


defineProps<{ pmsGlobalBasicStats: MedbookGlobalBasicStatsResponse }>()

</script>

<template>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <div class="grid grid-cols-3 gap-4">
                <StatsWidget v-for="data in pmsGlobalBasicStats.users" :label="data.label" :total="data.total"
                    :icon="data.icon" />
            </div>
            <RevenueStreamWidget title="Pharmacies Revenue (PMS)" :revenue="pmsGlobalBasicStats.revenue"></RevenueStreamWidget>
        </div>

        <div class="">
            <NotificationsWidget></NotificationsWidget>
            <RecentSalesWidget title="Wholesaler Best Selling Products"
                :products="pmsGlobalBasicStats.top5Products.wholesaler"></RecentSalesWidget>
            <RecentSalesWidget title="Retailer Best Selling  Products"
                :products="pmsGlobalBasicStats.top5Products.retailer"></RecentSalesWidget>
        </div>
    </div>


</template>
