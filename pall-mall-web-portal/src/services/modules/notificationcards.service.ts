import notificationAxiosInstance from "../api/notificationAxiosInstance";
import dashboardAxiosInstance from "../api/dashboardAxiosInstance";
import { ENDPOINTS } from "../api/endpoints";
import type { NotificationListResponse, TaskAnalyticsMetrics } from "../types";

/**
 * Task Analytics service for dashboard metrics
 */
export const taskAnalyticsService = {
  async getMetrics(): Promise<TaskAnalyticsMetrics> {
    const res = await dashboardAxiosInstance.get(
      ENDPOINTS.TASK_ANALYTICS.METRICS
    );
    return res.data.data;
  },
};

/**
 * Notification service for user notifications (cards/list)
 * Handles fetching user-specific notifications
 */
class NotificationCardsService {
  /**
   * Get notification list for a specific user
   * @param userId - User ID to fetch notifications for
   * @returns Notification list with stats
   */
  async getNotificationList(userId: string): Promise<NotificationListResponse> {
    const response = await notificationAxiosInstance.get<NotificationListResponse>(
      ENDPOINTS.NOTIFICATION.USER_LIST(userId)
    );

    return response.data;
  }

  /**
   * Mark a specific notification as read
   * @param notificationId - Notification ID to mark as read
   * @param userId - User ID
   */
  async markAsRead(notificationId: string, userId: string): Promise<void> {
    await notificationAxiosInstance.patch(
      ENDPOINTS.NOTIFICATION.MARK_AS_READ(notificationId, userId),
      { isRead: true }
    );
  }

  /**
   * Mark all notifications as read for a user
   * @param userId - User ID
   */
  async markAllAsRead(userId: string): Promise<void> {
    await notificationAxiosInstance.patch(
      ENDPOINTS.NOTIFICATION.MARK_ALL_READ(userId),
      { isRead: true }
    );
  }

  /**
   * Dismiss a notification
   * @param notificationId - Notification ID to dismiss
   */
  async dismissNotification(notificationId: string): Promise<void> {
    await notificationAxiosInstance.delete(
      ENDPOINTS.NOTIFICATION.DISMISS(notificationId)
    );
  }
}

export default new NotificationCardsService();