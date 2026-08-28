import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { AddTaskAttachmentDto } from '../dto/AddTaskAttachmentDto';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from '../entities/task.entity';
import { TaskActivity } from '../entities/task-activity.entity';
import { TaskComment } from '../entities/task-comments.entity';
import { TaskAttachment } from '../entities/task-attachment.entity';
import { TaskTemplate } from '../entities/task-templates.entity';
import { TASK_MESSAGES } from '@pallmall/common-utils';
import { Repository, DataSource } from 'typeorm';
import { ApiResponseBuilder, HttpStatus } from '@pallmall/shared-types';
import { logger } from '@pallmall/logger';

@Injectable()
export class TasksAttachmentService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(TaskAttachment)
    private taskAttachmentRepository: Repository<TaskAttachment>,
    private dataSource: DataSource,
    @InjectRepository(TaskComment)
    private taskCommentRepository: Repository<TaskComment>,
  ) {}

  // ---------------------------
  // CREATE ATTACHMENT
  // ---------------------------

  /**
   * Creates a task attachment inside a database transaction.
   *
   * - Validates input DTO
   * - Creates and stores TaskAttachment entity
   *
   * @param addTaskAttachmentDto - Attachment payload
   * @returns ApiResponse containing created attachment
   */
  async createTaskAttachment(
    addTaskAttachmentDto: AddTaskAttachmentDto,
    userId: string,
  ) {
    logger.info('Create task attachment...');

    return this.dataSource.transaction(async (manager) => {
      try {
        const task = await this.taskRepository.findOne({
          where: { id: addTaskAttachmentDto.taskId, is_active: true },
        });
        if (!task) {
          throw new NotFoundException(
            `Task with ID ${addTaskAttachmentDto.taskId} not found`,
          );
        }
        const taskAttachment = manager.create(TaskAttachment, {
          task_id: addTaskAttachmentDto.taskId,
          filename: addTaskAttachmentDto.filename,
          s3_key: addTaskAttachmentDto.s3Key,
          mime_type: addTaskAttachmentDto.mimeType,
          in_comment: addTaskAttachmentDto.inComment,
          uploaded_by: userId,
          is_active: true,
        });
        const savedAttachment = await manager.save(
          TaskAttachment,
          taskAttachment,
        );
        logger.info(`Create task attachment -> ${HttpStatus.CREATED}`);
        return new ApiResponseBuilder().success(
          savedAttachment,
          TASK_MESSAGES.TASK_ATTACHMENT_ADDED,
          HttpStatus.CREATED,
        );
      } catch (error) {
        logger.error(`Create task attachment -> ${error}`);
        return new ApiResponseBuilder().error(
          error,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    });
  }

  // ---------------------------
  // REMOVE ATTACHMENT
  // ---------------------------

  /**
   * Soft deletes a task attachment by marking isActive=false.
   *
   * - Ensures attachment exists
   * - Prevents repeated deletion
   * - Runs inside a DB transaction
   *
   * @param id - ID of the attachment to delete
   * @returns ApiResponse with deleted record
   */
  async removeTaskAttachment(id: string) {
    logger.info('Remove task attachment...');

    return this.dataSource.transaction(async (manager) => {
      try {
        const taskAttachment = await manager.findOne(TaskAttachment, {
          where: { id },
        });

        if (!taskAttachment) {
          throw new NotFoundException(
            `Task attachment with ID ${id} not found`,
          );
        }

        if (!taskAttachment.is_active) {
          throw new BadRequestException(
            `Task attachment with ID ${id} is already deleted`,
          );
        }

        taskAttachment.is_active = false;
        await manager.save(TaskAttachment, taskAttachment);

        logger.info(`Remove task attachment -> ${HttpStatus.OK}`);

        return new ApiResponseBuilder().success(
          taskAttachment,
          TASK_MESSAGES.TASK_ATTACHMENT_DELETED,
          HttpStatus.OK,
        );
      } catch (error) {
        logger.error(`Remove task attachment -> ${error}`);
        return new ApiResponseBuilder().error(
          error,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    });
  }
}
