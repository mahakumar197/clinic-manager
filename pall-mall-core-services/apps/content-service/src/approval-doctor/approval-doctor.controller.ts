import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Req,
  UseGuards,
  Param,
  Patch,
} from '@nestjs/common';
import { ApprovalDoctorService } from './approval-doctor.service';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import {
  FetchQueueDto,
  ReviewSubmissionDto,
  AddCommentsDto,
  AddQuickResponseDto,
  ApproveOrRejectTaskSubmissionDto,
  TaskListFiltersDto,
} from './dto/approval-doctor.dto';

@ApiTags('Approvals Doctor')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
@Controller('approval-doctor')
export class ApprovalDoctorController {
  constructor(private readonly approvalDoctorService: ApprovalDoctorService) {}

  @Get('/queue')
  @ApiOperation({
    summary: 'Fetch the approvals queue for the logged-in doctor/nurse',
  })
  getApprovalsQueue(@Query() query: FetchQueueDto, @Req() req) {
    return this.approvalDoctorService.getApprovalsQueue(req.user.userId, query);
  }

  @Get('/fetch-approvals/:submissionId')
  @ApiOperation({ summary: 'Fetch a single approval by ID' })
  fetchApprovalsById(@Param('submissionId') submissionId: string) {
    return this.approvalDoctorService.fetchApprovalsById(submissionId);
  }

  @Post('/review')
  @ApiOperation({ summary: 'Approve or Reject a form submission' })
  reviewSubmission(@Body() dto: ReviewSubmissionDto, @Req() req) {
    return this.approvalDoctorService.reviewSubmission(dto, req.user.userId);
  }

  @Post('/add-comments')
  @ApiOperation({ summary: 'Add a comment to a submission' })
  addComments(@Body() dto: AddCommentsDto, @Req() req) {
    return this.approvalDoctorService.addComments(dto, req.user.userId);
  }

  @Get('/fetch-comments/:submissionId')
  @ApiOperation({ summary: 'Fetch all comments for a submission' })
  getComments(@Param('submissionId') submissionId: string) {
    return this.approvalDoctorService.getComments(submissionId);
  }

  @Post('/add-quick-response')
  @ApiOperation({ summary: 'Add a quick response to a submission' })
  addQuickResponse(@Body() dto: AddQuickResponseDto, @Req() req) {
    return this.approvalDoctorService.addQuickResponse(dto, req.user.userId);
  }

  @Get('/fetch-quick-response/:submissionId')
  @ApiOperation({ summary: 'Fetch all quick responses for a submission' })
  getQuickResponse(@Param('submissionId') submissionId: string) {
    return this.approvalDoctorService.getQuickResponse(submissionId);
  }

  @Get('/fetch-all-task-submissions')
  fetchAllTaskSubmissions(@Query() query: TaskListFiltersDto, @Req() req) {
    return this.approvalDoctorService.fetchTaskSubmissionsWithPatient(
      req.user.userId,
      query,
    );
  }

  @Get('/fetch-task-submission-details/:taskSubmissionId')
  fetchTaskSubmissionDetails(
    @Param('taskSubmissionId') taskSubmissionId: string,
  ) {
    return this.approvalDoctorService.fetchTaskSubmissionDetailsById(
      taskSubmissionId,
    );
  }

  @Get('/fetch-task-submission-asset/:taskSubmissionId')
  fetchTaskSubmissionAsset(
    @Param('taskSubmissionId') taskSubmissionId: string,
  ) {
    return this.approvalDoctorService.fetchTaskSubmissionAssetDetailsById(
      taskSubmissionId,
    );
  }

  @Patch('/approve-or-reject-task-submission')
  approveOrRejectTaskSubmission(
    @Body() dto: ApproveOrRejectTaskSubmissionDto,
    @Req() req,
  ) {
    return this.approvalDoctorService.approveOrRejectSubmissionForTaskUpload(
      dto,
      req.user.userId,
    );
  }

  @Post('/add-comments-for-task-upload')
  addCommentsForTaskUpload(@Body() dto: AddCommentsDto, @Req() req) {
    return this.approvalDoctorService.addCommentsForTaskUpload(
      dto,
      req.user.userId,
    );
  }

  @Get('/fetch-task-upload-comments/:taskSubmissionId')
  getTaskUploadComments(@Param('taskSubmissionId') taskSubmissionId: string) {
    return this.approvalDoctorService.getTaskUploadComments(taskSubmissionId);
  }
}
