import { useAuthRole } from "@/hooks/useAuthRole";
import AdminApprovalQueueTabs from "./admin/AdminApprovalQueueTabs";
import ApprovalsList from "./shared/formsQueue/ApprovalsList";
import UserApprovalQueueTabs from "./shared/UserApprovalQueueTabs";

const ApprovalsQueue = () => {
  const role = useAuthRole();

  if (role === "admin") {
    return <AdminApprovalQueueTabs />;
  }

  return <UserApprovalQueueTabs />;
};

export default ApprovalsQueue;
