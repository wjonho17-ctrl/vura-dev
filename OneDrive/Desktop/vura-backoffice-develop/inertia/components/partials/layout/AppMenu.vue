<script setup lang="ts">
import { ref } from 'vue';

import tuyau from '~/app/tuyau';
import { useNotificationQuery } from '~/composables/notification';
import AppMenuItem from './AppMenuItem.vue';

const { total } = useNotificationQuery()

// onMounted(() => notifications.refetch())

const model = ref<any>([
    {
        label: 'Home',
        items: [
            { label: 'Dashboard', icon: 'pi pi-fw pi-home', to: tuyau.$route('dashboard.index').path },
            { label: 'Overview', icon: 'pi pi-fw  pi-chart-bar', to: tuyau.$route('dashboard.overview').path },
            {
                label: 'Notifications',
                icon: 'pi pi-bell',
                to: tuyau.$route('dashboard.notifications.list').path,
                badge: total
            },
        ]
    },
    {
        label: 'PMS',
        items: [
            {
                label: 'Pharmacies',
                icon: 'pi pi-shop',
                to: tuyau.$route('dashboard.pharmacies.list').path,
            },
        ]
    },
    {
        label: 'Fleet',
        items: [
            {
                label: 'Drivers',
                icon: 'pi pi-truck',
                to: tuyau.$route('dashboard.transporters.list').path,
            },
        ]
    },
    {
        label: 'HMS',
        items: [
            {
                label: 'Facilities',
                icon: 'pi pi-building-columns',
                to: tuyau.$route('dashboard.facilities.list').path,
            }
        ]
    },
    {
        label: 'system',
        items: [
            {
                label: 'Ads',
                icon: 'pi pi-megaphone',
                to: tuyau.$route('dashboard.ads.basic.list').path,
            },
            {
                label: 'Products',
                icon: 'pi pi-box',
                to: tuyau.$route('dashboard.products.list').path,
            },
            {
                label: 'Insurances',
                icon: 'pi pi-building',
                to: tuyau.$route('dashboard.insurance.index').path,
            },
            {
                label: 'Locations',
                icon: 'pi pi-map-marker',
                to: tuyau.$route('dashboard.locations.list').path,
            },
            {
                label: 'Settings',
                icon: 'pi pi-cog',
                to: tuyau.$route('dashboard.settings.list').path,
            }
        ]
    },
]);
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="item">
            <app-menu-item v-if="!item.separator" :item="item" :index="+i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped></style>
