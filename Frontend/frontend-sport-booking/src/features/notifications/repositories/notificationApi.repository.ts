import type { Notification } from '../../../entities/notification/types';
import { apiClient } from '../../../core/api/apiClient';

export const notificationApiRepository = {
  async getMyNotifications(): Promise<Notification[]> {
    return await apiClient.get<Notification[]>('/notifications/me');
  },

  async getUnreadCount(): Promise<number> {
    return await apiClient.get<number>('/notifications/me/unread-count');
  },

  async markAsRead(notificationId: number): Promise<void> {
    return await apiClient.put<void>(`/notifications/${notificationId}/read`);
  },

  async markAllAsRead(): Promise<void> {
    return await apiClient.put<void>('/notifications/me/read-all');
  },
};
