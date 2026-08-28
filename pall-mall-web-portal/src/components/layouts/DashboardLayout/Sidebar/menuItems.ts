import {
  MessagesIcon,
  TasksIcon,
  ApprovalsIcon,
  ContentUploadIcon,
  AnalyticsIcon,
  UserManagementIcon,
  NotificationsIcon,
  LogoutIcon,
  RuleNotificationsIcon,
} from "@/assets";
import { ROUTES } from "@/constants/routes";
import { MenuItem } from "./sidebarConfig";
import { UserPermissions } from "@/services/types";

/**
 * Master list of all possible menu items with their permission keys
 * These will be filtered based on user permissions from the API
 */
export const ALL_MENU_ITEMS: MenuItem[] = [
  {
    title: "Messages",
    icon: MessagesIcon,
    path: ROUTES.MESSAGES,
    permissionKey: "messages",
  },
  {
    title: "Tasks",
    icon: TasksIcon,
    path: ROUTES.TASKS,
    permissionKey: "tasks",
  },
  // {
  //   title: "Patient Tracker",
  //   icon: UserManagementIcon,
  //   path: ROUTES.PATIENT_TRACKER,
  //   permissionKey: "patient_tracker",
  // },
  {
    title: "Approvals Queue",
    icon: ApprovalsIcon,
    path: ROUTES.APPROVALS,
    permissionKey: "approvals",
  },
  {
    title: "Content Upload",
    icon: ContentUploadIcon,
    path: ROUTES.CONTENT_UPLOAD,
    permissionKey: "content_upload",
  },
  {
    title: "Reporting & Analytics",
    icon: AnalyticsIcon,
    path: ROUTES.ANALYTICS,
    permissionKey: "reporting_&_analytics",
  },
  {
    title: "User Management",
    icon: UserManagementIcon,
    path: ROUTES.USERS,
    permissionKey: "user_management",
  },
  {
    title: "Rule Notifications",
    icon: RuleNotificationsIcon,
    path: ROUTES.RULE_NOTIFICATIONS,
    permissionKey: "rule_notification",
  },
  {
    title: "Notifications",
    icon: NotificationsIcon,
    path: ROUTES.NOTIFICATIONS,
    permissionKey: "notifications",
  },
  // Logout always shows regardless of permissions
  {
    title: "Logout",
    icon: LogoutIcon,
    path: ROUTES.LOGIN,
    isLogout: true,
  },
];


/**
 * Filter menu items based on user permissions
 * @param permissions User permissions from API
 * @returns Filtered menu items
 */
export const getFilteredMenuItems = (
  permissions: UserPermissions | null
): MenuItem[] => {
  if (!permissions) {
    // If permissions haven't loaded yet or failed, show only logout
    return ALL_MENU_ITEMS.filter((item) => item.isLogout);
  }

  return ALL_MENU_ITEMS.filter((item) => {
    // Always show logout
    if (item.isLogout) return true;

    // Check if user has permission for this item
    if (item.permissionKey) {
      const permissionKey = item.permissionKey as keyof UserPermissions;
      return permissions[permissionKey] === true;
    }

    // If no permission key specified, don't show
    return false;
  });
};

/**
 * Get default permissions based on user role
 * Used as fallback when API fails or for skeleton loading
 */
export const getDefaultPermissionsByRole = (role?: string): UserPermissions => {
  const normalizedRole = role?.toLowerCase();

  // Admin gets all permissions EXCEPT Patient Tracker
  if (normalizedRole === "admin") {
    return {
      messages: true,
      tasks: true,
      approvals: true,
      content_upload: true,
      "reporting_&_analytics": true,
      user_management: true,
      rule_notification: true,
      patient_tracker: false, // Admin doesn't see Patient Tracker
      notifications: true,
    };
  }

  // Default for all other roles (doctor, nurse, coordinator, patient)
  return {
    messages: true,
    tasks: false,
    approvals: true,
    content_upload: false,
    "reporting_&_analytics": true,
    user_management: false,
    rule_notification: false,
    patient_tracker: true, // Non-admins see Patient Tracker
    notifications: true,
  };
};

