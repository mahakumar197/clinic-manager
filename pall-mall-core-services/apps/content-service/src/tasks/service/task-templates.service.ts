import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { TaskTemplate } from '../entities/task-templates.entity';
import { ApiResponseBuilder, HttpStatus } from '@pallmall/shared-types';
import { logger } from '@pallmall/logger';
import { CreateTaskTemplateDto, UpdateTaskTemplateDto } from '../dto/task.dto';
import { TASK_MESSAGES } from '@pallmall/common-utils';

@Injectable()
export class TaskTemplatesService {
  constructor(
    @InjectRepository(TaskTemplate)
    private readonly templatesRepo: Repository<TaskTemplate>,
    private readonly dataSource: DataSource,
  ) {}

  // ---------------------------
  // CREATE TASK TEMPLATE
  // ---------------------------

  /**
   * Creates a new task template inside a database transaction.
   *
   * - Maps DTO to TaskTemplate entity
   * - Saves record atomically
   *
   * @param dto - Template creation payload
   * @returns ApiResponse with created template
   */
  async createTaskTemplate(dto: CreateTaskTemplateDto, userId: string) {
    logger.info('Create task template...');

    return this.dataSource.transaction(async (manager) => {
      try {
        const template = manager.create(TaskTemplate, {
          template: dto.templateData,
          created_by: userId,
          is_active: true,
        });
        const savedTemplate = await manager.save(TaskTemplate, template);

        logger.info(`Create task template -> ${HttpStatus.CREATED}`);

        return new ApiResponseBuilder().success(
          savedTemplate,
          TASK_MESSAGES.TASK_TEMPLATE_CREATED,
          HttpStatus.CREATED,
        );
      } catch (error) {
        logger.error(`Create task template -> ${error}`);
        return new ApiResponseBuilder().error(
          error,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    });
  }

  // ---------------------------
  // UPDATE TASK TEMPLATE
  // ---------------------------

  /**
   * Updates a task template if it exists.
   *
   * - Validates ID
   * - Persists updated fields
   *
   * @param id - Template ID
   * @param dto - Template update payload
   * @returns ApiResponse with updated entity
   */
  async updateTaskTemplate(id: string, dto: UpdateTaskTemplateDto) {
    logger.info('Update task template...');
    return this.dataSource.transaction(async (manager) => {
      try {
        const template = await manager.findOne(TaskTemplate, { where: { id } });
        if (!template) {
          throw new NotFoundException(`Template with ID ${id} not found`);
        }
        await manager.update(TaskTemplate, id, {
          template: dto.templateData,
        });
        const updatedTemplate = await manager.findOne(TaskTemplate, {
          where: { id },
        });

        logger.info(`Update task template -> ${HttpStatus.OK}`);

        return new ApiResponseBuilder().success(
          updatedTemplate,
          TASK_MESSAGES.TASK_TEMPLATE_UPDATED,
          HttpStatus.OK,
        );
      } catch (error) {
        logger.error(`Update task template -> ${error}`);
        return new ApiResponseBuilder().error(
          error,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    });
  }

  // ---------------------------
  // DELETE TASK TEMPLATE
  // ---------------------------

  /**
   * Deletes a task template by ID.
   *
   * - Ensures the template exists before deletion
   *
   * @param id - Template ID
   * @returns ApiResponse confirming removal
   */
  async deleteTaskTemplate(id: string) {
    logger.info('Delete task template...');
    return this.dataSource.transaction(async (manager) => {
      try {
        const template = await manager.findOne(TaskTemplate, { where: { id } });

        if (!template) {
          throw new NotFoundException(`Template with ID ${id} not found`);
        }

        await manager.update(TaskTemplate, id, { is_active: false });

        logger.info(`Delete task template -> ${HttpStatus.OK}`);

        return new ApiResponseBuilder().success(
          {},
          TASK_MESSAGES.TASK_TEMPLATE_DELETED,
          HttpStatus.OK,
        );
      } catch (error) {
        logger.error(`Delete task template -> ${error}`);
        return new ApiResponseBuilder().error(
          error,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    });
  }

  // ---------------------------
  // GET TASK TEMPLATE
  // ---------------------------

  /**
   * Retrieves task templates.
   *
   * @returns ApiResponse with template data
   */
  async getTaskTemplate() {
    logger.info('Get task templates...');

    try {
      const template = await this.templatesRepo.find();

      if (!template) {
        throw new NotFoundException(`No templates found`);
      }

      logger.info(`Get task templates -> ${HttpStatus.OK}`);

      return new ApiResponseBuilder().success(
        template,
        TASK_MESSAGES.TASK_TEMPLATE_FETCHED,
        HttpStatus.OK,
      );
    } catch (error) {
      logger.error(`Get task templates -> ${error}`);
      return new ApiResponseBuilder().error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
