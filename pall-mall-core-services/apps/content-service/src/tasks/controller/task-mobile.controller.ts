import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiResponse,
  ApiOperation,
  ApiBody,
  ApiBearerAuth,
  ApiExtraModels,
} from '@nestjs/swagger';
import {
  TaskFileUploadDto,
  FormAnswerInputDto,
  TaskTrackDto,
} from '../dto/task.dto';
import { HttpStatus } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TaskMobileService } from '../service/task-mobile.service';

@ApiTags('Task Mobile')
@Controller('task-mobile')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class TaskMobileController {
  constructor(private readonly taskMobileService: TaskMobileService) {}

  @Get()
  @ApiOperation({ summary: 'Fetch tasks for patients based on Patient id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tasks fetched successfully',
  })
  getTasks(@Req() req) {
    return this.taskMobileService.getTasks(req.user.userId);
  }

  @Get('/post-op-form')
  @ApiOperation({
    summary: 'Fetch post op form for patients based on Patient id',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Post op form fetched successfully',
  })
  getPostOpForm(@Req() req) {
    return this.taskMobileService.getPostOpForm(req.user.userId);
  }

  @Get('/post-op-progress')
  @ApiOperation({
    summary:
      'Fetch post op progress (days post-op and form submission stats) for patient',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Post op progress fetched successfully',
  })
  getPostOpProgress(@Req() req) {
    return this.taskMobileService.getPostOpProgress(req.user.userId);
  }

  @Get('/thumbnails')
  @ApiOperation({
    summary: 'Fetch thumbnails for patients based on Patient id',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Thumbnails fetched successfully',
  })
  getThumbnails() {
    return this.taskMobileService.getThumbnails();
  }

  @Get('/:taskId')
  @ApiOperation({ summary: 'Fetch tasks for patients based on Patient id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tasks fetched successfully',
  })
  getTasksById(@Param('taskId') taskId: string) {
    return this.taskMobileService.fetchTaskbyId(taskId);
  }

  @Post('/track')
  @ApiOperation({ summary: 'Track task for patients based on Patient id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tasks fetched successfully',
  })
  trackTask(@Body() taskTrackDto: TaskTrackDto, @Req() req) {
    return this.taskMobileService.taskTrack(
      taskTrackDto.taskId,
      taskTrackDto.enValue,
      req.user.userId,
      taskTrackDto,
    );
  }

  @Get('/track-form/:taskId')
  @ApiOperation({
    summary: 'Fetch task track for patients based on Patient id',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Task track fetched successfully',
  })
  fetchTaskTrack(@Param('taskId') taskId: string, @Req() req) {
    return this.taskMobileService.fetchTaskTrack(taskId, req.user.userId);
  }

  @Post('/TaskFileUpload')
  @ApiOperation({ summary: 'Upload task for patients based on Patient id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tasks fetched successfully',
  })
  uploadTask(@Body() taskTrackDto: TaskFileUploadDto, @Req() req) {
    return this.taskMobileService.taskFileUpload(
      taskTrackDto.taskId,
      taskTrackDto.fileContent,
      req.user.userId,
    );
  }

  @Patch('/update-task-completion/:taskId')
  @ApiOperation({
    summary: 'Update task completion for patients based on Patient id',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Task completion updated successfully',
  })
  updateTaskCompletion(@Param('taskId') taskId: string, @Req() req) {
    return this.taskMobileService.updateTaskCompletion(taskId, req.user.userId);
  }
}
