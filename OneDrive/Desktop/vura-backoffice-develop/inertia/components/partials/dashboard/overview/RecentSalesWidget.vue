<script setup lang="ts">
defineProps<{
    title: string
    products: any
}>()

</script>

<template>
    <div class="card">
        <div class="font-semibold text-xl mb-4">{{ title }}</div>
        <DataTable :value="products" :rows="5" responsiveLayout="scroll">
            <Column header="No">
                <template #body="{ index }">{{ index + 1 }} </template>
            </Column>
            <Column field="name" header="Name"></Column>
            <Column field="total" header="Qty."></Column>
        </DataTable>
    </div>
</template>
