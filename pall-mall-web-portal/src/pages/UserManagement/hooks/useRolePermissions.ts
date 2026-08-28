import { useEffect, useState, useCallback } from "react";
import userService from "@/services/modules/user.service";
import { RolePermissionsResponse, UpdatePermissionPayload } from "@/services";
import { toast } from "@/utils/toast";
import { usePermission } from "@/contexts/PermissionContext";

interface UseRolePermissionsResult {
  permissions: RolePermissionsResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  updatePermission: (payload: UpdatePermissionPayload) => Promise<void>;
  updating: boolean;
}

/**
 * Custom hook to manage role permissions
 * Fetches permissions list and handles permission updates
 */
export const useRolePermissions = (): UseRolePermissionsResult => {
  const [permissions, setPermissions] = useState<RolePermissionsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refetchPermissions } = usePermission();

  const fetchPermissions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await userService.getRolePermissions();
      setPermissions(data);
    } catch (err: any) {
      console.error("Failed to fetch role permissions", err);
      const errorMessage = err?.response?.data?.message || err?.message || "Failed to load permissions";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePermission = useCallback(
    async (payload: UpdatePermissionPayload) => {
      setUpdating(true);
      setError(null);

      try {
        await userService.updatePermission(payload);
        
        // Optimistically update local state
        if (permissions) {
          const updatedPermissions = { ...permissions };
          const roleKey = payload.role;
          const moduleKey = getModuleKeyFromId(payload.module, permissions.modules);
          
          if (moduleKey && updatedPermissions.permissions[roleKey]) {
            updatedPermissions.permissions[roleKey] = {
              ...updatedPermissions.permissions[roleKey],
              [moduleKey]: payload.enabled,
            };
            setPermissions(updatedPermissions);
          }
        }
        
        toast.success("Permission updated successfully");
        // Only refetch permissions when toggling admin column (so sidebar updates for admins)
        if (payload.role === "95") {
          await refetchPermissions();
        }
      } catch (err: any) {
        console.error("Failed to update permission", err);
        const errorMessage = err?.response?.data?.message || err?.message || "Failed to update permission";
        setError(errorMessage);
        toast.error(errorMessage);
        
        // Refetch to ensure consistency
        await fetchPermissions();
        throw err;
      } finally {
        setUpdating(false);
      }
    },
    [permissions, fetchPermissions]
  );

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  return {
    permissions,
    loading,
    error,
    refetch: fetchPermissions,
    updatePermission,
    updating,
  };
};

/**
 * Helper to convert module ID to module key name
 */
function getModuleKeyFromId(moduleId: string, modules: { key: string; label: string }[]): string | null {
  const module = modules.find((m) => m.key === moduleId);
  if (!module) return null;
  
  // Convert label to snake_case key (e.g., "User Management" -> "user_management")
  return module.label.toLowerCase().replace(/\s+/g, "_");
}
