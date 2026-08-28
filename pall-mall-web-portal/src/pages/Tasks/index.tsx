import { useAuthRole } from "@/hooks/useAuthRole";
import { AdminTasks } from "./admin/AdminTasks";

const Tasks = () => {
  const role = useAuthRole();

  // Admin has a fundamentally different UI
  if (role === "admin") {
    return <AdminTasks />;
  }
};

export default Tasks;
