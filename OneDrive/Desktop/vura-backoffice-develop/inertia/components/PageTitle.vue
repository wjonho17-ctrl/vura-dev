<script setup lang="ts">
defineProps<{
    title: string
    description?: string
    size?: 'large' | 'x-large' | 'small'
}>()
</script>

<template>
    <div class="flex flex-col">
        <span class="font-bold" :class="{'text-2xl': size == 'large', 'text-3xl': size == 'x-large'}">{{ title }}</span>
        <span class="text-sm text-gray-600/70">{{ description }}</span>
    </div>
</template>