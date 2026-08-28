import React, { createContext, useState, useEffect, ReactNode } from "react";
import userService from "@/services/modules/user.service";
import { UserPermissions } from "@/services/types";
import { useAppSelector } from "@/app/store";
import { getDefaultPermissionsByRole } from "../components/layouts/DashboardLayout/Sidebar/menuItems";

interface PermissionContextType {
  permissions: UserPermissions | null;
  loading: boolean;
  refetching: boolean;
  error: string | null;
  hasPermission: (key: keyof UserPermissions) => boolean;
  hasAnyPermission: (keys: (keyof UserPermissions)[]) => boolean;
  hasAllPermissions: (keys: (keyof UserPermissions)[]) => boolean;
  refetchPermissions: (silent?: boolean) => Promise<void>;
}

const PermissionContext = createContext<PermissionContextType | undefined>(
  undefined
);

interface PermissionProviderProps {
  children: ReactNode;
}



export const PermissionProvider: React.FC<PermissionProviderProps> = ({
  children,
}) => {
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refetching, setRefetching] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Get authentication state from Redux
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const userRole = useAppSelector((state) => state.auth.user?.role);

  const fetchPermissions = async (isInitialLoad: boolean = true) => {
    // Only fetch if user is authenticated
    if (!isAuthenticated || !accessToken) {
      setPermissions(null);
      setLoading(false);
      return;
    }

    try {
      // Initial load: show loading spinner (for ProtectedRoute)
      // Refetch: show refetching (for Sidebar only)
      if (isInitialLoad) {
        setLoading(true);
      } else {
        setRefetching(true);
      }
      setError(null);
      const profileData = await userService.getUserProfile();
      setPermissions(profileData.permissions);
    } catch (err) {
      console.error("Failed to fetch user permissions:", err);
      setError("Failed to load permissions - using default permissions");
      
      // Use default permissions based on role as fallback
      const defaultPermissions = getDefaultPermissionsByRole(userRole);
      setPermissions(defaultPermissions);
      
      console.log("Using default permissions for role:", userRole, defaultPermissions);
    } finally {
      if (isInitialLoad) {
        setLoading(false);
      } else {
        setRefetching(false);
      }
    }
  };

  // Fetch permissions when authentication state changes
  useEffect(() => {
    fetchPermissions();
  }, [isAuthenticated, accessToken]);

  const hasPermission = (key: keyof UserPermissions): boolean => {
    if (!permissions) return false;
    return permissions[key] === true;
  };

  const hasAnyPermission = (keys: (keyof UserPermissions)[]): boolean => {
    if (!permissions) return false;
    return keys.some((key) => permissions[key] === true);
  };

  const hasAllPermissions = (keys: (keyof UserPermissions)[]): boolean => {
    if (!permissions) return false;
    return keys.every((key) => permissions[key] === true);
  };

  const refetchPermissions = async (silent?: boolean) => {
    // Always use isInitialLoad=false for refetch
    await fetchPermissions(false);
  };

  return (
    <PermissionContext.Provider
      value={{
        permissions,
        loading,
        refetching,
        error,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        refetchPermissions,
      }}
    >
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermission = (): PermissionContextType => {
  const context = React.useContext(PermissionContext);
  if (context === undefined) {
    throw new Error("usePermission must be used within a PermissionProvider");
  }
  return context;
};

export default PermissionContext;
