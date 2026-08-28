import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiResponse,
  ApiOperation,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TaskCommentsService } from '../service/tasks-comments.service';
import { CreateTaskCommentDto, UpdateTaskCommentDto } from '../dto/task.dto';
import { HttpStatus } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Task Comments')
@Controller('task-comments')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class TaskCommentsController {
  constructor(private readonly commentsService: TaskCommentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task comment' })
  @ApiBody({ type: CreateTaskCommentDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Task comment added successfully',
  })
  create(@Body() dto: CreateTaskCommentDto, @Req() req) {
    return this.commentsService.createComment(dto, req.user.userId);
  }

  @Patch(':commentId')
  @ApiOperation({ summary: 'Update an existing comment' })
  @ApiBody({ type: UpdateTaskCommentDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Task comment updated successfully',
  })
  update(
    @Param('commentId') commentId: string,
    @Body() dto: UpdateTaskCommentDto,
  ) {
    return this.commentsService.updateComment(commentId, dto);
  }

  @Delete(':commentId')
  @ApiOperation({ summary: 'Delete a comment' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Task comment deleted successfully',
  })
  delete(@Param('commentId') commentId: string) {
    return this.commentsService.deleteComment(commentId);
  }
}
