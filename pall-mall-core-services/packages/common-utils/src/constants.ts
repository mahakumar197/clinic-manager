export enum FileType {
  IMAGE = 'image',
  PDF = 'pdf',
  DOC = 'doc',
  AUDIO = 'audio',
  VIDEO = 'video',
  AUDIOMPEG = 'audio/mpeg',
  VIDEOMP4 = 'video/mp4',
  VOICE_NOTE = 'voice_note',
}

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  VOICE_NOTE = 'voice_note',
}

export enum MessageVisibility {
  PATIENT = 'patient',
  INTERNAL = 'internal',
}

export enum ThreadStatus {
  OPEN = 'open',
  CLOSED = 'closed',
  DELETED = 'deleted',
}

export enum TaskPhase {
  PRE_OP = 'Pre-Op',
  POST_OP = 'Post-Op',
  CONSULTATION = 'Consultation',
}

export enum TaskCategory {
  FORM_RESPONSE = 'Form Response',
  WATCH_CONTENT = 'Watch Content',
  E_SIGNATURE = 'E Signature',
  FILE_UPLOAD = 'File Upload',
}

export enum TaskAction {
  TASK_CREATED = 'Task Created',
  TASK_UPDATED = 'Task Updated',
  TASK_DELETED = 'Task Deleted',
  TASK_REASSIGN = 'Task Reassign',
  TASK_REVOKED = 'Task Revoked',
}

export enum TaskStatus {
  PENDING = 'Pending',
  IN_PROGRESS = 'Inprogress',
  COMPLETED = 'Completed',
  OVERDUE = 'Overdue',
  DELETED = 'Deleted',
}

export enum ProcedureType {
  Rhinoplasty = 'Rhinoplasty',
  BreastAugmentation = 'Breast augmentation and uplift (mastopexy)',
  Liposuction = 'Liposuction',
  Facelift = 'Facelift',
  Blepharoplasty = 'Blepharoplasty',
  Otoplasty = 'Otoplasty',
  TummyTuck = 'Tummy Tuck',
}

export enum TaskStatusId {
  PENDING = 24,
  IN_PROGRESS = 25,
  COMPLETED = 26,
  OVERDUE = 27,
  DELETED = 147,
}

export enum TaskCategoryId {
  FORM_RESPONSE = 16,
  WATCH_CONTENT = 17,
  E_SIGNATURE = 18,
  FILE_UPLOAD = 19,
}

export enum webhookPatientPhaseId {
  GUEST = 1,
  CONSULTATION = 2,
  PRE_OP = 3,
  POST_OP = 4,
}

export enum TaskPhaseId {
  PRE_OP = 13,
  POST_OP = 14,
  CONSULTATION = 15,
}
export enum PatientPhaseId {
  Guest = 140,
  Consultation = 141,
  PRE_OP = 142,
  POST_OP = 143,
}

export enum recoveryFormIds {
  DAYS_1_TO_14 = 'e4a9dbe8-d35c-44d3-bf5d-b96229fabacd',
  WEEKS_3_TO_12 = 'f48392f9-2a88-4b6a-a0bc-62f1169a8e37',
  MONTHS_4_TO_12 = '126386da-f2c1-44a2-b3f6-c34a5641aa8d',
}

export enum RatingsQuestionIds {
  DAYS_1_TO_14 = 'f10691cb-44bd-4264-884e-7c8b79fa63f2',
  WEEKS_3_TO_12 = '334bc5cf-a44a-47d2-885f-b90a5d85e478',
  MONTHS_4_TO_12 = 'ca4c17f4-e9a5-4b9c-885b-c2d6dd473c1c',
}

export enum FormPriority {
  HIGH = 'High',
  MID = 'Mid',
  LOW = 'Low',
}

export enum FormApprovalStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
}

export enum FormFlags {
  PENDING = 'Pending',
  COMPLETED = 'Completed',
  URGENT = 'Urgent',
}

export enum FormType {
  QUIZ = 'Quiz',
  CONCERN = 'Concent',
  PRE_OP_ASSESSMENT = 'Pre-OP Assessment',
  HEALTH_QUESTIONNAIRE = 'Health Questionnaire',
  RECOVERY_FORM = 'Recovery Form',
}

export enum TaskSubmissionType {
  E_SIGNATURE = 'e_signature',
  FILE_UPLOAD = 'file_upload',
}

export enum ProcedureTypeId {
  Rhinoplasty = 28,
  BreastAugmentation = 29,
  Liposuction = 30,
  Facelift = 31,
  Blepharoplasty = 32,
  Otoplasty = 33,
  TummyTuck = 34,
}

export const WebhookToPatientPhaseMap: Record<
  webhookPatientPhaseId,
  PatientPhaseId
> = {
  [webhookPatientPhaseId.GUEST]: PatientPhaseId.Guest,
  [webhookPatientPhaseId.CONSULTATION]: PatientPhaseId.Consultation,
  [webhookPatientPhaseId.PRE_OP]: PatientPhaseId.PRE_OP,
  [webhookPatientPhaseId.POST_OP]: PatientPhaseId.POST_OP,
};

export const TASK_STATUS_MAP: Record<TaskStatus, number> = {
  [TaskStatus.PENDING]: TaskStatusId.PENDING,
  [TaskStatus.IN_PROGRESS]: TaskStatusId.IN_PROGRESS,
  [TaskStatus.COMPLETED]: TaskStatusId.COMPLETED,
  [TaskStatus.OVERDUE]: TaskStatusId.OVERDUE,
  [TaskStatus.DELETED]: TaskStatusId.DELETED,
};

export const TASK_CATEGORY_MAP: Record<TaskCategory, number> = {
  [TaskCategory.FORM_RESPONSE]: TaskCategoryId.FORM_RESPONSE,
  [TaskCategory.WATCH_CONTENT]: TaskCategoryId.WATCH_CONTENT,
  [TaskCategory.E_SIGNATURE]: TaskCategoryId.E_SIGNATURE,
  [TaskCategory.FILE_UPLOAD]: TaskCategoryId.FILE_UPLOAD,
};

export const TASK_PHASE_MAP: Record<TaskPhase, number> = {
  [TaskPhase.PRE_OP]: TaskPhaseId.PRE_OP,
  [TaskPhase.POST_OP]: TaskPhaseId.POST_OP,
  [TaskPhase.CONSULTATION]: TaskPhaseId.CONSULTATION,
};

export const TASK_PHASEID_MAP: Record<number, TaskPhase> = {
  [TaskPhaseId.PRE_OP]: TaskPhase.PRE_OP,
  [TaskPhaseId.POST_OP]: TaskPhase.POST_OP,
  [TaskPhaseId.CONSULTATION]: TaskPhase.CONSULTATION,
};

export const PROCEDURE_TYPE_MAP: Record<ProcedureType, number> = {
  [ProcedureType.Rhinoplasty]: ProcedureTypeId.Rhinoplasty,
  [ProcedureType.BreastAugmentation]: ProcedureTypeId.BreastAugmentation,
  [ProcedureType.Liposuction]: ProcedureTypeId.Liposuction,
  [ProcedureType.Facelift]: ProcedureTypeId.Facelift,
  [ProcedureType.Blepharoplasty]: ProcedureTypeId.Blepharoplasty,
  [ProcedureType.Otoplasty]: ProcedureTypeId.Otoplasty,
  [ProcedureType.TummyTuck]: ProcedureTypeId.TummyTuck,
};

export enum ScreenId {
  FORM_RESPONSE = '0001',
  WATCH_CONTENT = '0002',
  E_SIGNATURE = '0003',
  FILE_UPLOAD = '0004',
}

export enum MimeType {
  JPEG = 'image/jpeg',
  JPG = 'image/jpg',
  PDF = 'application/pdf',
  DOC = 'application/msword',
  XLS = 'application/vnd.ms-excel',
  PPT = 'application/vnd.ms-powerpoint',
  TXT = 'text/plain',
  CSV = 'text/csv',
  MP4 = 'video/mp4',
  MPEG = 'video/mpeg',
  MP3 = 'audio/mpeg',
  WAV = 'audio/wav',
}

export enum ProcedureModel {
  FACE = 'face',
  MEN = 'men',
  BREAST = 'breast',
  BODY = 'body',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

export enum ProcedureStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum ImageCount {
  SINGLE = 'single',
  MULTIPLE = 'multiple',
}

export enum ImageCountId {
  SINGLE = 87,
  MULTIPLE = 88,
}

export enum ContentType {
  IMAGE = 'image',
  VIDEO = 'video',
  BLOG = 'blog',
  ELEARNING = 'elearning',
}

export enum ContentStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export enum StarStatus {
  Starred = 'starred',
  Unstarred = 'unstarred',
}
export enum FlagStatus {
  Flagged = 'flagged',
  Unflagged = 'unflagged',
}

export enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  ALL = 'all',
  FLAGGED = 'flagged',
  STARRED = 'starred',
  UNREAD = 'unread',
  ARCHIVED = 'archived',
  DELETED = 'deleted',
}

export enum roleType {
  ADMIN = 'admin',
  PATIENT = 'patient',
  DOCTOR = 'doctor',
  STAFF = 'staff',
  NURSE = 'nurse',
  COORDINATOR = 'coordinator',
  MANAGER = 'manager',
  MARKETING = 'marketing',
  SURGEON = 'surgeon',
}

export enum roleTypeId {
  ADMIN = 83,
  PATIENT = 84,
  DOCTOR = 85,
  STAFF = 86,
  NURSE = 5,
}

export enum DateFilterType {
  LAST_30_DAYS = 'LAST_30_DAYS',
  LAST_MONTH = 'LAST_MONTH',
  LAST_YEAR = 'LAST_YEAR',
  CUSTOM = 'CUSTOM',
}

export enum TriggerEvent {
  MESSAGE_RECEIVED = 'MESSAGE_RECEIVED',
  TASK_CREATED = 'TASK_CREATED',
  TASK_OVERDUE = 'TASK_OVERDUE',
  FORM_SUBMITTED = 'FORM_SUBMITTED',
  CONTENT_PUBLISHED = 'CONTENT_PUBLISHED',
  DAILY_AT_TIME = 'DAILY_AT_TIME',
  WEEKLY_ON_DAY = 'WEEKLY_ON_DAY',
}

export enum TriggerEventId {
  MESSAGE_RECEIVED = 65,
  TASK_CREATED = 66,
  TASK_OVERDUE = 67,
  FORM_SUBMITTED = 68,
  CONTENT_PUBLISHED = 69,
  DAILY_AT_TIME = 70,
  WEEKLY_ON_DAY = 71,
}

export const TRIGGER_EVENT_MAP: Record<TriggerEventId, TriggerEvent> = {
  [TriggerEventId.MESSAGE_RECEIVED]: TriggerEvent.MESSAGE_RECEIVED,
  [TriggerEventId.TASK_CREATED]: TriggerEvent.TASK_CREATED,
  [TriggerEventId.TASK_OVERDUE]: TriggerEvent.TASK_OVERDUE,
  [TriggerEventId.FORM_SUBMITTED]: TriggerEvent.FORM_SUBMITTED,
  [TriggerEventId.CONTENT_PUBLISHED]: TriggerEvent.CONTENT_PUBLISHED,
  [TriggerEventId.DAILY_AT_TIME]: TriggerEvent.DAILY_AT_TIME,
  [TriggerEventId.WEEKLY_ON_DAY]: TriggerEvent.WEEKLY_ON_DAY,
};

export enum NotificationChannel {
  IN_APP = 'IN_APP',
  EMAIL = 'EMAIL',
  DIGEST = 'DIGEST',
  PUSH = 'PUSH',
}

export enum EscalationCondition {
  NOT_APPROVED = 'NOT_APPROVED',
  NO_RESPONSE = 'NO_RESPONSE',
  TASK_OVERDUE = 'TASK_OVERDUE',
}

export enum EscalationConditionId {
  NOT_APPROVED = 127,
  NO_RESPONSE = 128,
  TASK_OVERDUE = 129,
}

export const ESCALATION_CONDITION_MAP: Record<
  EscalationConditionId,
  EscalationCondition
> = {
  [EscalationConditionId.NOT_APPROVED]: EscalationCondition.NOT_APPROVED,
  [EscalationConditionId.NO_RESPONSE]: EscalationCondition.NO_RESPONSE,
  [EscalationConditionId.TASK_OVERDUE]: EscalationCondition.TASK_OVERDUE,
};

export enum ELearningContentType {
  E_LEARNING = 'E-Learning',
  BLOGS = 'Blogs',
  VIDEO = 'Our Video',
  IMAGES = 'Our Image',
}

export enum MobileComponentType {
  BASICS = 'basicVideoComponent',
  BLOGS = 'blogsComponent',
  VIDEO = 'ourVideoComponent',
  IMAGES = 'ourImageComponent',
}

export enum EscalationAction {
  ALERT_MANAGER = 'Alert Manager',
  ALERT_ADMIN = 'Alert Admin',
  ALERT_COORDINATOR = 'Alert Coordinator & Manager',
}

export enum EscalationActionId {
  ALERT_MANAGER = 117,
  ALERT_ADMIN = 118,
  ALERT_COORDINATOR = 119,
}

export const ESCALATION_ACTION_MAP: Record<
  EscalationActionId,
  EscalationAction
> = {
  [EscalationActionId.ALERT_MANAGER]: EscalationAction.ALERT_MANAGER,
  [EscalationActionId.ALERT_ADMIN]: EscalationAction.ALERT_ADMIN,
  [EscalationActionId.ALERT_COORDINATOR]: EscalationAction.ALERT_COORDINATOR,
};

export const PATIENT_PHASE_TO_TASK_PHASE_MAP: Partial<
  Record<PatientPhaseId, TaskPhaseId>
> = {
  [PatientPhaseId.Consultation]: TaskPhaseId.CONSULTATION,
  [PatientPhaseId.PRE_OP]: TaskPhaseId.PRE_OP,
  [PatientPhaseId.POST_OP]: TaskPhaseId.POST_OP,
};

export const TASK_PHASE_TO_PATIENT_PHASE_MAP: Partial<
  Record<TaskPhaseId, PatientPhaseId>
> = {
  [TaskPhaseId.CONSULTATION]: PatientPhaseId.Consultation,
  [TaskPhaseId.PRE_OP]: PatientPhaseId.PRE_OP,
  [TaskPhaseId.POST_OP]: PatientPhaseId.POST_OP,
};

export enum FormStatus {
  DRAFT = 'Draft',
  SUBMITTED = 'Submitted',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
}

export enum QuestionType {
  TEXT = 'text',
  NUMBER = 'number',
  EMAIL = 'email',
  PHONE = 'phone',
  DATE = 'date',
  TIME = 'time',
  DATETIME = 'datetime',
  RADIO = 'radio',
  CHECKBOX = 'checkbox',
  SELECT = 'select',
  TEXTAREA = 'textarea',
  FILE = 'file',
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  LOCATION = 'location',
  SIGNATURE = 'signature',
  SLIDER = 'slider',
  RATING = 'rating',
}

export enum NodeType {
  QUESTION = 'Question',
  SECTION = 'Section',
  INFO = 'Info',
  CALCULATED = 'Calculated',
}
export enum ESCALATION_MESSAGES {
  CREATED = 'Escalation rule created successfully',
  UPDATED = 'Escalation rule updated successfully',
  DELETED = 'Escalation rule deleted successfully',
  FETCHED = 'Escalation rule fetched successfully',
}

export enum NOTIFICATION_MESSAGES {
  CREATED = 'Notification rule created successfully',
  UPDATED = 'Notification rule updated successfully',
  DELETED = 'Notification rule deleted successfully',
  FETCHED = 'Notification rule fetched successfully',
  NOTIFICATIONS_FETCHED = 'Notifications fetched successfully',
}

export enum NOTIFICATION_EVENT_TYPE {
  MESSAGE_RECEIVED = 'MESSAGE_RECEIVED',
  TASK_CREATED = 'TASK_CREATED',
  TASK_OVERDUE = 'TASK_OVERDUE',
  FORM_SUBMITTED = 'FORM_SUBMITTED',
  CONTENT_PUBLISHED = 'CONTENT_PUBLISHED',
  DAILY_AT_TIME = 'DAILY_AT_TIME',
  WEEKLY_ON_DAY = 'WEEKLY_ON_DAY',
}

export const NOTIFICATION_EVENT_LABELS = {
  MESSAGE_RECEIVED: 'Message Received',
  TASK_CREATED: 'Task Created',
  TASK_OVERDUE: 'Task Overdue',
  FORM_SUBMITTED: 'Form Submitted',
  CONTENT_PUBLISHED: 'Content Published',
  DAILY_AT_TIME: 'Daily At Time',
  WEEKLY_ON_DAY: 'Weekly On Day',
};
