<script setup lang="ts">
import { router } from '@inertiajs/vue3';
import { useUrlSearchParams } from '@vueuse/core';
import { ref } from 'vue';

const qs = useUrlSearchParams<{ tab?: string }>('history')
const tab = ref(qs.tab || 'pms');

function handleChangeTab(value: string) {
    router.get('', { tab: value }, {
        onBefore() {
            qs.tab = value
        }
    })
}

</script>

<template>
    <div>
        <Tabs @update:value="handleChangeTab($event.toString())" :value="tab">
            <TabList>
                <Tab value="pms">PMS</Tab>
                <Tab value="hms">HMS</Tab>
                <Tab value="lms">Fleet</Tab>
            </TabList>
        </Tabs>
    </div>
</template>
