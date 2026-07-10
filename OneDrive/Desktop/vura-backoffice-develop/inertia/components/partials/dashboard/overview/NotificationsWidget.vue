<script setup>
import { ref } from 'vue';
import NotificationCard from '~/components/NotificationCard.vue';
import { useNotificationQuery } from '~/composables/notification';

const { notifications, isRead, handleOpen } = useNotificationQuery()

</script>

<template>
    <div class="card">
        <div class="flex items-center justify-between mb-6">
            <div class="font-semibold text-xl">Notifications</div>
        </div>

        <span class="block text-muted-color font-medium mb-4">TODAY</span>

        <div>
            <NotificationCard @click="handleOpen(notification, 'today')"
                v-for="notification in notifications.data.value?.data.today" :notification
                :isRead="isRead(notification.id, 'today')"></NotificationCard>
        </div>

    </div>
</template>
