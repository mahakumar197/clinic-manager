import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { TasksAttachmentService } from '../service/tasks-attachment.service';
import { AddTaskAttachmentDto } from '../dto/AddTaskAttachmentDto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('tasks-attachments')
@Controller('tasks-attachments')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class TasksAttachmentsController {
  constructor(
    private readonly tasksAttachmentService: TasksAttachmentService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'upload a task attachment' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Task attachment uploaded successfully',
  })
  createTaskAttachment(
    @Body() addTaskAttachmentDto: AddTaskAttachmentDto,
    @Req() req,
  ) {
    return this.tasksAttachmentService.createTaskAttachment(
      addTaskAttachmentDto,
      req.user.userId,
    );
  }

  @Delete(':attachmentId')
  @ApiOperation({ summary: 'delete a task attachment by attachmentID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Task attachment deleted successfully',
  })
  removeTaskAttachment(@Param('attachmentId') attachmentId: string) {
    return this.tasksAttachmentService.removeTaskAttachment(attachmentId);
  }
}
