<script setup lang="ts">
import { NotificationResponse } from '#types/api/medbook/notification_type';
import NotificationCard from '~/components/NotificationCard.vue';
import { useNotificationQuery } from '~/composables/notification';
import { router } from '@inertiajs/vue3';
import tuyau from '~/app/tuyau';

const { notifications, isRead, handleOpen } = useNotificationQuery()

</script>
<template>
    <div class="card">
        <div class="flex items-center justify-between mb-6">
            <h4 class="m-0">Notifications</h4>
            <div>
                <Button icon="pi pi-ellipsis-v" class="p-button-text p-button-plain p-button-rounded"
                    @click=""></Button>
                <!-- <Menu ref="menu" popup :model="items" class="min-w-40!"></Menu> -->
            </div>
        </div>

        <div class="flex justify-between px-8! py-4">
            <div>
                <span class="block text-muted-color font-medium mb-4">TODAY</span>
                <div class="max-w-md">
                    <NotificationCard @click="handleOpen(notification, 'today')"
                        v-for="notification in notifications.data.value?.data.today" :notification
                        :isRead="isRead(notification.id, 'today')"></NotificationCard>
                </div>
            </div>

            <div>
                <span class="block text-muted-color font-medium mb-4">YESTERDAY</span>
                <div class="max-w-md">
                    <NotificationCard @click="handleOpen(notification, 'yesterday')"
                        v-for="notification in notifications.data.value?.data.yesterday" :notification
                        :isRead="isRead(notification.id, 'yesterday')"></NotificationCard>
                </div>
            </div>

            <div>
                <span class="block text-muted-color font-medium mb-4">LAST WEEK</span>
                <div class="max-w-md">
                    <NotificationCard @click="handleOpen(notification, 'lastWeek')"
                        v-for="notification in notifications.data.value?.data.lastWeek" :notification
                        :isRead="isRead(notification.id, 'lastWeek')"></NotificationCard>
                </div>

            </div>
        </div>
    </div>
</template>