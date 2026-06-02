import type { Notification } from '../entities/notification/types';
// import httpClient from '../shared/lib/httpClient';
import { notificationApiRepository } from '../features/notifications/repositories/notificationApi.repository';

const notificationService = {
  async getMyNotifications(): Promise<Notification[]> {
    return await notificationApiRepository.getMyNotifications();
  },

  async getUnreadCount(): Promise<number> {
    return await notificationApiRepository.getUnreadCount();
  },

  async markAsRead(notificationId: number): Promise<void> {
    return await notificationApiRepository.markAsRead(notificationId);
  },

  async markAllAsRead(): Promise<void> {
    return await notificationApiRepository.markAllAsRead();
  },

  // OLD CODE - KEEP FOR BACKUP
  /*
  async getMyNotificationsOld(): Promise<Notification[]> {
    const response = await httpClient.get<Notification[]>('/notifications/me');
    return response.data;
  },

  async getUnreadCountOld(): Promise<number> {
    const response = await httpClient.get<number>('/notifications/me/unread-count');
    return response.data;
  },

  async markAsReadOld(notificationId: number): Promise<void> {
    await httpClient.put(`/notifications/${notificationId}/read`);
  },

  async markAllAsReadOld(): Promise<void> {
    await httpClient.put('/notifications/me/read-all');
  },
  */
};

export default notificationService;
