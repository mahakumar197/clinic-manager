import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
} from '@nestjs/common';
import { ApprovalsAdminService } from './approvals-admin.service';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import {
  AddCommentsDto,
  ApproveOrRejectSubmissionDto,
  ApproveOrRejectTaskSubmissionDto,
  FormListFiltersDto,
  TaskListFiltersDto,
} from './dto/approvals-admin.dto';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Approvals Admin')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
@Controller('approvals-admin')
export class ApprovalsAdminController {
  constructor(private readonly approvalsAdminService: ApprovalsAdminService) {}

  @Post('/add-comments')
  addComments(@Body() dto: AddCommentsDto, @Req() req) {
    return this.approvalsAdminService.addComments(dto, req.user.userId);
  }

  @Get('/fetch-all-submissions')
  fetchAllSubmissions(@Query() query: FormListFiltersDto) {
    return this.approvalsAdminService.fetchSubmissionsWithPatient(query);
  }

  @Get('/fetch-assigned-users/:submissionIds')
  fetchAssignedUsers(@Param('submissionIds') submissionIds: string) {
    return this.approvalsAdminService.fetchSubmissionDetailsById(submissionIds);
  }

  @Get('/fetch-comments/:submissionId')
  getComments(@Param('submissionId') submissionId: string) {
    return this.approvalsAdminService.getComments(submissionId);
  }

  @Patch('/approve-or-reject-submission')
  approveOrRejectSubmission(
    @Body() dto: ApproveOrRejectSubmissionDto,
    @Req() req,
  ) {
    return this.approvalsAdminService.approveOrRejectSubmission(
      dto,
      req.user.userId,
    );
  }

  @Get('/fetch-all-task-submissions')
  fetchAllTaskSubmissions(@Query() query: TaskListFiltersDto) {
    return this.approvalsAdminService.fetchTaskSubmissionsWithPatient(query);
  }

  @Get('/fetch-task-submission-details/:taskSubmissionId')
  fetchTaskSubmissionDetails(
    @Param('taskSubmissionId') taskSubmissionId: string,
  ) {
    return this.approvalsAdminService.fetchTaskSubmissionDetailsById(
      taskSubmissionId,
    );
  }

  @Get('/fetch-task-submission-asset/:taskSubmissionId')
  fetchTaskSubmissionAsset(
    @Param('taskSubmissionId') taskSubmissionId: string,
  ) {
    return this.approvalsAdminService.fetchTaskSubmissionAssetDetailsById(
      taskSubmissionId,
    );
  }

  @Patch('/approve-or-reject-task-submission')
  approveOrRejectTaskSubmission(
    @Body() dto: ApproveOrRejectTaskSubmissionDto,
    @Req() req,
  ) {
    return this.approvalsAdminService.approveOrRejectSubmissionForTaskUpload(
      dto,
      req.user.userId,
    );
  }

  @Post('/add-comments-for-task-upload')
  addCommentsForTaskUpload(@Body() dto: AddCommentsDto, @Req() req) {
    return this.approvalsAdminService.addCommentsForTaskUpload(
      dto,
      req.user.userId,
    );
  }

  @Get('/fetch-task-upload-comments/:taskSubmissionId')
  getTaskUploadComments(@Param('taskSubmissionId') taskSubmissionId: string) {
    return this.approvalsAdminService.getTaskUploadComments(taskSubmissionId);
  }
}
