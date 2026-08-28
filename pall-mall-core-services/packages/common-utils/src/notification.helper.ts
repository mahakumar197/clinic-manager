import axios from 'axios';
import {
  NOTIFICATION_EVENT_TYPE,
  NOTIFICATION_EVENT_LABELS,
} from './constants';

export interface NotificationEventPayload {
  userId: string;
  userRole?: string;
  eventType: NOTIFICATION_EVENT_TYPE;
  patientName?: string;
  patientReference?: string;
  message: string;
  title: string;
  priority?: 'normal' | 'urgent';
  relatedEntityId?: string;
  dueAt?: Date;
  metadata?: Record<string, unknown>;
}

export interface NotificationRule {
  id: string;
  eventType: NOTIFICATION_EVENT_TYPE;
  enableEmail: boolean;
  enableWebNotification: boolean;
  emailTemplate?: string;
}

export class NotificationHelper {
  // Prefer env override; default to 127.0.0.1 to avoid IPv6 localhost (::1) issues
  private notificationServiceUrl =
    process.env.BASE_NOTIFICATION || 'http://127.0.0.1:2093/api/v1';
  private contentServiceUrl =
    process.env.BASE_CONTENT || 'http://127.0.0.1:2092';
  private hasWarnedNotificationServiceDown = false;
  private roleTypeCache: Map<number | string, string> | null = null;

  /**
   * Fetch role types from dropdowns API and cache them
   */
  private async fetchRoleTypes(): Promise<Map<number | string, string>> {
    if (this.roleTypeCache) {
      return this.roleTypeCache;
    }

    try {
      const response = await axios.get(
        `${this.contentServiceUrl}/api/v1/dropdowns/RoleType`,
        { timeout: 2000 },
      );

      const roleTypes = response.data.data || [];
      this.roleTypeCache = new Map();

      roleTypes.forEach((role: any) => {
        if (role && role.id && role.beValue) {
          this.roleTypeCache.set(role.id, role.beValue.toLowerCase());
          // Also map string version of ID
          this.roleTypeCache.set(String(role.id), role.beValue.toLowerCase());
        }
      });

      return this.roleTypeCache;
    } catch (error) {
      console.error(
        'Failed to fetch role types from dropdowns API:',
        error.message,
      );
      // Return empty map on failure
      return new Map();
    }
  }

  /**
   * Map role ID to role type string using dropdowns API
   * @param roleId - The role ID (number or string)
   * @returns The role type string (e.g., 'admin', 'doctor', 'nurse')
   */
  private async mapRoleIdToRoleType(
    roleId: number | string,
  ): Promise<string | null> {
    const id = typeof roleId === 'string' ? parseInt(roleId, 10) : roleId;
    const roleTypesMap = await this.fetchRoleTypes();
    return roleTypesMap.get(id) || null;
  }

  /**
   * Map role type string to role ID using dropdowns API (reverse mapping)
   * @param roleType - The role type string (e.g., 'admin', 'doctor', 'nurse')
   * @returns The role ID number
   */
  private async mapRoleTypeToRoleId(roleType: string): Promise<number | null> {
    try {
      const response = await axios.get(
        `${this.contentServiceUrl}/api/v1/dropdowns/RoleType`,
        { timeout: 2000 },
      );

      const roleTypes = response.data.data || [];
      const role = roleTypes.find(
        (r: any) => r.beValue?.toLowerCase() === roleType?.toLowerCase(),
      );
      return role ? role.id : null;
    } catch (error) {
      console.error('Failed to map role type to ID:', error.message);
      return null;
    }
  }

  /**
   * Trigger notification based on event and notification rules
   * Stores web notification and sends email if enabled in admin rules
   */
  async triggerNotification(
    payload: NotificationEventPayload,
    notificationRules: NotificationRule[],
  ): Promise<void> {
    try {
      // Find all matching rules for this event type
      const applicableRules = notificationRules.filter(
        (rule) => rule.eventType === payload.eventType,
      );

      // Only send notification if there's at least one matching admin rule
      if (applicableRules.length === 0) {
        return;
      }

      // Process each applicable rule
      for (const applicableRule of applicableRules) {
        // Verify the rule is enabled for this channel before sending
        if (
          !applicableRule.enableWebNotification &&
          !applicableRule.enableEmail
        ) {
          continue;
        }

        // Store web notification if enabled in rule
        if (applicableRule.enableWebNotification) {
          await this.createWebNotification(payload);
        }

        // Send email if enabled in rule
        if (applicableRule.enableEmail) {
          await this.sendEmail(payload, applicableRule);
        }
      }
    } catch (error) {
      console.error('Error triggering notification:', error);
      throw new Error('Failed to trigger notification');
    }
  }

  /**
   * Create web notification in the notification service
   */
  private async createWebNotification(
    payload: NotificationEventPayload,
  ): Promise<void> {
    try {
      const webNotificationData = {
        userId: payload.userId,
        title: payload.title,
        message: payload.message,
        type: payload.eventType,
        priority: payload.priority || 'normal',
        patientName: payload.patientName,
        patientReference: payload.patientReference,
        relatedEntityId: payload.relatedEntityId,
        dueAt: payload.dueAt,
        metadata: payload.metadata || {},
        status: 'unread',
      };

      await axios.post(
        `${this.notificationServiceUrl}/api/v1/notifications/web`,
        webNotificationData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
    } catch (error) {
      console.error('Error creating web notification:', error);
      throw error;
    }
  }

  /**
   * Send email notification
   */
  private async sendEmail(
    payload: NotificationEventPayload,
    rule: NotificationRule,
  ): Promise<void> {
    try {
      const emailData = {
        to: payload.userId, // Assumes userId is email or needs to be mapped
        subject: payload.title,
        template: rule.emailTemplate || 'notification-template',
        context: {
          title: payload.title,
          message: payload.message,
          patientName: payload.patientName,
          patientReference: payload.patientReference,
          eventType: NOTIFICATION_EVENT_LABELS[payload.eventType],
          metadata: payload.metadata,
        },
      };

      await axios.post(
        `${this.notificationServiceUrl}/api/v1/notifications/email`,
        emailData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
    } catch (error) {
      console.error('Error sending notification email:', error);
      throw error;
    }
  }

  /**
   * Get notification rules for a user based on their role
   * Fetches all rules and filters by recipient roles or assignedTo flag
   */
  async getNotificationRulesForUser(
    userId: string,
    userRole?: string,
  ): Promise<NotificationRule[]> {
    try {
      // Fetch all active notification rules (admin endpoint)
      console.log(`Fetching notification rules for userRole: ${userRole}`);
      const response = await axios.get(
        `${this.notificationServiceUrl}/api/v1/admin/notifications`,
        { headers: { Accept: 'application/json' }, timeout: 2000 },
      );
      // Admin controller returns the list directly
      const allRules = response.data.data.data || [];

      // Determine if userRole is a name (string) or ID (number)
      let userRoleType: String | null = null;

      if (userRole) {
        // If it's a number or numeric string, map ID to type
        userRoleType = userRole.toLowerCase();
      }
      // Filter rules that apply to this user based on:
      // 1. User's role matches rule recipient roles
      // 2. Rule has assignedTo flag enabled (applies to assigned users)
      const applicableRules = allRules
        .filter((rule: any) => {
          if (!rule.is_active) {
            return false;
          }
          const recipients = rule.recipients || {};
          const roles = recipients.roles || [];

          // Rule applies if:
          // 1. User role matches any role in the rule
          const roleMatch =
            userRoleType && roles.length > 0 && roles.includes(userRoleType);
          // 2. Rule has assignedTo flag enabled
          const assignedToApplies = recipients.assignedTo === true;
          // 3. Rule has no specific roles (empty array) - applies to everyone
          const noRoleRestriction = roles.length === 0;

          return roleMatch;
        })
        .map((rule: any) => ({
          id: rule.id,
          eventType: rule.trigger_event_label,
          enableEmail: rule.channels?.includes('EMAIL') ?? false,
          enableWebNotification: rule.channels?.includes('IN_APP') ?? false,
          emailTemplate: rule.name,
        }));

      return applicableRules;
    } catch (error) {
      const base = this.notificationServiceUrl;
      const code = error?.code || error?.response?.status;
      const msg =
        code === 'ECONNREFUSED'
          ? `Notification service unreachable at ${base}. Skipping rules fetch.`
          : `Failed to fetch notification rules from ${base}. Skipping.`;
      // Keep logs minimal and non-blocking; warn only once per process
      if (!this.hasWarnedNotificationServiceDown) {
        this.hasWarnedNotificationServiceDown = true;
      }
      return [];
    }
  }

  /**
   * Batch trigger notifications for multiple users
   */
  async triggerBatchNotifications(
    payloads: NotificationEventPayload[],
    notificationRules: NotificationRule[],
  ): Promise<void> {
    try {
      await Promise.all(
        payloads.map((payload) =>
          this.triggerNotification(payload, notificationRules),
        ),
      );
    } catch (error) {
      console.error('Error triggering batch notifications:', error);
      throw error;
    }
  }

  /**
   * Send notification safely with automatic rule fetching and error handling
   * This is a convenience method that wraps getNotificationRulesForUser and triggerNotification
   * @param payload - The notification payload
   * @param logger - Optional logger instance for error logging
   * @returns Promise that resolves when notification is sent (does not throw)
   */
  async sendNotificationSafely(
    payload: NotificationEventPayload,
    logger?: { error: (message: string) => void },
  ): Promise<void> {
    try {
      const notificationRules = await this.getNotificationRulesForUser(
        payload.userId,
        payload.userRole,
      );

      await this.triggerNotification(payload, notificationRules);
    } catch (notificationError) {
      const errorMessage = `Failed to send notification: ${notificationError?.message || notificationError}`;
      if (logger) {
        logger.error(errorMessage);
      } else {
        console.error(errorMessage);
      }
      // Don't throw - notification failures should not break the main flow
    }
  }
}
