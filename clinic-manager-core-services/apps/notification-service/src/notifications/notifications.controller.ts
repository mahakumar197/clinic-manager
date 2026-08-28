import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Req,
  Delete,
  Query,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import {
  SendEmailDto,
  SendOtpEmailDto,
  SendPushDto,
  SendSmsDto,
  NotificationsByUserDto,
  CreateWebNotificationDto,
  SendWebNotificationEmailDto,
  GetNotificationRulesDto,
} from './dto/notifications.dto';
import { PaginationQueryDto } from '@pallmall/common-utils';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('notifications')
@Controller('notifications')
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /* ---------------- SEND NOTIFICATIONS ---------------- */

  @Post('email')
  @ApiOperation({ summary: 'Send email notification' })
  sendEmail(@Body() sendEmailDto: SendEmailDto) {
    return this.notificationsService.sendEmail(sendEmailDto);
  }

  @Post('emailotp')
  @ApiOperation({ summary: 'Send password reset OTP email' })
  sendOtpEmail(@Body() sendOtpDto: SendOtpEmailDto) {
    return this.notificationsService.sendPasswordResetOtpEmail(
      sendOtpDto.to,
      sendOtpDto.otp,
    );
  }

  @Post('email-verify-otp')
  @ApiOperation({ summary: 'Send email verification OTP' })
  sendEmailVerifyOtpEmail(@Body() sendOtpDto: SendOtpEmailDto) {
    return this.notificationsService.sendVerifyOtpEmail(
      sendOtpDto.to,
      sendOtpDto.otp,
    );
  }

  @Post('sms')
  @ApiOperation({ summary: 'Send SMS notification' })
  sendSms(@Body() sendSmsDto: SendSmsDto) {
    return this.notificationsService.sendSms(sendSmsDto);
  }

  @Post('push')
  @ApiOperation({ summary: 'Send push notification' })
  sendPush(@Body() sendPushDto: SendPushDto) {
    return this.notificationsService.sendPush(sendPushDto);
  }

  /* ============ WEB NOTIFICATIONS ============ */

  @Post('web')
  @ApiOperation({ summary: 'Create web notification' })
  createWebNotification(@Body() dto: CreateWebNotificationDto) {
    return this.notificationsService.createWebNotification(dto);
  }

  /* ============ COUNTS ============ */

  @Get('counts')
  @ApiOperation({ summary: 'Get notification counts' })
  getCounts(@Req() req) {
    const userId = req?.user?.userId;
    if (!userId) {
      return { total: 0, unread: 0 };
    }
    return this.notificationsService.getCounts(userId);
  }

  /* ---------------- IN-APP NOTIFICATIONS ---------------- */
  @Get('app')
  @ApiOperation({ summary: 'Get in-app notifications for Patient' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'In-app notifications retrieved',
  })
  @UseGuards(AuthGuard('jwt'))
  getInAppNotifications(@Req() req, @Query() query: PaginationQueryDto) {
    return this.notificationsService.getInAppNotifications(
      req.user.userId,
      query,
    );
  }

  /* ---------------- READ / UNREAD ---------------- */

  @Patch('read/bulk/:userId')
  @ApiOperation({ summary: 'Mark all notifications as read/unread for a user' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        isRead: { type: 'boolean' },
      },
    },
  })
  markBulk(@Param('userId') userId: string, @Body('isRead') isRead: boolean) {
    if (!userId) {
      return { message: 'User ID is required' };
    }
    return this.notificationsService.markAllByUser(userId, isRead);
  }

  @Patch(':id/read/:userId')
  @ApiOperation({ summary: 'Mark notification as read/unread' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        isRead: { type: 'boolean', example: true },
      },
    },
  })
  markAsRead(
    @Param('id') notificationId: string,
    @Param('userId') userId: string,
    @Body('isRead') isRead: boolean,
    @Req() req,
  ) {
    if (!userId) {
      return { message: 'User ID is required' };
    }
    return this.notificationsService.markAsRead(notificationId, userId, isRead);
  }

  /* ---------------- UPDATE ---------------- */

  @Patch(':id')
  @ApiOperation({ summary: 'Update notification' })
  updateNotification(
    @Param('id') id: string,
    @Body() body: { title?: string; message?: string },
  ) {
    return this.notificationsService.updateNotification(id, body);
  }

  /* ---------------- DELETE ---------------- */

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete notification' })
  delete(@Param('id') id: string) {
    return this.notificationsService.softDelete(id);
  }

  /* ---------------- GET ---------------- */

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all notifications for a user' })
  findByUser(@Param('userId') userId: string) {
    return this.notificationsService.findByUser(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get notification by ID' })
  @ApiOkResponse({ type: NotificationsByUserDto })
  findOne(@Param('id') id: string) {
    return this.notificationsService.findOne(id);
  }
}
