import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { TaskComment } from '../entities/task-comments.entity';
import { CreateTaskCommentDto, UpdateTaskCommentDto } from '../dto/task.dto';
import { ApiResponseBuilder, HttpStatus } from '@pallmall/shared-types';
import { TASK_MESSAGES } from '@pallmall/common-utils';
import { logger } from '@pallmall/logger';

@Injectable()
export class TaskCommentsService {
  constructor(
    @InjectRepository(TaskComment)
    private readonly commentsRepo: Repository<TaskComment>,
    private readonly dataSource: DataSource,
  ) {}

  // ---------------------------
  // CREATE COMMENT
  // ---------------------------

  /**
   * Creates a new task comment within a database transaction.
   *
   * - Maps DTO to TaskComment entity
   * - Persists record atomically
   *
   * @param dto - Comment creation payload
   * @returns ApiResponse containing saved comment
   */
  async createComment(dto: CreateTaskCommentDto, commentedBy: string) {
    logger.info('Create task comment...');

    return this.dataSource.transaction(async (manager) => {
      try {
        const comment = manager.create(TaskComment, {
          task_id: dto.taskId,
          comment: dto.comment,
          commented_by: commentedBy,
          attachment_id: dto.attachmentId,
          is_active: true,
        });

        const saved = await manager.save(TaskComment, comment);

        logger.info(`Create task comment -> ${HttpStatus.CREATED}`);

        return new ApiResponseBuilder().success(
          saved,
          TASK_MESSAGES.TASK_COMMENT_ADDED,
          HttpStatus.CREATED,
        );
      } catch (error) {
        logger.error(`Create task comment -> ${error}`);
        return new ApiResponseBuilder().error(
          error,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    });
  }

  // ---------------------------
  // UPDATE COMMENT
  // ---------------------------

  /**
   * Updates comment text if the record exists.
   *
   * - Validates record state
   * - Saves updated values
   *
   * @param commentId - ID of the comment
   * @param dto - Updated payload
   * @returns ApiResponse with updated comment
   */
  async updateComment(commentId: string, dto: UpdateTaskCommentDto) {
    logger.info('Update task comment...');

    try {
      const existing = await this.commentsRepo.findOne({
        where: { id: commentId, is_active: true },
      });

      if (!existing) {
        throw new NotFoundException(`Comment with ID ${commentId} not found`);
      }

      existing.comment = dto.comment;
      existing.attachment_id = dto.attachmentId;
      existing.updated_at = new Date();

      const updated = await this.commentsRepo.save(existing);

      logger.info(`Update task comment -> ${HttpStatus.OK}`);

      return new ApiResponseBuilder().success(
        updated,
        TASK_MESSAGES.TASK_COMMENT_UPDATED,
        HttpStatus.OK,
      );
    } catch (error) {
      logger.error(`Update task comment -> ${error}`);
      return new ApiResponseBuilder().error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ---------------------------
  // DELETE COMMENT
  // ---------------------------

  /**
   * Soft deletes a comment by marking it inactive.
   *
   * - Validates existence and active state
   *
   * @param commentId - ID of the comment
   * @returns ApiResponse confirming deletion
   */
  async deleteComment(commentId: string) {
    logger.info('Delete task comment...');

    try {
      const comment = await this.commentsRepo.findOne({
        where: { id: commentId, is_active: true },
      });

      if (!comment) {
        throw new NotFoundException(`Comment with ID ${commentId} not found`);
      }

      await this.commentsRepo.update(commentId, { is_active: false });

      logger.info(`Delete task comment -> ${HttpStatus.OK}`);

      return new ApiResponseBuilder().success(
        null,
        TASK_MESSAGES.TASK_COMMENT_DELETED,
        HttpStatus.OK,
      );
    } catch (error) {
      logger.error(`Delete task comment -> ${error}`);
      return new ApiResponseBuilder().error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
