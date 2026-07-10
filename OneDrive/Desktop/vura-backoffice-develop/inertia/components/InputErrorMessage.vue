<script setup lang="ts">
defineProps<{
    error: string | undefined
}>()
</script>
<template>
    <Message severity="error" variant="simple" size="small" v-if="error" class="p-error">{{ error }}</Message>
</template>