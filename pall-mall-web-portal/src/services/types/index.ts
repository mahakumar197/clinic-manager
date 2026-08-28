/**
 * Common API types and interfaces
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  error?: ApiError;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
}

// Auth related types
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
  device: string;
}

export interface VerifyOtpData {
  email: string;
  otp: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface UserSummary {
  id: string;
  userName: string;
  role: string;
}

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  userName?: string;
  profileImage?: string;
  phoneNumber?: string;
  dob?: string;
}

// Query params
export interface QueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
  search?: string;
  [key: string]: string | number | boolean | undefined;
}

/**
 * Pagination info from backend
 */
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// User list item
export interface UserListItem {
  id: string;
  userName: string;
  role: string;
  medicalData: {
    procedureType?: string;
    procedureTypeId?: number;
    phase?: string;
    phaseId?: number;
  };
}

// Task service

/**
 * Single task entity
 * Mirrors backend task object
 */
export interface Task {
  id: string;
  patientId: string;
  patientName: string;
  procedureType: string;
  taskTemplate: string;
  taskName: string;
  taskDescription: string;
  phase: string;
  category: string;
  zohoform?: string | null;
  contentId?: string | null;
  assignedTo: string;
  dueDate: string; // ISO date string
  status: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Status counts returned by backend
 * Example: { Pending: 3, Completed: 5 }
 */
export interface TaskStatusCounts {
  [status: string]: number;
}

/**
 * API response shape after normalization
 * (what services return to hooks)
 */

// FOR TASK LIST
export interface TasksResponse {
  tasks: Task[];
  statusCounts: TaskStatusCounts;
  pagination: Pagination;
}

// export interface TaskDetails {
//   id: string;
//   patientId: string;
//   procedureType: string;
//   taskTemplate: string;
//   taskName: string;
//   patientName: string;
//   taskDescription: string;
//   phase: string;
//   category: string;
//   zohoform?: string | null;
//   contentId?: string | null;
//   assignedTo: string;
//   dueDate: string;
//   status: string;
//   isActive: boolean;
//   createdAt: string;
//   updatedAt: string;

//   patient?: UserSummary;
//   assignedUser?: UserSummary;
// }

export interface TaskDetails {
  id: string;
  patient_id: string;
  procedure_type: string;
  task_template: string | null;
  task_name: string;
  task_description: string;
  phase: string;
  category: string;
  zohoform: string | null;
  content_id: string | null;
  assigned_to: string;
  due_date: string;
  status: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  patient: User;
  assignedUser: User;
}

// export interface TaskActivity {
//   id: string;
//   taskId: string;
//   action: string;
//   isActive: boolean;
//   performedBy: string;
//   performedAt: string;
//   performedByUser: UserSummary;
// }

export interface TaskActivity {
  id: string;
  action: string;
  performed_at: string;
  performedByUser: User;
}

// export interface TaskAttachment {
//   id: string;
//   taskId: string;
//   filename: string;
//   s3Key: string;
//   mimeType: string;
//   inComment: boolean;
//   isActive: boolean;
//   uploadedBy: string;
//   uploadedAt: string;
//   uploadedByUser: UserSummary;
// }

export interface TaskAttachment {
  id?: string;
  filename?: string;
  file_url?: string;
  s3_key?: string;
  uploaded_at?: string;
}

// export interface TaskComment {
//   id: string;
//   taskId: string;
//   comment: string;
//   attachmentId?: string;
//   commentedBy: string;
//   isActive: boolean;
//   commentedAt: string;
//   updatedAt: string;
//   commentedByUser: UserSummary;
//   attachment?: TaskAttachment;
// }

export interface TaskComment {
  id: string;
  comment: string;
  created_at: string;
  createdByUser: User;
}
export interface TaskAssignee {
  id: string;
  assigned_at: string;
  assigneeUser: User;
  assignedByUser: User;
}

// FOR TASK DETAILS

export interface TaskDetailsResponse {
  task: TaskDetails;
  activity: TaskActivity[];
  comments: TaskComment[];
  assignees: TaskAssignee[];
  attachments: TaskAttachment[];
}

//CONTENT UPLOAD

export type ContentType = "image" | "video" | "blog" | "elearning";
// Single content item
export interface Content {
  blogHeader: string;
  imgCount?: number;
  createdAt:  string;
  updatedAt: string;
  thumbnailUrl?: string;
  img_urls: any;
  video_url: string;
  id: string;
  title: string;
  description: string;
  content: string;
  // type: string;
  type: ContentType;
  thumbnail_key?: string;
  thumbnail_url?: string;
  thumbnail?: string;
  content_key?: string[];
  content_url?: string;
  status: string;
  viewCount: number;
  likeCount: number;
  publishedAt?: string | null;
  created_at: string;
  updated_at: string;
  eLearnings: any;
  img_count?: number;
  blog_header?: string;

  procedureId?: string;
  procedure?: {
    id: string;
    title: string;
    type: string;
    status: string;
    thumbnailUrl: string;
    description: string;
  };
}

// Content count summary
export interface ContentCounts {
  total: number;
  image: number;
  video: number;
  blog: number;
  elearning: number;
}

// Final content service response
export interface ContentListResponse {
  contents: Content[];
  counts: ContentCounts;
  pagination: Pagination;
}

// --------------------
// PROCEDURE TYPES
// --------------------

export interface Procedure {
  id: string;
  title: string;
  description: string;
  contentCount: number;
  type: string;
  thumbnailUrl?: string;
  thumbnail?: string;
  videoUrl?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface ProcedureStatusCounts {
  total: number;
  draft: number;
  published: number;
  archived?: number;
}

export interface ProcedureListResponse {
  procedures: Procedure[];
  statusCounts: ProcedureStatusCounts;
  pagination: Pagination;
}
// Payload for creating a new task
export interface CreateTaskPayload {
  patientId: string;
  procedureType: number | null;
  taskTemplate?: string | null;
  taskName: string;
  taskDescription: string;
  // phase: number;
  category: number;
  zohoform?: string | null;
  contentId?: string | null;
  assignedTo: string;
  dueDate: string;
}

/**
 * Parameters for fetching task list
 */
export interface GetTasksParams {
  page?: number;
  limit?: number;
  search?: string;
  procedureType?: string;
  status?: string;
  phases?: string;
  dueDate?: string;
  startDate?: string;
  endDate?: string;
  dateFilter?: string;
}

/**
 * Single task item in export response
 */
export interface TaskExportData {
  task_id: string;
  patient_name: string;
  procedure_type: string;
  phase: string;
  task_name: string;
  status: string;
  due_date: string;
  assigned_to: string;
}

/**
 * Response from task export API
 */
export interface TaskExportResponse {
  success: boolean;
  total_count: number;
  data: TaskExportData[];
}

export interface TaskDetailsResponse {
  task: TaskDetails;
  activity: TaskActivity[];
  comments: TaskComment[];
  assignees: TaskAssignee[];
  attachments: TaskAttachment[];
}

export interface CreateCommentPayload {
  taskId: string;
  comment: string;
  attachmentId?: string;
}

export interface CreateTaskAttachmentPayload {
  taskId: string;
  filename: string;
  s3Key: string;
  mimeType: string;
  inComment: boolean;
}

// --------------------
// NOTIFICATION TYPES
// --------------------

export interface NotificationRecipients {
  roles: string[];
  users: string[];
  assignedTo: boolean;
}

export interface TaskAnalyticsMetrics {
  totalApprovals: {
    total: number;
    percentageChange: number;
    comparisonPeriod: string;
  };
  thisWeek: {
    total: number;
    percentageChange: number;
    comparisonPeriod: string;
  };
  avgResponseTime: {
    averageHours: number;
    percentageChange: number;
    comparisonPeriod: string;
  };
  outstandingForms: {
    total: number;
    status: string;
  };
}

export interface NotificationRule {
  id: string;
  name: string;
  trigger_event: number;
  channels: ("EMAIL" | "IN_APP" | "DIGEST")[];
  recipients: NotificationRecipients;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  trigger_event_label: string;
}

export interface GetNotificationRulesParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: "asc" | "desc";
  is_active?: boolean;
  trigger_event?: number;
  [key: string]: string | number | boolean | undefined;
}

export interface NotificationRulesResponse {
  rules: NotificationRule[];
  total: number;
  pagination: Pagination;
}

export interface NotificationRuleDetailsResponse {
  rule: NotificationRule | null;
}

export interface CreateNotificationRulePayload {
  name: string;
  triggerEvent: number; //  camelCase, not snake_case
  channels: ("EMAIL" | "IN_APP" | "DIGEST")[];
  recipients: {
    roles: string[];
    // users: string[];
    assignedTo: boolean;
  };
}

// Add this to your types file (around where other common types are defined)

export interface DropdownOption {
  label: string;
  value: number;
  beValue: string;
  enValue?: string | null;
}

// export interface UpdateNotificationRulePayload {
//   name?: string;
//   trigger_event?: number;
//   channels?: string[];
//   recipients?: NotificationRecipients;
//   is_active?: boolean;
// }

// --------------------
// ESCALATION TYPES
// --------------------

export interface EscalationRecipients {
  roles: number[];
  users: string[];
  assignedTo: boolean;
}

export interface EscalationRule {
  escalation_action: any;
  id: string;
  name: string;
  base_trigger_event: number;
  condition: number;
  action: number;
  channels: ("EMAIL" | "IN_APP" | "DIGEST")[];
  recipients: EscalationRecipients;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  base_trigger_event_label: string;
}

export interface GetEscalationRulesParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: "asc" | "desc";
  is_active?: boolean;
  base_trigger_event?: number;
  [key: string]: string | number | boolean | undefined;
}

export interface EscalationRulesResponse {
  rules: EscalationRule[];
  total: number;
  pagination: Pagination;
}

export interface EscalationRuleDetailsResponse {
  rule: EscalationRule | null;
}

export interface CreateEscalationRulePayload {
  name: string;
  baseTriggerEvent: number;
  condition: number;
  action: number;
  channels: ("EMAIL" | "IN_APP" | "DIGEST")[];
  recipients: EscalationRecipients;
  is_active?: boolean;
}

export interface UpdateEscalationRulePayload {
  name?: string;
  baseTriggerEvent?: number;
  condition?: number;
  action?: number;
  channels: ("EMAIL" | "IN_APP" | "DIGEST")[];
  recipients?: EscalationRecipients;
  is_active?: boolean;
}
export interface NotificationRecipient {
  roles: string[];
  users: string[];
  assignedTo: boolean;
}

export interface NotificationRuleListResponse {
  total: number;
  data: NotificationRule[];
}

export interface NotificationRuleDetailsResponse {
  rule: NotificationRule | null;
}

export interface UpdateNotificationRulePayload {
  name: string;
  channels: ("EMAIL" | "IN_APP" | "DIGEST")[];
  recipients: {
    roles: string[];
    users: string[];
  };
  is_active: boolean;
}

// USER MANAGEMENT TYPES
// --------------------

/**
 * User management dashboard statistics
 */
export interface UserManagementStats {
  total: number;
  active: number;
  twoFAEnabled: number;
  suspended: number;
}

/**
 * Role item from permissions API
 */
export interface RoleItem {
  key: string;
  label: string;
}

/**
 * Module item from permissions API
 */
export interface ModuleItem {
  key: string;
  label: string;
}

/**
 * Permissions map - roleKey -> { moduleName: boolean }
 */
export interface PermissionsMap {
  [roleKey: string]: {
    [moduleName: string]: boolean;
  };
}

/**
 * Role permissions list response
 */
export interface RolePermissionsResponse {
  roles: RoleItem[];
  modules: ModuleItem[];
  permissions: PermissionsMap;
}

/**
 * Update permission payload
 */
export interface UpdatePermissionPayload {
  role: string;
  module: string;
  enabled: boolean;
}

/**
 * User list item from users API
 */
export interface UserListItem {
  userId: string;
  fullName: string;
  email: string;
  roleLabel: string;
  roleId: string;
  status: string;
  lastLogin: string | null;
  two_fa_enabled: boolean;
}

/**
 * User list filters
 */
export interface UserListFilters {
  search?: string;
  role?: string;
  status?: string;
}

/**
 * User list response
 */
export interface UserListResponse {
  users: UserListItem[];
  pagination: Pagination;
}

/**
 * Suspend user payload
 */
export interface SuspendUserPayload {
  userId: string;
  duration: string;
  reason: string;
}

/**
 * Create user payload
 */
export interface CreateUserPayload {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  department: string;
  password: string;
  twoFaEnabled: boolean;
  sendWelcomeEmail: boolean;
  phoneNumber?: string;
  additionalNotes?: string;
}

/**
 * User details response from view API
 */
export interface UserDetails {
  userId: string;
  userName: string;
  email: string;
  phoneNumber: string;
  departmentId: string;
  deptLabel: string;
  roleId: string;
  roleLabel: string;
  joinDate: string | null;
  lastLogin: string | null;
  usersActiveDays: number;
  additionalNotes: string;
  status: string;
  twoFaEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Update user payload
 */
export interface UpdateUserPayload {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  phoneNumber?: string;
  role: string;
  department: string;
  twoFaEnabled: boolean;
  additionalNotes?: string;
}

/**
 * User permissions from profile API
 */
export interface UserPermissions {
  messages: boolean;
  tasks: boolean;
  approvals: boolean;
  content_upload: boolean;
  "reporting_&_analytics": boolean;
  user_management: boolean;
  rule_notification: boolean;
  patient_tracker: boolean;
  notifications: boolean;
}

/**
 * User profile response from /users/profile API
 */
export interface UserProfileData {
  user: {
    id: string;
    userName: string;
    email: string;
    phoneNumber: string;
    role: string;
    status: string;
  };
  permissions: UserPermissions;
}

export interface UserProfileResponse extends ApiResponse<UserProfileData> {}

// --------------------
// ADMIN APPROVAL TYPES
// --------------------

// FORM TAB

export interface ApprovalsCounts {
  [counts: string]: number;
}

export interface ApprovalList {
  id: string;
  submitted_at: string;
  form: {
    name: string | null;
    priority: string | null;
  } | null;
  patient: {
    userName: string | null;
  } | null;
}
export interface ApprovalDetails {
  id: string;
  submitted_at: string | null;
  submitted_by: string | null;
  status: string | null;
  form: {
    id: string | null;
    name: string | null;
    priority: string | null;
    form_type: string | null;
  } | null;
  patient: {
    userName: string | null;
    phoneNumber: string | null;
    dob: string | null;
    email: string | null;
  } | null;
  assigned_to_user: {
    userName: string | null;
    phoneNumber: string | null;
    dob: string | null;
    email: string | null;
    role: string | null;
  } | null;
}
export interface ApprovalsCommentsPayload {
  submissionId: string;
  comment: string;
}
export interface ApprovalCommentUser {
  userName: string | null;
  role: string | null;
}
export interface ApprovalsGetComments {
  id: string;
  submission_id: string;
  comment: string | null;
  commented_at: string | null;
  commentedByUser: ApprovalCommentUser | null;
}

export interface ApproveOrRejectPayload {
  formId: string;
  submissionId: string;
  isApproved: boolean | null;
  isRejected: boolean | null;
  comment?: {
    comment: string | null;
  } | null;
}

export interface ApprovalFormAnswer {
  questionId: string;
  question: string;
  questionType:
    | "text"
    | "select"
    | "radio"
    | "checkbox"
    | "date"
    | "email"
    | "phone"
    | "file"
    | "rating"
    | "slider";
  displayOrder: number;
  options: string[] | null;
  answer: string[] | null;
  nodeType: string | null;
}

export interface ApprovalFormItem {
  submissionId: string;
  status: string;
  submittedAt: string;
  signature: string | null;
  answers: ApprovalFormAnswer[];
}

export interface ApprovalFormResponse {
  data: ApprovalFormItem[];
}

export interface ApprovalsResponse {
  approvals: ApprovalList[];
  cardsCounts: ApprovalsCounts;
}


// UPLOAD TAB

export interface UploadAdminApprovalsCounts {
  [counts: string]: number;
}

export interface  UploadAdminApprovalList {
  id: string;
  submitted_at: string;
  type: string;
  task: {
    task_name: string | null;
  } | null;
  patient: {
    userName: string | null;
  } | null;
}
export interface  UploadAdminApprovalsResponse {
  approvals: UploadAdminApprovalList[];
  cardsCounts: UploadAdminApprovalsCounts;
}

export interface UploadApprovalDetails {
  id: string;
  submitted_at: string | null;
  submitted_by: string | null;
  type: string | null;
  status: string | null;
  task: {
    id: string | null;
    task_name: string | null;
  } | null;
  patient: {
    userName: string | null;
    phoneNumber: string | null;
    dob: string | null;
    email: string | null;
  } | null;
  assigned_to_user: {
    userName: string | null;
    role: string | null;
  } | null;
}

export interface UploadApprovalsCommentsPayload {
  submissionId: string;
  comment: string;
}
export interface UploadApprovalCommentUser {
  userName: string | null;
  role: string | null;
}
export interface UploadApprovalsGetComments {
  id: string;
  taskSubmissionId: string;
  comment: string | null;
  commented_at: string | null;
  commentedByUser: UploadApprovalCommentUser | null;
}

export interface UploadApproveOrRejectPayload {
  taskId: string;
  submissionId: string;
  isApproved: boolean | null;
  isRejected: boolean | null;
  comment?: {
    comment: string | null;
  } | null;
}

export interface ViewAdminUpload {
  submission: {
    id: string;
    type: string;
    status: string;
    submitted_at: string;
  };
  type: string;
  assets: Array<{
    id: string;
    signature?: string;
    file_content?: string;
    file_url?: string;
    [key: string]: any;
  }>;
}


// --------------------
// USER APPROVAL TYPES
// --------------------

//FORM TAB

export interface UserApprovalsCounts {
  [counts: string]: number;
}

export interface UserApprovalList {
  id: string;
  submitted_at: string;
  form: {
    name: string | null;
  } | null;
  patient_details: {
    userName: string | null;
  } | null;
  form_flag: string | null;
}

export interface UserApprovalDetails {
  approval: {
    id: string;
    submitted_at: string | null;
    submitted_by: string | null;
    status: string | null;
    form: {
      id: string | null;
      name: string | null;
      priority: string | null;
      form_type: string | null;
    } | null;
  } | null;
  patient: {
    userName: string | null;
    phoneNumber: string | null;
    dob: string | null;
    email: string | null;
  } | null;
  form_flag: string | null;
}

export interface UserApprovalsCommentsPayload {
  submissionId: string;
  comment: string;
}
export interface UserApprovalCommentUser {
  userName: string | null;
  role: string | null;
}
export interface UserApprovalsGetComments {
  id: string;
  submission_id: string;
  comment: string | null;
  commented_at: string | null;
  commentedByUser: UserApprovalCommentUser | null;
}

export interface UserApproveOrRejectPayload {
  formId: string;
  submissionId: string;
  status: string;
}
export interface UserApprovalsResponse {
  approvals: UserApprovalList[];
  cardsCounts: UserApprovalsCounts;
}


//UPLOAD TAB

export interface UploadUserApprovalsCounts {
  [counts: string]: number;
}

export interface  UploadUserApprovalList {
  id: string;
  submitted_at: string;
  type: string;
  task: {
    task_name: string | null;
  } | null;
  patient: {
    userName: string | null;
  } | null;
}
export interface  UploadUserApprovalsResponse {
  approvals: UploadUserApprovalList[];
  cardsCounts: UploadUserApprovalsCounts;
}

export interface UploadUserApprovalDetails {
  id: string;
  submitted_at: string | null;
  submitted_by: string | null;
  type: string | null;
  status: string | null;
  task: {
    id: string | null;
    task_name: string | null;
  } | null;
  patient: {
    userName: string | null;
    phoneNumber: string | null;
    dob: string | null;
    email: string | null;
  } | null;
  assigned_to_user: {
    userName: string | null;
    role: string | null;
  } | null;
}

export interface UploadUserCommentsPayload {
  submissionId: string;
  comment: string;
}
export interface UploadUserCommentUser {
  userName: string | null;
  role: string | null;
}
export interface UploadUserGetComments {
  id: string;
  taskSubmissionId: string;
  comment: string | null;
  commented_at: string | null;
  commentedByUser: UploadApprovalCommentUser | null;
}

export interface UploadUserApproveOrRejectPayload {
  taskId: string;
  submissionId: string;
  isApproved: boolean | null;
  isRejected: boolean | null;
  comment?: {
    comment: string | null;
  } | null;
}

export interface ViewUserUpload {
  submission: {
    id: string;
    type: string;
    status: string;
    submitted_at: string;
  };
  type: string;
  assets: Array<{
    id: string;
    signature?: string;
    file_content?: string;
    file_url?: string;
    [key: string]: any;
  }>;
}

// --------------------
// NOTIFICATION CARDS/LIST TYPES
// --------------------

/**
 * Single notification item from the list API
 */
export interface NotificationItem {
  id: string;
  type: "in_app" | "push" | "email";
  recipient: string;
  userId: string;
  subject: string;
  content: string;
  status: "delivered" | "pending" | "failed";
  templateId: string | null;
  templateData: string | null;
  metadata: string | null;
  externalId: string | null;
  errorMessage: string | null;
  sentAt: string | null;
  deliveredAt: string | null;
  retryCount: number;
  notificationType: string | null;
  priority: "urgent" | "normal" | "high";
  notificationStatus: "read" | "unread";
  webUserId: string | null;
  patientName: string | null;
  patientReference: string | null;
  category: string | null;
  relatedEntityId: string | null;
  dueAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Notification stats from the list API
 */
export interface NotificationStats {
  unreadCount: number;
  totalCount: number;
  urgentCount: number;
}

/**
 * Full response from notification list API
 */
export interface NotificationListResponse {
  notifications: NotificationItem[];
  unreadCount: number;
  totalCount: number;
  urgentCount: number;
}
