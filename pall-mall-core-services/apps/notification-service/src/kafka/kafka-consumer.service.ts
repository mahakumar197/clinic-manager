import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Consumer, Kafka, EachMessagePayload } from 'kafkajs';
import {
  KafkaNotificationEvent,
  ALL_NOTIFICATION_TOPICS,
  KafkaTopics,
} from '@pallmall/common-utils';
import { logger } from '@pallmall/logger';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class KafkaConsumerService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private consumer: Consumer;

  constructor(
    private readonly configService: ConfigService,
    private readonly notificationsService: NotificationsService,
  ) {
    this.kafka = new Kafka({
      clientId: this.configService.get<string>(
        'KAFKA_CLIENT_ID',
        'notification-service',
      ),
      brokers: [
        this.configService.get<string>('KAFKA_BROKER', 'localhost:9092'),
      ],
    });

    this.consumer = this.kafka.consumer({
      groupId: this.configService.get<string>(
        'KAFKA_GROUP_ID',
        'notification-group',
      ),
    });
  }

  async onModuleInit(): Promise<void> {
    await this.connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.disconnect();
  }

  private async connect(): Promise<void> {
    try {
      await this.consumer.connect();
      logger.info('[KafkaConsumer] Connected to Kafka broker');

      // Subscribe to ALL notification topics from common-utils — single source of truth.
      // Adding a new topic in KafkaTopics (common-utils) automatically includes it here.
      for (const topic of ALL_NOTIFICATION_TOPICS) {
        await this.consumer.subscribe({ topic, fromBeginning: false });
        logger.info(`[KafkaConsumer] Subscribed to topic: ${topic}`);
      }

      await this.consumer.run({
        eachMessage: async (payload: EachMessagePayload) => {
          await this.handleMessage(payload);
        },
      });
    } catch (error) {
      logger.error('[KafkaConsumer] Failed to connect or subscribe', {
        error: error instanceof Error ? error.message : error,
      });
    }
  }

  private async disconnect(): Promise<void> {
    try {
      await this.consumer.disconnect();
      logger.info('[KafkaConsumer] Disconnected from Kafka broker');
    } catch (error) {
      logger.error('[KafkaConsumer] Error during disconnect', {
        error: error instanceof Error ? error.message : error,
      });
    }
  }

  /**
   * Handles messages from any notification topic.
   * Parses as KafkaNotificationEvent and dispatches to NotificationsService.
   */
  private async handleMessage(payload: EachMessagePayload): Promise<void> {
    const { topic, partition, message } = payload;
    const rawValue = message.value?.toString();

    if (!rawValue) {
      logger.warn('[KafkaConsumer] Received empty message — skipping', {
        topic,
        partition,
        offset: message.offset,
      });
      return;
    }

    let event: KafkaNotificationEvent;
    try {
      event = JSON.parse(rawValue) as KafkaNotificationEvent;
    } catch {
      logger.error('[KafkaConsumer] Failed to parse message JSON — skipping', {
        topic,
        partition,
        offset: message.offset,
      });
      return;
    }

    logger.info('[KafkaConsumer] Message received', {
      topic,
      partition,
      offset: message.offset,
      eventId: event.id,
      eventType: event.eventType,
      channel: event.channel,
      userId: event.userId,
      source: event.source,
    });

    try {
      switch (topic) {
        case KafkaTopics.INAPP_NOTIFICATION_EVENTS:
          await this.handleInAppNotification(event);
          break;
        case KafkaTopics.PUSH_NOTIFICATION_EVENTS:
          await this.handlePushNotification(event);
          break;
        case KafkaTopics.EMAIL_NOTIFICATION_EVENTS:
          await this.handleEmailNotification(event);
          break;
        case KafkaTopics.SMS_NOTIFICATION_EVENTS:
          await this.handleSmsNotification(event);
          break;
        default:
          logger.warn(`[KafkaConsumer] No strict handler configured for topic: ${topic}`);
      }
    } catch (error) {
      logger.error(`[KafkaConsumer] Failed to process event from topic ${topic}`, {
        eventId: event.id,
        eventType: event.eventType,
        error: error instanceof Error ? error.message : error,
      });
    }
  }

  private async handleInAppNotification(event: KafkaNotificationEvent): Promise<void> {
    logger.info('[KafkaConsumer] In-App Notification created successfully', { eventId: event.id, userId: event.userId });
  }

  private async handlePushNotification(event: KafkaNotificationEvent): Promise<void> {
    // TODO: Wire up to PushService
    logger.info('[KafkaConsumer] Handling Push Notification', { eventId: event.id, userId: event.userId });
  }

  private async handleEmailNotification(event: KafkaNotificationEvent): Promise<void> {
    // TODO: Wire up to EmailService
    logger.info('[KafkaConsumer] Handling Email Notification', { eventId: event.id, userId: event.userId });
  }

  private async handleSmsNotification(event: KafkaNotificationEvent): Promise<void> {
    // TODO: Wire up to SmsService
    logger.info('[KafkaConsumer] Handling SMS Notification', { eventId: event.id, userId: event.userId });
  }
}
