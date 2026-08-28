import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional, IsObject } from 'class-validator';

/* =====================================================
   EMAIL – BASIC
===================================================== */
export class SendEmailDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  to: string;

  @ApiProperty({ example: 'Welcome to pallmall System' })
  @IsString()
  subject: string;

  @ApiProperty({ example: 'Welcome! Your account has been created.' })
  @IsString()
  content: string;

  @ApiProperty({ example: 'user-uuid', required: false })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({ example: 'OTP_EMAIL', required: false })
  @IsOptional()
  @IsString()
  templateCode?: string;

  @ApiProperty({ example: { name: 'John', otp: '123456' }, required: false })
  @IsOptional()
  @IsObject()
  templateData?: any;
}

/* =====================================================
   EMAIL – OTP
===================================================== */
export class SendOtpEmailDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  to: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  otp: string;
}

/* =====================================================
   EMAIL – ADVANCED
===================================================== */
export class SendEmailAdvanceDto {
  @ApiProperty({
    example: 'user-uuid',
    description: 'User ID of the email recipient',
  })
  userId: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'Recipient email address',
  })
  to: string;

  @ApiProperty({
    example: 'New Appointment',
    description: 'Email subject',
  })
  subject: string;

  @ApiProperty({
    example: 'You have an appointment tomorrow at 10 AM',
    description: 'Email body content',
  })
  content: string;

  @ApiProperty({
    example: 'appointment-template',
    nullable: true,
    required: false,
    description: 'Optional email template ID',
  })
  templateId?: string | null;

  @ApiProperty({
    example: { appointmentId: 'appt-123' },
    nullable: true,
    required: false,
    description: 'Template variables',
  })
  templateData?: Record<string, any> | null;

  @ApiProperty({
    example: { source: 'admin-panel' },
    nullable: true,
    required: false,
    description: 'Additional metadata',
  })
  metadata?: Record<string, any>;
}

/* =====================================================
   PUSH NOTIFICATION
===================================================== */
export class SendPushDto {
  @ApiProperty({ example: 'device-token-here' })
  @IsString()
  deviceToken: string;

  @ApiProperty({ example: 'New Appointment' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'You have an appointment tomorrow at 10 AM' })
  @IsString()
  body: string;

  @ApiProperty({ example: 'user-uuid', required: false })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({ example: { appointmentId: 'appt-123' }, required: false })
  @IsOptional()
  @IsObject()
  data?: any;
}

/* =====================================================
   SMS
===================================================== */
export class SendSmsDto {
  @ApiProperty({ example: '+1234567890' })
  @IsString()
  to: string;

  @ApiProperty({ example: 'Your OTP is 123456' })
  @IsString()
  message: string;

  @ApiProperty({ example: 'user-uuid', required: false })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({ example: 'OTP_SMS', required: false })
  @IsOptional()
  @IsString()
  templateCode?: string;

  @ApiProperty({ example: { otp: '123456' }, required: false })
  @IsOptional()
  @IsObject()
  templateData?: any;
}

/* =====================================================
   FETCH NOTIFICATIONS BY USER
===================================================== */
export class NotificationsByUserDto {
  @ApiProperty({
    type: 'array',
    description: 'List of notifications for a user',
    example: [
      {
        id: '226082e3-5aa6-4859-afcc-69d76e318be7',
        type: 'push',
        recipient: 'device-token-here',
        userId: 'user-uuid',
        subject: 'New Appointment',
        content: 'You have an appointment tomorrow at 10 AM',
        status: 'sent',
        templateId: null,
        templateData: null,
        metadata: { appointmentId: 'appt-123' },
        externalId: 'mock-push-1768835721191',
        errorMessage: null,
        sentAt: '2026-01-19T15:15:21.191Z',
        deliveredAt: null,
        retryCount: 0,
        createdAt: '2026-01-19T09:45:21.892Z',
        updatedAt: '2026-01-19T09:45:22.330Z',
      },
    ],
  })
  data: {
    id: string;
    type: string;
    recipient: string;
    userId: string;
    subject: string;
    content: string;
    status: string;
    templateId: string | null;
    templateData: any | null;
    metadata: Record<string, any> | null;
    externalId: string;
    errorMessage: string | null;
    sentAt: string;
    deliveredAt: string | null;
    retryCount: number;
    createdAt: string;
    updatedAt: string;
  }[];
}

/* =====================================================
   WEB NOTIFICATIONS
===================================================== */
export class CreateWebNotificationDto {
  @ApiProperty({ example: 'user-uuid' })
  @IsString()
  userId: string;

  @ApiProperty({ example: 'New Task Assigned' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'You have been assigned a new task' })
  @IsString()
  message: string;

  @ApiProperty({ example: 'task_created' })
  @IsString()
  type: string;

  @ApiProperty({ example: 'normal', required: false })
  @IsOptional()
  @IsString()
  priority?: 'normal' | 'urgent';

  @ApiProperty({ example: 'Emily Thompson', required: false })
  @IsOptional()
  @IsString()
  patientName?: string;

  @ApiProperty({ example: 'PT2451', required: false })
  @IsOptional()
  @IsString()
  patientReference?: string;

  @ApiProperty({ example: 'task-uuid', required: false })
  @IsOptional()
  @IsString()
  relatedEntityId?: string;

  @ApiProperty({ example: new Date(), required: false })
  @IsOptional()
  dueAt?: Date;

  @ApiProperty({ example: { taskName: 'Upload ID' }, required: false })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class SendWebNotificationEmailDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  to: string;

  @ApiProperty({ example: 'New Task Assigned' })
  @IsString()
  subject: string;

  @ApiProperty({ example: 'notification-template', required: false })
  @IsOptional()
  @IsString()
  template?: string;

  @ApiProperty({
    example: { title: 'Task', message: 'New task' },
    required: false,
  })
  @IsOptional()
  @IsObject()
  context?: any;
}

export class GetNotificationRulesDto {
  @ApiProperty({ example: 'user-uuid' })
  @IsString()
  userId: string;
}
