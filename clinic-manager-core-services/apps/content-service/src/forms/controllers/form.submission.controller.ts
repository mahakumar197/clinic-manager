import {
  Req,
  Query,
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
} from '@nestjs/common';
import { FormSubmissionService } from '../services/form.submission.service';
import {
  FormSubmissionDto,
  FormSubmissionFilterQueryDto,
  FormAnswerInputDto,
} from '../dto/form.dto';
import { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ApiOperation, ApiResponse, ApiExtraModels } from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';
import { OptionalJwtAuthGuard } from '../guards/optional-jwt-auth.guard';

@ApiTags('forms-submissions')
@Controller('forms-submissions')
export class FormSubmissionController {
  constructor(private readonly formSubmissionService: FormSubmissionService) {}

  @UseGuards(OptionalJwtAuthGuard)
  @Post()
  @ApiExtraModels(FormSubmissionDto, FormAnswerInputDto)
  @ApiOperation({ summary: 'submits a form' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'form submitted successfully',
  })
  submitForm(@Body() formAnswerInputDto: FormSubmissionDto, @Req() req) {
    return this.formSubmissionService.submitForm(
      formAnswerInputDto,
      req.user?.userId || null,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Get(':formId')
  @ApiOperation({ summary: 'gets form submissions for a specific user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'form submissions fetched successfully',
  })
  getFormSubmissions(
    @Param('formId') formId: string,
    @Query('submissionId') submissionId: string,
  ) {
    return this.formSubmissionService.getFormSubmissions(formId, submissionId);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Get()
  @ApiOperation({ summary: 'gets form submissions for a specific user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'form submissions fetched successfully',
  })
  getFormSubmissionsByUser(
    @Req() req,
    @Query() filters: FormSubmissionFilterQueryDto,
  ) {
    const userid = req.user?.userId || null;
    return this.formSubmissionService.getFormSubmissionsbyUser(userid, filters);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Get(':formId/download')
  @ApiOperation({
    summary: 'downloads form submissions for a specific user as PDF',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'PDF downloaded successfully',
  })
  async downloadFormSubmissions(
    @Param('formId') formId: string,
    @Req() req,
    @Res() res: Response,
  ) {
    const userid = req.user?.userId || null;
    const pdfStream =
      await this.formSubmissionService.generateFormSubmissionsPdf(
        formId,
        userid,
      );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=form_submissions_${formId}.pdf`,
    );

    pdfStream.pipe(res);
  }
}
