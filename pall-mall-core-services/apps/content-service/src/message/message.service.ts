import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  HttpStatus as NestHttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ArrayContains,
  Brackets,
  DataSource,
  EntityManager,
  In,
  LessThanOrEqual,
  Not,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { Thread } from './entities/threads.entity';
import { Message } from './entities/message.entity';
import { Attachment } from './entities/attachments.entity';
import {
  API_ENDPOINTS,
  decryptMessage,
  encryptMessage,
  FileType,
  helpers,
  MESSAGE_TEXT,
  PaginationQueryDto,
  roleType,
  StarStatus,
  MessageStatus,
  NotificationHelper,
  NOTIFICATION_EVENT_TYPE,
  getBlobFileUrl,
} from '@pallmall/common-utils';
import { MessageType, MessageVisibility } from '@pallmall/common-utils';
import { ThreadStatus } from '@pallmall/common-utils';
import {
  ApiError,
  ApiResponse,
  ApiResponseBuilder,
  HttpStatus,
} from '@pallmall/shared-types';
import { ThreadTag } from './entities/threadTags.entity';
import {
  AssignThreadDto,
  CreateInternalNoteDto,
  CreatePatientMessageDto,
  CreateThreadDto,
  GetThreadsQueryDto,
  MarkReadDto,
} from './dto/message-thread.dto';
import { logger } from '@pallmall/logger';
import { MessageGateway } from './message.gateway';
import { ThreadStar } from './entities/threadStar.entity';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { MessageRead } from './entities/messageReads.entity';
import { Dropdown } from 'src/master/entities/dropdown.entity';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Thread)
    private readonly threadRepository: Repository<Thread>,

    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,

    @InjectRepository(Attachment)
    private readonly attachmentRepository: Repository<Attachment>,

    @InjectRepository(ThreadTag)
    private readonly threadTagRepository: Repository<ThreadTag>,

    @InjectRepository(ThreadStar)
    private readonly threadStarRepository: Repository<ThreadStar>,

    @InjectRepository(Dropdown)
    private readonly dropdownRepository: Repository<Dropdown>,

    private readonly messageGateway: MessageGateway,

    private readonly dataSource: DataSource,
    private configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.notificationHelper = new NotificationHelper();
  }

  private notificationHelper: NotificationHelper;

  private decryptMessageList(messages: any[]) {
    logger.debug('decryptMessageList --->');
    return messages.map((msg) => {
      try {
        logger.info(
          `Decrypting message_id=${msg.message_id} ,messagetext=${msg.message_text}`,
        );
        msg.message_text = decryptMessage(msg.message_text);
      } catch (err) {
        logger.error(
          `Failed to decrypt message_id=${msg.message_id}: ${err.message}`,
        );
        msg.message_text = null;
      }
      return msg;
    });
  }

  async getUserInfo(userId: string) {
    logger.debug('getUserInfo --->');
    const userInfoMap = await helpers.fetchUsersByIds(
      this.configService.get('BASE_OPERATIONS'),
      API_ENDPOINTS.OPERATIONS_SERVICE.USER_DATA_FETCH,
      [userId],
    );
    return userInfoMap[userId];
  }

  private async ensureThreadAccess(
    userId: string,
    role: string,
    threadId: string,
  ): Promise<Thread> {
    logger.debug('ensureThreadAccess --->');
    const thread = await this.threadRepository.findOne({
      where: {
        thread_id: threadId,
        status: Not(ThreadStatus.DELETED),
      },
    });

    if (!thread) {
      throw new NotFoundException('thread id not found');
    }

    role = role.toLowerCase();

    if (role === roleType.ADMIN) {
      return thread;
    }

    if (role === roleType.PATIENT) {
      if (thread.patient_user_id !== userId) {
        throw new ForbiddenException(
          'You do not have permission to access this thread',
        );
      }
      return thread;
    }

    if (role === roleType.DOCTOR || role === roleType.NURSE) {
      if (!thread.assigned_user_ids?.includes(userId)) {
        throw new ForbiddenException('You are not assigned to this thread');
      }
      return thread;
    }

    throw new ForbiddenException('Unauthorized role');
  }

  // ---------------------------
  // CREATE THREAD (patients only)
  // ---------------------------

  /**
   * Creates a new thread for a patient with an optional initial message and attachments.
   * @param patientId - The ID of the patient creating the thread
   * @param dto - DTO containing subject, message, assigned user IDs, and attachments
   * @returns ApiResponse containing the thread ID
   */
  async createThreadWithMessage(
    patientId: string,
    dto: CreateThreadDto,
  ): Promise<ApiResponse<any>> {
    try {
      logger.info(`Creating thread for patientId: ${patientId}`);
      await this.validateAssignedUsers(dto.assigned_user_ids);

      const thread = await this.dataSource.transaction(async (manager) => {
        const threadEntity = await this.createThreadEntity(
          manager,
          patientId,
          dto,
        );
        const messageEntity = await this.createMessageEntity(
          manager,
          patientId,
          threadEntity.thread_id,
          dto,
        );
        await this.saveAttachments(
          manager,
          messageEntity.message_id,
          dto.attachments,
        );
        return threadEntity;
      });

      this.notifyParticipants(patientId, thread);
      return new ApiResponseBuilder().success(
        { thread_id: thread.thread_id },
        MESSAGE_TEXT.THREAD_CREATED,
        HttpStatus.CREATED,
      );
    } catch (error) {
      logger.error(
        `Failed to create thread for patientId ${patientId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  private async validateAssignedUsers(userIds?: string[]): Promise<void> {
    logger.debug('validateAssignedUsers --->');
    if (!userIds?.length) return;
    const usersMap = await helpers.fetchUsersByIds(
      this.configService.get('BASE_OPERATIONS'),
      API_ENDPOINTS.OPERATIONS_SERVICE.USER_DATA_FETCH,
      userIds,
    );

    for (const userId of userIds) {
      const user = usersMap[userId];
      if (!user)
        throw new NotFoundException(`User with ID ${userId} not found`);
      const role = user.role?.toLowerCase();
      if (role !== roleType.DOCTOR && role !== roleType.NURSE && role !== roleType.COORDINATOR) {
        throw new BadRequestException(
          `Only Doctors, Nurses, or Coordinators can be assigned. User ${userId} is a ${user.role}`,
        );
      }
    }
  }

  private async createThreadEntity(
    manager: EntityManager,
    patientId: string,
    dto: CreateThreadDto,
  ): Promise<Thread> {
    logger.debug('createThreadEntity --->');
    const thread = manager.create(Thread, {
      subject: dto.subject,
      patient_user_id: patientId,
      assigned_user_ids: Array.from(new Set(dto.assigned_user_ids ?? [])),
    });
    return manager.save(thread);
  }

  private async createMessageEntity(
    manager: EntityManager,
    senderId: string,
    threadId: string,
    dto: CreateThreadDto,
  ): Promise<Message> {
    logger.debug('createMessageEntity --->');
    const message = manager.create(Message, {
      thread: { thread_id: threadId },
      sender_id: senderId,
      message_text: encryptMessage(dto.message),
      message_type: dto.attachments?.length
        ? MessageType.FILE
        : MessageType.TEXT,
      visibility: MessageVisibility.PATIENT,
    });
    return manager.save(message);
  }

  private async saveAttachments(
    manager: EntityManager,
    messageId: string,
    attachmentsDto?: any[],
  ): Promise<void> {
    logger.debug('saveAttachments --->');
    if (!attachmentsDto?.length) return;
    const attachments = attachmentsDto.map((att) =>
      manager.create(Attachment, {
        message: { message_id: messageId },
        file_url: att.file_url,
        file_type: att.file_type as FileType,
        file_duration: att.duration,
      }),
    );
    await manager.save(attachments);
  }

  private notifyParticipants(patientId: string, thread: Thread): void {
    logger.debug('notifyParticipants --->');
    const participants = [patientId, ...(thread.assigned_user_ids ?? [])];
    this.notifyCountsUpdates(participants);
    participants.forEach((uid) => {
      this.messageGateway.sendThreadListUpdate(uid, {
        thread_id: thread.thread_id,
      });
    });
  }

  // ---------------------------
  // LIST THREADS (role-aware)
  // ---------------------------

  /**
   * Retrieve paginated message threads for a user based on role.
   *
   * - Admin: all threads
   * - Doctor/Nurse: assigned threads only
   * - Patient: own threads only
   *
   * Supports pagination with page & limit, and returns total count and page info.
   * Logs info and errors for auditing and debugging.
   *
   * @param userId - ID of the user requesting threads
   * @param role - Role of the user (admin, doctor, nurse, patient)
   * @param query - Pagination parameters
   * @returns Paginated threads visible to the user
   */
  private async getThreadStarsByUser(userId: string, threadIds: string[]) {
    logger.debug('getThreadStarsByUser --->');
    if (threadIds.length === 0) return [];
    return this.threadStarRepository.find({
      where: {
        user_id: userId,
        thread_id: In(threadIds),
      },
    });
  }

  async getThreads(userId: string, role: string, query: GetThreadsQueryDto) {
    logger.info(`Fetching threads for userId=${userId}, role=${role}`);

    role = role.toLowerCase();

    try {
      const page = Number(query.page) || 1;
      const limit = Number(query.limit) || 10;
      const skip = (page - 1) * limit;
      const { search, filter } = query;

      const qb = this.threadRepository.createQueryBuilder('thread');
      if (filter === MessageStatus.DELETED) {
        qb.andWhere('thread.status = :deletedStatus', {
          deletedStatus: ThreadStatus.DELETED,
        });
      } else {
        qb.andWhere('thread.status != :deletedStatus', {
          deletedStatus: ThreadStatus.DELETED,
        });
      }

      // Role Filtering
      if (role === roleType.ADMIN) {
      } else if (
        role === roleType.DOCTOR ||
        role === roleType.NURSE ||
        role === roleType.COORDINATOR
      ) {
        qb.andWhere('thread.assigned_user_ids @> :userIds', {
          userIds: [userId],
        });
      } else if (role === roleType.PATIENT) {
        qb.andWhere('thread.patient_user_id = :userId', { userId: userId });
      }

      // Search by subject, patient name, or doctor name
      if (search) {
        // Get user IDs by calling getUserList with search parameter
        const url = `${this.configService.get('BASE_OPERATIONS')}${API_ENDPOINTS.OPERATIONS_SERVICE.USER_LIST_FETCH}?search=${encodeURIComponent(search)}`;
        const response: any = await this.httpService.axiosRef.get(url);
        const matchingUserIds =
          response?.data?.map((user: any) => user.id) || [];

        qb.andWhere(
          new Brackets((qb) => {
            qb.where('thread.subject ILIKE :search', { search: `%${search}%` });
            if (matchingUserIds.length > 0) {
              qb.orWhere('thread.patient_user_id IN (:...matchingUserIds)', {
                matchingUserIds,
              });
              qb.orWhere('thread.assigned_user_ids && :matchingUserIds', {
                matchingUserIds,
              });
            }
          }),
        );
      }

      // Filters
      if (filter === MessageStatus.FLAGGED) {
        qb.innerJoin('thread.stars', 'star', 'star.user_id = :userId', {
          userId,
        });
      } else if (filter === MessageStatus.ARCHIVED) {
        qb.andWhere('thread.status = :status', { status: ThreadStatus.CLOSED });
      } else if (filter === MessageStatus.UNREAD) {
        qb.innerJoin('thread.messages', 'm_unread');
        qb.leftJoin(
          'message_reads',
          'mr',
          'mr.message_id = m_unread.message_id AND mr.user_id = :userId',
        );
        qb.andWhere('mr.id IS NULL');
        qb.andWhere('m_unread.sender_id != :userId');
        qb.distinct(true);
        qb.setParameter('userId', userId);
      } else if (filter === MessageStatus.SENT) {
        // Join to get the latest message and filter by sender
        qb.innerJoin('thread.messages', 'm_last');
        qb.leftJoin(
          'thread.messages',
          'm_future',
          'm_last.created_at < m_future.created_at',
        );
        qb.andWhere('m_future.message_id IS NULL'); // m_last is the latest
        qb.andWhere('m_last.sender_id = :userId', { userId });
        qb.distinct(true);
        qb.setParameter('userId', userId);
      }

      // Role Group Filter
      if (query.roleGroup) {
        const roleGroup = await this.dropdownRepository.findOne({
          where: { id: query.roleGroup },
        });
        if (!roleGroup) {
          throw new NotFoundException('Role group not found');
        }
        const roleGroupUserIds = await helpers.fetchUserIdsByRole(
          this.configService.get('BASE_OPERATIONS'),
          API_ENDPOINTS.OPERATIONS_SERVICE.USER_LIST_FETCH,
          roleGroup.beValue,
        );

        if (roleGroupUserIds.length > 0) {
          qb.andWhere('thread.assigned_user_ids && :roleGroupUserIds', {
            roleGroupUserIds,
          });
        } else {
          // If no users found for this role, return empty result
          return new ApiResponseBuilder().paginated(
            [],
            {
              page,
              limit,
              total: 0,
              totalPages: 0,
              hasNext: false,
              hasPrev: false,
            },
            MESSAGE_TEXT.THREAD_FETCHED,
          );
        }
      }

      // Pagination
      // Sort by the latest message in the thread
      qb.addSelect((subQuery) => {
        return subQuery
          .select('MAX(m.created_at)', 'max_created_at')
          .from(Message, 'm')
          .where('m.thread_id = thread.thread_id');
      }, 'latest_message_at');

      qb.orderBy('latest_message_at', 'DESC', 'NULLS LAST');
      qb.skip(skip).take(limit);

      const [threads, total] = await qb.getManyAndCount();
      return this.processThreadResults(
        threads,
        total,
        userId,
        role.toLowerCase(),
        page,
        limit,
      );
    } catch (error) {
      logger.error(
        `Error in getThreads for userId=${userId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  private async processThreadResults(
    threads: Thread[],
    total: number,
    userId: string,
    role: string,
    page: number,
    limit: number,
  ): Promise<ApiResponse<any>> {
    logger.debug('processThreadResults --->');
    if (threads.length === 0) {
      return new ApiResponseBuilder().paginated(
        [],
        { page, limit, total, totalPages: 0, hasNext: false, hasPrev: false },
        MESSAGE_TEXT.THREAD_FETCHED,
      );
    }

    const enrichmentData = await this.fetchEnrichmentData(
      threads,
      userId,
      role,
    );
    const enrichedThreads = this.enrichThreads(threads, enrichmentData, userId);
    await this.generateSasUrls(enrichedThreads);

    return new ApiResponseBuilder().paginated(
      enrichedThreads,
      {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
      MESSAGE_TEXT.THREAD_FETCHED,
    );
  }

  private async fetchEnrichmentData(
    threads: Thread[],
    userId: string,
    role: string,
  ) {
    logger.debug('fetchEnrichmentData --->');
    const threadIds = threads.map((t) => t.thread_id);
    const allUserIds = new Set<string>();
    threads.forEach((t) => {
      if (t.patient_user_id) allUserIds.add(t.patient_user_id);
      t.assigned_user_ids?.forEach((id) => allUserIds.add(id));
    });

    const [lastMessages, usersMap, threadStars, unreadCounts] =
      await Promise.all([
        this.fetchLastMessages(threadIds, userId, role),
        helpers.fetchUsersByIds(
          this.configService.get('BASE_OPERATIONS'),
          API_ENDPOINTS.OPERATIONS_SERVICE.USER_DATA_FETCH,
          Array.from(allUserIds),
        ),
        this.getThreadStarsByUser(userId, threadIds),
        this.fetchUnreadCounts(threadIds, userId, role),
      ]);

    const lastMessageIds = lastMessages
      .map((m) => m.message_id)
      .filter(Boolean);
    const attachmentsMap = await this.fetchAttachmentsMap(lastMessageIds);

    return {
      lastMessages,
      usersMap,
      threadStars,
      unreadCounts,
      attachmentsMap,
    };
  }

  private async fetchLastMessages(
    threadIds: string[],
    userId: string,
    role: string,
  ) {
    logger.debug('fetchLastMessages --->');
    return this.messageRepository
      .createQueryBuilder('msg')
      .select('msg.*')
      .addSelect(
        'CASE WHEN mr.id IS NOT NULL OR msg.sender_id = :userId THEN true ELSE false END',
        'is_read',
      )
      .distinctOn(['msg.thread_id'])
      .leftJoin(
        'message_reads',
        'mr',
        'mr.message_id = msg.message_id AND mr.user_id = :userId',
      )
      .where('msg.thread_id IN (:...threadIds)', { threadIds })
      .andWhere(
        role === roleType.PATIENT ? 'msg.visibility = :visibility' : '1=1',
        { visibility: MessageVisibility.PATIENT },
      )
      .orderBy('msg.thread_id')
      .addOrderBy('msg.created_at', 'DESC')
      .setParameter('userId', userId)
      .getRawMany();
  }

  private async fetchUnreadCounts(
    threadIds: string[],
    userId: string,
    role: string,
  ) {
    logger.debug('fetchUnreadCounts --->');
    return this.messageRepository
      .createQueryBuilder('msg')
      .select('msg.thread_id', 'thread_id')
      .addSelect('COUNT(*)', 'unread_count')
      .leftJoin(
        'message_reads',
        'mr',
        'mr.message_id = msg.message_id AND mr.user_id = :userId',
      )
      .where('msg.thread_id IN (:...threadIds)', { threadIds })
      .andWhere('mr.id IS NULL')
      .andWhere('msg.sender_id != :userId')
      .andWhere(
        role === roleType.PATIENT ? 'msg.visibility = :visibility' : '1=1',
        { visibility: MessageVisibility.PATIENT },
      )
      .groupBy('msg.thread_id')
      .setParameter('userId', userId)
      .getRawMany();
  }

  private async fetchAttachmentsMap(messageIds: string[]) {
    logger.debug('fetchAttachmentsMap --->');
    if (messageIds.length === 0) return new Map<string, any[]>();
    const attachments = await this.attachmentRepository.find({
      where: { message: { message_id: In(messageIds) } },
      select: [
        'attachment_id',
        'file_url',
        'file_type',
        'file_duration',
        'created_at',
      ],
    });

    const map = new Map<string, any[]>();
    attachments.forEach((att: any) => {
      const msgId = att.message?.message_id || att.messageMessageId;
      if (!map.has(msgId)) map.set(msgId, []);
      map.get(msgId).push(att);
    });
    return map;
  }

  private enrichThreads(threads: Thread[], data: any, userId: string) {
    logger.debug('enrichThreads --->');
    const {
      lastMessages,
      usersMap,
      threadStars,
      unreadCounts,
      attachmentsMap,
    } = data;
    const lastMessageMap = new Map<string, any>(
      lastMessages.map((m: any) => [m.thread_id, m]),
    );
    const starredThreadIds = new Set<string>(
      threadStars.map((s: any) => s.thread_id),
    );
    const unreadCountMap = new Map<string, number>(
      unreadCounts.map((uc: any) => [
        uc.thread_id,
        parseInt(uc.unread_count, 10),
      ]),
    );

    return threads.map((thread) => {
      const lastMessage = lastMessageMap.get(thread.thread_id);
      return this.enrichThreadItem(
        thread,
        usersMap,
        lastMessage,
        starredThreadIds,
        unreadCountMap,
        attachmentsMap,
      );
    });
  }

  private enrichThreadItem(
    thread: Thread,
    usersMap: any,
    lastMessage: any,
    starredIds: Set<string>,
    unreadMap: Map<string, number>,
    attachmentsMap: Map<string, any[]>,
  ) {
    logger.debug('enrichThreadItem --->');
    const patientUser = usersMap[thread.patient_user_id];
    const assignedUsers =
      thread.assigned_user_ids?.map((id) => ({
        name: usersMap[id]?.userName || null,
        role: usersMap[id]?.role || null,
      })) || [];

    return {
      thread_id: thread.thread_id,
      subject: thread.subject,
      status: thread.status,
      created_at: thread.created_at,
      isRead: lastMessage ? lastMessage.is_read : true,
      unread_count: unreadMap.get(thread.thread_id) || 0,
      flagged: starredIds.has(thread.thread_id),
      patient: {
        name: patientUser?.userName || null,
        role: patientUser?.role || null,
      },
      assigned_users: assignedUsers,
      last_message: this.formatLastMessage(
        lastMessage,
        usersMap,
        attachmentsMap,
      ),
    };
  }

  private formatLastMessage(
    lastMessage: any,
    usersMap: any,
    attachmentsMap: Map<string, any[]>,
  ) {
    logger.debug('formatLastMessage --->');
    if (!lastMessage) return null;
    const sender = usersMap[lastMessage.sender_id];
    let decryptedText = null;
    try {
      decryptedText = decryptMessage(lastMessage.message_text);
    } catch {
      decryptedText = null;
    }

    return {
      message_id: lastMessage.message_id,
      text: decryptedText,
      sender_id: lastMessage.sender_id,
      sender_name: sender?.userName || null,
      sender_role: sender?.role || null,
      created_at: lastMessage.created_at,
      attachments: attachmentsMap.get(lastMessage.message_id) || [],
    };
  }

  private async generateSasUrls(threads: any[]) {
    logger.debug('generateSasUrls --->');
    await Promise.all(
      threads.map(async (t) => {
        if (t.last_message?.attachments) {
          await Promise.all(
            t.last_message.attachments.map(async (att: any) => {
              att.file_url = await getBlobFileUrl(att.file_url);
            }),
          );
        }
      }),
    );
  }

  // ---------------------------
  // VIEW MESSAGES (role-aware)
  // ---------------------------

  /**
   * Fetch messages for a specific thread based on user role.
   *
   * - Admin/Doctor/Nurse: all messages
   * - Patient: only messages visible to the patient
   *
   * Messages are decrypted before returning.
   * Logs all key actions and errors for auditing.
   *
   * @param userId - ID of the requesting user
   * @param role - Role of the user (admin, doctor, nurse, patient)
   * @param threadId - ID of the thread to fetch messages from
   * @returns List of messages in the thread
   */

  async getThreadMessages(
    userId: string,
    role: string,
    threadId: string,
  ): Promise<ApiResponse<any>> {
    try {
      logger.info(
        `Fetching messages for threadId=${threadId}, userId=${userId}, role=${role}`,
      );
      const normalizedRole = role.toLowerCase();
      await this.ensureThreadAccess(userId, normalizedRole, threadId);

      const messages = await this.fetchThreadMessages(threadId, normalizedRole);
      const decrypted = this.decryptMessageList(messages);
      const enriched = await this.enrichThreadMessages(decrypted);
      await this.generateMessageAttachmentUrls(enriched);
      const withStatus = this.addMessageStatus(enriched, userId);
      return new ApiResponseBuilder().success(
        withStatus,
        MESSAGE_TEXT.MESSAGE_FETCHED,
        HttpStatus.OK,
      );
    } catch (error) {
      logger.error(`getThreadMessages failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async fetchThreadMessages(
    threadId: string,
    role: string,
  ): Promise<Message[]> {
    logger.debug('fetchThreadMessages --->');
    const where: any = { thread: { thread_id: threadId } };

    if (role === roleType.PATIENT) {
      where.visibility = MessageVisibility.PATIENT;
    }

    return this.messageRepository.find({
      where,
      relations: ['attachments', 'reads'],
      order: { created_at: 'ASC' },
    });
  }

  private addMessageStatus(messages: any[], currentUserId: string) {
    logger.debug('addMessageStatus --->');
    return messages.map((msg) => {
      if (msg.sender_id !== currentUserId) {
        return {
          ...msg,
          status: null,
        };
      }

      const readByOthers =
        msg.reads?.some((read) => read.user_id !== currentUserId) ?? false;

      return {
        ...msg,
        status: readByOthers ? 'double' : 'single',
      };
    });
  }

  private async enrichThreadMessages(messages: any[]): Promise<any[]> {
    logger.debug('enrichThreadMessages --->');
    const senderIds = [...new Set(messages.map((m) => m.sender_id))];
    if (!senderIds.length) return messages;

    const usersMap = await helpers.fetchUsersByIds(
      this.configService.get('BASE_OPERATIONS'),
      API_ENDPOINTS.OPERATIONS_SERVICE.USER_DATA_FETCH,
      senderIds,
    );

    return messages.map((msg) => ({
      ...msg,
      sender_name: usersMap[msg.sender_id]?.userName || null,
      sender_role: usersMap[msg.sender_id]?.role || null,
    }));
  }

  private async generateMessageAttachmentUrls(
    enrichedMessages: any[],
  ): Promise<void> {
    logger.debug('generateMessageAttachmentUrls --->');
    await Promise.all(
      enrichedMessages.map(async (msg) => {
        if (!msg.attachments?.length) return;
        await Promise.all(
          msg.attachments.map(async (att: any) => {
            att.file_url = await getBlobFileUrl(att.file_url);
          }),
        );
      }),
    );
  }

  // ---------------------------
  // SEND MESSAGE (role-aware)
  // ---------------------------

  /**
   * Sends a message in a thread.
   * @param userId - ID of the sender
   * @param role - Role of the sender (admin, doctor, nurse, patient)
   * @param threadId - ID of the thread
   * @param dto - Message content and optional attachments
   * @returns Created message and thread information
   */
  async sendMessage(
    userId: string,
    role: string,
    threadId: string,
    dto: CreatePatientMessageDto,
  ): Promise<ApiResponse<any>> {
    try {
      logger.info(
        `sendMessage started → userId=${userId}, role=${role}, threadId=${threadId}`,
      );
      await this.ensureThreadAccess(userId, role, threadId);

      const visibility = this.determineVisibility(role.toLowerCase());
      const result = await this.dataSource.transaction(async (manager) => {
        const message = await this.saveMessage(
          manager,
          userId,
          threadId,
          dto,
          visibility,
        );
        const attachments = await this.saveMessageAttachments(
          manager,
          message.message_id,
          dto.attachments,
        );
        return { message, attachments };
      });

      await this.notifySendMessageParticipants(
        userId,
        threadId,
        result.message,
        result.attachments,
      );
      return new ApiResponseBuilder().success(
        {
          success: true,
          thread_id: threadId,
          message_id: result.message.message_id,
        },
        MESSAGE_TEXT.MESSAGE_SENT,
        HttpStatus.CREATED,
      );
    } catch (error) {
      logger.error(`sendMessage failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  private determineVisibility(role: string): MessageVisibility {
    logger.debug('determineVisibility --->');
    const validRoles: string[] = [
      roleType.ADMIN,
      roleType.PATIENT,
      roleType.DOCTOR,
      roleType.NURSE,
    ];
    if (validRoles.includes(role)) return MessageVisibility.PATIENT;
    throw new ForbiddenException('Role not allowed');
  }

  private async saveMessage(
    manager: EntityManager,
    userId: string,
    threadId: string,
    dto: CreatePatientMessageDto,
    visibility: MessageVisibility,
  ): Promise<Message> {
    logger.debug('saveMessage --->');
    const message = manager.create(Message, {
      thread: { thread_id: threadId },
      sender_id: userId,
      message_text: encryptMessage(dto.message),
      message_type: dto.attachments?.length
        ? MessageType.FILE
        : MessageType.TEXT,
      visibility,
    });
    return manager.save(message);
  }

  private async saveMessageAttachments(
    manager: EntityManager,
    messageId: string,
    attachmentsDto?: any[],
  ): Promise<any[]> {
    logger.debug('saveMessageAttachments --->');
    if (!attachmentsDto?.length) return [];
    const attachments = attachmentsDto.map((att) =>
      manager.create(Attachment, {
        message: { message_id: messageId },
        file_url: att.file_url,
        file_type: att.file_type as FileType,
        file_duration: att.duration,
      }),
    );
    const saved = await manager.save(attachments);
    return Promise.all(
      saved.map(async (att) => ({
        ...att,
        file_url: await getBlobFileUrl(att.file_url),
      })),
    );
  }

  private async notifySendMessageParticipants(
    userId: string,
    threadId: string,
    message: Message,
    attachments: any[],
  ) {
    logger.debug('notifySendMessageParticipants --->');
    const thread = await this.threadRepository.findOne({
      where: { thread_id: threadId },
    });
    const userInfo = await this.getUserInfo(userId);
    await this.sendMessageReceivedNotification(
      thread,
      userId,
      userInfo,
      threadId,
      message.message_id,
    );

    this.messageGateway.sendNewMessage(threadId, {
      message_id: message.message_id,
      message_text: decryptMessage(message.message_text),
      sender: {
        user_id: userId,
        name: userInfo?.userName,
        role: userInfo?.role,
      },
      visibility: message.visibility,
      created_at: message.created_at,
      attachments,
    });

    const participants = [
      thread.patient_user_id,
      ...(thread.assigned_user_ids || []),
    ];
    this.notifyCountsUpdates(participants);
  }

  // ---------------------------
  // ARCHIVE THREAD (admins only)
  // ---------------------------

  /**
   * Archives a thread and marks it as closed.
   *
   * - Only accessible by admins.
   * - Updates `archived_at` and `status` fields.
   * - Returns success status on completion.
   *
   * @param adminId - ID of the admin performing the action
   * @param threadId - ID of the thread to archive
   * @returns Success status
   * @throws Returns 403 if thread not found, 500 on internal errors
   */

  async archiveThread(
    adminId: string,
    threadId: string,
    status: boolean,
  ): Promise<ApiResponse<{ success: boolean }>> {
    try {
      logger.info(
        `Archive/Unarchive thread → threadId=${threadId}, status=${status}, by_admin=${adminId}`,
      );
      const thread = await this.ensureThreadAccess(
        adminId,
        roleType.ADMIN,
        threadId,
      );

      thread.archived_at = status ? new Date() : null;
      thread.status = status ? ThreadStatus.CLOSED : ThreadStatus.OPEN;
      await this.threadRepository.save(thread);

      this.notifyArchiveUpdate(threadId, adminId, status, thread);
      return new ApiResponseBuilder().success(
        { success: true },
        status ? MESSAGE_TEXT.THREAD_ARCHIVED : MESSAGE_TEXT.THREAD_UNARCHIVED,
        HttpStatus.OK,
      );
    } catch (error) {
      logger.error(`archiveThread failed: ${error.message}`, error.stack);
      throw new InternalServerErrorException(
        `Failed to ${status ? 'archive' : 'unarchive'} thread`,
      );
    }
  }

  private notifyArchiveUpdate(
    threadId: string,
    adminId: string,
    status: boolean,
    thread: Thread,
  ): void {
    logger.debug('notifyArchiveUpdate --->');
    this.messageGateway.sendThreadUpdated(threadId, {
      status: status ? ThreadStatus.CLOSED : ThreadStatus.OPEN,
      updated_by: adminId,
    });
    this.notifyCountsUpdates([
      thread.patient_user_id,
      ...(thread.assigned_user_ids || []),
    ]);
  }

  // ---------------------------
  // Marks AS Read
  // ---------------------------

  /**
   * Marks a message as read by the given user.
   *
   * - Creates or updates a read receipt for the message.
   * - Validates if the message exists in the specified thread.
   *
   * @param userId - ID of the user marking the message as read
   * @param threadId - ID of the thread containing the message
   * @param dto - Object containing last_seen_message_id
   * @returns Success status if read receipt is updated
   * @throws 400 if message_id is invalid, 500 on internal errors
   */

  async markAsRead(
    userId: string,
    role: string,
    threadId: string,
    dto: MarkReadDto,
  ): Promise<ApiResponse<any>> {
    try {
      logger.info(
        `markAsRead started → userId=${userId}, threadId=${threadId}`,
      );
      await this.ensureThreadAccess(userId, role.toLowerCase(), threadId);

      const message = await this.validateMessageForThread(
        dto.last_seen_message_id,
        threadId,
      );
      const readReceipts = await this.prepareReadReceipts(
        userId,
        threadId,
        message.created_at,
      );
      readReceipts.push({
        message_id: dto.last_seen_message_id,
        user_id: userId,
        read_at: new Date(),
      });
      if (readReceipts.length > 0) {
        await this.dataSource
          .getRepository(MessageRead)
          .upsert(readReceipts, ['message_id', 'user_id']);
      }

      this.notifyReadStatus(threadId, userId, dto.last_seen_message_id);
      return new ApiResponseBuilder().success(
        { success: true, thread_id: threadId },
        MESSAGE_TEXT.MESSAGE_MARKED_READ,
        HttpStatus.OK,
      );
    } catch (error) {
      logger.error(`markAsRead failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async validateMessageForThread(
    messageId: string,
    threadId: string,
  ): Promise<Message> {
    logger.debug('validateMessageForThread --->');
    const message = await this.messageRepository.findOne({
      where: { message_id: messageId, thread: { thread_id: threadId } },
    });
    if (!message)
      throw new BadRequestException('Invalid message_id for this thread');
    return message;
  }

  private async prepareReadReceipts(
    userId: string,
    threadId: string,
    createdAt: Date,
  ): Promise<any[]> {
    logger.debug('prepareReadReceipts --->');
    const messagesToMark = await this.messageRepository.find({
      where: {
        thread: { thread_id: threadId },
        created_at: LessThanOrEqual(createdAt),
      },
      select: ['message_id'],
    });
    return messagesToMark.map((m) => ({
      message_id: m.message_id,
      user_id: userId,
      read_at: new Date(),
    }));
  }

  private notifyReadStatus(
    threadId: string,
    userId: string,
    messageId: string,
  ): void {
    logger.debug('notifyReadStatus --->');
    this.messageGateway.sendMessageRead(threadId, {
      thread_id: threadId,
      last_seen_message_id: messageId,
      user_id: userId,
      status: 'double',
    });
    this.notifyCountsUpdates([userId]);
  }

  // ---------------------------
  // Marks AS Unread
  // ---------------------------

  async markAsUnread(
    userId: string,
    role: string,
    threadId: string,
  ): Promise<ApiResponse<{ success: boolean }>> {
    try {
      logger.info(
        `markAsUnread started → userId=${userId}, threadId=${threadId}`,
      );
      await this.ensureThreadAccess(userId, role.toLowerCase(), threadId);

      const messages = await this.messageRepository.find({
        where: { thread: { thread_id: threadId } },
        select: ['message_id'],
      });

      if (messages.length > 0) {
        await this.clearReadReceipts(
          userId,
          messages.map((m) => m.message_id),
        );
      }

      this.messageGateway.sendMarkAsUnread(threadId, { user_id: userId });
      this.notifyCountsUpdates([userId]);

      return new ApiResponseBuilder().success(
        { success: true },
        MESSAGE_TEXT.MESSAGE_MARKED_UNREAD,
        HttpStatus.OK,
      );
    } catch (error) {
      logger.error(`markAsUnread failed: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to mark as unread');
    }
  }

  private async clearReadReceipts(
    userId: string,
    messageIds: string[],
  ): Promise<void> {
    logger.debug('clearReadReceipts --->');
    await this.dataSource
      .getRepository(MessageRead)
      .createQueryBuilder()
      .delete()
      .where('user_id = :userId AND message_id IN (:...messageIds)', {
        userId,
        messageIds,
      })
      .execute();
  }

  // ---------------------------
  // DELETE THREAD (admins only)
  // ---------------------------

  async deleteThread(
    adminId: string,
    threadId: string,
  ): Promise<ApiResponse<{ success: boolean }>> {
    logger.info(`deleteThread started → adminId=${adminId}, threadId=${threadId}`);
    const thread = await this.ensureThreadAccess(
      adminId,
      roleType.ADMIN,
      threadId,
    );
    try {
      thread.deleted_at = new Date();
      thread.deleted_by = adminId;
      thread.status = ThreadStatus.DELETED;
      await this.threadRepository.save(thread);

      this.messageGateway.sendThreadDeleted(threadId, {
        status: ThreadStatus.DELETED,
        updated_by: adminId,
      });
      this.notifyCountsUpdates([
        thread.patient_user_id,
        ...(thread.assigned_user_ids || []),
      ]);

      return new ApiResponseBuilder().success(
        { success: true },
        MESSAGE_TEXT.THREAD_DELETED,
        HttpStatus.OK,
      );
    } catch (error) {
      logger.error(`deleteThread failed: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to delete thread');
    }
  }

  // ---------------------------
  // Assign Thread
  // ---------------------------

  /**
   * Assigns users to a thread and creates tags for newly added users.
   *
   * - Updates the thread's assigned_user_ids with new users.
   * - Detects newly added users and creates thread tags for them.
   * - Only an admin can perform this action.
   *
   * @param adminId - ID of the admin performing the assignment
   * @param threadId - ID of the thread to assign users to
   * @param dto - Object containing assigned_user_ids
   * @returns Assigned users, newly tagged users, and thread ID
   * @throws 404 if thread not found, 500 on internal errors
   */

  async assignThread(
    adminId: string,
    threadId: string,
    dto: AssignThreadDto,
  ): Promise<ApiResponse<any>> {
    logger.info(
      `AssignThread start → adminId=${adminId}, threadId=${threadId}`,
    );
    const thread = await this.ensureThreadAccess(
      adminId,
      roleType.ADMIN,
      threadId,
    );

    if (dto.assigned_user_ids?.length) {
      await this.validateAssignmentRoles(dto.assigned_user_ids);
    }

    const { newAssigned, newlyAdded } = this.calculateAssignments(
      thread.assigned_user_ids || [],
      dto.assigned_user_ids || [],
    );
    thread.assigned_user_ids = newAssigned;
    await this.threadRepository.save(thread);

    if (newlyAdded.length)
      await this.createAssignmentTags(threadId, newlyAdded, adminId);

    this.messageGateway.sendThreadUpdated(threadId, {
      assigned_user_ids: newAssigned,
    });
    this.notifyCountsUpdates([thread.patient_user_id, ...newAssigned]);

    return new ApiResponseBuilder().success(
      {
        success: true,
        thread_id: threadId,
        assigned_user_ids: newAssigned,
        tagged_users: newlyAdded,
      },
      MESSAGE_TEXT.THREAD_ASSIGNED,
      HttpStatus.OK,
    );
  }

  private async validateAssignmentRoles(userIds: string[]): Promise<void> {
    logger.debug('validateAssignmentRoles --->');
    const usersMap = await helpers.fetchUsersByIds(
      this.configService.get('BASE_OPERATIONS'),
      API_ENDPOINTS.OPERATIONS_SERVICE.USER_DATA_FETCH,
      userIds,
    );
    userIds.forEach((id) => {
      const u = usersMap[id];
      if (!u) throw new NotFoundException(`User ${id} not found`);
      const role = u.role?.toLowerCase();
      if (role !== roleType.DOCTOR && role !== roleType.NURSE) {
        throw new BadRequestException(
          `Only Doctors/Nurses allowed. User ${id} is ${u.role}`,
        );
      }
    });
  }

  private calculateAssignments(existing: string[], incoming: string[]) {
    logger.debug('calculateAssignments --->');
    const uniqueIncoming = [...new Set(incoming)];
    const newAssigned = [...new Set([...existing, ...uniqueIncoming])];
    const newlyAdded = uniqueIncoming.filter((id) => !existing.includes(id));
    return { newAssigned, newlyAdded };
  }

  private async createAssignmentTags(
    threadId: string,
    users: string[],
    adminId: string,
  ): Promise<void> {
    logger.debug('createAssignmentTags --->');
    const tags = users.map((uid) =>
      this.threadTagRepository.create({
        thread_id: threadId,
        tagged_user_id: uid,
        tagged_by_user_id: adminId,
      }),
    );
    await this.threadTagRepository.save(tags);
  }

  // ---------------------------
  // Get Assigned Users
  // ---------------------------

  /**
   * Retrieves the list of assigned users (doctors/nurses) for a thread.
   * Excluding the patient.
   *
   * @param threadId - ID of the thread
   * @returns List of assigned users with names and roles
   */
  async getAssignedUsers(
    threadId: string,
    search?: string,
  ): Promise<ApiResponse<any>> {
    logger.info(`getAssignedUsers ---> threadId=${threadId}`);
    const thread = await this.threadRepository.findOne({
      where: { thread_id: threadId, status: Not(ThreadStatus.DELETED) },
    });
    if (!thread) throw new NotFoundException(MESSAGE_TEXT.THREAD_NOT_FOUND);

    const doctorNurseIds = (thread.assigned_user_ids || []).filter(
      (id) => id !== thread.patient_user_id,
    );
    if (!doctorNurseIds.length)
      return new ApiResponseBuilder().success(
        [],
        MESSAGE_TEXT.ASSIGNED_USERS_FETCHED,
        HttpStatus.OK,
      );

    const usersMap = await helpers.fetchUsersByIds(
      this.configService.get('BASE_OPERATIONS'),
      API_ENDPOINTS.OPERATIONS_SERVICE.USER_DATA_FETCH,
      doctorNurseIds,
    );
    let assignedUsers = this.mapAssignedUsers(doctorNurseIds, usersMap);

    if (search)
      assignedUsers = assignedUsers.filter((u) =>
        u.name?.toLowerCase().includes(search.toLowerCase()),
      );
    return new ApiResponseBuilder().success(
      assignedUsers,
      MESSAGE_TEXT.ASSIGNED_USERS_FETCHED,
      HttpStatus.OK,
    );
  }

  private mapAssignedUsers(ids: string[], usersMap: any) {
    logger.debug('mapAssignedUsers --->');
    return ids.map((id) => ({
      user_id: id,
      name: usersMap[id]?.userName || null,
      role: usersMap[id]?.role || null,
    }));
  }

  // ---------------------------
  // Add internal note (admins only)
  // ---------------------------
  /**
   * Adds an internal note to a thread.
   *
   * - Creates a message with INTERNAL visibility linked to the thread.
   * - Only admins can add internal notes.
   * - Runs inside a database transaction to ensure consistency.
   *
   * @param adminId - ID of the admin adding the note
   * @param threadId - ID of the thread to add the note to
   * @param dto - Object containing the note text
   * @returns Success status and the created message_id
   * @throws 500 if internal note creation fails
   */

  async addInternalNote(
    adminId: string,
    threadId: string,
    dto: CreateInternalNoteDto,
  ): Promise<ApiResponse<{ success: boolean; message_id: string }>> {
    const thread = await this.ensureThreadAccess(
      adminId,
      roleType.ADMIN,
      threadId,
    );
    logger.info(
      `addInternalNote started by adminId=${adminId} for threadId=${threadId}`,
    );

    return this.dataSource.transaction(async (manager) => {
      const message = await this.saveInternalNote(
        manager,
        adminId,
        threadId,
        dto.note_text,
      );
      this.notifyInternalNote(
        threadId,
        adminId,
        message.message_id,
        dto.note_text,
        thread,
      );

      return new ApiResponseBuilder().success(
        { success: true, message_id: message.message_id },
        MESSAGE_TEXT.INTERNAL_NOTE_ADDED,
        HttpStatus.CREATED,
      );
    });
  }

  private async saveInternalNote(
    manager: EntityManager,
    adminId: string,
    threadId: string,
    noteText: string,
  ): Promise<Message> {
    logger.debug('saveInternalNote --->');
    const message = manager.create(Message, {
      thread: { thread_id: threadId },
      sender_id: adminId,
      message_text: encryptMessage(noteText),
      message_type: MessageType.TEXT,
      visibility: MessageVisibility.INTERNAL,
    });
    return manager.save(message);
  }

  private async notifyInternalNote(
    threadId: string,
    adminId: string,
    messageId: string,
    noteText: string,
    thread: Thread,
  ): Promise<void> {
    logger.debug('notifyInternalNote --->');
    const userInfo = await this.getUserInfo(adminId);

    this.messageGateway.sendInternalNote(threadId, {
      message_id: messageId,
      note_text: encryptMessage(noteText),
      admin_id: adminId,
    });

    this.messageGateway.sendNewMessage(threadId, {
      message_id: messageId,
      message_text: noteText,
      sender: {
        user_id: adminId,
        name: userInfo?.userName,
        role: userInfo?.role,
      },
      visibility: MessageVisibility.INTERNAL,
      created_at: new Date(),
    });

    this.notifyCountsUpdates([
      thread.patient_user_id,
      ...(thread.assigned_user_ids || []),
      adminId,
    ]);
  }

  async toggleStar(
    threadId: string,
    userId: string,
    role: string,
  ): Promise<ApiResponse<{ success: boolean; action: string }>> {
    try {
      logger.info(`toggleStar ---> userId=${userId}, threadId=${threadId}`);
      await this.ensureThreadAccess(userId, role, threadId);
      const existing = await this.threadStarRepository.findOne({
        where: { thread_id: threadId, user_id: userId },
      });
      const action = existing ? 'unstarred' : 'starred';

      if (existing) await this.threadStarRepository.remove(existing);
      else
        await this.threadStarRepository.save(
          this.threadStarRepository.create({
            thread_id: threadId,
            user_id: userId,
          }),
        );

      this.messageGateway.sendToggleStar(userId, {
        thread_id: threadId,
        action,
      });
      this.notifyCountsUpdates([userId]);

      return new ApiResponseBuilder().success(
        { success: true, action },
        `Thread ${action} successfully`,
        HttpStatus.OK,
      );
    } catch (error) {
      logger.error(`toggleStar failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getMessageCounts(
    userId: string,
    role: string,
  ): Promise<ApiResponse<any>> {
    try {
      logger.info(`getMessageCounts ---> userId=${userId}, role=${role}`);
      const normalizedRole = role.trim().toLowerCase();
      const threads = await this.fetchThreadsForCounts(userId, normalizedRole);
      const threadIds = threads.map((t) => t.thread_id);

      if (!threadIds.length) return this.emptyCountsResponse();

      const counts = await this.calculateCounts(userId, threadIds, threads);
      const role_groups =
        normalizedRole === roleType.ADMIN ||
        normalizedRole === roleType.NURSE ||
        normalizedRole === roleType.DOCTOR ||
        normalizedRole === roleType.COORDINATOR ||
        normalizedRole === roleType.MANAGER
          ? await this.calculateAdminRoleGroups(threads)
          : {};

      return new ApiResponseBuilder().success(
        { ...counts, role_groups },
        MESSAGE_TEXT.COUNTS_FETCHED,
        HttpStatus.OK,
      );
    } catch (err: any) {
      logger.error(`getMessageCounts failed: ${err.message}`, err.stack);
      throw err;
    }
  }

  private async fetchThreadsForCounts(
    userId: string,
    role: string,
  ): Promise<Thread[]> {
    logger.debug('fetchThreadsForCounts --->');
    let where: any = { status: Not(ThreadStatus.DELETED) };
    if (role === roleType.ADMIN) {
      /* all good */
    } else if (role === roleType.DOCTOR || role === roleType.NURSE)
      where.assigned_user_ids = ArrayContains([userId]);
    else if (role === roleType.PATIENT) where.patient_user_id = userId;
    else return [];

    return this.threadRepository.find({ where });
  }

  private async calculateCounts(
    userId: string,
    threadIds: string[],
    threads: Thread[],
  ) {
    logger.debug('calculateCounts --->');
    const starred = await this.threadStarRepository.count({
      where: { thread_id: In(threadIds), user_id: userId },
    });
    return {
      all: threads.length,
      archived: threads.filter((t) => t.status === ThreadStatus.CLOSED).length,
      unread: await this.countUnreadThreads(userId, threadIds),
      sent: await this.countSentThreads(userId, threadIds),
      starred,
      flagged: starred,
    };
  }

  private async countUnreadThreads(
    userId: string,
    threadIds: string[],
  ): Promise<number> {
    logger.debug('countUnreadThreads --->');
    const res = await this.threadRepository
      .createQueryBuilder('thread')
      .innerJoin('thread.messages', 'm')
      .leftJoin(
        'message_reads',
        'mr',
        'mr.message_id = m.message_id AND mr.user_id = :userId',
        { userId },
      )
      .where('thread.thread_id IN (:...threadIds)', { threadIds })
      .andWhere('thread.status = :status', { status: ThreadStatus.OPEN })
      .andWhere('m.sender_id != :userId')
      .andWhere('mr.id IS NULL')
      .select('COUNT(DISTINCT thread.thread_id)', 'count')
      .getRawOne();
    return parseInt(res?.count || '0', 10);
  }

  private async countSentThreads(
    userId: string,
    threadIds: string[],
  ): Promise<number> {
    logger.debug('countSentThreads --->');
    const res = await this.threadRepository
      .createQueryBuilder('thread')
      .innerJoin('thread.messages', 'm_last')
      .leftJoin(
        'thread.messages',
        'm_future',
        'm_last.created_at < m_future.created_at AND m_last.thread_id = m_future.thread_id',
      )
      .where('thread.thread_id IN (:...threadIds)', { threadIds })
      .andWhere('m_future.message_id IS NULL')
      .andWhere('m_last.sender_id = :userId', { userId })
      .select('COUNT(DISTINCT thread.thread_id)', 'count')
      .getRawOne();
    return parseInt(res?.count || '0', 10);
  }

  private emptyCountsResponse() {
    logger.debug('emptyCountsResponse --->');
    return new ApiResponseBuilder().success(
      {
        all: 0,
        unread: 0,
        flagged: 0,
        starred: 0,
        sent: 0,
        archived: 0,
        role_groups: {},
      },
      MESSAGE_TEXT.COUNTS_FETCHED,
      HttpStatus.OK,
    );
  }

  private async calculateAdminRoleGroups(
    threads: Thread[],
  ): Promise<Record<string, number>> {
    logger.debug('calculateAdminRoleGroups --->');
    const userIds = [
      ...new Set(
        threads.flatMap((t) => [
          t.patient_user_id,
          ...(t.assigned_user_ids || []),
        ]),
      ),
    ].filter(Boolean);
    if (!userIds.length) return {};

    const usersMap = await helpers.fetchUsersByIds(
      this.configService.get('BASE_OPERATIONS'),
      API_ENDPOINTS.OPERATIONS_SERVICE.USER_DATA_FETCH,
      userIds,
    );
    const roleGroups: Record<string, number> = {};

    threads.forEach((t) => {
      const threadParticipants = [
        t.patient_user_id,
        ...(t.assigned_user_ids || []),
      ];
      const roles = new Set(
        threadParticipants
          .map((pid) => usersMap[pid]?.role)
          .filter((r) => r && r !== roleType.PATIENT),
      );
      roles.forEach((r) => (roleGroups[r] = (roleGroups[r] || 0) + 1));
    });
    return roleGroups;
  }

  private async sendMessageReceivedNotification(
    thread: Thread,
    userId: string,
    userInfo: any,
    threadId: string,
    messageId: string,
  ): Promise<void> {
    logger.debug('sendMessageReceivedNotification --->');
    if (userId === thread?.patient_user_id) {
      return;
    }

    // Fetch patient information
    let patientName: string | undefined;
    let patientRole: string = roleType.PATIENT;

    if (thread?.patient_user_id) {
      try {
        const patientInfoMap = await helpers.fetchUsersByIds(
          this.configService.get('BASE_OPERATIONS'),
          API_ENDPOINTS.OPERATIONS_SERVICE.USER_DATA_FETCH,
          [thread.patient_user_id],
        );

        const patientInfo = patientInfoMap[thread.patient_user_id];
        patientName = patientInfo?.userName;

        if (patientInfo?.role) {
          patientRole = patientInfo.role;
        }
      } catch (error) {
        logger.debug(`Could not fetch patient name for notification: ${error}`);
      }
    }

    await this.notificationHelper.sendNotificationSafely(
      {
        userId: thread?.patient_user_id || userId,
        userRole: patientRole,
        eventType: NOTIFICATION_EVENT_TYPE.MESSAGE_RECEIVED,
        title: 'New Message',
        message: `You have received a new message from ${userInfo?.userName || 'Staff'}`,
        patientName: patientName,
        patientReference: thread?.patient_user_id,
        priority: 'normal',
        relatedEntityId: messageId,
        metadata: {
          threadId,
          messageId,
          senderName: userInfo?.userName,
        },
      },
      logger,
    );
  }

  // ---------------------------
  // NOTIFY COUNTS
  // ---------------------------

  /**
   * Helper to recalculate and emit counts for a list of users.
   * Fetches user roles if needed to ensure accurate counting.
   */
  private async notifyCountsUpdates(userIds: string[]) {
    if (!userIds?.length) return;
    const uniqueIds = [...new Set(userIds)];
    logger.info(`Notifying counts for: ${JSON.stringify(uniqueIds)}`);

    try {
      const usersMap = await helpers.fetchUsersByIds(
        this.configService.get('BASE_OPERATIONS'),
        API_ENDPOINTS.OPERATIONS_SERVICE.USER_DATA_FETCH,
        uniqueIds,
      );
      await Promise.all(
        uniqueIds.map((uid) =>
          this.processSingleUserCountUpdate(uid, usersMap[uid]),
        ),
      );
    } catch (error) {
      logger.error(`notifyCountsUpdates failed: ${error.message}`);
    }
  }

  private async processSingleUserCountUpdate(
    userId: string,
    user: any,
  ): Promise<void> {
    logger.debug('processSingleUserCountUpdate --->');
    if (!user) return;
    this.messageGateway.sendThreadListUpdate(userId, { action: 'refresh' });
    try {
      const countRes = await this.getMessageCounts(userId, user.role);
      if (countRes?.data)
        this.messageGateway.sendCountsUpdate(userId, countRes.data);
    } catch (err) {
      logger.error(`Count update failed for ${userId}: ${err.message}`);
    }
  }

  // ---------------------------
  // ESCALATION SUPPORT METHODS
  // ---------------------------

  /**
   * Get all open threads for escalation checking
   * Used by cron job to check for no-response escalations
   */
  async getOpenThreadsForEscalation(): Promise<ApiResponse<Thread[]>> {
    logger.info('getOpenThreadsForEscalation --->');
    try {
      const threads = await this.threadRepository.find({
        where: { status: ThreadStatus.OPEN },
        select: [
          'thread_id',
          'patient_user_id',
          'assigned_user_ids',
          'created_at',
        ],
        order: { created_at: 'DESC' },
      });
      return new ApiResponseBuilder().success(
        threads,
        'Open threads fetched successfully',
        HttpStatus.OK,
      );
    } catch (error) {
      logger.error(`getOpenThreadsForEscalation failed: ${error.message}`);
      throw error;
    }
  }

  async getThreadMessagesForEscalation(
    threadId: string,
  ): Promise<ApiResponse<Message[]>> {
    logger.info(`getThreadMessagesForEscalation ---> threadId=${threadId}`);
    try {
      const messages = await this.messageRepository.find({
        where: { thread: { thread_id: threadId } },
        select: ['message_id', 'sender_id', 'message_text', 'created_at'],
        order: { created_at: 'ASC' },
      });
      return new ApiResponseBuilder().success(
        messages,
        'Messages fetched successfully',
        HttpStatus.OK,
      );
    } catch (error) {
      logger.error(`getThreadMessagesForEscalation failed: ${error.message}`);
      throw error;
    }
  }

  async findThreadBetweenUsers(
    patientId: string,
    providerIds: string[],
  ): Promise<Record<string, string | null>> {
    logger.info(`findThreadBetweenUsers ---> patientId=${patientId}`);
    if (!providerIds?.length) return {};
    const threads = await this.threadRepository.find({
      where: { patient_user_id: patientId, status: Not(ThreadStatus.DELETED) },
      select: ['thread_id', 'assigned_user_ids'],
    });

    const threadMap: Record<string, string | null> = {};
    providerIds.forEach((id) => (threadMap[id] = null));
    threads.forEach((t) =>
      this.matchProvidersToThread(t, providerIds, threadMap),
    );
    return threadMap;
  }

  private matchProvidersToThread(
    thread: Thread,
    providerIds: string[],
    map: Record<string, string | null>,
  ): void {
    logger.debug('matchProvidersToThread --->');
    if (!thread.assigned_user_ids) return;
    providerIds.forEach((pid) => {
      if (thread.assigned_user_ids?.includes(pid) && !map[pid])
        map[pid] = thread.thread_id;
    });
  }
}