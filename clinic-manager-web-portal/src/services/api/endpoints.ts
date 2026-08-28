/**
 * API endpoint constants
 * Centralized location for all API endpoints
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export const MAIN_API_BASE_URL = import.meta.env.VITE_MAIN_API_BASE_URL || "";

export const NOTIFICATION_API_BASE_URL =
  import.meta.env.VITE_NOTIFICATION_API_BASE_URL || "";

export const REPORTS_API_BASE_URL =
  import.meta.env.VITE_REPORTS_API_BASE_URL || "";

export const ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    REFRESH_TOKEN: "/auth/refresh",
    VERIFY_EMAIL: "/auth/verify-email",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    GOOGLE_LOGIN: `${API_BASE_URL}/auth/google/redirect`,
    VERIFY_OTP: "/auth/verify-otp",
    USER_LIST: "/auth/user-list",
  },

  // User
  USER: {
    LOGIN_PROFILE: "/auth/user-dataFromToken",
    PROFILE: "/user/profile",
    UPDATE_PROFILE: "/user/profile",
    CHANGE_PASSWORD: "/user/change-password",
    UPLOAD_AVATAR: "/user/avatar",
  },

  // User Management
  USER_MANAGEMENT: {
    CARDS: "/users/cards-counts",
    ROLE_PERMISSIONS_LIST: "/users/role-permissions/list",
    ROLE_PERMISSIONS_UPDATE: "/users/role-permissions",
    USER_LIST: "/users",
    SUSPEND_USER: "/users/suspend",
    CREATE_USER: "/users/add-user",
    VIEW_USER: "/users/view",
    UPDATE_USER: "/users/update",
    PROFILE: "/users/profile",
  },

  // Products (example)
  PRODUCTS: {
    LIST: "/products",
    DETAIL: (id: string | number) => `/products/${id}`,
    CREATE: "/products",
    UPDATE: (id: string | number) => `/products/${id}`,
    DELETE: (id: string | number) => `/products/${id}`,
  },

  // Tasks
  TASKS: {
    LIST: "/tasks",
    EXPORT: "/tasks/export",
    DETAILS: (taskId: string) => `/tasks/${taskId}`,
    CREATE: "/tasks",
    UPDATE: (taskId: string) => `/tasks/${taskId}`,
    DELETE: (taskId: string) => `/tasks/${taskId}`,
    RECOVER: (taskId: string) => `/tasks/${taskId}/recover`,
  },

  // Approvals - FORM
  APPROVALS: {
    LIST: "/approvals-admin/fetch-all-submissions",
    DETAILS: (id: string) => `/approvals-admin/fetch-assigned-users/${id}`,
    COMMENTS: (submission_id: string) =>
      `/approvals-admin/fetch-comments/${submission_id}`,
    ACTION: "/approvals-admin/approve-or-reject-submission", // Approve/Reject,
    FORM: "/forms-submissions/",
  },

// Approvals - UPLOAD
  UPLOAD_APPROVALS: {
    LIST: "/approvals-admin/fetch-all-task-submissions",
    DETAILS: (id: string) => `/approvals-admin/fetch-task-submission-details/${id}`,
    COMMENTS: (taskSubmissionId: string) =>
      `/approvals-admin/fetch-task-upload-comments/${taskSubmissionId}`,
    ACTION: "/approvals-admin/approve-or-reject-task-submission", // Approve/Reject,
    UPLOAD: (id: string) => `/approvals-admin/fetch-task-submission-asset/${id}`,
  },

  // User Approvals - FORM
  USER_APPROVALS: {
    LIST: "/approval-doctor/queue",
    DETAILS: (id: string) => `/approval-doctor/fetch-approvals/${id}`,
    COMMENTS: (submission_id: string) =>
      `/approval-doctor/fetch-comments/${submission_id}`,
    ACTION: "/approval-doctor/review", // Approve/Reject,
    // FORM SAME AS ADMIN 
  },

  // User Approvals - UPLOAD
  UPLOAD_USER_APPROVALS: {
    LIST: "/approval-doctor/fetch-all-task-submissions",
    DETAILS: (id: string) => `/approval-doctor/fetch-task-submission-details/${id}`,
    COMMENTS: (submission_id: string) =>
      `/approval-doctor/fetch-task-upload-comments/${submission_id}`,
    ACTION: "/approval-doctor/approve-or-reject-task-submission", // Approve/Reject,
    UPLOAD: (id: string) => `/approval-doctor/fetch-task-submission-asset/${id}`,
  },

  // Messages
  MESSAGES: {
    THREADS: "/Message/threads",
    THREAD: (id: string) => `/Message/threads/${id}`,
    THREAD_MESSAGES: (id: string) => `/Message/${id}/messages`,
    SEND_IN_THREAD: (id: string) => `/Message/${id}/messages`,
    COUNTS: "/Message/counts",
    SEND: "/Message/send",
    ARCHIVE: (id: string) => `/Message/${id}/archive`,
    READ: (id: string) => `/Message/${id}/read`,
    UNREAD: (id: string) => `/Message/${id}/unread`, // If using API for fallback
    INTERNAL_NOTE: (id: string) => `/Message/${id}/internal-note`,
    DELETE: (id: string) => `/Message/${id}`,
    STAR: (id: string) => `/Message/threads/${id}/star`,
    THREAD_ASSIGNED_USERS: (id: string) => `/Message/${id}/assigned`,
    ASSIGN_THREAD: (id: string) => `/Message/${id}/assign`,
  },

  // Media
  MEDIA: {
    UPLOAD: "/media/upload",
  },

  //notification
  NOTIFICATION: {
    LIST: "/admin/notifications",
    CREATE: "/admin/notifications",
    DETAILS: (id: string) => `/admin/notifications/${id}`,
    STATUS: (id: string, isActive: boolean) =>
      `/admin/notifications/status/${id}?isActive=${isActive}`,
    DELETE: (id: string) => `/admin/notifications/${id}`,
    // User notifications (non-admin)
    USER_LIST: (userId: string) => `/notifications/user/${userId}`,
    MARK_AS_READ: (notificationId: string, userId: string) =>
      `/notifications/${notificationId}/read/${userId}`,
    MARK_ALL_READ: (userId: string) => `/notifications/read/bulk/${userId}`,
    DISMISS: (notificationId: string) => `/notifications/${notificationId}`,
  },

  //notificationcards
  TASK_ANALYTICS: {
    METRICS: "/task-analytics/metrics",
  },

  //escalation
  ESCALATION: {
    LIST: "/admin/escalations",
    CREATE: "/admin/escalations",
    DETAILS: (id: string) => `/admin/escalations/${id}`,
    STATUS: (id: string, isActive: boolean) =>
      `/admin/escalations/status/${id}?isActive=${isActive}`,
    DELETE: (id: string) => `/admin/escalations/${id}`,
  },

  //content
  CONTENT: {
    LIST: "/content",
    DETAILS: (id: string) => `/content/${id}`,
    CREATE: "/content",
    UPDATE: (id: string) => `/content/${id}`,
    DELETE: (id: string) => `/content/${id}`,
    LIKE: (id: string) => `/content/${id}/like`,
  },
  PROCEDURE: {
    LIST: "/procedures",
    DETAILS: (id: string) => `/procedures/${id}`,
  },
  ZOHO: {
    ZOHO_FORM: "/forms",
  },
  CONTENTTYPE: {
    CONTENT_TYPE: "/content/dropdown",
  },

  // Reports & Analytics
  REPORTS: {
    DASHBOARD: "/reports/admin/reports",
    PERFORMANCE_BY_USER: "/reports/admin/performance-by-user",
    USER_DASHBOARD: "/reports", // User/Personal analytics dashboard
    EXPORT: "/reports/admin/reports-export", // Admin reports export
    STAFF_EXPORT: "/reports/staff/export", // User/Staff reports export
  },
} as const;

/**
 * Dropdown types
 */
export enum DropdownType {
  FILE_TYPE = "FileType",
  MESSAGE_TYPE = "MessageType",
  MESSAGE_VISIBILITY = "MessageVisibility",
  THREAD_STATUS = "ThreadStatus",
  TASK_PHASE = "TaskPhase",
  TASK_CATEGORY = "TaskCategory",
  TASK_ACTION = "TaskAction",
  TASK_STATUS = "TaskStatus",
  PROCEDURE_TYPE = "ProcedureType",
  PROCEDURE_MODEL = "ProcedureModel",
  PROCEDURE_STATUS = "ProcedureStatus",
  MIME_TYPE = "MimeType",
  CONTENT_TYPE = "ContentType",
  CONTENT_STATUS = "ContentStatus",
  ZOHO_FORM = "ZohoForm",
  TASK_CONTENT = "TaskContent",
  IMAGE_COUNT = "ImageCount",
  TRIGGER_EVENT = "TriggerEvent",
  ROLE_TYPE = "RoleType",
  ESCALATION_TYPE = "escalationType",
  ESCALATION_CONDITION = "escalationCondition",
  DATE_FILTER_TYPE = "DateFilterType",
  USER_ROLE = "Role",
  USER_STATUS = "ProcedureStatus",
  SUSPENSION_DURATION = "SuspensionDuration",
  USER_DEPARTMENT = "UserDepartment",
  APPROVAL_STATUS = "ApprovalStatus",
  FORM_PRIORITY = "FormPriority",
  FORM_APPROVAL_STATUS = "FormApprovalStatus",
  APPROVALS_TASK_UPLOAD_TYPE = "TaskUploadType",
  TASK_DATE_FILTER_TYPE = "TaskDateFilterType"
}
