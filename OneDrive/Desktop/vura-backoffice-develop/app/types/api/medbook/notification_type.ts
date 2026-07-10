export type NotificationResponse = {
  id: number
  title: string
  message: string
  type: string
  refId: string
  readBy: { data: { id: string, system: 'PMS' | 'E-PRESCRIPTION' | 'BACKOFFICE' }[] }
}

export type NotificationList = {
  today: NotificationResponse[]
  yesterday: NotificationResponse[]
  lastWeek: NotificationResponse[]
}