<script setup lang="ts">
import { router } from '@inertiajs/vue3';
import { useUrlSearchParams } from '@vueuse/core';
import { ref } from 'vue';

const qs = useUrlSearchParams<{ tab?: string }>('history')
const tab = ref(qs.tab || 'insurance_list');

function handleChangeTab(value: string) {
    router.get('', { tab: value }, {
        onBefore() {
            qs.tab = value
        }
    })
}

</script>

<template>
    <div class="mb-4">
        <Tabs @update:value="handleChangeTab($event.toString())" :value="tab">
            <TabList>
                <Tab value="insurance_list">Insurances</Tab>
                <Tab value="insurance_products">Products</Tab>
            </TabList>
        </Tabs>
    </div>
</template>
