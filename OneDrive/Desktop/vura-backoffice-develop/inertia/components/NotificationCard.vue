<script setup lang="ts">
import type { NotificationResponse } from '#types/api/medbook/notification_type';

defineProps<{
    notification: NotificationResponse
    isRead?: boolean
    icon?: string
    color?: 'blue' | 'red' | 'yellow' | 'purple' | 'green'
}>()

</script>

<template>
    <div class="flex items-start p-2! my-2! border-b border-surface cursor-pointer hover:ring hover:ring-blue-500 rounded"
        :class="{ 'text-gray-500': !isRead }">
        <div class="w-12 h-12 flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-full shrink-0">
            <i class="pi pi-bell text-xl! text-blue-500" :class="{'text-gray-500!': isRead}"></i>
        </div>
        <div class="flex flex-col px-2!">
            <span class="text-primary font-bold" :class="{ 'text-gray-500!': isRead }">{{ notification.title }}</span>
            <span class="text-surface-900 dark:text-surface-0 leading-normal" :class="{ 'text-gray-500!': isRead }">
                {{ notification.message }}
            </span>
        </div>
    </div>
</template>
