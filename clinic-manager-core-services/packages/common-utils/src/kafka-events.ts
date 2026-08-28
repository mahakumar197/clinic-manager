import { NOTIFICATION_EVENT_TYPE } from './constants';

/**
 * Canonical Kafka topic names.
 * Import this in both producers and consumers — never hard-code topic strings.
 */
export const KafkaTopics = {
  PUSH_NOTIFICATION_EVENTS: 'events.notifications.push',
  EMAIL_NOTIFICATION_EVENTS: 'events.notifications.email',
  SMS_NOTIFICATION_EVENTS: 'events.notifications.sms',
  INAPP_NOTIFICATION_EVENTS: 'events.notifications.inapp',
} as const;

export type KafkaTopicName = (typeof KafkaTopics)[keyof typeof KafkaTopics];

/**
 * Notification delivery channel — drives which Kafka topic the event is published to.
 */
export enum KafkaNotificationChannel {
  PUSH = 'PUSH',
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  INAPP = 'INAPP',
}

/**
 * Maps a KafkaNotificationChannel to its canonical Kafka topic.
 * Use this in producers to resolve the topic from the channel on the event.
 */
export const KafkaTopicByChannel: Record<KafkaNotificationChannel, KafkaTopicName> = {
  [KafkaNotificationChannel.PUSH]: KafkaTopics.PUSH_NOTIFICATION_EVENTS,
  [KafkaNotificationChannel.EMAIL]: KafkaTopics.EMAIL_NOTIFICATION_EVENTS,
  [KafkaNotificationChannel.SMS]: KafkaTopics.SMS_NOTIFICATION_EVENTS,
  [KafkaNotificationChannel.INAPP]: KafkaTopics.INAPP_NOTIFICATION_EVENTS,
};

/**
 * All topics the notification-service consumer must subscribe to.
 * Update KafkaTopics above — this list stays in sync automatically.
 */
export const ALL_NOTIFICATION_TOPICS: KafkaTopicName[] = Object.values(KafkaTopics);

/**
 * Shared event schema for all notification Kafka topics.
 * Both producer (operations-service) and consumer (notification-service)
 * depend on this interface from @pallmall/common-utils.
 */
export interface KafkaNotificationEvent {
  /** Unique message ID — used for deduplication */
  id: string;
  /** Which service published this event */
  source: string;
  /** Distributed trace ID */
  traceId?: string;
  /** Target user ID (also used as Kafka partition key) */
  userId: string;
  /** Role of the target user, e.g. 'doctor', 'coordinator' */
  userRole?: string;
  /** Notification event type */
  eventType: NOTIFICATION_EVENT_TYPE;
  /**
   * Delivery channel — determines which Kafka topic this event is published to.
   * Defaults to INAPP if omitted.
   */
  channel?: KafkaNotificationChannel;
  /** Notification title */
  title: string;
  /** Notification body */
  message: string;
  /** Urgency level */
  priority?: 'normal' | 'urgent';
  /** Related patient name (for context) */
  patientName?: string;
  /** Related patient reference/ID */
  patientReference?: string;
  /** ID of the entity this notification is about (e.g. taskId) */
  relatedEntityId?: string;
  /** Optional due date for the related entity */
  dueAt?: Date;
  /** Arbitrary extra data */
  metadata?: Record<string, unknown>;
}
