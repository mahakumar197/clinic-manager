import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Content } from './entities/content.entity';
import {
  CreateContentDto,
  listContentDto,
  UpdateContentDto,
} from './dto/content.dto';
import {
  ApiResponse,
  ApiResponseBuilder,
  HttpStatus,
  PaginatedApiResponse,
} from '@pallmall/shared-types';
import {
  ContentStatus,
  ContentType,
  CONTENT_MESSAGES,
  ImageCount,
  ImageCountId,
  NotificationHelper,
  NOTIFICATION_EVENT_TYPE,
  NOTIFICATION_EVENT_LABELS,
} from '@pallmall/common-utils';
import { contains } from 'class-validator';
import { helpers } from '@pallmall/common-utils';
import { Procedures } from 'src/procedures/entities/procedures.entity';

@Injectable()
export class ContentService {
  private notificationHelper: NotificationHelper;
  private logger = new Logger(ContentService.name);

  constructor(
    @InjectRepository(Content)
    private contentRepository: Repository<Content>,
    private dataSource: DataSource,
  ) {
    this.notificationHelper = new NotificationHelper();
  }

  // ---------------------------
  // IS EXTERNAL URL
  // ---------------------------

  /**
   * Checks if URL is external.
   *
   * @param url - URL
   * @returns True if URL is external, false otherwise
   */
  private isExternalUrl(url: string): boolean {
    this.logger.debug('isExternalUrl --->');
    return url && (url.startsWith('http://') || url.startsWith('https://'));
  }

  // ---------------------------
  // VALIDATE EXTENSIONS
  // ---------------------------

  /**
   * Validates extensions.
   *
   * @param urls - URLs
   * @param type - Content type
   * @param imgCount - Image count
   */
  private validateExtensions(
    urls: string[],
    type: ContentType,
    imgCount?: number,
  ) {
    this.logger.debug('validateExtensions --->');
    if (type === ContentType.ELEARNING && urls && urls.length > 0) {
      throw new BadRequestException(
        'contentUrl is not allowed for eLearning content',
      );
    }

    if ((!urls || urls.length === 0) && type === ContentType.VIDEO) {
      throw new BadRequestException('contentUrl is required for video content');
    }
    if (type === ContentType.VIDEO && imgCount !== undefined) {
      throw new BadRequestException(
        'imgCount is not allowed for video content',
      );
    }
    if (type === ContentType.ELEARNING && imgCount !== undefined) {
      throw new BadRequestException(
        'imgCount is not allowed for eLearning content',
      );
    }

    if ((!urls || urls.length === 0) && type === ContentType.IMAGE) {
      throw new BadRequestException('contentUrl is required for image content');
    }

    if (!urls || urls.length === 0) return;

    const imgExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];
    const videoExts = ['.mp4', '.mov', '.avi', '.webm', '.mkv'];

    if (urls.some((url) => !url || url.trim() === '')) {
      throw new BadRequestException('Content URL cannot contain empty strings');
    }

    // Skip extension validation for external URLs
    const internalUrls = urls.filter((url) => !this.isExternalUrl(url));

    if (internalUrls.length === 0 && urls.length > 0) return; // All are external URLs

    if (type === ContentType.IMAGE) {
      const invalid = internalUrls.some((url) => {
        const clean = url.split('?')[0].toLowerCase();
        return !imgExts.some((ext) => clean.endsWith(ext));
      });
      if (invalid)
        throw new BadRequestException('Invalid image file extension');
    }

    if (type === ContentType.VIDEO) {
      if (urls.length > 1) {
        throw new BadRequestException('Video content can only have one URL');
      }

      const invalid = internalUrls.some((url) => {
        const clean = url.split('?')[0].toLowerCase();
        return !videoExts.some((ext) => clean.endsWith(ext));
      });
      if (invalid)
        throw new BadRequestException(
          'Invalid video file extension or Image URL used in Video type',
        );
    }
  }
  // ---------------------------
  // CREATE CONTENT
  // ---------------------------

  /**
   * Creates a new content inside a transactional context.
   *
   * - Saves content
   * - Adds activity log
   * - Assigns user
   *
   * @param createContentDto - Content payload
   * @returns Saved Content Response
   */
  async createContent(createContentDto: CreateContentDto) {
    this.logger.log('createContent --->');
    this.validateThumbnailUrl(createContentDto.thumbnailUrl);
    this.validateExtensions(
      createContentDto.contentUrl,
      createContentDto.type,
      createContentDto.imgCount,
    );

    if (createContentDto.type === ContentType.ELEARNING) {
      this.validateELearningLessons(createContentDto.eLearnings);
    }

    if (
      createContentDto.type === ContentType.ELEARNING &&
      (!createContentDto.content || createContentDto.content.trim() === '')
    ) {
      throw new BadRequestException('content is required for eLearning type');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (createContentDto.procedureId) {
        const procedureExists = await queryRunner.manager.exists(Procedures, {
          where: { id: createContentDto.procedureId },
        });

        if (!procedureExists) {
          throw new BadRequestException('Invalid procedureId');
        }
      }
      const content = this.contentRepository.create({
        title: createContentDto.title,
        description: createContentDto.description,
        type: createContentDto.type,
        content: createContentDto.content,
        img_count: createContentDto.imgCount,
        thumbnail_url: createContentDto.thumbnailUrl,
        content_url: createContentDto.contentUrl,
        status: createContentDto.status,
        author_id: createContentDto.authorId,
        author_name: createContentDto.authorName,
        procedure_id: createContentDto.procedureId,
        blog_header: createContentDto.blogHeader,
        eLearnings: createContentDto.eLearnings,
      });

      if (createContentDto.status === ContentStatus.PUBLISHED) {
        content.published_at = new Date();
      }

      const data = await queryRunner.manager.save(content);

      await queryRunner.commitTransaction();

      const transformedData = await this.transformContent(data);

      return new ApiResponseBuilder().success(
        transformedData,
        CONTENT_MESSAGES.CONTENT_CREATED,
        HttpStatus.CREATED,
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Error creating content:', error);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException(error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async findAllContentForDropdown() {
    this.logger.log('findAllContentForDropdown --->');
    try {
      const content = await this.contentRepository.find({
        where: {
          status: ContentStatus.PUBLISHED,
          type: ContentType.ELEARNING,
        },
      });
      return new ApiResponseBuilder().success(
        content,
        CONTENT_MESSAGES.CONTENT_FETCHED,
        HttpStatus.OK,
      );
    } catch (error) {
      this.logger.error('Error fetching content:', error);
      throw new InternalServerErrorException(error.message);
    }
  }

  // ---------------------------
  // LIST CONTENT
  // ---------------------------

  /**
   * Lists all content inside a transactional context.
   *
   * - Lists content
   * - Adds activity log
   * - Assigns user
   *
   * @param query - List content payload
   * @returns List content response
   */
  async findAllContent(query: listContentDto) {
    this.logger.log('findAllContent --->');
    try {
      const { page = 1, limit = 10, search, type, status, procedureId } = query;
      const queryBuilder = this.contentRepository
        .createQueryBuilder('content')
        .leftJoinAndSelect('content.procedure', 'procedure');

      if (search) {
        queryBuilder.andWhere(
          '(content.title ILIKE :search OR content.description ILIKE :search)',
          { search: `%${search}%` },
        );
      }
      if (type) {
        queryBuilder.andWhere('content.type = :type', { type });
      }
      if (status) {
        queryBuilder.andWhere('content.status = :status', { status });
      }
      if (procedureId) {
        queryBuilder.andWhere('content.procedure_id = :procedureId', {
          procedureId,
        });
      }
      const total = await queryBuilder.getCount();
      const skip = (page - 1) * limit;
      const dataQuery = queryBuilder
        .skip(skip)
        .take(limit)
        .orderBy('content.created_at', 'DESC')
        .getMany();
      const countsQuery = this.contentRepository
        .createQueryBuilder('content')
        .leftJoinAndSelect('content.procedure', 'procedure')
        .select('content.type', 'type')
        .addSelect('COUNT(*)', 'count');

      if (procedureId) {
        countsQuery.andWhere('content.procedure_id = :procedureId', {
          procedureId,
        });
      }

      const [rawData, counts] = await Promise.all([
        dataQuery,
        countsQuery.groupBy('content.type').getRawMany(),
      ]);

      const data = await Promise.all(
        rawData.map(async (content) => this.transformContent(content)),
      );

      const countMap = Object.values(ContentType).reduce(
        (acc, type) => {
          acc[type] = Number(
            counts.find((item) => item.type === type)?.count ?? 0,
          );
          return acc;
        },
        {} as Record<ContentType, number>,
      );

      const totalCount = Object.values(countMap).reduce(
        (sum, value) => sum + value,
        0,
      );
      const result = {
        ...countMap,
        total: totalCount,
      };
      console.log('Content counts by type:', total);

      const response = new ApiResponseBuilder().paginated(
        data,
        {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
        CONTENT_MESSAGES.CONTENT_FETCHED,
      );

      response.meta.count = result;

      return response;
    } catch (error) {
      this.logger.error('Error fetching content:', error);
      throw new InternalServerErrorException(error.message);
    }
  }

  // ---------------------------
  // FIND CONTENT BY ID
  // ---------------------------

  /**
   * Finds content by ID inside a transactional context.
   *
   * - Finds content
   * - Adds activity log
   * - Assigns user
   *
   * @param id - Content ID
   * @returns Content Response
   */
  private async findContentById(id: string): Promise<Content> {
    this.logger.log(`findContentById ---> id: ${id}`);
    const content = await this.contentRepository.findOne({ where: { id } });
    if (!content) {
      throw new NotFoundException(`Content with ID ${id} not found`);
    }
    return content;
  }

  // ---------------------------
  // FIND CONTENT BY ID
  // ---------------------------

  /**
   * Finds content by ID inside a transactional context.
   *
   * - Finds content
   * - Adds activity log
   * - Assigns user
   *
   * @param id - Content ID
   * @returns Content Response
   */
  public async findOneContent(id: string) {
    this.logger.log('findOneContent --->');
    try {
      await this.contentRepository.increment({ id }, 'view_count', 1);
      const data = await this.findContentById(id);
      return new ApiResponseBuilder().success(
        data,
        CONTENT_MESSAGES.CONTENT_FETCHED,
        HttpStatus.OK,
      );
    } catch (error) {
      this.logger.error('Error fetching content by ID:', error);
      throw new InternalServerErrorException(error.message);
    }
  }

  // ---------------------------
  // FIND CONTENT BY ID
  // ---------------------------

  /**
   * Finds content by ID inside a transactional context.
   *
   * - Finds content
   * - Adds activity log
   * - Assigns user
   *
   * @param id - Content ID
   * @returns Content Response
   */
  async findOneContentbyId(id: string) {
    this.logger.log('findOneContentbyId --->');
    const content = await this.findContentById(id);
    await this.contentRepository.increment({ id }, 'view_count', 1);

    const transformed = await this.transformContent(content);

    return new ApiResponseBuilder().success(
      transformed,
      CONTENT_MESSAGES.CONTENT_FETCHED,
      HttpStatus.OK,
    );
  }

  // ---------------------------
  // UPDATE CONTENT
  // ---------------------------

  /**
   * Updates content inside a transactional context.
   *
   * - Validates user permission
   * - Fetches existing content
   * - Validates immutable fields (type)
   * - Applies allowed updates conditionally
   * - Commits changes in a transaction
   * - Triggers publish notification (if applicable)
   *
   * @param id - Content ID
   * @param updateContentDto - Update content payload
   * @param userRole - User role
   * @returns Updated Content Response
   */
  async updateContent(
    id: string,
    updateContentDto: UpdateContentDto,
    userRole?: string,
  ): Promise<ApiResponse<Content>> {
    this.logger.log('updateContent --->');
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      this.assertCanUpdate(userRole);

      const content = await this.findContentById(id);
      this.assertContentExists(content);
      this.assertTypeNotChanged(updateContentDto, content);

      const updatePayload: Partial<Content> = {};

      this.applyTitle(updateContentDto, updatePayload);
      this.applyDescription(updateContentDto, updatePayload);
      this.applyContent(updateContentDto, updatePayload);
      this.applyThumbnail(updateContentDto, updatePayload);
      this.applyContentUrl(updateContentDto, content, updatePayload);
      this.applyImgCount(updateContentDto, updatePayload);
      this.applyStatus(updateContentDto, updatePayload);
      this.applyAuthor(updateContentDto, updatePayload);
      this.applyProcedure(updateContentDto, content, updatePayload);
      this.applyBlogHeader(updateContentDto, updatePayload);
      this.applyELearnings(updateContentDto, updatePayload);

      await queryRunner.manager.update(Content, id, updatePayload);
      await queryRunner.commitTransaction();

      const updatedContent = await this.findContentById(id);

      await this.sendContentPublishedNotification(
        updatedContent,
        updateContentDto.status || content.status,
      );

      return new ApiResponseBuilder().success(
        updatedContent,
        CONTENT_MESSAGES.CONTENT_UPDATED,
        HttpStatus.OK,
      );
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      this.logger.error('updateContent error', error);

      if (
        error instanceof ForbiddenException ||
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(error.message);
    } finally {
      await queryRunner.release();
    }
  }
  /**
   * Validates whether the current user role is allowed to update content.
   *
   * - Blocks content updates from PATIENT users
   *
   * @param userRole - Role of the current user
   * @throws ForbiddenException if user is a patient
   */
  private assertCanUpdate(userRole?: string) {
    this.logger.debug('assertCanUpdate --->');
    if (userRole === 'PATIENT') {
      throw new ForbiddenException(
        'Patients are not allowed to update content',
      );
    }
  }

  /**
   * Ensures the content entity exists before performing updates.
   *
   * @param content - Content entity fetched from DB
   * @throws NotFoundException if content does not exist
   */
  private assertContentExists(content: Content | null) {
    this.logger.debug('assertContentExists --->');
    if (!content) {
      throw new NotFoundException('Content not found');
    }
  }

  /**
   * Prevents changing content type after creation.
   *
   * @param dto - Update payload
   * @param content - Existing content entity
   * @throws BadRequestException if type change is attempted
   */
  private assertTypeNotChanged(dto: UpdateContentDto, content: Content) {
    this.logger.debug('assertTypeNotChanged --->');
    if (dto.type && dto.type !== content.type) {
      throw new BadRequestException(
        'Content type cannot be changed after creation',
      );
    }
  }

  /**
   * Validates and applies title update.
   *
   * - Ensures title is not empty
   *
   * @param dto - Update content payload
   * @param payload - Accumulated update payload
   */
  private applyTitle(dto: UpdateContentDto, payload: Partial<Content>) {
    this.logger.debug('applyTitle --->');
    if (dto.title !== undefined) {
      if (!dto.title || dto.title.trim() === '') {
        throw new BadRequestException('Title cannot be empty');
      }
      payload.title = dto.title;
    }
  }

  /**
   * Applies description update if provided.
   *
   * @param dto - Update content payload
   * @param payload - Accumulated update payload
   */
  private applyDescription(dto: UpdateContentDto, payload: Partial<Content>) {
    this.logger.debug('applyDescription --->');
    if (dto.description !== undefined) {
      payload.description = dto.description;
    }
  }

  /**
   * Applies content body update if provided.
   *
   * @param dto - Update content payload
   * @param payload - Accumulated update payload
   */
  private applyContent(dto: UpdateContentDto, payload: Partial<Content>) {
    this.logger.debug('applyContent --->');
    if (dto.content !== undefined) {
      payload.content = dto.content;
    }
  }

  /**
   * Validates and applies thumbnail URL update.
   *
   * - Allows external URLs
   * - Validates image extensions for internal URLs
   *
   * @param dto - Update content payload
   * @param payload - Accumulated update payload
   */
  private applyThumbnail(dto: UpdateContentDto, payload: Partial<Content>) {
    this.logger.debug('applyThumbnail --->');
    if (dto.thumbnailUrl !== undefined) {
      if (
        dto.thumbnailUrl &&
        dto.thumbnailUrl.trim() !== '' &&
        !this.isExternalUrl(dto.thumbnailUrl)
      ) {
        const validExts = ['.jpg', '.jpeg', '.png', '.webp'];
        const clean = dto.thumbnailUrl.split('?')[0].toLowerCase();
        if (!validExts.some((ext) => clean.endsWith(ext))) {
          throw new BadRequestException('Invalid thumbnail URL extension');
        }
      }
      payload.thumbnail_url = dto.thumbnailUrl;
    }
  }

  /**
   * Validates and applies content URLs based on content type.
   *
   * - Prevents empty URLs for image/video types
   * - Validates file extensions for allowed content types
   *
   * @param dto - Update content payload
   * @param content - Existing content entity
   * @param payload - Accumulated update payload
   */
  private applyContentUrl(
    dto: UpdateContentDto,
    content: Content,
    payload: Partial<Content>,
  ) {
    this.logger.debug('applyContentUrl --->');
    if (dto.contentUrl !== undefined) {
      if (!dto.contentUrl || dto.contentUrl.length === 0) {
        if (
          content.type === ContentType.IMAGE ||
          content.type === ContentType.VIDEO
        ) {
          throw new BadRequestException(
            'Content URL cannot be empty for Image/Video content',
          );
        }
        payload.content_url = [];
      } else {
        this.validateExtensions(dto.contentUrl, content.type);
        payload.content_url = dto.contentUrl;
      }
    }
  }

  /**
   * Applies image count update.
   *
   * @param dto - Update content payload
   * @param payload - Accumulated update payload
   */
  private applyImgCount(dto: UpdateContentDto, payload: Partial<Content>) {
    this.logger.debug('applyImgCount --->');
    if (dto.imgCount !== undefined) {
      payload.img_count = dto.imgCount;
    }
  }

  /**
   * Applies status update.
   *
   * - Sets published timestamp when status is PUBLISHED
   *
   * @param dto - Update content payload
   * @param payload - Accumulated update payload
   */
  private applyStatus(dto: UpdateContentDto, payload: Partial<Content>) {
    this.logger.debug('applyStatus --->');
    if (dto.status !== undefined) {
      payload.status = dto.status;
      if (dto.status === ContentStatus.PUBLISHED) {
        payload.published_at = new Date();
      }
    }
  }

  /**
   * Applies author metadata updates.
   *
   * @param dto - Update content payload
   * @param payload - Accumulated update payload
   */
  private applyAuthor(dto: UpdateContentDto, payload: Partial<Content>) {
    this.logger.debug('applyAuthor --->');
    if (dto.authorId !== undefined) {
      payload.author_id = dto.authorId;
    }
    if (dto.authorName !== undefined) {
      payload.author_name = dto.authorName;
    }
  }

  /**
   * Validates and applies procedure ID.
   *
   * - Procedure ID is mandatory for BLOG and IMAGE content types
   *
   * @param dto - Update content payload
   * @param content - Existing content entity
   * @param payload - Accumulated update payload
   */
  private applyProcedure(
    dto: UpdateContentDto,
    content: Content,
    payload: Partial<Content>,
  ) {
    this.logger.debug('applyProcedure --->');
    if (dto.procedureId !== undefined) {
      if (
        !dto.procedureId &&
        (content.type === ContentType.BLOG ||
          content.type === ContentType.IMAGE)
      ) {
        throw new BadRequestException('Procedure ID is required');
      }
      payload.procedure_id = dto.procedureId;
    }
  }

  /**
   * Applies blog header update.
   *
   * @param dto - Update content payload
   * @param payload - Accumulated update payload
   */
  private applyBlogHeader(dto: UpdateContentDto, payload: Partial<Content>) {
    this.logger.debug('applyBlogHeader --->');
    if (dto.blogHeader !== undefined) {
      payload.blog_header = dto.blogHeader;
    }
  }

  /**
   * Applies eLearning metadata update.
   *
   * @param dto - Update content payload
   * @param payload - Accumulated update payload
   */
  private applyELearnings(dto: UpdateContentDto, payload: Partial<Content>) {
    this.logger.debug('applyELearnings --->');
    if (dto.eLearnings !== undefined) {
      payload.eLearnings = dto.eLearnings;
    }
  }

  // ---------------------------
  // REMOVE CONTENT
  // ---------------------------

  /**
   * Removes content inside a transactional context.
   *
   * - Removes content
   * - Adds activity log
   * - Assigns user
   *
   * @param id - Content ID
   * @returns Removed Content Response
   */
  async removeContent(
    id: string,
    userId: string,
  ): Promise<ApiResponse<Content>> {
    this.logger.log('removeContent --->');
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const content = await this.findContentById(id);
      content.status = ContentStatus.ARCHIVED;
      await queryRunner.manager.save(content);
      await queryRunner.manager.softDelete(Content, id);

      await queryRunner.commitTransaction();
      return new ApiResponseBuilder().success(
        content,
        CONTENT_MESSAGES.CONTENT_DELETED,
        HttpStatus.OK,
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('removeContent error', error);
      return new ApiResponseBuilder().error(error);
    } finally {
      await queryRunner.release();
    }
  }

  // ---------------------------
  // INCREMENT LIKE CONTENT
  // ---------------------------

  /**
   * Increments like count for a content inside a transactional context.
   *
   * - Increments like count
   * - Adds activity log
   * - Assigns user
   *
   * @param id - Content ID
   * @param userId - User ID
   * @returns Content Response
   */
  async incrementLikeContent(
    id: string,
    userId: string,
  ): Promise<ApiResponse<Content>> {
    this.logger.log('incrementLikeContent --->');
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const content = await queryRunner.manager.findOne(Content, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!content) {
        throw new NotFoundException(`Content with ID ${id} not found`);
      }
      const likedUsers = content.liked_users ?? [];
      if (likedUsers.includes(userId)) {
        throw new ConflictException('User already liked this content');
      }
      await queryRunner.manager.update(
        Content,
        { id },
        {
          like_count: () => '"like_count" + 1',
          liked_users: [...likedUsers, userId],
        },
      );

      await queryRunner.commitTransaction();

      const updatedContent = await this.findContentById(id);

      return new ApiResponseBuilder().success(
        updatedContent,
        CONTENT_MESSAGES.CONTENT_UPDATED,
        HttpStatus.OK,
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('incrementLikeContent error', error);
      return new ApiResponseBuilder().error(error);
    } finally {
      await queryRunner.release();
    }
  }

  // ---------------------------
  // SEND CONTENT PUBLISHED NOTIFICATION
  // ---------------------------

  /**
   * Sends content published notification.
   *
   * @param content - Content
   * @param status - Content status
   */
  private async sendContentPublishedNotification(
    content: Content,
    status: ContentStatus,
  ): Promise<void> {
    this.logger.log('sendContentPublishedNotification --->');
    if (status === ContentStatus.PUBLISHED && content) {
      await this.notificationHelper.sendNotificationSafely(
        {
          userId: content.author_id,
          eventType: NOTIFICATION_EVENT_TYPE.CONTENT_PUBLISHED,
          title: NOTIFICATION_EVENT_LABELS.CONTENT_PUBLISHED,
          message: `Content "${content.title}" ${CONTENT_MESSAGES.CONTENT_PUBLISHED_NOTIFICATION}`,
          priority: 'normal',
          relatedEntityId: content.id,
          metadata: {
            contentId: content.id,
            contentType: content.type,
            procedureId: content.procedure_id,
          },
        },
        this.logger,
      );
    }
  }

  // ---------------------------
  // TRANSFORM CONTENT
  // ---------------------------

  /**
   * Transforms content.
   *
   * @param content - Content
   * @returns Transformed content
   */
  private async transformContent(content: Content) {
    this.logger.debug('transformContent --->');
    const baseContent = {
      id: content.id,
      title: content.title,
      description: content.description,
      type: content.type,
      content: content.content,
      status: content.status,
      imgCount: content.img_count,
      thumbnailUrl: content.thumbnail_url,
      contentUrl: content.content_url,
      eLearnings: content.eLearnings,
      blogHeader: content.blog_header,
      authorId: content.author_id,
      authorName: content.author_name,
      viewCount: content.view_count,
      likeCount: content.like_count,
      likedUsers: content.liked_users,
      publishedAt: content.published_at,
      createdAt: content.created_at,
      updatedAt: content.updated_at,
      procedureId: content.procedure_id,
      procedure: content.procedure,
    };

    if (
      content.type === ContentType.IMAGE &&
      Array.isArray(content.content_url)
    ) {
      const imgCountType =
        content.img_count === ImageCountId.SINGLE
          ? ImageCount.SINGLE
          : ImageCount.MULTIPLE;

      return {
        ...baseContent,
        img_urls: await this.parseImageUrls(
          content.content_url,
          content.img_count,
        ),
        imageCountType: imgCountType,
        thumbnail:
          content.thumbnail_url && !this.isExternalUrl(content.thumbnail_url)
            ? await helpers.getFileUrlFromAzure(content.thumbnail_url)
            : content.thumbnail_url,
      };
    }

    if (content.type === ContentType.VIDEO) {
      return {
        ...baseContent,
        thumbnail:
          content.thumbnail_url && !this.isExternalUrl(content.thumbnail_url)
            ? await helpers.getFileUrlFromAzure(content.thumbnail_url)
            : content.thumbnail_url,
        video_url:
          content.content_url?.[0] &&
          !this.isExternalUrl(content.content_url[0])
            ? await helpers.getFileUrlFromAzure(content.content_url[0])
            : content.content_url?.[0] || null,
      };
    }

    if (content.type === ContentType.BLOG) {
      return {
        ...baseContent,
        thumbnail:
          content.thumbnail_url && !this.isExternalUrl(content.thumbnail_url)
            ? await helpers.getFileUrlFromAzure(content.thumbnail_url)
            : content.thumbnail_url,
      };
    }

    if (content.type === ContentType.ELEARNING) {
      const thumbnail =
        content.thumbnail_url && !this.isExternalUrl(content.thumbnail_url)
          ? await helpers.getFileUrlFromAzure(content.thumbnail_url)
          : content.thumbnail_url;
      const orderedLessons = await Promise.all(
        Object.entries(content.eLearnings)
          .sort(([keyA], [keyB]) => {
            const a = Number(keyA.replace('lesson', ''));
            const b = Number(keyB.replace('lesson', ''));
            return a - b;
          })
          .map(async ([lessonKey, lessonValue]: [string, any], index) => {
            const thumbnailUrl =
              lessonValue.thumbnail_url &&
              !this.isExternalUrl(lessonValue.thumbnail_url)
                ? await helpers.getFileUrlFromAzure(lessonValue.thumbnail_url)
                : lessonValue.thumbnail_url;

            const contentUrl =
              lessonValue.content_Url &&
              !this.isExternalUrl(lessonValue.content_Url)
                ? await helpers.getFileUrlFromAzure(lessonValue.content_Url)
                : lessonValue.content_Url;

            return {
              lessonIndex: index + 1,
              lessonKey,
              ...lessonValue,
              thumbnailUrl,
              contentUrl,
            };
          }),
      );

      return {
        ...baseContent,
        thumbnail,
        eLearnings: orderedLessons,
      };
    }

    return baseContent;
  }

  // ---------------------------
  // PARSE IMAGE URLS
  // ---------------------------

  /**
   * Parses image URLs.
   *
   * @param urls - Image URLs
   * @param img_count - Image count
   * @returns Parsed image URLs
   */
  private async parseImageUrls(urls: string[] = [], img_count: number) {
    this.logger.debug('parseImageUrls --->');
    const emptyResult = {
      url_single: null,
      url_before: null,
      url_after: null,
    };

    if (!Array.isArray(urls) || urls.length === 0) {
      return emptyResult;
    }

    if (img_count === ImageCountId.SINGLE) {
      return {
        ...emptyResult,
        url_single: this.isExternalUrl(urls[0])
          ? urls[0]
          : await helpers.getFileUrlFromAzure(urls[0]),
      };
    }

    await Promise.all(
      urls.map(async (rawUrl) => {
        if (rawUrl.startsWith('before:')) {
          const path = rawUrl.replace('before:', '');
          emptyResult.url_before = this.isExternalUrl(path)
            ? path
            : await helpers.getFileUrlFromAzure(path);
        } else if (rawUrl.startsWith('after:')) {
          const path = rawUrl.replace('after:', '');
          emptyResult.url_after = this.isExternalUrl(path)
            ? path
            : await helpers.getFileUrlFromAzure(path);
        }
      }),
    );

    return emptyResult;
  }

  // ---------------------------
  // VALIDATE THUMBNAIL URL
  // ---------------------------

  /**
   * Validates thumbnail URL.
   *
   * @param thumbnailUrl - Thumbnail URL
   */
  private validateThumbnailUrl(thumbnailUrl?: string) {
    this.logger.debug('validateThumbnailUrl --->');
    if (!thumbnailUrl) return;

    // Skip checking extension for external URLs
    if (this.isExternalUrl(thumbnailUrl)) return;

    const allowedExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const clean = thumbnailUrl.split('?')[0].toLowerCase();

    if (!allowedExts.some((ext) => clean.endsWith(ext))) {
      throw new BadRequestException('thumbnailUrl must be a valid image URL');
    }
  }

  // ---------------------------
  // VALIDATE E-LEARNING LESSONS
  // ---------------------------

  /**
   * Validates eLearning lessons.
   *
   * @param eLearnings - E-learning lessons
   */
  private validateELearningLessons(eLearnings: any) {
    this.logger.debug('validateELearningLessons --->');
    if (!eLearnings) {
      throw new BadRequestException(
        'eLearning lessons are required for eLearning content',
      );
    }

    const lessons = Array.isArray(eLearnings)
      ? eLearnings
      : Object.values(eLearnings);

    if (lessons.length === 0) {
      throw new BadRequestException(
        'At least one lesson is required for eLearning content',
      );
    }

    lessons.forEach((lesson, index) => {
      if (!lesson || typeof lesson !== 'object') {
        throw new BadRequestException(
          `Invalid lesson format at index ${index}`,
        );
      }

      if (!lesson.title || lesson.title.trim() === '') {
        throw new BadRequestException(
          `Lesson title is required at index ${index}`,
        );
      }

      if (!lesson.content_Url || lesson.content_Url.trim() === '') {
        throw new BadRequestException(
          `Lesson content_Url is required at index ${index}`,
        );
      }

      // Check URL validity only if it is an external URL
      if (this.isExternalUrl(lesson.content_Url)) {
        try {
          new URL(lesson.content_Url);
        } catch {
          throw new BadRequestException(
            `Invalid lesson content_Url at index ${index}`,
          );
        }
      }
    });
  }
} 