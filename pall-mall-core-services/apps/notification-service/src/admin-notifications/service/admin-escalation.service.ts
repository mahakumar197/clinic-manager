import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EscalationRule } from '../entities/escalation-rule.entity';
import {
  CreateEscalationRuleDto,
  UpdateEscalationRuleDto,
} from '../dto/admin-notification.dto';
import { ApiResponseBuilder, HttpStatus } from '@pallmall/shared-types';
import {
  ESCALATION_MESSAGES,
  TRIGGER_EVENT_MAP,
  TriggerEvent,
  EscalationCondition,
  ESCALATION_CONDITION_MAP,
  ESCALATION_ACTION_MAP,
} from '@pallmall/common-utils';
import axios from 'axios';

@Injectable()
export class AdminEscalationService {
  private readonly logger = new Logger(AdminEscalationService.name);

  constructor(
    @InjectRepository(EscalationRule)
    private readonly escalationRepo: Repository<EscalationRule>,
  ) {}

  // Content service base URL for dropdowns
  private contentServiceUrl =
    process.env.BASE_CONTENT || 'http://127.0.0.1:2092';
  // Cache for dropdowns by type
  private dropdownCache: Map<string, any[]> = new Map();

  /**
   * Fetch dropdown entries from master by type (cached)
   */
  private async fetchDropdownByType(type: string): Promise<any[]> {
    this.logger.log(`[fetchDropdownByType] Fetching dropdown entries for type: ${type}`);
    
    if (this.dropdownCache.has(type)) {
      this.logger.debug(`[fetchDropdownByType] Returning cached dropdown entries for type: ${type}`);
      return this.dropdownCache.get(type) || [];
    }

    try {
      this.logger.log(`[fetchDropdownByType] Calling content-service API for dropdown type: ${type}`);
      const res = await axios.get(
        `${this.contentServiceUrl}/api/v1/dropdowns/${type}`,
        { timeout: 3000 },
      );
      
      const items = res.data?.data || [];
      this.logger.debug(`[fetchDropdownByType] Successfully fetched ${items.length} items from API for ${type}`);
      this.dropdownCache.set(type, items);
      
      return items;
    } catch (err: any) {
      // Use standard err as this might not be an Error object from Axios
      const errorMessage = err?.message || err;
      this.logger.error(`[fetchDropdownByType] Failed to fetch dropdown ${type}: ${errorMessage}`, err.stack);
      return [];
    }
  }

  /**
   * Map a dropdown value (beValue/enValue/label) to its ID for a given type
   */
  private async mapEscalationValueToId(
    value: string,
    type: string,
  ): Promise<number | null> {
    this.logger.log(`[mapEscalationValueToId] Mapping value for type: ${type}`);
    if (!value) {
      this.logger.warn(`[mapEscalationValueToId] No value provided for type: ${type}`);
      return null;
    }
    
    const items = await this.fetchDropdownByType(type);
    const found = items.find((it: any) => {
      const be = (it.beValue || it.label || it.value || '')
        .toString()
        .toLowerCase();
      return be === value.toString().toLowerCase();
    });
    
    if (found) {
      this.logger.debug(`[mapEscalationValueToId] Successfully mapped value to ID: ${found.id}`);
    } else {
      this.logger.warn(`[mapEscalationValueToId] Could not map value to ID for type: ${type}`);
    }
    
    return found ? found.id : null;
  }

  /**
   * Map recipients.roles array which may contain role ids or role names to role type strings
   * Uses RoleType dropdown to resolve ids to beValue strings
   */
  private async mapRecipientsRolesUsingRoleType(recipients: any): Promise<any> {
    this.logger.log(`[mapRecipientsRolesUsingRoleType] Mapping recipient roles`);
    if (
      !recipients ||
      !Array.isArray(recipients.roles) ||
      recipients.roles.length === 0
    ) {
      this.logger.debug(`[mapRecipientsRolesUsingRoleType] No roles to map`);
      return recipients;
    }

    const roleTypeItems = await this.fetchDropdownByType('RoleType');
    const mapped = recipients.roles
      .map((r: any) => {
        // if numeric or numeric-string, find by id
        if (!isNaN(Number(r))) {
          const found = roleTypeItems.find(
            (it: any) => Number(it.id) === Number(r),
          );
          return found
            ? (found.beValue || found.label || '').toString().toLowerCase()
            : null;
        }
        // otherwise treat as name/beValue
        const foundByName = roleTypeItems.find(
          (it: any) =>
            (it.beValue || it.label || '').toString().toLowerCase() ===
            r.toString().toLowerCase(),
        );
        return foundByName
          ? (foundByName.beValue || foundByName.label || '')
              .toString()
              .toLowerCase()
          : r.toString().toLowerCase();
      })
      .filter((x: any) => !!x);

    this.logger.debug(`[mapRecipientsRolesUsingRoleType] Successfully mapped ${mapped.length} roles`);
    return {
      ...recipients,
      roles: mapped,
    };
  }

  async createEscalationRule(dto: CreateEscalationRuleDto) {
    this.logger.log(`[createEscalationRule] Creating new escalation rule`);
    try {
      const escalation = await this.escalationRepo.create({
        name: dto.name,
        base_trigger_event: dto.baseTriggerEvent,
        condition: dto.condition,
        action: dto.action,
        channels: dto.channels,
        recipients: dto.recipients,
        is_active: true,
      });

      const result = await this.escalationRepo.save(escalation);
      this.logger.log(`[createEscalationRule] Successfully saved escalation rule ID: ${result.id}`);

      return new ApiResponseBuilder().success(
        result,
        ESCALATION_MESSAGES.CREATED,
        HttpStatus.CREATED,
      );
    } catch (error: any) {
      this.logger.error(`[createEscalationRule] Error creating escalation rule: ${error.message}`, error.stack);
      return new ApiResponseBuilder().error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAllEscalationRules() {
    this.logger.log(`[findAllEscalationRules] Fetching all escalation rules`);
    try {
      const escalations = await this.escalationRepo.find({
        order: { created_at: 'DESC' },
      });
      this.logger.debug(`[findAllEscalationRules] Found ${escalations.length} escalation rules from DB`);

      const conditionItems = await this.fetchDropdownByType(
        'escalationCondition',
      );
      const actionItems = await this.fetchDropdownByType('EscalationAction');

      const escalationsWithLabel = await Promise.all(
        escalations.map(async (escalation) => {
          const conditionItem = conditionItems.find(
            (i: any) => Number(i.id) === Number(escalation.condition),
          );
          const actionItem = actionItems.find(
            (i: any) => Number(i.id) === Number(escalation.action),
          );
          const mappedRecipients = await this.mapRecipientsRolesUsingRoleType(
            escalation.recipients,
          );
          return {
            ...escalation,
            base_trigger_event_label:
              TRIGGER_EVENT_MAP[escalation.base_trigger_event],
            condition_label: conditionItem
              ? (conditionItem.beValue || conditionItem.label || '').toString()
              : ESCALATION_CONDITION_MAP[escalation.condition],
            action_label: actionItem
              ? (actionItem.beValue || actionItem.label || '').toString()
              : ESCALATION_ACTION_MAP[escalation.action],
            recipients: mappedRecipients,
          };
        }),
      );

      this.logger.log(`[findAllEscalationRules] Successfully fetched and mapped ${escalationsWithLabel.length} rules`);
      return new ApiResponseBuilder().success(
        {
          total: escalationsWithLabel.length,
          data: escalationsWithLabel,
        },
        ESCALATION_MESSAGES.FETCHED,
        HttpStatus.OK,
      );
    } catch (error: any) {
      this.logger.error(`[findAllEscalationRules] Error fetching all escalation rules: ${error.message}`, error.stack);
      return new ApiResponseBuilder().error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOneEscalationRule(id: string) {
    this.logger.log(`[findOneEscalationRule] Fetching escalation rule ID: ${id}`);
    try {
      const escalation = await this.escalationRepo.findOne({
        where: { id },
      });
      
      if (!escalation) {
        this.logger.warn(`[findOneEscalationRule] Escalation rule ID: ${id} not found`);
        throw new NotFoundException('Escalation rule not found');
      }
      this.logger.debug(`[findOneEscalationRule] Found escalation rule ID: ${id} in DB`);
      
      const conditionItems = await this.fetchDropdownByType(
        'EscalationCondition',
      );
      const actionItems = await this.fetchDropdownByType('EscalationAction');
      const conditionItem = conditionItems.find(
        (i: any) => Number(i.id) === Number(escalation.condition),
      );
      const actionItem = actionItems.find(
        (i: any) => Number(i.id) === Number(escalation.action),
      );
      const mappedRecipients = await this.mapRecipientsRolesUsingRoleType(
        escalation.recipients,
      );
      const escalationWithLabel = {
        ...escalation,
        base_trigger_event_label:
          TRIGGER_EVENT_MAP[escalation.base_trigger_event],
        condition_label: conditionItem
          ? (conditionItem.beValue || conditionItem.label || '').toString()
          : ESCALATION_CONDITION_MAP[escalation.condition],
        action_label: actionItem
          ? (actionItem.beValue || actionItem.label || '').toString()
          : ESCALATION_ACTION_MAP[escalation.action],
        recipients: mappedRecipients,
      };

      this.logger.log(`[findOneEscalationRule] Successfully fetched and mapped rule ID: ${id}`);
      return new ApiResponseBuilder().success(
        escalationWithLabel,
        ESCALATION_MESSAGES.FETCHED,
        HttpStatus.OK,
      );
    } catch (error: any) {
      this.logger.error(`[findOneEscalationRule] Error fetching escalation rule ID: ${id}: ${error.message}`, error.stack);
      return new ApiResponseBuilder().error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateEscalationRule(id: string, dto: UpdateEscalationRuleDto) {
    this.logger.log(`[updateEscalationRule] Updating escalation rule ID: ${id}`);
    try {
      const escalation = await this.escalationRepo.findOne({ where: { id } });
      if (!escalation) {
        this.logger.warn(`[updateEscalationRule] Escalation rule ID: ${id} not found for update`);
        throw new NotFoundException('Escalation rule not found');
      }
      
      if (dto.name) escalation.name = dto.name;
      if (dto.baseTriggerEvent)
        escalation.base_trigger_event = dto.baseTriggerEvent;
      if (dto.condition) escalation.condition = dto.condition;
      if (dto.action) escalation.action = dto.action;
      if (dto.channels) escalation.channels = dto.channels;
      if (dto.recipients) escalation.recipients = dto.recipients;
      
      await this.escalationRepo.update(id, escalation);
      this.logger.debug(`[updateEscalationRule] Database update successful for rule ID: ${id}`);

      const updatedEscalation = await this.findOneEscalationRule(id);
      this.logger.log(`[updateEscalationRule] Successfully updated escalation rule ID: ${id}`);

      return new ApiResponseBuilder().success(
        updatedEscalation,
        ESCALATION_MESSAGES.UPDATED,
        HttpStatus.OK,
      );
    } catch (error: any) {
      this.logger.error(`[updateEscalationRule] Error updating escalation rule ID: ${id}: ${error.message}`, error.stack);
      return new ApiResponseBuilder().error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateStatusEscalationRule(id: string, isActive: boolean) {
    this.logger.log(`[updateStatusEscalationRule] Updating status for escalation rule ID: ${id} to active: ${isActive}`);
    try {
      const escalation = await this.escalationRepo.findOne({ where: { id } });
      if (!escalation) {
        this.logger.warn(`[updateStatusEscalationRule] Escalation rule ID: ${id} not found for status update`);
        throw new NotFoundException('Escalation rule not found');
      }

      // Convert string to boolean if needed
      const isActiveBoolean =
        typeof isActive === 'string' ? isActive === 'true' : isActive;
        
      const updatedEscalation = await this.escalationRepo.update(
        { id },
        { is_active: isActiveBoolean },
      );
      this.logger.debug(`[updateStatusEscalationRule] Database status update successful for rule ID: ${id}`);

      const updatedRule = await this.escalationRepo.findOne({ where: { id } });
      this.logger.log(`[updateStatusEscalationRule] Successfully updated status for rule ID: ${id}`);
      
      return new ApiResponseBuilder().success(
        updatedRule,
        ESCALATION_MESSAGES.UPDATED,
        HttpStatus.OK,
      );
    } catch (error: any) {
      this.logger.error(`[updateStatusEscalationRule] Error updating status for escalation rule ID: ${id}: ${error.message}`, error.stack);
      return new ApiResponseBuilder().error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async removeEscalationRule(id: string) {
    this.logger.log(`[removeEscalationRule] Removing escalation rule ID: ${id}`);
    try {
      const escalation = await this.escalationRepo.findOne({ where: { id } });
      if (!escalation) {
        this.logger.warn(`[removeEscalationRule] Escalation rule ID: ${id} not found for removal`);
        throw new NotFoundException('Escalation rule not found');
      }
      
      await this.escalationRepo.remove(escalation);
      this.logger.log(`[removeEscalationRule] Successfully deleted escalation rule ID: ${id}`);
      
      return new ApiResponseBuilder().success(
        null,
        ESCALATION_MESSAGES.DELETED,
        HttpStatus.OK,
      );
    } catch (error: any) {
      this.logger.error(`[removeEscalationRule] Error removing escalation rule ID: ${id}: ${error.message}`, error.stack);
      return new ApiResponseBuilder().error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
