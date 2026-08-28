import { Navigate } from "react-router-dom";
import { ROUTES } from "../constants";
import { useAppSelector } from "../app/store";
import { LoadingSpinner } from "@/components/common";
import { usePermissions } from "@/hooks/usePermissions";
import { UserPermissions } from "@/services/types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requiredPermission?: keyof UserPermissions;
}

/**
 * Protected route wrapper
 * Redirects to login if user is not authenticated
 * Can check either roles OR permissions
 */
export const ProtectedRoute = ({
  children,
  allowedRoles,
  requiredPermission,
}: ProtectedRouteProps) => {
  const { accessToken, user } = useAppSelector((state) => state.auth);
  const { permissions, loading: permissionsLoading, hasPermission } = usePermissions();

  // Not logged in
  if (!accessToken) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // Permission-based protection (preferred)
  if (requiredPermission) {
    // Permissions still loading
    if (permissionsLoading) {
      return <LoadingSpinner />;
    }

    // Check if user has the required permission
    if (!hasPermission(requiredPermission)) {
      // Redirect to a safe route (Messages)
      return <Navigate to={ROUTES.MESSAGES} replace />;
    }
  }

  // Role-based protection (legacy, kept for backward compatibility)
  if (allowedRoles) {
    // User not yet loaded (during refresh)
    if (!user) {
      return <LoadingSpinner />;
    }

    if (!allowedRoles.includes(user.role)) {
      return <Navigate to={ROUTES.MESSAGES} replace />;
    }
  }

  return <>{children}</>;
};
