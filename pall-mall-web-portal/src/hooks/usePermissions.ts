import { useContext } from "react";
import PermissionContext from "@/contexts/PermissionContext";

/**
 * Custom hook to access permission context
 * @returns Permission context with user permissions and helper functions
 */
export const usePermissions = () => {
  const context = useContext(PermissionContext);

  if (context === undefined) {
    throw new Error("usePermissions must be used within a PermissionProvider");
  }

  return context;
};
