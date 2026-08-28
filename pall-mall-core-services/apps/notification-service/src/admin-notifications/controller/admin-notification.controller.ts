import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Put,
  Param,
  Delete,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { AdminNotificationService } from '../service/admin-notification.service';
import {
  CreateNotificationRuleDto,
  UpdateNotificationRuleDto,
  UpdateNotificationStatusDto,
  NotificationRulesListDto,
  NotificationRuleByIdResponseDto,
} from '../dto/admin-notification.dto';
import {
  ApiTags,
  ApiBody,
  ApiResponse,
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';

@ApiTags('Admin Notifications')
@Controller('admin/notifications')
export class AdminNotificationController {
  constructor(
    private readonly adminNotificationService: AdminNotificationService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'create a Notification rule' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Notification rule created successfully',
  })
  @ApiBody({ type: CreateNotificationRuleDto })
  create(@Body() dto: CreateNotificationRuleDto) {
    return this.adminNotificationService.createNotificationRule(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all notification rules' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Notification rules fetched successfully',
    type: NotificationRulesListDto,
  })
  findAll() {
    return this.adminNotificationService.findAllNotificationRules();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a notification rule by ID' })
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Notification rule fetched successfully',
    type: NotificationRuleByIdResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Notification rule not found',
  })
  findOne(@Param('id') id: string) {
    return this.adminNotificationService.findOneNotificationRule(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'update a Notification rule' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Notification rule updated successfully',
  })
  @ApiBody({ type: UpdateNotificationRuleDto })
  update(@Param('id') id: string, @Body() dto: UpdateNotificationRuleDto) {
    return this.adminNotificationService.updateNotificationRule(id, dto);
  }

  @Put('status/:id')
  @ApiOperation({ summary: 'update a Notification rule status' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Notification rule status updated successfully',
  })
  updateStatus(@Param('id') id: string, @Query('isActive') isActive: boolean) {
    return this.adminNotificationService.updateStatusNotificationRule(
      id,
      isActive,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'delete a Notification rule' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Notification rule deleted successfully',
  })
  remove(@Param('id') id: string) {
    return this.adminNotificationService.removeNotificationRule(id);
  }
}
