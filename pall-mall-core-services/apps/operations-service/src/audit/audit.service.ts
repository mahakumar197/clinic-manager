import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import {
  AuditLog,
  AuditAction,
  AuditEntity,
} from './entities/audit-log.entity';
import { asyncLocalStorage, logger } from '@pallmall/logger';
import { SearchAuditLogsDto } from './dto/audit.dtos';

export interface CreateAuditLogDto {
  userId?: string;
  userName?: string;
  action: AuditAction;
  entityType: AuditEntity;
  entityId: string;
  oldValue?: any;
  newValue?: any;
  metadata?: any;
  description?: string;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  /**
   * Create audit log entry
   */
  async log(dto: CreateAuditLogDto, req?: any): Promise<AuditLog> {
    logger.info('log (Audit) --->');
    const store = asyncLocalStorage.getStore();
    const correlationId = store?.get('correlationId');

    const auditLog = this.auditLogRepository.create({
      ...dto,
      correlationId,
      ipAddress: req?.ip || req?.socket?.remoteAddress,
      userAgent: req?.headers?.['user-agent'],
    });

    return await this.auditLogRepository.save(auditLog);
  }

  /**
   * Get audit logs for a specific entity
   */
  async getEntityAuditLogs(
    entityType: AuditEntity,
    entityId: string,
  ): Promise<AuditLog[]> {
    logger.info('getEntityAuditLogs --->');
    return await this.auditLogRepository.find({
      where: { entityType, entityId },
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  /**
   * Get audit logs for a user
   */
  async getUserAuditLogs(
    userId: string,
    limit: number = 100,
  ): Promise<AuditLog[]> {
    logger.info('getUserAuditLogs --->');
    return await this.auditLogRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Get audit logs by action
   */
  async getAuditLogsByAction(
    action: AuditAction,
    limit: number = 100,
  ): Promise<AuditLog[]> {
    logger.info('getAuditLogsByAction --->');
    return await this.auditLogRepository.find({
      where: { action },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Get audit logs within date range
   */
  async getAuditLogsByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<AuditLog[]> {
    logger.info('getAuditLogsByDateRange --->');
    return await this.auditLogRepository.find({
      where: {
        createdAt: Between(startDate, endDate),
      },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Search audit logs with filters
   */
  async searchAuditLogs(
    filters: SearchAuditLogsDto,
  ): Promise<{ data: AuditLog[]; total: number }> {
    logger.info('searchAuditLogs --->');
    const {
      page = 1,
      limit = 50,
      userId,
      action,
      entityType,
      startDate,
      endDate,
    } = filters;

    const queryBuilder = this.auditLogRepository.createQueryBuilder('audit');

    if (userId) {
      queryBuilder.andWhere('audit.userId = :userId', { userId });
    }

    if (action) {
      queryBuilder.andWhere('audit.action = :action', { action });
    }

    if (entityType) {
      queryBuilder.andWhere('audit.entityType = :entityType', { entityType });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('audit.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit).orderBy('audit.createdAt', 'DESC');

    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total };
  }

  /**
   * Get audit statistics
   */
  async getAuditStatistics(startDate?: Date, endDate?: Date): Promise<any> {
    logger.info('getAuditStatistics --->');
    const queryBuilder = this.auditLogRepository.createQueryBuilder('audit');

    if (startDate && endDate) {
      queryBuilder.where('audit.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    const totalLogs = await queryBuilder.getCount();

    const byAction = await this.auditLogRepository
      .createQueryBuilder('audit')
      .select('audit.action', 'action')
      .addSelect('COUNT(*)', 'count')
      .groupBy('audit.action')
      .getRawMany();

    const byEntity = await this.auditLogRepository
      .createQueryBuilder('audit')
      .select('audit.entityType', 'entityType')
      .addSelect('COUNT(*)', 'count')
      .groupBy('audit.entityType')
      .getRawMany();

    return {
      totalLogs,
      byAction,
      byEntity,
    };
  }
}