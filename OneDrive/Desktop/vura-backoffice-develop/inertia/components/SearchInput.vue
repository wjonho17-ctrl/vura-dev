<script setup lang="ts">

defineProps<{
    loading?: boolean
}>()

defineEmits(['input'])

const value = defineModel<string>({ required: false })

</script>
<template>
    <IconField>
        <InputIcon>
            <i class="pi pi-spinner pi-spin" v-if="loading"></i>
            <i class="pi pi-search" v-else></i>
        </InputIcon>
        <InputText fluid :maxlength="100" @input="$emit('input', $event)" v-model="value" placeholder="Search..." />
    </IconField>
</template>
