import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  Put,
  Query,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
  UseGuards,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { MessageService } from './message.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PaginationQueryDto, roleType } from '@pallmall/common-utils';
import {
  ArchiveThreadDto,
  ArchiveThreadResponseDto,
  AssignThreadDto,
  AssignThreadResponseDto,
  CreateInternalNoteDto,
  CreateInternalNoteResponseDto,
  CreateMessageResponseDto,
  CreatePatientMessageDto,
  CreateThreadDto,
  DeleteThreadResponseDto,
  GetAdminThreadsResponseDto,
  GetThreadsQueryDto,
  MarkReadDto,
  MarkReadResponseDto,
  MarkUnreadResponseDto,
  ToggleActionResponseDto,
  UpdateMessageDto,
  SearchThreadsBulkDto,
} from './dto/message-thread.dto';
import { AuthGuard } from '@nestjs/passport';
import { UserRole } from '@pallmall/shared-types';

@ApiTags('message')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('Message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  // ---------------------------
  // THREADS LISTING
  // ---------------------------
  @Get('threads')
  @ApiOperation({ summary: 'List threads (role-aware)' })
  @ApiResponse({
    status: 200,
    description: 'Threads listed successfully',
    type: GetAdminThreadsResponseDto,
  })
  async getThreads(@Req() req: any, @Query() query: GetThreadsQueryDto) {
    if (!req.user?.userId || !req.user?.role) {
      throw new UnauthorizedException('User information not found in request');
    }

    const { userId, role } = req.user;

    return this.messageService.getThreads(userId, role, query);
  }
  // ---------------------------
  // CREATE THREAD (patients only)
  // ---------------------------
  @Post()
  @ApiOperation({
    summary: 'Create new thread with first message (patients only)',
  })
  @ApiResponse({ status: 201, description: 'Thread created successfully' })
  async createThread(@Body() dto: CreateThreadDto, @Req() req: any) {
    if (!req.user?.userId) {
      throw new UnauthorizedException('User information not found in request');
    }

    if (req.user.role !== UserRole.PATIENT) {
      throw new ForbiddenException('Only patients can create threads');
    }

    const patientId = req.user.userId;

    return this.messageService.createThreadWithMessage(patientId, dto);
  }

  // ---------------------------
  // VIEW MESSAGES
  // ---------------------------
  @Get(':thread_id/messages')
  @ApiOperation({ summary: 'View messages in a thread (role-aware)' })
  @ApiResponse({ status: 200, description: 'Messages retrieved successfully' })
  async getThreadMessages(
    @Param('thread_id', new ParseUUIDPipe()) threadId: string,
    @Req() req: any,
  ) {
    if (!req.user?.userId || !req.user?.role) {
      throw new UnauthorizedException('User information not found in request');
    }

    const { userId, role } = req.user;

    return this.messageService.getThreadMessages(userId, role, threadId);
  }

  // ---------------------------
  // SEND MESSAGE
  // ---------------------------
  @Post(':thread_id/messages')
  @ApiOperation({ summary: 'Send message in a thread (role-aware)' })
  @ApiResponse({
    status: 201,
    description: 'Message sent successfully',
    type: CreateMessageResponseDto,
  })
  async sendMessage(
    @Param('thread_id', new ParseUUIDPipe()) threadId: string,
    @Body() dto: CreatePatientMessageDto,
    @Req() req: any,
  ) {
    if (!req.user?.userId || !req.user?.role) {
      throw new UnauthorizedException('User information not found in request');
    }

    const { userId, role } = req.user;

    return this.messageService.sendMessage(userId, role, threadId, dto);
  }

  // ---------------------------
  // ARCHIVE THREAD (admins only)
  // ---------------------------
  @Put(':thread_id/archive')
  @ApiOperation({
    summary:
      'Archive/Unarchive a thread (admins only) - True to archive, False to unarchive',
  })
  @ApiResponse({
    status: 200,
    description: 'Thread archived/unarchived successfully',
    type: ArchiveThreadResponseDto,
  })
  async archiveThread(
    @Param('thread_id', new ParseUUIDPipe()) threadId: string,
    @Body() dto: ArchiveThreadDto,
    @Req() req: any,
  ) {
    req.user.role = req.user.role.toLowerCase();
    if (!req.user?.userId || req.user.role !== roleType.ADMIN) {
      throw new ForbiddenException('Only admins can archive threads');
    }

    return this.messageService.archiveThread(
      req.user.userId,
      threadId,
      dto.status,
    );
  }

  // ---------------------------
  // Mark As Read
  // ---------------------------
  @Put(':thread_id/read')
  @ApiOperation({ summary: 'Mark messages as read in a thread' })
  @ApiResponse({
    status: 200,
    description: 'Messages marked as read',
    type: MarkReadResponseDto,
  })
  async markAsRead(
    @Param('thread_id', new ParseUUIDPipe()) threadId: string,
    @Body() dto: MarkReadDto,
    @Req() req: any,
  ) {
    if (!req.user?.userId) {
      throw new UnauthorizedException('User information not found in request');
    }

    req.user.role = req.user.role.toLowerCase();
    return this.messageService.markAsRead(
      req.user.userId,
      req.user.role,
      threadId,
      dto,
    );
  }

  // ---------------------------
  // Mark As Unread
  // ---------------------------
  @Put(':thread_id/unread')
  @ApiOperation({ summary: 'Mark a thread as unread' })
  @ApiResponse({
    status: 200,
    description: 'Thread marked as unread',
    type: MarkUnreadResponseDto,
  })
  async markAsUnread(
    @Param('thread_id', new ParseUUIDPipe()) threadId: string,
    @Req() req: any,
  ) {
    if (!req.user?.userId) {
      throw new UnauthorizedException('User information not found in request');
    }

    req.user.role = req.user.role.toLowerCase();
    return this.messageService.markAsUnread(
      req.user.userId,
      req.user.role,
      threadId,
    );
  }

  // DELETE THREAD (admins only)
  // ---------------------------
  @Delete(':thread_id')
  @ApiOperation({ summary: 'Soft-delete a thread (admins only)' })
  @ApiResponse({
    status: 200,
    description: 'Thread deleted successfully',
    type: DeleteThreadResponseDto,
  })
  async deleteThread(
    @Param('thread_id', new ParseUUIDPipe()) threadId: string,
    @Req() req: any,
  ) {
    req.user.role = req.user.role.toLowerCase();
    if (!req.user?.userId || req.user.role !== roleType.ADMIN) {
      throw new ForbiddenException('Only admins can delete threads');
    }

    return this.messageService.deleteThread(req.user.userId, threadId);
  }

  // ---------------------------
  // Assign Thread
  // ---------------------------
  @Put(':thread_id/assign')
  @ApiOperation({ summary: 'Assign a thread to a doctor/nurse (admins only)' })
  @ApiResponse({
    status: 200,
    description: 'Thread assigned successfully',
    type: AssignThreadResponseDto,
  })
  async assignThread(
    @Param('thread_id', new ParseUUIDPipe()) threadId: string,
    @Body() dto: AssignThreadDto,
    @Req() req: any,
  ) {
    req.user.role = req.user.role.toLowerCase();

    if (!req.user?.userId || req.user.role !== roleType.ADMIN) {
      throw new ForbiddenException('Only admins can assign threads');
    }

    return this.messageService.assignThread(req.user.userId, threadId, dto);
  }

  // ---------------------------
  // Get Assigned Users
  // ---------------------------
  @Get(':thread_id/assigned')
  @ApiOperation({
    summary: 'Get assigned users (doctors/nurses) for a thread (TAG USER)',
  })
  @ApiResponse({
    status: 200,
    description: 'Assigned users retrieved successfully',
  })
  async getAssignedUsers(
    @Param('thread_id', new ParseUUIDPipe()) threadId: string,
    @Req() req: any,
    @Query('search') search?: string,
  ) {
    if (!req.user?.userId) {
      throw new UnauthorizedException('User information not found in request');
    }

    return this.messageService.getAssignedUsers(threadId, search);
  }

  // ---------------------------------------------
  //  TOGGLE STAR
  // ---------------------------------------------
  @Post('threads/:thread_id/star')
  @ApiOperation({ summary: 'Star / Unstar a thread' })
  @ApiResponse({
    status: 200,
    description: 'Thread starred / unstarred successfully',
    type: ToggleActionResponseDto,
  })
  async toggleStar(
    @Param('thread_id', new ParseUUIDPipe()) threadId: string,
    @Req() req: any,
  ) {
    if (!req.user?.userId) {
      throw new UnauthorizedException('User information not found in request');
    }

    req.user.role = req.user.role.toLowerCase();
    return this.messageService.toggleStar(
      threadId,
      req.user.userId,
      req.user.role,
    );
  }

  // ---------------------------------------------
  //  Count Messages for Sidebar
  // ---------------------------------------------

  @Get('counts')
  @ApiOperation({ summary: 'Get all message counts for sidebar' })
  async getMessageCounts(@Req() req: any) {
    const userId = req.user?.userId;
    const role = req.user?.role;
    role.toLowerCase();

    if (!userId || !role) {
      throw new BadRequestException('User id or role not found in request');
    }

    return this.messageService.getMessageCounts(userId, role);
  }

  @Post('threads/search-bulk')
  @ApiOperation({
    summary: 'Check for existing threads between patient and providers (bulk)',
  })
  @ApiResponse({ status: 200, description: 'Thread map fetched successfully' })
  async bulkSearchThreads(@Req() req: any, @Body() dto: SearchThreadsBulkDto) {
    if (!req.user?.userId) {
      throw new UnauthorizedException('User information not found in request');
    }

    if (req.user.role !== UserRole.PATIENT) {
      throw new ForbiddenException('Only patients can use this endpoint');
    }

    const patientId = req.user.userId;
    const threadMap = await this.messageService.findThreadBetweenUsers(
      patientId,
      dto.provider_ids,
    );

    return {
      success: true,
      data: threadMap,
      message: 'Thread map fetched successfully',
      statusCode: 200,
    };
  }
}
