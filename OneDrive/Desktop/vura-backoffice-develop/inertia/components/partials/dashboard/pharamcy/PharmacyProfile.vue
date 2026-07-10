<script lang="ts" setup>
import type Pharmacy from '#models/pharmacy';

defineProps<{
    pharmacy: Pharmacy
}>()

</script>
<template>
    <div class="flex gap-2">
        <Avatar :image="pharmacy?.logo?.url || undefined" size="xlarge" shape="circle"
            :label="pharmacy?.logo ? undefined : pharmacy.initial"></Avatar>
        <div class="flex flex-col gap-1">
            <span>Name: {{ pharmacy?.name }}</span>
            <span>TIN: {{ pharmacy?.tin }}</span>
            <span>Email: {{ pharmacy?.email }}</span>
        </div>
    </div>
</template>