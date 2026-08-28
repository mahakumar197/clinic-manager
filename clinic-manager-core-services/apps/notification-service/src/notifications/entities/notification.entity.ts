import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum NotificationType {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  IN_APP = 'in_app',
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  BOUNCED = 'bounced',
}

export enum WebNotificationType {
  RECOVERY_FORM = 'recovery_form',
  APPROVAL_REMINDER = 'approval_reminder',
  PATIENT_MESSAGE = 'patient_message',
  FOLLOW_UP_REMINDER = 'follow_up_reminder',
  SYSTEM_ALERT = 'system_alert',
  MESSAGE_RECEIVED = 'message_received',
  TASK_CREATED = 'task_created',
  TASK_OVERDUE = 'task_overdue',
  FORM_SUBMITTED = 'form_submitted',
  CONTENT_PUBLISHED = 'content_published',
}

export enum WebNotificationPriority {
  NORMAL = 'normal',
  URGENT = 'urgent',
}

export enum WebNotificationStatus {
  UNREAD = 'unread',
  READ = 'read',
  DISMISSED = 'dismissed',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column()
  recipient: string; // email, phone number, or device token

  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @Column()
  subject: string;

  @Column({ type: 'text' })
  content: string;

  @Column({
    type: 'enum',
    enum: NotificationStatus,
    default: NotificationStatus.PENDING,
  })
  status: NotificationStatus;

  @Column({ name: 'template_id', nullable: true })
  templateId: string;

  @Column({ name: 'template_data', type: 'jsonb', nullable: true })
  templateData: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: string;

  @Column({ name: 'external_id', nullable: true })
  externalId: string; // ID from external service (Sendgrid, Twilio, etc.)

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string;

  @Column({ name: 'sent_at', type: 'timestamp', nullable: true })
  sentAt: Date;

  @Column({ name: 'delivered_at', type: 'timestamp', nullable: true })
  deliveredAt: Date;

  @Column({ name: 'retry_count', default: 0 })
  retryCount: number;

  @Column({ name: 'notification_type', type: 'enum', enum: WebNotificationType, nullable: true })
  notificationType: WebNotificationType;

  @Column({
    type: 'enum',
    enum: WebNotificationPriority,
    default: WebNotificationPriority.NORMAL,
  })
  priority: WebNotificationPriority;

  @Column({
    name: 'notification_status',
    type: 'enum',
    enum: WebNotificationStatus,
    default: WebNotificationStatus.UNREAD,
  })
  notificationStatus: WebNotificationStatus;

  @Column({ name: 'web_user_id', type: 'uuid', nullable: true })
  webUserId: string; // owner of the web notification

  @Column({ name: 'patient_name', nullable: true })
  patientName: string;

  @Column({ name: 'patient_reference', nullable: true })
  patientReference: string; // e.g., patient code like PT2451

  @Column({ nullable: true })
  category: string; // display grouping such as "Recovery Forms" or "Reminders"

  @Column({ name: 'related_entity_id', nullable: true })
  relatedEntityId: string; // link to form, message, or task id

  @Column({ name: 'due_at', type: 'timestamp', nullable: true })
  dueAt: Date; // SLA or follow-up deadline

  @Column({ default: false })
  is_deleted: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}