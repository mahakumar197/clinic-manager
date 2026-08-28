// import {
//   MessagesIcon,
//   TasksIcon,
//   ApprovalsIcon,
//   ContentUploadIcon,
//   AnalyticsIcon,
//   UserManagementIcon,
//   NotificationsIcon,
//   LogoutIcon,
//   RuleNotificationsIcon,
// } from "@/assets";
// import { ROUTES } from "@/constants/routes";

// export type Role = "admin" | "doctor" | "nurse" | "coordinator" | "patient";

// export interface MenuItem {
//   title: string;
//   icon: string;
//   path: string;
//   isLogout?: boolean;
//   badgeCount?: number;
// }

// export const ROLE_MENU_CONFIG: Record<Role, MenuItem[]> = {
//   admin: [
//     {
//       title: "Messages",
//       icon: MessagesIcon,
//       path: ROUTES.MESSAGES,
//       badgeCount: 21,
//     },
//     { title: "Tasks", icon: TasksIcon, path: ROUTES.TASKS },
//     { title: "Approvals Queue", icon: ApprovalsIcon, path: ROUTES.APPROVALS },
//     {
//       title: "Content Upload",
//       icon: ContentUploadIcon,
//       path: ROUTES.CONTENT_UPLOAD,
//     },
//     {
//       title: "Reporting & Analytics",
//       icon: AnalyticsIcon,
//       path: ROUTES.ANALYTICS,
//     },
//     { title: "User Management", icon: UserManagementIcon, path: ROUTES.USERS },
//     {
//       title: "Rule Notifications",
//       icon: RuleNotificationsIcon,
//       path: ROUTES.RULE_NOTIFICATIONS,
//     },
//     {
//       title: "Notifications",
//       icon: NotificationsIcon,
//       path: ROUTES.NOTIFICATIONS,
//     },
//     { title: "Logout", icon: LogoutIcon, path: ROUTES.LOGIN, isLogout: true },
//   ],

//   doctor: [
//     {
//       title: "Messages",
//       icon: MessagesIcon,
//       path: ROUTES.MESSAGES,
//       badgeCount: 10,
//     },
//     { title: "Approvals Queue", icon: ApprovalsIcon, path: ROUTES.APPROVALS },
//     {
//       title: "Patient Tracker",
//       icon: UserManagementIcon,
//       path: ROUTES.PATIENT_TRACKER,
//     },
//     {
//       title: "Reporting & Analytics",
//       icon: AnalyticsIcon,
//       path: ROUTES.ANALYTICS,
//     },
//     {
//       title: "Notifications",
//       icon: NotificationsIcon,
//       path: ROUTES.NOTIFICATIONS,
//     },
//     { title: "Logout", icon: LogoutIcon, path: ROUTES.LOGIN, isLogout: true },
//   ],

//   nurse: [
//     {
//       title: "Messages",
//       icon: MessagesIcon,
//       path: ROUTES.MESSAGES,
//       badgeCount: 10,
//     },
//     { title: "Approvals Queue", icon: ApprovalsIcon, path: ROUTES.APPROVALS },
//     {
//       title: "Patient Tracker",
//       icon: UserManagementIcon,
//       path: ROUTES.PATIENT_TRACKER,
//     },
//     {
//       title: "Reporting & Analytics",
//       icon: AnalyticsIcon,
//       path: ROUTES.ANALYTICS,
//     },
//     {
//       title: "Notifications",
//       icon: NotificationsIcon,
//       path: ROUTES.NOTIFICATIONS,
//     },
//     { title: "Logout", icon: LogoutIcon, path: ROUTES.LOGIN, isLogout: true },
//   ],

//   coordinator: [
//     {
//       title: "Messages",
//       icon: MessagesIcon,
//       path: ROUTES.MESSAGES,
//       badgeCount: 10,
//     },
//     { title: "Approvals Queue", icon: ApprovalsIcon, path: ROUTES.APPROVALS },
//     {
//       title: "Patient Tracker",
//       icon: UserManagementIcon,
//       path: ROUTES.PATIENT_TRACKER,
//     },
//     {
//       title: "Reporting & Analytics",
//       icon: AnalyticsIcon,
//       path: ROUTES.ANALYTICS,
//     },
//     {
//       title: "Notifications",
//       icon: NotificationsIcon,
//       path: ROUTES.NOTIFICATIONS,
//     },
//     { title: "Logout", icon: LogoutIcon, path: ROUTES.LOGIN, isLogout: true },
//   ],

//   patient: [
//     {
//       title: "Messages",
//       icon: MessagesIcon,
//       path: ROUTES.MESSAGES,
//       badgeCount: 10,
//     },
//     { title: "Approvals Queue", icon: ApprovalsIcon, path: ROUTES.APPROVALS },
//     {
//       title: "Patient Tracker",
//       icon: UserManagementIcon,
//       path: ROUTES.PATIENT_TRACKER,
//     },
//     {
//       title: "Reporting & Analytics",
//       icon: AnalyticsIcon,
//       path: ROUTES.ANALYTICS,
//     },
//     {
//       title: "Notifications",
//       icon: NotificationsIcon,
//       path: ROUTES.NOTIFICATIONS,
//     },
//     { title: "Logout", icon: LogoutIcon, path: ROUTES.LOGIN, isLogout: true },
//   ],
// };
