import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Producer, CompressionTypes } from 'kafkajs';
import {
  KafkaNotificationEvent,
  KafkaNotificationChannel,
  KafkaTopicByChannel,
  KafkaTopics,
} from '../kafka-events';
import { logger } from '@pallmall/logger';
import { v4 as uuid } from 'uuid';

@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private producer: Producer;

  constructor(private readonly configService: ConfigService) {
    this.kafka = new Kafka({
      clientId: this.configService.get<string>(
        'KAFKA_CLIENT_ID',
        'pallmall-producer',
      ),
      brokers: [
        this.configService.get<string>('KAFKA_BROKER', 'localhost:9092'),
      ],
    });

    this.producer = this.kafka.producer({ idempotent: true });
  }

  async onModuleInit(): Promise<void> {
    await this.connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.disconnect();
  }

  private async connect(): Promise<void> {
    try {
      await this.producer.connect();
      logger.info('[KafkaProducer] Connected to Kafka broker');
    } catch (error) {
      logger.error('[KafkaProducer] Failed to connect to Kafka broker', {
        error: error instanceof Error ? error.message : error,
      });
    }
  }

  private async disconnect(): Promise<void> {
    try {
      await this.producer.disconnect();
      logger.info('[KafkaProducer] Disconnected from Kafka broker');
    } catch (error) {
      logger.error('[KafkaProducer] Error during disconnect', {
        error: error instanceof Error ? error.message : error,
      });
    }
  }

  /**
   * Resolve the Kafka topic from the event channel.
   * Topic names come from KafkaTopicByChannel (common-utils) — never hard-coded.
   * Falls back to INAPP topic when no channel is specified.
   */
  private resolveTopic(channel?: KafkaNotificationChannel): string {
    if (channel && KafkaTopicByChannel[channel]) {
      return KafkaTopicByChannel[channel];
    }
    logger.warn(
      '[KafkaProducer] No channel specified — defaulting to INAPP topic',
      { channel },
    );
    return KafkaTopics.INAPP_NOTIFICATION_EVENTS;
  }

  /**
   * Publish a notification event to the correct channel-specific topic.
   * Set event.channel to control which topic receives the message.
   *
   * Errors are swallowed so notification failures never break the caller.
   */
  async publish(event: KafkaNotificationEvent): Promise<void> {
    const payload: KafkaNotificationEvent = {
      ...event,
      id: event.id ?? uuid(),
      source: event.source ?? 'common-utils-producer',
    };

    const topic = this.resolveTopic(payload.channel);

    try {
      await this.producer.send({
        topic,
        compression: CompressionTypes.None,
        messages: [
          {
            key: payload.userId, // partition key — consistent routing per user
            value: JSON.stringify(payload),
          },
        ],
      });

      logger.info('[KafkaProducer] Event published', {
        topic,
        channel: payload.channel,
        eventType: payload.eventType,
        userId: payload.userId,
        id: payload.id,
      });
    } catch (error) {
      logger.error('[KafkaProducer] Failed to publish event', {
        topic,
        eventType: payload.eventType,
        error: error instanceof Error ? error.message : error,
      });
    }
  }
}
