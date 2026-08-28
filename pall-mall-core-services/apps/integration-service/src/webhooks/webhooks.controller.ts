import {
  Controller,
  Post,
  Body,
  Headers,
  Logger,
  Get,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { MailService } from './mail.service';
import { WebhooksService } from './webhooks.service';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('webhooks')
@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);
  constructor(
    private readonly mailService: MailService,
    private readonly webhooksservice: WebhooksService,
  ) {}

  @Post('zoho')
  @ApiOperation({ summary: 'Handle Zoho CRM webhooks' })
  @ApiResponse({ status: 200, description: 'Webhook processed' })
  handleZohoWebhook(@Body() payload: any, @Headers() headers: any) {
    this.logger.log('Received Zoho webhook');
    this.logger.debug('Payload:', JSON.stringify(payload));

    // TODO: Process webhook based on event type
    // - Contact created/updated
    // - Appointment created/updated
    // - etc.

    return { success: true, message: 'Webhook received' };
  }

  @Post('sendgrid')
  @ApiOperation({ summary: 'Handle Sendgrid webhooks (email events)' })
  @ApiResponse({ status: 200, description: 'Webhook processed' })
  handleSendgridWebhook(@Body() payload: any) {
    this.logger.log('Received Sendgrid webhook');
    this.logger.debug('Payload:', JSON.stringify(payload));

    // TODO: Process email events (delivered, bounced, opened, clicked)

    return { success: true, message: 'Webhook received' };
  }

  @Post('twilio')
  @ApiOperation({ summary: 'Handle Twilio webhooks (SMS status)' })
  @ApiResponse({ status: 200, description: 'Webhook processed' })
  handleTwilioWebhook(@Body() payload: any) {
    this.logger.log('Received Twilio webhook');
    this.logger.debug('Payload:', JSON.stringify(payload));

    // TODO: Process SMS status updates (delivered, failed)

    return { success: true, message: 'Webhook received' };
  }

  @Get('patient-forms-by-mail')
  @ApiOperation({ summary: 'Get patient forms by email' })
  @ApiResponse({
    status: 200,
    description: 'Patient forms fetched successfully',
  })
  async getPatientFormsByMail(@Query('email') email: string) {
    return this.webhooksservice.getPatientFormsByMail(email);
  }

  @Get('patient-forms')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async getPatientForms(@Req() req) {
    return this.webhooksservice.getPatientForms(req.user.userId);
  }

  @Get('patient-forms/helper')
  async getPatientFormsHelper(@Query('userId') userId: string) {
    return this.webhooksservice.getPatientForms(userId);
  }
}
