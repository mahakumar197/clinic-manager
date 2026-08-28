import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import {
  EscalationCondition,
  EscalationHelper,
  NOTIFICATION_EVENT_TYPE,
  TaskStatusId,
} from '@pallmall/common-utils';

@Injectable()
export class EscalationCronService {
  private readonly logger = new Logger(EscalationCronService.name);
  private escalationHelper: EscalationHelper;
  private contentServiceUrl: string;
  private operationsServiceUrl: string;
  private internalApiKey: string;

  // Track processed escalations to prevent duplicates
  // Map key format: 'NO_RESPONSE:threadId' or 'TASK_OVERDUE:taskId'
  // Map value: timestamp of last escalation
  private processedEscalations: Map<string, number> = new Map();

  // Cooldown period: Don't re-escalate the same item within this time (24 hours)
  private readonly ESCALATION_COOLDOWN_MS = 24 * 60 * 60 * 1000;

  constructor(private configService: ConfigService) {
    this.escalationHelper = new EscalationHelper();
    this.contentServiceUrl =
      this.configService.get('BASE_CONTENT') || 'http://127.0.0.1:2092';
    this.operationsServiceUrl =
      this.configService.get('BASE_OPERATIONS') || 'http://127.0.0.1:2091';
    this.internalApiKey =
      this.configService.get('INTERNAL_API_KEY') || 'internal-secret-key-2024';
  }

  /**
   * Check if escalation was already processed recently
   */
  private hasRecentEscalation(key: string): boolean {
    const lastEscalation = this.processedEscalations.get(key);
    if (!lastEscalation) return false;

    const timeSinceLastEscalation = Date.now() - lastEscalation;
    return timeSinceLastEscalation < this.ESCALATION_COOLDOWN_MS;
  }

  /**
   * Mark escalation as processed
   */
  private markEscalationProcessed(key: string): void {
    this.processedEscalations.set(key, Date.now());
  }

  /**
   * Cron job to check for unanswered patient messages
   * Runs every 30 minutes
   *
   * Logic:
   * - Fetch all open threads from content service
   * - For each thread, check if the last message is from patient
   * - Check if there's been no response within the configured timeframe (e.g., 2 hours)
   * - If no response, trigger escalation with NO_RESPONSE condition
   */
  @Cron(CronExpression.EVERY_30_MINUTES)
  async checkNoResponseMessages() {
    try {
      // Configuration: Time threshold in hours (no response after X hours)
      const noResponseThresholdHours = parseInt(
        this.configService.get('NO_RESPONSE_THRESHOLD_HOURS', '2'),
        10,
      );

      // Fetch all open threads from content service
      const threadsUrl = `${this.contentServiceUrl}/api/v1/escalation/threads`;

      const threadsResponse = await axios.get(threadsUrl, {
        headers: {
          'Content-Type': 'application/json',
          'x-internal-api-key': this.internalApiKey,
        },
      });

      const threads = threadsResponse.data?.data || [];

      let escalationsTriggered = 0;

      for (const thread of threads) {
        const threadId = thread.thread_id;
        const patientId = thread.patient_user_id;

        // Fetch messages for this thread
        const messagesUrl = `${this.contentServiceUrl}/api/v1/escalation/threads/${threadId}/messages`;

        const messagesResponse = await axios.get(messagesUrl, {
          headers: {
            'Content-Type': 'application/json',
            'x-internal-api-key': this.internalApiKey,
          },
        });

        const messages = messagesResponse.data?.data || [];

        if (messages.length === 0) continue;

        // Get the last message
        const lastMessage = messages[messages.length - 1];
        const isFromPatient = lastMessage.sender_id === patientId;

        if (!isFromPatient) {
          // Last message is not from patient, no need to escalate
          continue;
        }

        // Check if enough time has passed since the last message
        const lastMessageTime = new Date(lastMessage.created_at);
        const now = new Date();
        const hoursSinceLastMessage =
          (now.getTime() - lastMessageTime.getTime()) / (1000 * 60 * 60);

        if (hoursSinceLastMessage >= noResponseThresholdHours) {
          // Check if we already escalated this thread recently
          const escalationKey = `NO_RESPONSE:${threadId}`;
          if (this.hasRecentEscalation(escalationKey)) {
            continue;
          }

          // Fetch patient info
          let patientName = 'Patient';
          try {
            const patientResponse = await axios.get(
              `${this.operationsServiceUrl}/api/v1/auth/user/${patientId}`,
              {
                headers: { 'Content-Type': 'application/json' },
              },
            );
            patientName =
              patientResponse.data?.data?.userName ||
              patientResponse.data?.data?.name ||
              'Patient';
          } catch (error) {
            this.logger.warn(
              `⚠️ [Cron] Could not fetch patient name: ${error.message}`,
            );
          }

          // Trigger escalation for NO_RESPONSE condition
          await this.escalationHelper.triggerEscalationSafely(
            {
              entityId: threadId,
              entityType: 'form', // Using form as entity type (can be adjusted)
              condition: EscalationCondition.NO_RESPONSE,
              baseTriggerEvent: NOTIFICATION_EVENT_TYPE.MESSAGE_RECEIVED,
              patientId: patientId,
              patientName: patientName,
              patientReference: patientId,
              metadata: {
                threadId,
                lastMessageTime: lastMessageTime.toISOString(),
                hoursSinceLastMessage: hoursSinceLastMessage.toFixed(1),
                messageText: lastMessage.message_text?.substring(0, 100),
              },
            },
            this.logger,
          );

          // Mark this thread as escalated
          this.markEscalationProcessed(escalationKey);
          escalationsTriggered++;
        }
      }
    } catch (error) {
      this.logger.error(
        `❌ [Cron] Error details: ${JSON.stringify({
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
        })}`,
      );
    }
  }

  /**
   * Cron job to check for overdue tasks
   * Runs every hour
   *
   * Logic:
   * - Fetch all tasks with status IN_PROGRESS (25) from content service
   * - Check if due_date is in the past
   * - If overdue, trigger escalation with TASK_OVERDUE condition
   */
  @Cron(CronExpression.EVERY_HOUR)
  async checkOverdueTasks() {
    try {
      // Fetch all tasks with status IN_PROGRESS from content service
      const tasksUrl = `${this.contentServiceUrl}/api/v1/escalation/tasks`;

      const tasksResponse = await axios.get(tasksUrl, {
        params: {
          status: TaskStatusId.IN_PROGRESS, // 25 = IN_PROGRESS
        },
        headers: {
          'Content-Type': 'application/json',
          'x-internal-api-key': this.internalApiKey,
        },
      });

      const tasks = tasksResponse.data?.data || [];

      let escalationsTriggered = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset to start of day for comparison

      for (const task of tasks) {
        if (!task.due_date) {
          // Task has no due date, skip
          continue;
        }

        const dueDate = new Date(task.due_date);
        dueDate.setHours(0, 0, 0, 0); // Reset to start of day

        // Check if due date is in the past
        if (dueDate < today) {
          // Check if we already escalated this task recently
          const escalationKey = `TASK_OVERDUE:${task.id}`;
          if (this.hasRecentEscalation(escalationKey)) {
            this.logger.debug(
              `⏭️ [Cron] Skipping task ${task.id} - already escalated within cooldown period`,
            );
            continue;
          }

          const daysOverdue = Math.floor(
            (today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24),
          );

          // Fetch patient info
          let patientName = 'Patient';
          try {
            const patientResponse = await axios.get(
              `${this.operationsServiceUrl}/api/v1/auth/user/${task.patient_id}`,
              {
                headers: { 'Content-Type': 'application/json' },
              },
            );
            patientName =
              patientResponse.data?.data?.userName ||
              patientResponse.data?.data?.name ||
              'Patient';
          } catch (error) {
            this.logger.warn(
              `[Cron] Could not fetch patient name: ${error.message}`,
            );
          }

          // Trigger escalation for TASK_OVERDUE condition
          await this.escalationHelper.triggerEscalationSafely(
            {
              entityId: task.id,
              entityType: 'task',
              condition: EscalationCondition.TASK_OVERDUE,
              baseTriggerEvent: NOTIFICATION_EVENT_TYPE.TASK_OVERDUE,
              patientId: task.patient_id,
              patientName: patientName,
              patientReference: task.patient_id,
              metadata: {
                taskId: task.id,
                taskName: task.task_name,
                taskDescription: task.task_description,
                dueDate: task.due_date,
                daysOverdue,
                assignedTo: task.assigned_to,
              },
            },
            this.logger,
          );

          // Mark this task as escalated
          this.markEscalationProcessed(escalationKey);
          escalationsTriggered++;
        }
      }
    } catch (error) {
      this.logger.error(`[Cron] Error in TASK_OVERDUE check: ${error.message}`);
      this.logger.error(
        `[Cron] Error details: ${JSON.stringify({
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
        })}`,
      );
    }
  }

  /**
   * Manual trigger for testing NO_RESPONSE escalation
   * Can be called via API endpoint
   */
  async manualCheckNoResponse() {
    this.logger.log('🔧 [Manual] Manually triggering NO_RESPONSE check...');
    await this.checkNoResponseMessages();
  }

  /**
   * Manual trigger for testing TASK_OVERDUE escalation
   * Can be called via API endpoint
   */
  async manualCheckOverdueTasks() {
    this.logger.log('🔧 [Manual] Manually triggering TASK_OVERDUE check...');
    await this.checkOverdueTasks();
  }
}
