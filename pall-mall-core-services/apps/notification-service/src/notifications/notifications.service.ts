import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import {
  Notification,
  NotificationType,
  NotificationStatus,
  WebNotificationType,
  WebNotificationStatus,
  WebNotificationPriority,
} from './entities/notification.entity';
import { NotificationTemplate } from './entities/notification-template.entity';
import { NotificationRule } from '../admin-notifications/entities/notification-rule.entity';
import {
  API_ENDPOINTS,
  helpers,
  NOTIFICATION_MESSAGES,
  NotificationChannel,
  PaginationQueryDto,
  TRIGGER_EVENT_MAP,
} from '@pallmall/common-utils';
import { EmailService } from './services/email.service';
import { SmsService } from './services/sms.service';
import { PushService } from './services/push.service';
import { ConfigService } from '@nestjs/config';
import {
  SendEmailDto,
  SendSmsDto,
  SendPushDto,
  CreateWebNotificationDto,
  SendWebNotificationEmailDto,
} from './dto/notifications.dto';
import { MailService } from './services/mail/mail.service';
import { logger } from '@pallmall/logger';
import { ApiResponseBuilder, HttpStatus } from '@pallmall/shared-types';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(NotificationTemplate)
    private templateRepository: Repository<NotificationTemplate>,
    @InjectRepository(NotificationRule)
    private notificationRuleRepository: Repository<NotificationRule>,
    private emailService: EmailService,
    private smsService: SmsService,
    private pushService: PushService,
    private mailService: MailService,
    private configService: ConfigService,
  ) {}

  /**
   * Send email notification
   */
  async sendEmail(sendEmailDto: SendEmailDto): Promise<Notification> {
    let content = sendEmailDto.content || '';
    let subject = sendEmailDto.subject || '';

    // If template is specified, use it
    if (sendEmailDto.templateCode) {
      const template = await this.getTemplate(sendEmailDto.templateCode);
      if (template) {
        content = this.replaceTemplateVariables(
          template.content,
          sendEmailDto.templateData,
        );
        subject = this.replaceTemplateVariables(
          template.subject,
          sendEmailDto.templateData,
        );
      }
    }

    // Ensure content is never null
    if (!content) {
      content = 'Email notification';
    }

    // Create notification record
    const notification = this.notificationRepository.create({
      type: NotificationType.EMAIL,
      recipient: sendEmailDto.to,
      userId: sendEmailDto.userId,
      subject: subject || 'Notification',
      content,
      templateId: sendEmailDto.templateCode,
      templateData: sendEmailDto.templateData,
      status: NotificationStatus.PENDING,
    });

    await this.notificationRepository.save(notification);

    // Send email
    const result = await this.emailService.sendEmail({
      to: sendEmailDto.to,
      subject: subject || 'Notification',
      html: content,
    });

    // Update notification status
    notification.status = result.success
      ? NotificationStatus.SENT
      : NotificationStatus.FAILED;
    notification.externalId = result.messageId;
    notification.errorMessage = result.error;
    notification.sentAt = result.success ? new Date() : null;

    return await this.notificationRepository.save(notification);
  }

  /**
   * Send SMS notification
   */
  async sendSms(sendSmsDto: SendSmsDto): Promise<Notification> {
    let message = sendSmsDto.message || '';

    // If template is specified, use it
    if (sendSmsDto.templateCode) {
      const template = await this.getTemplate(sendSmsDto.templateCode);
      if (template) {
        message = this.replaceTemplateVariables(
          template.content,
          sendSmsDto.templateData,
        );
      }
    }

    // Ensure message is never null
    if (!message) {
      message = 'SMS notification';
    }

    // Create notification record
    const notification = this.notificationRepository.create({
      type: NotificationType.SMS,
      recipient: sendSmsDto.to,
      userId: sendSmsDto.userId,
      subject: 'SMS',
      content: message,
      templateId: sendSmsDto.templateCode,
      templateData: sendSmsDto.templateData,
      status: NotificationStatus.PENDING,
    });

    await this.notificationRepository.save(notification);

    // Send SMS
    const result = await this.smsService.sendSms({
      to: sendSmsDto.to,
      message,
    });

    // Update notification status
    notification.status = result.success
      ? NotificationStatus.SENT
      : NotificationStatus.FAILED;
    notification.externalId = result.messageId;
    notification.errorMessage = result.error;
    notification.sentAt = result.success ? new Date() : null;

    return await this.notificationRepository.save(notification);
  }

  /**
   * Send push notification
   */
  async sendPush(sendPushDto: SendPushDto): Promise<Notification> {
    // Ensure required fields have values
    const title = sendPushDto.title || 'Notification';
    const body = sendPushDto.body || 'New notification';

    // Create notification record
    const notification = this.notificationRepository.create({
      type: NotificationType.PUSH,
      recipient: sendPushDto.deviceToken,
      userId: sendPushDto.userId,
      subject: title,
      content: body,
      metadata: sendPushDto.data,
      status: NotificationStatus.PENDING,
    });

    await this.notificationRepository.save(notification);

    // Send push notification
    const result = await this.pushService.sendPushNotification({
      deviceToken: sendPushDto.deviceToken,
      title,
      body,
      data: sendPushDto.data,
    });

    // Update notification status
    notification.status = result.success
      ? NotificationStatus.SENT
      : NotificationStatus.FAILED;
    notification.externalId = result.messageId;
    notification.errorMessage = result.error;
    notification.sentAt = result.success ? new Date() : null;

    return await this.notificationRepository.save(notification);
  }

  /**
   * Get notification by ID
   */
  async findOne(id: string): Promise<Notification> {
    return await this.notificationRepository.findOne({ where: { id } });
  }

  /**
   * Get all notifications for a user
   */
  async findByUser(userId: string): Promise<any> {
    const notifications = await this.notificationRepository.find({
      where: { userId, is_deleted: false },
      order: { createdAt: 'DESC' },
    });

    // collect patientReference ids
    const patientIds = [
      ...new Set(
        notifications
          .map((n) => n.patientReference)
          .filter((id): id is string => Boolean(id)),
      ),
    ];

    const uri = this.configService.get('BASE_OPERATIONS');
    const url = API_ENDPOINTS.OPERATIONS_SERVICE.USER_DATA_FETCH;

    const patientMap =
      patientIds.length > 0
        ? await helpers.fetchUsersByIds(uri, url, patientIds)
        : {};

    // enrich notifications with patientName
    const enrichedNotifications = notifications.map((notification) => ({
      ...notification,
      patientName:
        patientMap[notification.patientReference]?.userName ??
        notification.patientName,
    }));

    const unreadCount = await this.notificationRepository.count({
      where: {
        userId,
        notificationStatus: WebNotificationStatus.UNREAD,
        is_deleted: false,
      },
    });

    const totalCount = notifications.length;

    const urgentCount = await this.notificationRepository.count({
      where: {
        userId,
        priority: WebNotificationPriority.URGENT,
        is_deleted: false,
      },
    });

    return {
      notifications: enrichedNotifications,
      unreadCount,
      totalCount,
      urgentCount,
    };
  }

  /**
   * Get template by code
   */
  private async getTemplate(code: string): Promise<NotificationTemplate> {
    return await this.templateRepository.findOne({
      where: { code, isActive: true },
    });
  }

  /*
 Dedicated method for sending OTP email using Handlebars template (otp.hbs)
 */
  async sendPasswordResetOtpEmail(to: string, otp: string): Promise<void> {
    await this.mailService.sendPasswordResetOtp(to, otp);
  }
  /*
 Dedicated method for sending OTP email for email verification (otp_email_verify.hbs)
 */
  async sendVerifyOtpEmail(to: string, otp: string): Promise<void> {
    await this.mailService.sendEmailVerifyOtp(to, otp);
  }

  /**
   * Replace template variables
   */
  private replaceTemplateVariables(template: string, data: any): string {
    if (!data) return template;

    let result = template;
    Object.keys(data).forEach((key) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, data[key]);
    });

    return result;
  }

  async markAsRead(notificationId: string, userId: string, isRead: boolean) {
    const status = isRead
      ? WebNotificationStatus.READ
      : WebNotificationStatus.UNREAD;

    await this.notificationRepository.update(
      { id: notificationId, userId, is_deleted: false },
      {
        notificationStatus: status,
        updatedAt: new Date(),
      },
    );

    return { message: 'Notification read status updated' };
  }

  async markAllByUser(userId: string, isRead: boolean) {
    const status = isRead
      ? WebNotificationStatus.READ
      : WebNotificationStatus.UNREAD;

    await this.notificationRepository.update(
      { userId, is_deleted: false },
      {
        notificationStatus: status,
        updatedAt: new Date(),
      },
    );

    return { message: 'All notifications updated successfully' };
  }

  async markBulk(ids: string[], userId: string, isRead: boolean) {
    const status = isRead
      ? WebNotificationStatus.READ
      : WebNotificationStatus.UNREAD;

    await this.notificationRepository.update(
      { id: In(ids), userId, is_deleted: false },
      {
        notificationStatus: status,
        updatedAt: new Date(),
      },
    );

    return { message: 'Notifications updated successfully' };
  }

  async softDelete(notificationId: string) {
    await this.notificationRepository.update(
      { id: notificationId },
      { is_deleted: true, updatedAt: new Date() },
    );

    return { message: 'Notification removed' };
  }

  async getCounts(userId: string) {
    const total = await this.notificationRepository.count({
      where: { userId, is_deleted: false },
    });

    const unread = await this.notificationRepository.count({
      where: {
        userId,
        notificationStatus: WebNotificationStatus.UNREAD,
        is_deleted: false,
      },
    });

    return {
      total,
      unread,
    };
  }

  async updateNotification(
    notificationId: string,
    body: { title?: string; message?: string },
  ) {
    const updatePayload: any = { updatedAt: new Date() };
    if (body.title) updatePayload.subject = body.title;
    if (body.message) updatePayload.content = body.message;

    await this.notificationRepository.update(
      { id: notificationId, is_deleted: false },
      updatePayload,
    );

    return { message: 'Notification updated successfully' };
  }

  /**
   * Create web notification
   */
  async createWebNotification(dto: CreateWebNotificationDto): Promise<any> {
    try {
      const notification = this.notificationRepository.create({
        // Required base fields
        subject: dto.title,
        content: dto.message,
        type: NotificationType.IN_APP,
        recipient: dto.patientName || 'patient',
        userId: dto.userId,
        status: NotificationStatus.DELIVERED,

        // Web notification specific fields
        // webUserId: dto.userId,
        notificationType:
          WebNotificationType[dto.type] || WebNotificationType.TASK_CREATED,
        priority: (dto.priority ||
          'normal') as unknown as WebNotificationPriority,
        notificationStatus: WebNotificationStatus.UNREAD,
        patientName: dto.patientName,
        patientReference: dto.patientReference,
        relatedEntityId: dto.relatedEntityId,
        dueAt: dto.dueAt,
        metadata: JSON.stringify(dto.metadata || {}),
      } as any);
      const saved = await this.notificationRepository.save(notification as any);
      return Array.isArray(saved) ? saved[0] : saved;
    } catch (error) {
      console.error('Error creating web notification:', error);
      throw error;
    }
  }

  /**
   * Get all active notification rules
   */
  async getAllNotificationRules(): Promise<any[]> {
    try {
      const adminRules = await this.notificationRuleRepository.find({
        where: { is_active: true },
      });

      if (!adminRules || adminRules.length === 0) {
        return [];
      }

      return adminRules;
    } catch (error) {
      console.error('Error fetching all notification rules:', error);
      return [];
    }
  }

  /**
   * Get notification rules from admin-defined rules based on user role
   * Returns rules that match the user's role, are assigned to specific users, or apply to all assignees
   */
  async getNotificationRulesForUser(
    userId: string,
    userRole?: string,
  ): Promise<any[]> {
    try {
      // Fetch all active notification rules from admin
      const adminRules = await this.notificationRuleRepository.find({
        where: { is_active: true },
      });

      if (!adminRules || adminRules.length === 0) {
        return [];
      }

      // Filter rules that apply to this user based on recipients field
      // Check: role match or assignedTo flag
      const applicableRules = adminRules
        .filter((rule) => {
          const recipients = rule.recipients || {};
          const roles = recipients.roles || [];
          const assignedToFlag = recipients.assignedTo === true;

          // Rule applies if:
          // 1. User's role is in the rule's recipient roles
          // 2. Rule has assignedTo flag (applies to assigned users)
          return (userRole && roles.includes(userRole)) || assignedToFlag;
        })
        .map((rule) => ({
          id: rule.id,
          eventType: rule.trigger_event,
          trigger_event_label: TRIGGER_EVENT_MAP[rule.trigger_event],
          enableEmail:
            rule.channels?.includes(NotificationChannel.EMAIL) ?? false,
          enableWebNotification:
            rule.channels?.includes(NotificationChannel.IN_APP) ?? false,
          emailTemplate: 'notification-template',
        }));

      return applicableRules;
    } catch (error) {
      console.error('Error fetching notification rules:', error);
      return [];
    }
  }

  async getInAppNotifications(userId: string, query: PaginationQueryDto) {
    logger.info('Get in-app notifications...');
    try {
      const page = query.page || 1;
      const limit = query.limit || 10;

      const notifications = await this.notificationRepository.find({
        where: {
          patientReference: userId,
          type: NotificationType.IN_APP,
        },
        order: {
          id: 'DESC',
        },
      });

      const mappedNotifications = notifications.map((n) => ({
        id: n.id,
        title: n.subject,
        subject: n.content,
        createdAt: n.createdAt,
      }));

      const paginated = helpers.paginate(mappedNotifications, page, limit);

      logger.info('Get in-app notifications -> OK');

      return new ApiResponseBuilder().paginated(
        paginated.items,
        paginated.meta,
        NOTIFICATION_MESSAGES.NOTIFICATIONS_FETCHED,
      );
    } catch (error) {
      logger.error(`Get in-app notifications -> ${error}`);
      return new ApiResponseBuilder().error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
