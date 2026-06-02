export interface Notification {
  id: number;
  message: string;
  redirectUrl?: string | null;
  read?: boolean;
  isRead?: boolean;
  readAt?: string | null;
  createdAt?: string;
}

export type NotificationRealtimeType = 'NEW_NOTIFICATION' | 'UNREAD_COUNT_UPDATED';

export interface NotificationRealtimePayload {
  type: NotificationRealtimeType;
  notification?: Notification | null;
  unreadCount: number;
  serverTime?: string;
}
