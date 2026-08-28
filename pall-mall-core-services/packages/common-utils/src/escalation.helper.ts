import axios from 'axios';
import {
  NOTIFICATION_EVENT_TYPE,
  EscalationCondition,
  EscalationConditionId,
  EscalationAction,
  EscalationActionId,
  NotificationChannel,
} from './constants';

export interface EscalationEventPayload {
  entityId: string; // form submission ID, task ID, etc.
  entityType: 'form' | 'task' | 'message';
  condition: EscalationCondition;
  baseTriggerEvent: NOTIFICATION_EVENT_TYPE;
  patientId?: string;
  patientName?: string;
  patientReference?: string;
  metadata?: Record<string, unknown>;
}

export interface EscalationRule {
  condition_label: number;
  id: string;
  name: string;
  base_trigger_event: number;
  condition: number;
  action: number;
  channels: NotificationChannel[];
  recipients: {
    roles?: string[];
    users?: string[];
    assignedTo?: boolean;
  };
  is_active: boolean;
}

export class EscalationHelper {
  private notificationServiceUrl =
    process.env.BASE_NOTIFICATION || 'http://127.0.0.1:2093';
  private operationsServiceUrl =
    process.env.BASE_OPERATIONS || 'http://127.0.0.1:2091';

  /**
   * Check if escalation should be triggered based on condition
   */
  async checkAndTriggerEscalation(
    payload: EscalationEventPayload,
  ): Promise<void> {
    try {
      // Fetch active escalation rules from the notification service
      const rules = await this.fetchEscalationRules(
        payload.baseTriggerEvent,
        payload.condition,
      );

      if (rules.length === 0) {
        return;
      }

      // Trigger escalation for each matching rule
      for (const rule of rules) {
        await this.triggerEscalationNotification(payload, rule);
      }
    } catch (error) {
      console.error('[Escalation] Error checking escalation:', error);
      // Don't throw - escalation failures shouldn't block the main operation
    }
  }

  /**
   * Fetch matching escalation rules from notification service
   */
  private async fetchEscalationRules(
    baseTriggerEvent: NOTIFICATION_EVENT_TYPE,
    condition: EscalationCondition,
  ): Promise<EscalationRule[]> {
    try {
      const conditionId = this.getConditionId(condition);
      const baseTriggerEventId = this.getBaseTriggerEventId(baseTriggerEvent);

      const response = await axios.get(
        `${this.notificationServiceUrl}/api/v1/admin/escalations`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      const allRules = response.data?.data?.data || [];

      const matchedRules = allRules.filter(
        (rule: EscalationRule) =>
          rule.is_active && rule.condition === conditionId,
      );

      return matchedRules;
    } catch (error) {
      console.error('[Escalation] Error fetching escalation rules:', error);
      return [];
    }
  }

  /**
   * Trigger escalation notification to recipients based on action
   */
  private async triggerEscalationNotification(
    payload: EscalationEventPayload,
    rule: EscalationRule,
  ): Promise<void> {
    try {
      const recipients = await this.resolveRecipients(rule, payload);

      for (const recipient of recipients) {
        // Send notification with URGENT priority for escalations
        const notificationPayload = {
          userId: recipient.userId,
          userRole: recipient.role,
          eventType: payload.baseTriggerEvent,
          title: this.getEscalationTitle(payload, rule),
          message: this.getEscalationMessage(payload, rule),
          priority: 'urgent', // Always urgent for escalations
          patientName: payload.patientName,
          patientReference: payload.patientReference,
          relatedEntityId: payload.entityId,
          metadata: {
            ...payload.metadata,
            isEscalation: true,
            escalationRuleId: rule.id,
            escalationCondition: this.getConditionString(rule.condition),
            escalationAction: this.getActionString(rule.action),
          },
        };

        // Send via enabled channels
        for (const channel of rule.channels) {
          if (channel === NotificationChannel.IN_APP) {
            await this.sendWebNotification(notificationPayload);
          } else if (channel === NotificationChannel.EMAIL) {
            await this.sendEmailNotification(notificationPayload);
          }
        }
      }
    } catch (error) {
      console.error(
        '[Escalation] Error triggering escalation notification:',
        error,
      );
    }
  }

  /**
   * Resolve recipients based on escalation action and rule configuration
   * Fetches all users with the role defined by the escalation action
   */
  private async resolveRecipients(
    rule: EscalationRule,
    payload: EscalationEventPayload,
  ): Promise<Array<{ userId: string; role: string }>> {
    const recipients: Array<{ userId: string; role: string }> = [];

    // Get the role based on escalation action
    const actionType = this.getActionString(rule.action);
    const targetRole = this.mapActionToRole(actionType);

    try {
      // Fetch all users with the target role from operations service
      const usersWithRole = await this.fetchUsersByRole(targetRole);

      for (const user of usersWithRole) {
        recipients.push({
          userId: user.id || user.userId,
          role: targetRole,
        });
      }

      // Also add any users directly specified in recipients
      if (rule.recipients.users && rule.recipients.users.length > 0) {
        for (const userId of rule.recipients.users) {
          // Avoid duplicates
          if (!recipients.find((r) => r.userId === userId)) {
            recipients.push({ userId, role: targetRole });
          }
        }
      }
    } catch (error) {
      console.error('[Escalation] Error resolving recipients:', error);

      // Fallback: add users directly specified in recipients
      if (rule.recipients.users && rule.recipients.users.length > 0) {
        for (const userId of rule.recipients.users) {
          recipients.push({ userId, role: targetRole });
        }
      }
    }

    return recipients;
  }

  /**
   * Map escalation action to role type
   */
  private mapActionToRole(action: EscalationAction): string {
    switch (action) {
      case EscalationAction.ALERT_MANAGER:
        return 'manager';
      case EscalationAction.ALERT_ADMIN:
        return 'admin';
      case EscalationAction.ALERT_COORDINATOR:
        return 'coordinator';
      default:
        return 'admin';
    }
  }

  /**
   * Fetch all users with a specific role from operations service
   */
  private async fetchUsersByRole(
    role: string,
  ): Promise<Array<{ id: string; userId: string; role: string }>> {
    try {
      const url = `${this.operationsServiceUrl}/api/v1/auth/user-list`;

      const response = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const allUsers = response.data || [];

      // Filter users by role on client side since the API doesn't support role parameter
      const filteredUsers = allUsers.filter(
        (user: any) =>
          user.role?.toLowerCase() === role.toLowerCase() ||
          user.userRole?.toLowerCase() === role.toLowerCase(),
      );

      return filteredUsers;
    } catch (error: any) {
      console.error(`[Escalation] Error fetching users with role ${role}:`, {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      return [];
    }
  }

  /**
   * Send web notification
   */
  private async sendWebNotification(payload: any): Promise<void> {
    try {
      await axios.post(
        `${this.notificationServiceUrl}/api/v1/notifications/web`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
    } catch (error) {
      console.error('Error sending escalation web notification:', error);
    }
  }

  /**
   * Send email notification
   */
  private async sendEmailNotification(payload: any): Promise<void> {
    try {
      await axios.post(
        `${this.notificationServiceUrl}/api/v1/notifications/email`,
        {
          to: payload.userId,
          subject: payload.title,
          template: 'escalation-template',
          context: payload,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
    } catch (error) {
      console.error('Error sending escalation email notification:', error);
    }
  }

  /**
   * Get escalation title based on condition
   */
  private getEscalationTitle(
    payload: EscalationEventPayload,
    rule: EscalationRule,
  ): string {
    const conditionStr = this.getConditionString(rule.condition);

    switch (conditionStr) {
      case EscalationCondition.NOT_APPROVED:
        return `🚨 Escalation: Form Not Approved`;
      case EscalationCondition.NO_RESPONSE:
        return `🚨 Escalation: No Response`;
      case EscalationCondition.TASK_OVERDUE:
        return `🚨 Escalation: Task Overdue`;
      default:
        return `🚨 Escalation Alert`;
    }
  }

  /**
   * Get escalation message based on condition
   */
  private getEscalationMessage(
    payload: EscalationEventPayload,
    rule: EscalationRule,
  ): string {
    const conditionStr = this.getConditionString(rule.condition);
    const patientInfo = payload.patientName
      ? `for patient ${payload.patientName}`
      : `for patient ${payload.patientReference || ''}`;

    switch (conditionStr) {
      case EscalationCondition.NOT_APPROVED:
        return `A form submission ${patientInfo} has been rejected and requires immediate attention.`;
      case EscalationCondition.NO_RESPONSE:
        return `A form submission ${patientInfo} has not received a response within the expected timeframe.`;
      case EscalationCondition.TASK_OVERDUE:
        return `A task ${patientInfo} is overdue and requires immediate action.`;
      default:
        return `An escalation has been triggered ${patientInfo}.`;
    }
  }

  /**
   * Map condition ID to string
   */
  private getConditionString(conditionId: number): EscalationCondition {
    switch (conditionId) {
      case EscalationConditionId.NOT_APPROVED:
        return EscalationCondition.NOT_APPROVED;
      case EscalationConditionId.NO_RESPONSE:
        return EscalationCondition.NO_RESPONSE;
      case EscalationConditionId.TASK_OVERDUE:
        return EscalationCondition.TASK_OVERDUE;
      default:
        return EscalationCondition.NOT_APPROVED;
    }
  }

  /**
   * Map action ID to string
   */
  private getActionString(actionId: number): EscalationAction {
    switch (actionId) {
      case EscalationActionId.ALERT_MANAGER:
        return EscalationAction.ALERT_MANAGER;
      case EscalationActionId.ALERT_ADMIN:
        return EscalationAction.ALERT_ADMIN;
      case EscalationActionId.ALERT_COORDINATOR:
        return EscalationAction.ALERT_COORDINATOR;
      default:
        return EscalationAction.ALERT_ADMIN;
    }
  }

  /**
   * Map condition string to ID
   */
  private getConditionId(condition: EscalationCondition): number {
    switch (condition) {
      case EscalationCondition.NOT_APPROVED:
        return EscalationConditionId.NOT_APPROVED;
      case EscalationCondition.NO_RESPONSE:
        return EscalationConditionId.NO_RESPONSE;
      case EscalationCondition.TASK_OVERDUE:
        return EscalationConditionId.TASK_OVERDUE;
      default:
        return EscalationConditionId.NOT_APPROVED;
    }
  }

  /**
   * Map base trigger event to ID
   */
  private getBaseTriggerEventId(event: NOTIFICATION_EVENT_TYPE): number {
    // You'll need to add TRIGGER_EVENT_ID mappings to constants.ts
    // For now, using form submitted as an example
    switch (event) {
      case NOTIFICATION_EVENT_TYPE.FORM_SUBMITTED:
        return 68; // TriggerEventId.FORM_SUBMITTED
      case NOTIFICATION_EVENT_TYPE.TASK_CREATED:
        return 66; // TriggerEventId.TASK_CREATED
      case NOTIFICATION_EVENT_TYPE.TASK_OVERDUE:
        return 67; // TriggerEventId.TASK_OVERDUE
      default:
        return 68;
    }
  }

  /**
   * Safe wrapper for triggering escalations without throwing errors
   */
  async triggerEscalationSafely(
    payload: EscalationEventPayload,
    logger?: { error: (message: string) => void },
  ): Promise<void> {
    try {
      await this.checkAndTriggerEscalation(payload);
    } catch (error) {
      console.error('[Escalation] triggerEscalationSafely failed:', error);
      if (logger) {
        logger.error(`Failed to trigger escalation: ${error}`);
      } else {
        console.error('Failed to trigger escalation:', error);
      }
    }
  }
}
