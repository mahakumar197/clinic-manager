import { taskAnalyticsService } from "@/services/modules/notificationcards.service";
import { useEffect, useState } from "react";


export const useNotificationCardAnalytics = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const data = await taskAnalyticsService.getMetrics();
        setMetrics(data);
      } catch (err) {
        setError(err);
        console.error("Task analytics error", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);


  console.log("CARD  DATA", metrics)

  return {
    metrics,
    loading,
    error,
  };
};
