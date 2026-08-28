import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationRule } from '../entities/notification-rule.entity';
import {
  CreateNotificationRuleDto,
  UpdateNotificationRuleDto,
} from '../dto/admin-notification.dto';
import { ApiResponseBuilder, HttpStatus } from '@pallmall/shared-types';
import {
  NOTIFICATION_MESSAGES,
  TRIGGER_EVENT_MAP,
} from '@pallmall/common-utils';
import axios from 'axios';

@Injectable()
export class AdminNotificationService {
  private readonly logger = new Logger(AdminNotificationService.name);

  private contentServiceUrl =
    process.env.BASE_CONTENT || 'http://127.0.0.1:2092';
  private roleTypeCache: Map<number | string, string> | null = null;

  constructor(
    @InjectRepository(NotificationRule)
    private readonly notificationRepo: Repository<NotificationRule>,
  ) {}

  /**
   * Fetch role types from dropdowns API and cache them
   */
  private async fetchRoleTypes(): Promise<Map<number | string, string>> {
    this.logger.log('[fetchRoleTypes] Fetching role types from content-service dropdowns API');
    if (this.roleTypeCache) {
      this.logger.debug('[fetchRoleTypes] Returning role types from cache');
      return this.roleTypeCache;
    }

    try {
      this.logger.log(`[fetchRoleTypes] Calling content-service API for RoleType`);
      const response = await axios.get(
        `${this.contentServiceUrl}/api/v1/dropdowns/RoleType`,
        { timeout: 2000 },
      );

      const roleTypes = response.data.data || [];
      this.logger.debug(`[fetchRoleTypes] Successfully fetched ${roleTypes.length} role types`);
      this.roleTypeCache = new Map();

      roleTypes.forEach((role: any) => {
        if (role && role.id && role.beValue) {
          this.roleTypeCache.set(role.id, role.beValue.toLowerCase());
          // Also map string version of ID
          this.roleTypeCache.set(String(role.id), role.beValue.toLowerCase());
        }
      });

      return this.roleTypeCache;
    } catch (error: any) {
      const errorMessage = error?.message || error;
      this.logger.error(`[fetchRoleTypes] Failed to fetch role types from dropdowns API: ${errorMessage}`, error.stack);
      return new Map();
    }
  }

  /**
   * Map role IDs in recipients to role type strings
   */
  private async mapRoleIdsToTypes(recipients: any): Promise<any> {
    this.logger.log('[mapRoleIdsToTypes] Mapping recipient role IDs to role types');
    if (!recipients || !recipients.roles || recipients.roles.length === 0) {
      this.logger.debug('[mapRoleIdsToTypes] No roles to map');
      return recipients;
    }

    const roleTypesMap = await this.fetchRoleTypes();

    const mappedRoles = recipients.roles
      .map((roleId: number | string) => {
        // Try both as-is and as number
        const roleType =
          roleTypesMap.get(roleId) || roleTypesMap.get(Number(roleId));
        return roleType;
      })
      .filter((role: string | undefined) => role !== undefined);

    this.logger.debug(`[mapRoleIdsToTypes] Successfully mapped ${mappedRoles.length} roles`);
    return {
      ...recipients,
      roles: mappedRoles,
    };
  }

  async createNotificationRule(dto: CreateNotificationRuleDto) {
    this.logger.log('[createNotificationRule] Creating new notification rule');
    try {
      const rule = this.notificationRepo.create({
        name: dto.name,
        trigger_event: dto.triggerEvent,
        channels: dto.channels,
        recipients: dto.recipients,
        is_active: true,
      });

      const result = await this.notificationRepo.save(rule);
      this.logger.log(`[createNotificationRule] Successfully saved notification rule ID: ${result.id}`);

      return new ApiResponseBuilder().success(
        result,
        NOTIFICATION_MESSAGES.CREATED,
        HttpStatus.CREATED,
      );
    } catch (error: any) {
      this.logger.error(`[createNotificationRule] Error creating notification rule: ${error.message}`, error.stack);
      return new ApiResponseBuilder().error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAllNotificationRules() {
    this.logger.log('[findAllNotificationRules] Fetching all notification rules');
    try {
      const rules = await this.notificationRepo.find({
        order: { created_at: 'DESC' },
      });
      this.logger.debug(`[findAllNotificationRules] Found ${rules.length} notification rules from DB`);

      const rulesWithLabel = await Promise.all(
        rules.map(async (rule) => {
          const mappedRecipients = await this.mapRoleIdsToTypes(
            rule.recipients,
          );
          return {
            ...rule,
            trigger_event_label: TRIGGER_EVENT_MAP[rule.trigger_event],
            recipients: mappedRecipients,
          };
        }),
      );

      this.logger.log(`[findAllNotificationRules] Successfully fetched and mapped ${rulesWithLabel.length} rules`);
      return new ApiResponseBuilder().success(
        {
          total: rulesWithLabel.length,
          data: rulesWithLabel,
        },
        NOTIFICATION_MESSAGES.FETCHED,
        HttpStatus.OK,
      );
    } catch (error: any) {
      this.logger.error(`[findAllNotificationRules] Error fetching all notification rules: ${error.message}`, error.stack);
      return new ApiResponseBuilder().error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOneNotificationRule(id: string) {
    this.logger.log(`[findOneNotificationRule] Fetching notification rule ID: ${id}`);
    try {
      const rule = await this.notificationRepo.findOne({ where: { id } });
      if (!rule) {
        this.logger.warn(`[findOneNotificationRule] Notification rule ID: ${id} not found`);
        throw new NotFoundException('Notification rule not found');
      }
      this.logger.debug(`[findOneNotificationRule] Found notification rule ID: ${id} in DB`);

      const mappedRecipients = await this.mapRoleIdsToTypes(rule.recipients);
      const ruleWithLabel = {
        ...rule,
        trigger_event_label: TRIGGER_EVENT_MAP[rule.trigger_event],
        recipients: mappedRecipients,
      };

      this.logger.log(`[findOneNotificationRule] Successfully fetched and mapped rule ID: ${id}`);
      return new ApiResponseBuilder().success(
        ruleWithLabel,
        NOTIFICATION_MESSAGES.FETCHED,
        HttpStatus.OK,
      );
    } catch (error: any) {
      this.logger.error(`[findOneNotificationRule] Error fetching notification rule ID: ${id}: ${error.message}`, error.stack);
      return new ApiResponseBuilder().error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateNotificationRule(id: string, dto: UpdateNotificationRuleDto) {
    this.logger.log(`[updateNotificationRule] Updating notification rule ID: ${id}`);
    try {
      const rule = await this.notificationRepo.findOne({ where: { id } });

      if (!rule) {
        this.logger.warn(`[updateNotificationRule] Notification rule ID: ${id} not found for update`);
        throw new NotFoundException('Notification rule not found');
      }
      if (dto.name) rule.name = dto.name;
      if (dto.triggerEvent) rule.trigger_event = dto.triggerEvent;
      if (dto.channels) rule.channels = dto.channels;
      if (dto.recipients) rule.recipients = dto.recipients;
      await this.notificationRepo.save(rule);

      this.logger.log(`[updateNotificationRule] Successfully updated notification rule ID: ${id}`);
      return new ApiResponseBuilder().success(
        rule,
        NOTIFICATION_MESSAGES.UPDATED,
        HttpStatus.OK,
      );
    } catch (error: any) {
      this.logger.error(`[updateNotificationRule] Error updating notification rule ID: ${id}: ${error.message}`, error.stack);
      return new ApiResponseBuilder().error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateStatusNotificationRule(id: string, isActive: boolean) {
    this.logger.log(`[updateStatusNotificationRule] Updating status for notification rule ID: ${id} to active: ${isActive}`);
    try {
      const rule = await this.notificationRepo.findOne({ where: { id } });

      if (!rule) {
        this.logger.warn(`[updateStatusNotificationRule] Notification rule ID: ${id} not found for status update`);
        throw new NotFoundException('Notification rule not found');
      }

      // Convert string to boolean if needed
      const isActiveBoolean =
        typeof isActive === 'string' ? isActive === 'true' : isActive;

      await this.notificationRepo.update(
        { id },
        { is_active: isActiveBoolean },
      );
      this.logger.debug(`[updateStatusNotificationRule] Database status update successful for rule ID: ${id}`);

      const updatedRule = await this.notificationRepo.findOne({
        where: { id },
      });
      this.logger.log(`[updateStatusNotificationRule] Successfully updated status for rule ID: ${id}`);

      return new ApiResponseBuilder().success(
        updatedRule,
        NOTIFICATION_MESSAGES.UPDATED,
        HttpStatus.OK,
      );
    } catch (error: any) {
      this.logger.error(`[updateStatusNotificationRule] Error updating status for notification rule ID: ${id}: ${error.message}`, error.stack);
      return new ApiResponseBuilder().error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async removeNotificationRule(id: string) {
    this.logger.log(`[removeNotificationRule] Removing notification rule ID: ${id}`);
    try {
      const rule = await this.notificationRepo.findOne({ where: { id } });

      if (!rule) {
        this.logger.warn(`[removeNotificationRule] Notification rule ID: ${id} not found for removal`);
        throw new NotFoundException('Notification rule not found');
      }

      await this.notificationRepo.remove(rule);
      this.logger.log(`[removeNotificationRule] Successfully deleted notification rule ID: ${id}`);

      return new ApiResponseBuilder().success(
        null,
        NOTIFICATION_MESSAGES.DELETED,
        HttpStatus.OK,
      );
    } catch (error: any) {
      this.logger.error(`[removeNotificationRule] Error removing notification rule ID: ${id}: ${error.message}`, error.stack);
      return new ApiResponseBuilder().error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
