export enum NotificationType {
  // store network / social media
  STORE_FOLLOW = 'STORE_FOLLOW',
  STORE_ORDER_PAYED = 'STORE_ORDER_PAYED',
  STORE_ORDER_COMPLETED = 'STORE_ORDER_COMPLETED',
  STORE_IMPORT_FILE_TO_IMPORTATION_ITEMS_COMPLETED = 'STORE_IMPORT_FILE_TO_IMPORTATION_ITEMS_COMPLETED',
  // stores tasks
  STORE_TASK_STARTED = 'STORE_TASK_STARTED',
  STORE_TASK_COMPLETED = 'STORE_TASK_COMPLETED',
}

export interface NotificationData {
  id: number
  isRead: boolean
  isMeRead: boolean
  type: NotificationType
  refId: string
  senderId: string
}