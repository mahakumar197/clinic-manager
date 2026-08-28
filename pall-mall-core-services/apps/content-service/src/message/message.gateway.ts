import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessageService } from './message.service';
import { forwardRef, Inject } from '@nestjs/common';
import {
  AssignThreadDto,
  CreateInternalNoteDto,
  CreatePatientMessageDto,
  CreateThreadDto,
  GetThreadsQueryDto,
  MarkReadDto,
} from './dto/message-thread.dto';
import { UserRole } from '@pallmall/shared-types';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class MessageGateway {
  constructor(
    @Inject(forwardRef(() => MessageService))
    private readonly messageService: MessageService,
  ) {}

  @WebSocketServer()
  server: Server;

  // -------------------------
  // JOIN THREAD ROOM
  // -------------------------
  @SubscribeMessage('join_thread')
  handleJoinThread(
    @MessageBody() data: { thread_id: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`thread_${data.thread_id}`);
  }

  // -------------------------
  // JOIN USER ROOM
  // -------------------------
  @SubscribeMessage('join_user')
  handleJoinUser(
    @MessageBody() data: { user_id: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`user_${data.user_id}`);
  }

  // -------------------------
  // CREATE THREAD (WebSocket)
  // -------------------------
  @SubscribeMessage('create_thread')
  async handleCreateThread(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string; role: string; dto: CreateThreadDto },
  ) {
    try {
      if (data.role !== UserRole.PATIENT) {
        client.emit('error', { message: 'Only patients can create threads' });
        return;
      }
      const result = await this.messageService.createThreadWithMessage(
        data.userId,
        data.dto,
      );
      client.emit('thread_created_success', result);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  // -------------------------
  // TYPING INDICATOR
  // -------------------------
  @SubscribeMessage('typing')
  async handleTyping(
    @MessageBody() data: { thread_id: string; user_id: string },
  ) {
    const user = await this.messageService.getUserInfo(data.user_id);
    this.server.to(`thread_${data.thread_id}`).emit('typing', {
      ...data,
      userName: user?.userName || 'Unknown',
      userRole: user?.role || 'Unknown',
    });
  }

  // -------------------------
  // GET THREADS (WebSocket)
  // -------------------------
  @SubscribeMessage('get_threads')
  async handleGetThreads(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: { userId: string; role: string; query: GetThreadsQueryDto },
  ) {
    try {
      const result = await this.messageService.getThreads(
        data.userId,
        data.role,
        data.query,
      );
      client.emit('threads_list', result);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  // -------------------------
  // GET MESSAGES (WebSocket)
  // -------------------------
  @SubscribeMessage('get_messages')
  async handleGetMessages(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string; role: string; thread_id: string },
  ) {
    try {
      const result = await this.messageService.getThreadMessages(
        data.userId,
        data.role,
        data.thread_id,
      );
      client.emit('messages_list', result);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  // -------------------------
  // SEND EVENT HELPERS
  // -------------------------
  sendNewMessage(threadId: string, payload: any) {
    this.server.to(`thread_${threadId}`).emit('new_message', payload);
  }

  sendInternalNote(threadId: string, payload: any) {
    this.server.to(`thread_${threadId}`).emit('internal_note_added', payload);
  }

  sendMessageRead(threadId: string, payload: any) {
    this.server.to(`thread_${threadId}`).emit('message_read', payload);
  }

  sendThreadUpdated(threadId: string, payload: any) {
    this.server.to(`thread_${threadId}`).emit('thread_updated', payload);
  }

  sendMarkAsUnread(threadId: string, payload: any) {
    this.server.to(`thread_${threadId}`).emit('message_unread', payload);
  }

  sendThreadDeleted(threadId: string, payload: any) {
    this.server.to(`thread_${threadId}`).emit('delete_message', payload);
  }

  // -------------------------
  // DELETE THREAD (WebSocket)
  // -------------------------
  @SubscribeMessage('delete_thread')
  async handleDeleteThread(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { adminId: string; threadId: string },
  ) {
    try {
      const result = await this.messageService.deleteThread(
        data.adminId,
        data.threadId,
      );
      client.emit('thread_deleted_success', result);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  // -------------------------
  // SEND MESSAGE (WebSocket)
  // -------------------------
  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      userId: string;
      role: string;
      threadId: string;
      dto: CreatePatientMessageDto;
    },
  ) {
    try {
      const result = await this.messageService.sendMessage(
        data.userId,
        data.role,
        data.threadId,
        data.dto,
      );
      client.emit('message_sent_success', result);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  // -------------------------
  // ARCHIVE THREAD (WebSocket)
  // -------------------------
  @SubscribeMessage('archive_thread')
  async handleArchiveThread(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { adminId: string; threadId: string; status: boolean },
  ) {
    try {
      const result = await this.messageService.archiveThread(
        data.adminId,
        data.threadId,
        data.status,
      );
      client.emit('thread_archive_success', result);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  // -------------------------
  // MARK READ (WebSocket)
  // -------------------------
  @SubscribeMessage('mark_read')
  async handleMarkAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: { userId: string; role: string; threadId: string; dto: MarkReadDto },
  ) {
    try {
      const result = await this.messageService.markAsRead(
        data.userId,
        data.role,
        data.threadId,
        data.dto,
      );
      client.emit('mark_read_success', result);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  // -------------------------
  // MARK UNREAD (WebSocket)
  // -------------------------
  @SubscribeMessage('mark_unread')
  async handleMarkAsUnread(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string; role: string; threadId: string },
  ) {
    try {
      const result = await this.messageService.markAsUnread(
        data.userId,
        data.role,
        data.threadId,
      );
      client.emit('mark_unread_success', result);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  // -------------------------
  // ADD INTERNAL NOTE (WebSocket)
  // -------------------------
  @SubscribeMessage('add_internal_note')
  async handleAddInternalNote(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: { userId: string; threadId: string; dto: CreateInternalNoteDto },
  ) {
    try {
      const result = await this.messageService.addInternalNote(
        data.userId,
        data.threadId,
        data.dto,
      );
      client.emit('internal_note_success', result);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  // -------------------------
  // ASSIGN THREAD (WebSocket)
  // -------------------------
  @SubscribeMessage('assign_thread')
  async handleAssignThread(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: { adminId: string; threadId: string; dto: AssignThreadDto },
  ) {
    try {
      const result = await this.messageService.assignThread(
        data.adminId,
        data.threadId,
        data.dto,
      );
      client.emit('assign_thread_success', result);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  // -------------------------
  // GET ASSIGNED USERS (WebSocket)
  // -------------------------
  @SubscribeMessage('get_assigned_users')
  async handleGetAssignedUsers(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { threadId: string },
  ) {
    try {
      const result = await this.messageService.getAssignedUsers(data.threadId);
      client.emit('assigned_users_list', result);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  // -------------------------
  // TOGGLE STAR (WebSocket)
  // -------------------------
  @SubscribeMessage('toggle_star')
  async handleToggleStar(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string; role: string; threadId: string },
  ) {
    try {
      const result = await this.messageService.toggleStar(
        data.threadId,
        data.userId,
        data.role,
      );
      client.emit('toggle_star_success', result);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  // -------------------------
  // GET MESSAGE COUNTS (WebSocket)
  // -------------------------
  @SubscribeMessage('get_message_counts')
  async handleGetMessageCounts(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string; role: string },
  ) {
    try {
      const result = await this.messageService.getMessageCounts(
        data.userId,
        data.role,
      );
      client.emit('message_counts_data', result);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  sendCountsUpdate(userId: string, payload: any) {
    this.server.to(`user_${userId}`).emit('counts_updated', payload);
  }

  sendToggleStar(userId: string, payload: any) {
    this.server.to(`user_${userId}`).emit('thread_star_toggled', payload);
  }

  sendThreadListUpdate(userId: string, payload: any) {
    this.server.to(`user_${userId}`).emit('thread_list_updated', payload);
  }
}
