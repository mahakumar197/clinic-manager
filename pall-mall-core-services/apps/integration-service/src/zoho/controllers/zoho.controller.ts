import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Req,
  UseGuards,
  Logger,
  Headers,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { ZohoService } from '../services/zoho.service';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('zoho')
@Controller('zoho')
export class ZohoController {
  private readonly logger = new Logger(ZohoController.name);
  constructor(private readonly zohoService: ZohoService) {}

  @Get('appointments')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get patient appointments from Zoho' })
  @ApiResponse({
    status: 200,
    description: 'Appointments retrieved successfully',
  })
  async getAppointments(@Req() req) {
    this.logger.log('[getAppointments] Endpoint hit');
    const email = req.user.email;
    const userId = req.user.userId;
    return this.zohoService.PatientAppointments(email, userId);
  }

  @Get('appointments-via-email')
  @ApiOperation({ summary: 'Get patient appointments from Zoho' })
  @ApiResponse({
    status: 200,
    description: 'Appointments retrieved successfully',
  })
  async getAppointmentsviaEmail(@Query('email') email: string) {
    this.logger.log('[getAppointmentsviaEmail] Endpoint hit');
    return this.zohoService.orchestratePatientAppointments(email);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Handle Zoho CRM webhooks' })
  @ApiResponse({ status: 200, description: 'Webhook processed' })
  @ApiBody({
    schema: {
      type: 'object',
      example: {
        consult_date: '2026-03-18T10:00:00Z',
        patient_email: 'testing@gmail.com',
        patient_stage: 'phase_4',
        appointment_location: 'PallMall UK',
        surgeon_name: 'Dr. John Doe',
        consultat_status: 'completed',
        procedure_name: 'Knee Surgery',
        send_to_app: true,
      },
    },
  })
  async handleZohoWebhook(@Body() payload: any, @Headers() headers: any) {
    this.logger.log('Received Zoho webhook');

    await this.zohoService.processWebhook(payload);

    return {
      success: true,
      message: 'Webhook received',
    };
  }

  @Post('generate-token')
  @ApiOperation({ summary: 'Generate Zoho Access token' })
  @ApiResponse({
    status: 200,
    description: 'Zoho token generated successfully',
  })
  async generateZohoAccessToken() {
    this.logger.log('[generateZohoAccessToken] Endpoint hit');
    await this.zohoService.forceGenerateAccessToken();
    return {
      success: true,
      message: 'Zoho token force-generated and saved to database successfully',
    };
  }

  @Post('generate-form-token')
  @ApiOperation({ summary: 'Generate Zoho Forms Access token' })
  @ApiResponse({
    status: 200,
    description: 'Zoho Forms token generated successfully',
  })
  async generateZohoFormAccessToken() {
    this.logger.log('[generateZohoFormAccessToken] Endpoint hit');
    await this.zohoService.forceGenerateAccessTokenforZohoForms();
    return {
      success: true,
      message:
        'Zoho Forms token force-generated and saved to database successfully',
    };
  }

  @Post('webhook/form')
  @ApiOperation({
    summary: 'Catch Zoho Forms webhook and forward to Content Service',
  })
  @ApiBody({
    schema: {
      type: 'object',
      example: {
        'First Name': 'John',
        'Last Name': 'Doe',
        'Phone Number': '+91 9876543210',
        'Any previous surgeries?': 'No',
        'Preferred Consultation Date': '2026-03-20',
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Webhook caught and forwarded' })
  async catchFormWebhook(@Body() payload: any, @Req() req: any) {
    return this.zohoService.catchAndForwardZohoWebhook(payload, req);
  }

  @Post('webhook/ask-the-team/form')
  @ApiOperation({
    summary: 'Catch Ask the team webhook and forward to Content Service',
  })
  @ApiResponse({ status: 200, description: 'Webhook caught and forwarded' })
  async catchAskTheTeamFormWebhook(@Body() payload: any) {
    return this.zohoService.catchAndForwardZohoWebhookNew(payload, {
      formType: 'Ask the team',
    });
  }

  @Post('webhook/ask-the-surgeon/form')
  @ApiOperation({
    summary: 'Catch Ask the surgeon webhook and forward to Content Service',
  })
  @ApiResponse({ status: 200, description: 'Webhook caught and forwarded' })
  async catchAskTheSurgeonFormWebhook(@Body() payload: any) {
    return this.zohoService.catchAndForwardZohoWebhookNew(payload, {
      formType: 'Ask the Surgeon (APP)',
    });
  }

  @Post('webhook/ssq/form')
  @ApiOperation({
    summary: 'Catch Surgery Screening Questionnaire webhook and forward to Content Service',
  })
  @ApiResponse({ status: 200, description: 'Webhook caught and forwarded' })
  async catchSsqFormWebhook(@Body() payload: any) {
    return this.zohoService.catchAndForwardZohoWebhookNew(payload, {
      formType: 'Surgery Screening Questionnaire (“SSQ”)',
    });
  }

  @Post('webhook/post-op-day/form')
  @ApiOperation({
    summary: 'Catch Post op day webhook and forward to Content Service',
  })
  @ApiResponse({ status: 200, description: 'Webhook caught and forwarded' })
  async catchPostOpDayFormWebhook(@Body() payload: any) {
    return this.zohoService.catchAndForwardZohoWebhookNew(payload, {
      formType: 'Post Surgery Recovery Check-In - Days 1-14',
    });
  }

  @Post('webhook/post-op-week/form')
  @ApiOperation({
    summary: 'Catch Post op week webhook and forward to Content Service',
  })
  @ApiResponse({ status: 200, description: 'Webhook caught and forwarded' })
  async catchPostOpWeekFormWebhook(@Body() payload: any) {
    return this.zohoService.catchAndForwardZohoWebhookNew(payload, {
      formType: 'Post Surgery Recovery Check-In - Weeks 3-12',
    });
  }

  @Post('webhook/post-op-month/form')
  @ApiOperation({
    summary: 'Catch Post op month webhook and forward to Content Service',
  })
  @ApiResponse({ status: 200, description: 'Webhook caught and forwarded' })
  async catchPostOpMonthFormWebhook(@Body() payload: any) {
    return this.zohoService.catchAndForwardZohoWebhookNew(payload, {
      formType: 'Post Surgery Recovery Check-In - Months 4-12',
    });
  }

  @Post('webhook/patient-consent-form/form')
  @ApiOperation({
    summary: 'Catch Patient consent form webhook and forward to Content Service',
  })
  @ApiResponse({ status: 200, description: 'Webhook caught and forwarded' })
  async catchPatientConsentFormWebhook(@Body() payload: any) {
    return this.zohoService.catchAndForwardZohoWebhookNew(payload, {
      formType: 'Patient Consent Form - Pall Mall Cosmetics',
    });
  }

  @Post('webhook/pre-surgery-photo-assessment/form')
  @ApiOperation({
    summary: 'Catch Pre surgery photo assessment webhook and forward to Content Service',
  })
  @ApiResponse({ status: 200, description: 'Webhook caught and forwarded' })
  async catchPreSurgeryPhotoAssessmentFormWebhook(@Body() payload: any) {
    return this.zohoService.catchAndForwardZohoWebhookNew(payload, {
      formType: 'Pre-Consultation Assessment',
    });
  }

  @Post('webhook-log')
  @ApiOperation({
    summary: 'Store raw Zoho webhook payload in Zoho logs table',
  })
  @ApiResponse({ status: 200, description: 'Webhook logged successfully' })
  async logWebhook(@Body() payload: any) {
    return this.zohoService.saveWebhookLog(payload);
  }

  @Post('webhook/form/response')
  @ApiOperation({
    summary: 'Catch Zoho Forms webhook and forward to Content Service',
  })
  @ApiBody({
    schema: {
      type: 'object',
      example: {
        'First Name': 'John',
        'Last Name': 'Doe',
        'Phone Number': '+91 9876543210',
        'Any previous surgeries?': 'No',
        'Preferred Consultation Date': '2026-03-20',
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Webhook caught and forwarded' })
  async catchZohoWebhook(@Body() payload: any) {
    return this.zohoService.catchZohoWebhook(payload);
  }
}
