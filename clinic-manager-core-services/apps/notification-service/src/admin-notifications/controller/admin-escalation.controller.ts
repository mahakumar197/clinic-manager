import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Query,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AdminEscalationService } from '../service/admin-escalation.service';
import {
  CreateEscalationRuleDto,
  UpdateEscalationRuleDto,
  UpdateNotificationStatusDto,
  EscalationRulesListResponseDto,
  EscalationRuleByIdResponseDto,
} from '../dto/admin-notification.dto';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';

@ApiTags('Admin Escalations')
@Controller('admin/escalations')
export class AdminEscalationController {
  constructor(
    private readonly adminEscalationService: AdminEscalationService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'create a new escalation rule' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Escalation rule created successfully',
  })
  create(@Body() dto: CreateEscalationRuleDto) {
    return this.adminEscalationService.createEscalationRule(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all escalation rules' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Escalation rules fetched successfully',
    type: EscalationRulesListResponseDto,
  })
  findAll() {
    return this.adminEscalationService.findAllEscalationRules();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific escalation rule' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Escalation rule fetched successfully',
    type: EscalationRuleByIdResponseDto,
  })
  findOne(@Param('id') id: string) {
    return this.adminEscalationService.findOneEscalationRule(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'update an escalation rule' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Escalation rule updated successfully',
  })
  update(@Param('id') id: string, @Body() dto: UpdateEscalationRuleDto) {
    return this.adminEscalationService.updateEscalationRule(id, dto);
  }

  @Put('status/:id')
  @ApiOperation({ summary: 'update an escalation rule status' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Escalation rule status updated successfully',
  })
  updateStatus(@Param('id') id: string, @Query('isActive') isActive: boolean) {
    return this.adminEscalationService.updateStatusEscalationRule(id, isActive);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'delete an escalation rule' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Escalation rule deleted successfully',
  })
  remove(@Param('id') id: string) {
    return this.adminEscalationService.removeEscalationRule(id);
  }
}
