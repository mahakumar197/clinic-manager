import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Req,
  UseGuards,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ZohoFormsService } from '../services/zoho-forms.service';
import { FormSubmissionDto } from '../dto/zoho.dto';

@ApiTags('zoho-forms')
@Controller('zoho-forms')
export class ZohoFormsController {
  private readonly logger = new Logger(ZohoFormsController.name);

  constructor(private readonly zohoFormsService: ZohoFormsService) {}

  @Post('submit-zoho-askthesurgeon')
  submitAskTheSurgeon(@Body() body: FormSubmissionDto) {
    this.logger.log('[submitAskTheSurgeon] Endpoint hit');
    return this.zohoFormsService.submitAskTheSurgeonForm(body);
  }

  @Post('submit-zoho-asktheteam')
  submitAskTheTeam(@Body() body: FormSubmissionDto) {
    this.logger.log('[submitAskTheTeam] Endpoint hit');
    return this.zohoFormsService.submitAskTheTeamForm(body);
  }

  @Post('submit-zoho-ssq')
  submitSSQ(@Body() body: FormSubmissionDto) {
    this.logger.log('[submitSSQ] Endpoint hit');
    return this.zohoFormsService.submitSSQForm(body);
  }

  @Post('submit-zoho-post-ops')
  submitPostOpDaily(@Body() body: FormSubmissionDto) {
    this.logger.log('[submitPostOpDaily] Endpoint hit');
    return this.zohoFormsService.submitPostOpForm(body);
  }
}
