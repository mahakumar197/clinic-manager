import {
  Controller,
  Post,
  Get,
  Param,
  Query,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiExtraModels,
} from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FormResponseService } from '../services/form.response.service';
import { NewFormSubmissionDto, NewFormAnswerInputDto } from '../dto/form.dto';
import { OptionalJwtAuthGuard } from '../guards/optional-jwt-auth.guard';

@ApiTags('form_response')
@Controller('form_response')
export class FormResponseController {
  constructor(private readonly formResponseService: FormResponseService) {}

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Get(':formId')
  @ApiOperation({
    summary: 'Gets new form submissions for a specific submission',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Form submissions fetched successfully',
  })
  getNewFormSubmissions(
    @Param('formId') formId: string,
    @Query('submissionId') submissionId: string,
  ) {
    return this.formResponseService.getNewFormSubmissions(formId, submissionId);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Post('new')
  @ApiExtraModels(NewFormSubmissionDto, NewFormAnswerInputDto)
  @ApiOperation({ summary: 'Submit a new form using Zoho field structure' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Form submitted successfully',
  })
  submitNewForm(@Body() dto: NewFormSubmissionDto, @Req() req) {
    return this.formResponseService.submitNewForm(
      dto,
      req.user?.userId || null,
    );
  }

  @Post('webhook-sync')
  @ApiOperation({ summary: 'New API to store Zoho webhook form submissions' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Webhook data stored successfully',
  })
  async syncWebhookSubmission(@Body() payload: any) {
    return this.formResponseService.saveWebhookSubmission(payload);
  }

  @Post('webhook-sync-new')
  @ApiOperation({ summary: 'New API to store Zoho webhook form submissions' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Webhook data stored successfully',
  })
  async syncWebhookSubmissionNew(
    @Body() payload: any,
    @Query('formType') formType: string,
  ) {
    return this.formResponseService.saveWebhookSubmissionNew(payload, formType);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Get('new/:submissionId')
  @ApiOperation({ summary: 'Fetch form responses for a form' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Form responses fetched successfully',
  })
  getFormResponsesByFormId(@Param('submissionId') submissionId: string) {
    return this.formResponseService.getFormResponsesByFormId(submissionId);
  }

  @Post('map-zoho-fields')
  @ApiOperation({ summary: 'Map Zoho webhook fields to internal questions' })
  @ApiResponse({ status: 200, description: 'Mapped questions returned' })
  async mapZohoFields(
    @Body() payload: { formName: string; data: Record<string, any> },
  ) {
    const { formName, data } = payload;
    return this.formResponseService.mapZohoData(formName, data);
  }

  @Post('webhook-sync-mapped')
  @ApiOperation({ summary: 'New API to store Zoho webhook form submissions' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Webhook data stored successfully',
  })
  async webhookSubmission(@Body() payload: any) {
    return this.formResponseService.webhookSubmission(payload);
  }

  @Post('upsert')
  async upsert(@Body() mappings: any[]) {
    return this.formResponseService.upsertMappings(mappings);
  }
}