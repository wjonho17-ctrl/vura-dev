import type { NotificationList, NotificationResponse } from '#types/api/medbook/notification_type'
import { router } from '@inertiajs/vue3'
import { useMutation, useQuery } from '@tanstack/vue-query'
import { computed } from 'vue'
import tuyau from '~/app/tuyau'

export function useNotificationQuery() {
    // Query
    const notifications = useQuery<{
        data: NotificationList, readToday: number[], readYesterDay: number[], readLastWeek: number[]
    }>({
        queryKey: ['notifications'],
        queryFn: () => tuyau.$route('notifications.list').$get().unwrap() as any,
        refetchInterval: 1_000 * 60
    })

    const readNotification = useMutation({
        mutationFn({ id }: { id: number }) {
            return tuyau.notifications.read({ id }).$post()
        }
    })

    const totalToday = computed(() => notifications.data.value?.data.today.filter(notification => !isRead(notification.id, 'today')).length)
    const totalYesterday = computed(() => notifications.data.value?.data.yesterday.filter(notification => !isRead(notification.id, 'yesterday')).length)
    const totalLastWeek = computed(() => notifications.data.value?.data.lastWeek.filter(notification => !isRead(notification.id, 'lastWeek')).length)
    const total = computed(() => (totalToday.value || 0) + (totalYesterday.value || 0) + (totalLastWeek.value || 0))

    function isRead(id: number, time: 'today' | 'yesterday' | 'lastWeek') {
        if (time == 'today') return notifications.data.value?.readToday.includes(id)
        else if (time == 'yesterday') return notifications.data.value?.readYesterDay.includes(id)
        else if (time == 'lastWeek') return notifications.data.value?.readLastWeek.includes(id)

        throw new Error('Invalid time')
    }

    function handleOpen(notification: NotificationResponse, time: 'today' | 'yesterday' | 'lastWeek') {
        if (!isRead(notification.id, time)) {
            readNotification.mutate({ id: notification.id }, {
                onSuccess() {
                    notifications.refetch()
                }
            })
        }

        router.get(tuyau.$url('dashboard.products.edit', { params: { id: +notification.refId } }))
    }

    return {
        notifications,
        readNotification,
        total,
        totalToday,
        totalYesterday,
        totalLastWeek,
        isRead,
        handleOpen
    }
}
