import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useSelector } from "react-redux";
import notificationCardsService from "@/services/modules/notificationcards.service";
import type { RootState } from "@/app/store";

interface NotificationContextValue {
  unreadCount: number;
  refreshNotifications: () => Promise<void>;
  isLoading: boolean;
}

const NotificationContext = createContext<NotificationContextValue>({
  unreadCount: 0,
  refreshNotifications: async () => {},
  isLoading: false,
});

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const userId = useSelector((state: RootState) => state.auth.user?.id);

  const fetchUnreadCount = async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      const data = await notificationCardsService.getNotificationList(userId);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error("NotificationContext - Failed to fetch unread count:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Smart polling with visibility API
  useEffect(() => {
    if (!userId) return;

    // Initial fetch
    fetchUnreadCount();

    let pollingInterval: NodeJS.Timeout;
    let intervalDuration = 30000; // Default: 30 seconds

    const startPolling = (interval: number) => {
      if (pollingInterval) clearInterval(pollingInterval);
      pollingInterval = setInterval(fetchUnreadCount, interval);
    };

    // Adjust polling based on tab visibility
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Slow down when tab is hidden
        intervalDuration = 60000; // 60 seconds
        startPolling(intervalDuration);
      } else {
        // Speed up when tab is active
        intervalDuration = 15000; // 15 seconds
        fetchUnreadCount(); // Immediate fetch when tab becomes visible
        startPolling(intervalDuration);
      }
    };

    // Start initial polling
    startPolling(intervalDuration);

    // Listen for visibility changes
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (pollingInterval) clearInterval(pollingInterval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [userId]);

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        refreshNotifications: fetchUnreadCount,
        isLoading,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

/**
 * Hook to access notification badge data
 * Use this in the header to show unread notification count
 */
export const useNotificationBadge = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotificationBadge must be used within NotificationProvider");
  }
  return context;
};
