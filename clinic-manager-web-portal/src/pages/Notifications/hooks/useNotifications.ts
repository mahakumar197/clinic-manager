import { useEffect, useState, useCallback } from "react";
import notificationCardsService from "@/services/modules/notificationcards.service";
import type { NotificationItem, NotificationStats } from "@/services/types";
import { toast } from "@/utils/toast";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import { useNotificationBadge } from "@/contexts/NotificationContext";

interface UseNotificationsResult {
  notifications: NotificationItem[];
  stats: NotificationStats;
  loading: boolean;
  error: string | null;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  dismissNotification: (notificationId: string) => Promise<void>;
  refetch: () => Promise<void>;
}

/**
 * Custom hook to manage user notifications
 * Handles fetching notifications with stats and actions
 */
export const useNotifications = (): UseNotificationsResult => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [stats, setStats] = useState<NotificationStats>({
    unreadCount: 0,
    totalCount: 0,
    urgentCount: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get current user ID from Redux store
  const userId = useSelector((state: RootState) => state.auth.user?.id);
  const { refreshNotifications: refreshBadge, unreadCount: badgeUnreadCount } = useNotificationBadge();

  /**
   * Fetch notifications from API
   */
  const fetchNotifications = useCallback(async () => {
    if (!userId) {
      console.warn("No userId found, skipping notifications fetch");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await notificationCardsService.getNotificationList(userId);

      console.log("useNotifications - API Response:", data);

      setNotifications(data.notifications);
      setStats({
        unreadCount: data.unreadCount,
        totalCount: data.totalCount,
        urgentCount: data.urgentCount,
      });
    } catch (err: any) {
      console.error("useNotifications - Error:", err);
      const errorMessage =
        err?.response?.data?.message || err?.message || "Failed to load notifications";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  /**
   * Auto fetch on mount
   */
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  /**
   * Re-fetch when badge polling detects changes (new notifications)
   * This keeps the list page in sync with the header badge
   */
  useEffect(() => {
    if (badgeUnreadCount !== stats.unreadCount && !loading) {
      fetchNotifications();
    }
  }, [badgeUnreadCount]);

  /**
   * Mark a single notification as read
   */
  const markAsRead = async (notificationId: string) => {
    if (!userId) return;

    try {
      await notificationCardsService.markAsRead(notificationId, userId);

      // Optimistic UI update
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification.id === notificationId
            ? { ...notification, notificationStatus: "read" as const }
            : notification
        )
      );

      // Update stats
      setStats((prevStats) => ({
        ...prevStats,
        unreadCount: Math.max(0, prevStats.unreadCount - 1),
      }));

      toast.success("Notification marked as read");
      await refreshBadge(); // Update global badge
    } catch (err: any) {
      console.error("Failed to mark notification as read:", err);
      toast.error("Failed to mark notification as read");

      // Re-fetch to resync
      await fetchNotifications();
    }
  };

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = async () => {
    if (!userId) return;

    try {
      await notificationCardsService.markAllAsRead(userId);

      // Optimistic UI update
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) => ({
          ...notification,
          notificationStatus: "read" as const,
        }))
      );

      // Update stats
      setStats((prevStats) => ({
        ...prevStats,
        unreadCount: 0,
      }));

      toast.success("All notifications marked as read");
      await refreshBadge(); // Update global badge
    } catch (err: any) {
      console.error("Failed to mark all notifications as read:", err);
      toast.error("Failed to mark all notifications as read");

      // Re-fetch to resync
      await fetchNotifications();
    }
  };

  /**
   * Dismiss a notification
   */
  const dismissNotification = async (notificationId: string) => {
    try {
      await notificationCardsService.dismissNotification(notificationId);

      // Optimistic UI update - remove from list
      const dismissedNotification = notifications.find(
        (n) => n.id === notificationId
      );

      setNotifications((prevNotifications) =>
        prevNotifications.filter((notification) => notification.id !== notificationId)
      );

      // Update stats
      setStats((prevStats) => ({
        ...prevStats,
        totalCount: Math.max(0, prevStats.totalCount - 1),
        unreadCount:
          dismissedNotification?.notificationStatus === "unread"
            ? Math.max(0, prevStats.unreadCount - 1)
            : prevStats.unreadCount,
        urgentCount:
          dismissedNotification?.priority === "urgent"
            ? Math.max(0, prevStats.urgentCount - 1)
            : prevStats.urgentCount,
      }));

      toast.success("Notification dismissed");
      await refreshBadge(); // Update global badge
    } catch (err: any) {
      console.error("Failed to dismiss notification:", err);
      toast.error("Failed to dismiss notification");

      // Re-fetch to resync
      await fetchNotifications();
    }
  };

  return {
    notifications,
    stats,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    refetch: fetchNotifications,
  };
};
