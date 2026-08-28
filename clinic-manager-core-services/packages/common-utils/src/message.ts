export const MESSAGE_TEXT = {
  THREAD_CREATED: 'Thread created successfully',
  THREAD_FETCHED: 'Threads fetched successfully',
  THREAD_ARCHIVED: 'Thread archived successfully',
  THREAD_UNARCHIVED: 'Thread unarchived successfully',
  THREAD_ASSIGNED: 'Thread assigned successfully',

  MESSAGE_SENT: 'Message sent successfully',
  MESSAGE_FETCHED: 'Messages fetched successfully',
  MESSAGE_MARKED_READ: 'Messages marked as read',
  MESSAGE_MARKED_UNREAD: 'Messages marked as unread',
  THREAD_DELETED: 'Thread deleted successfully',

  INTERNAL_NOTE_ADDED: 'Internal note added successfully',
  ERROR_ROLE_NOT_ALLOWED: 'Role not allowed',
  ERROR_THREAD_NOT_FOUND: 'Thread not found',
  MESSAGE_UNSTARRED: 'Message unstarred successfully',
  MESSAGE_STARRED: 'Message starred successfully',
  MESSAGE_FLAGGED: 'Message flagged successfully',
  MESSAGE_UNFLAGGED: 'Message unflagged successfully',
  COUNTS_FETCHED: 'Message counts fetched successfully',
  THREAD_NOT_FOUND: 'Thread not found',
  ASSIGNED_USERS_FETCHED: 'Assigned users fetched successfully',
} as const;

export const TASK_MESSAGES = {
  TASK_CREATED: 'Task created successfully',
  TASK_FETCHED: 'Task fetched successfully',
  TASK_UPDATED: 'Task updated successfully',
  TASK_DELETED: 'Task deleted successfully',
  TASK_REASSIGN: 'Task reassigned successfully',
  TASK_ATTACHMENT_ADDED: 'Task attachment added successfully',
  TASK_ATTACHMENT_FETCHED: 'Task attachment fetched successfully',
  TASK_ATTACHMENT_DELETED: 'Task attachment deleted successfully',
  TASK_COMMENT_ADDED: 'Task comment added successfully',
  TASK_COMMENT_FETCHED: 'Task comment fetched successfully',
  TASK_COMMENT_UPDATED: 'Task comment updated successfully',
  TASK_COMMENT_DELETED: 'Task comment deleted successfully',
  TASK_TEMPLATE_CREATED: 'Task template created successfully',
  TASK_TEMPLATE_FETCHED: 'Task template fetched successfully',
  TASK_TEMPLATE_UPDATED: 'Task template updated successfully',
  TASK_TEMPLATE_DELETED: 'Task template deleted successfully',
  TASK_TEMPLATE_NOT_FOUND: 'Task template not found',
  TASK_TRACKED: 'Task tracked successfully',
  TASK_TRACK_FETCHED: 'Task track fetched successfully',
  THUMBNAILS_FETCHED: 'Thumbnails fetched successfully',
  TASK_FILE_UPLOADED: 'Task file uploaded successfully',
};

export const HOME_MESSAGES = {
  HOME_DATA_FETCHED: 'Home data fetched successfully',
};

export const FILTER_MESSAGES = {
  FILTER_ADDED: 'Filter added successfully',
  FILTER_FETCHED: 'Filter fetched successfully',
  FILTER_DELETED: 'Filter deleted successfully',
  FILTER_NOT_FOUND: 'Filter not found',
};

export const DROPDOWN_MESSAGES = {
  DROPDOWN_ADDED: 'Dropdown added successfully',
  DROPDOWN_FETCHED: 'Dropdown fetched successfully',
};

export const CONTENT_MESSAGES = {
  CONTENT_CREATED: 'Content created successfully',
  CONTENT_FETCHED: 'Content fetched successfully',
  CONTENT_UPDATED: 'Content updated successfully',
  CONTENT_DELETED: 'Content deleted successfully',
  CONTENT_REASSIGN: 'Content reassigned successfully',
  CONTENT_PUBLISHED_NOTIFICATION: 'has been published',
  PROCEDURE_CREATED: 'Procedure created successfully',
  PROCEDURE_FETCHED: 'Procedure fetched successfully',
};

export const AUTH_MESSAGES = {
  USER_DATA_FETCHED: 'User data fetched successfully',
  USER_DATA_NOT_FOUND: 'User data not found',
  NO_USER_IDS_PROVIDED: 'No user ids provided',

  SIGNUP_SUCCESS: 'Account created successfully',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  SOCIAL_LOGIN_SUCCESS: 'Social login successful',
  SOCIAL_SIGNUP_SUCCESS: 'Social account created successfully',

  USER_PROFILE_FETCHED: 'User profile fetched successfully',

  OTP_SENT: 'OTP sent successfully',
  OTP_RESENT: 'OTP resent successfully',
  OTP_VERIFIED: 'OTP verified successfully',

  FORGOT_PASSWORD_REQUESTED:
    'If an account exists, password reset instructions have been sent',
  PASSWORD_RESET_SUCCESS: 'Password reset successfully',
  PASSWORD_UPDATED_SUCCESS: 'Password updated successfully',

  TOKEN_REFRESHED: 'Session refreshed successfully',
  ACCESS_TOKEN_ISSUED: 'Access token issued successfully',
  SESSION_TERMINATED: 'Session terminated successfully',

  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_ALREADY_EXISTS: 'An account with this email already exists',
  ACCOUNT_NOT_VERIFIED: 'Account is not verified',
  ACCOUNT_DISABLED: 'Account is disabled',
  ACCOUNT_INACTIVE: 'Account is inactive',
  ACCOUNT_LOCKED:
    'Account is temporarily locked due to multiple failed login attempts',

  PASSWORD_REQUIRED_FOR_ROLE: 'Password is required for this user role',

  INVALID_OTP: 'Invalid or expired OTP',
  OTP_EXPIRED: 'OTP has expired',
  OTP_REQUIRED: 'OTP is required',
  OTP_ALREADY_USED: 'OTP has already been used',
  OTP_RATE_LIMITED: 'Too many OTP requests. Please try again later',

  PASSWORD_RESET_TOKEN_INVALID: 'Invalid or expired password reset token',
  PASSWORD_POLICY_VIOLATION: 'Password does not meet security requirements',
  PASSWORD_REUSE_NOT_ALLOWED:
    'New password must be different from previous passwords',

  ACCESS_TOKEN_EXPIRED: 'Access token expired',
  REFRESH_TOKEN_EXPIRED: 'Refresh token expired',
  TOKEN_INVALID: 'Invalid authentication token',
  REFRESH_TOKEN_INVALID: 'Invalid refresh token',
  REFRESH_TOKEN_MISSING: 'Refresh token not provided',

  SESSION_EXPIRED: 'Your session has expired, please login again',

  SOCIAL_EMAIL_NOT_PROVIDED:
    'Email not provided by social authentication provider',
  SOCIAL_ACCOUNT_NOT_LINKED: 'Social account is not linked to any user',

  UNAUTHORIZED: 'Authentication required',
  FORBIDDEN: 'You do not have permission to perform this action',
  NO_USERS_FOUND: 'No users found',

  TOO_MANY_ATTEMPTS: 'Too many attempts, please try again later',
  PATIENT_PHASE_UPDATED: 'Patient phase updated',
  DOCTOR_PATIENTS_LIST_RETRIEVED_SUCCESSFULLY:
    'Doctor patients list retrieved successfully',
} as const;

export const ELEARNING_MESSAGES = {
  ELEARNING_TYPES_FETCHED: 'Elearning types fetched successfully',
  ELEARNING_FETCHED: 'Elearning fetched successfully',
  ELEARNING_IMAGES_VIDEOS_FETCHED:
    'Elearning images and videos fetched successfully',
} as const;

export const FORM_APPROVALS_MESSAGES = {
  SUBMISSIONS_FETCHED: 'Submissions fetched successfully',
  SUBMISSION_APPROVED: 'Submission approved successfully',
  SUBMISSION_REJECTED: 'Submission rejected successfully',
  SUBMISSION_NOT_FOUND: 'Submission not found',
  SUBMISSION_ALREADY_APPROVED: 'Submission already approved',
  SUBMISSION_ALREADY_REJECTED: 'Submission already rejected',
  FORM_STATUS_UPDATED: 'Form status updated successfully',
  COMMENT_ADDED: 'Comment added successfully',
  COMMENTS_FETCHED: 'Comments fetched successfully',
  QUICK_RESPONSE_ADDED: 'Quick response added successfully',
  QUICK_RESPONSE_FETCHED: 'Quick responses fetched successfully',
} as const;

export const USER_MANAGEMENT_MESSAGES = {
  EMAIL_ALREADY_EXISTS: 'An account with this email already exists',
  PASSWORD_MISMATCH: 'Passwords do not match',
  USER_CREATED: 'User created successfully',
  USER_UPDATED: 'User updated successfully',
  USER_DATA_FETCHED: 'User data fetched successfully',
  PERMISSION_CREATED: 'Permission created successfully',
  PERMISSION_UPDATED: 'Permission updated successfully',
  PERMISSIONS_FETCHED: 'Permissions fetched successfully',
  USER_SUSPENDED: 'User suspended successfully',
  USER_NOT_FOUND: 'User not found',
  USER_UNSUSPENDED: 'User unsuspended successfully',
  USER_CARDS_FETCHED: 'User cards fetched successfully',
} as const;
export const USER_PROFILE_MESSAGES = {
  PROFILE_CREATED_UPDATED: 'User profile created/updated successfully',
  PROFILE_FETCHED: 'User profile fetched successfully',
} as const;
