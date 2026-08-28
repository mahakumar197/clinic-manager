import { Controller, Get, Query, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { AuditAction, AuditEntity } from './entities/audit-log.entity';

// SINGLE IMPORT SOURCE
import {
  SearchAuditLogsDto,
  GetAuditStatsDto,
  GetAuditLogsResponseDto,
  GetAuditStatsResponseDto,
} from './dto/audit.dtos';

@ApiTags('audit')
@Controller('audit')
@ApiBearerAuth()
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('entity/:entityType/:entityId')
  @ApiOperation({ summary: 'Get audit logs for a specific entity' })
  @ApiResponse({
    status: 200,
    description: 'Audit logs retrieved',
    type: GetAuditLogsResponseDto,
  })
  getEntityAuditLogs(
    @Param('entityType') entityType: AuditEntity,
    @Param('entityId') entityId: string,
  ) {
    return this.auditService.getEntityAuditLogs(entityType, entityId);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get audit logs for a user' })
  @ApiResponse({
    status: 200,
    description: 'User audit logs retrieved',
    type: GetAuditLogsResponseDto,
  })
  getUserAuditLogs(
    @Param('userId') userId: string,
    @Query('limit') limit?: number,
  ) {
    return this.auditService.getUserAuditLogs(userId, limit);
  }

  @Get('action/:action')
  @ApiOperation({ summary: 'Get audit logs by action' })
  @ApiResponse({
    status: 200,
    description: 'Audit logs by action retrieved',
    type: GetAuditLogsResponseDto,
  })
  getAuditLogsByAction(
    @Param('action') action: AuditAction,
    @Query('limit') limit?: number,
  ) {
    return this.auditService.getAuditLogsByAction(action, limit);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search audit logs with filters' })
  @ApiResponse({
    status: 200,
    description: 'Audit logs search results',
    type: GetAuditLogsResponseDto,
  })
  searchAuditLogs(@Query() filters: SearchAuditLogsDto) {
    return this.auditService.searchAuditLogs(filters);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get audit statistics' })
  @ApiResponse({
    status: 200,
    description: 'Audit statistics retrieved',
    type: GetAuditStatsResponseDto,
  })
  getAuditStatistics(@Query() statsDto: GetAuditStatsDto) {
    return this.auditService.getAuditStatistics(
      statsDto.startDate ? new Date(statsDto.startDate) : undefined,
      statsDto.endDate ? new Date(statsDto.endDate) : undefined,
    );
  }
}
