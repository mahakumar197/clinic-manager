/**
 * Application route constants
 */

export const ROUTES = {
  HOME: "/",

  // Auth routes
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  OTP: "/otp",
  RESET_PASSWORD: "/reset-password",
  GOOGLE_CALLBACK: "/auth/google/callback",

  // // User routes
  // PROFILE: "/profile",
  // SETTINGS: "/settings",

  // App routes
  MESSAGES: "/messages",
  TASKS: "/tasks",
  TASKS_DETAIL: "/tasks/:taskId",
  APPROVALS: "/approvals",
  CONTENT_UPLOAD: "/content-upload",
  CONTENT_LIBRARY: "/content-upload/content-library/:procedureId",
  ANALYTICS: "/analytics",
  USERS: "/user-management",
  EDITUSER: "/user-management/edit-user",
  NOTIFICATIONS: "/notifications",
  RULE_NOTIFICATIONS: "/rule-notifications",
  EDIT_NOTIFICATIONS:"/rule-notifications/edit-notifications/:id",
  EDIT_ESCALATIONS:"/rule-notifications/edit-escalations/:id",
  PATIENT_TRACKER: "/patient-tracker",

  // Error routes
  NOT_FOUND: "/404",
  UNAUTHORIZED: "/401",
  SERVER_ERROR: "/500",
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RoutePath = (typeof ROUTES)[RouteKey];
