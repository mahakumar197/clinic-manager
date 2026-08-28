import { useAuthRole } from "@/hooks/useAuthRole";
import AdminAnalytics from "./admin/AdminAnalytics";
import AnalyticsReports from "./shared/AnalyticsReports";

const Analytics = () => {
  const role = useAuthRole();

  if (role === "admin") {
    return <AdminAnalytics />;
  }

  return <AnalyticsReports />;
};

export default Analytics;
