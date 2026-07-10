<script setup lang="ts">
import { router } from '@inertiajs/vue3';
import { useUrlSearchParams } from '@vueuse/core';
import { ref } from 'vue';

defineProps<{
    locks?: {
        hms?: boolean
        lms?: boolean
        pms?: boolean
    }
}>()

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
                <Tab value="pms" :disabled="!!locks?.pms">PMS</Tab>
                <Tab value="hms" :disabled="!!locks?.hms">HMS</Tab>
                <Tab value="lms" :disabled="!!locks?.lms">Fleet</Tab>
            </TabList>
        </Tabs>
    </div>
</template>
