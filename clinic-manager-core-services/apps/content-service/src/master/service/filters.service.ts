import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateFilterDto } from '../dto/master.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Filter } from '../entities/filter.entity';
import { FILTER_MESSAGES } from '@pallmall/common-utils';
import { Repository, DataSource } from 'typeorm';
import { ApiResponseBuilder, HttpStatus } from '@pallmall/shared-types';
import { logger } from '@pallmall/logger';

@Injectable()
export class FiltersService {
  constructor(
    @InjectRepository(Filter)
    private filterRepository: Repository<Filter>,
    private dataSource: DataSource,
  ) {}

  // ---------------------------
  // CREATE TASK FILTER
  // ---------------------------

  /**
   * Creates a new task filter and stores it inside a DB transaction.
   *
   * - Maps DTO to entity
   * - Saves record atomically
   *
   * @param addTaskFilterDto - Task filter creation payload
   * @returns ApiResponse with saved filter
   */
  async createFilter(addFilterDto: CreateFilterDto, userId: string) {
    logger.info('Create filter...');

    return this.dataSource.transaction(async (manager) => {
      try {
        const filter = manager.create(Filter, {
          type: addFilterDto.type,
          filter_name: addFilterDto.filterName,
          filter_data: addFilterDto.filterData,
          user_id: userId,
          is_active: true,
        });
        const savedFilter = await manager.save(Filter, filter);
        logger.info(`Create filter -> ${HttpStatus.CREATED}`);

        return new ApiResponseBuilder().success(
          savedFilter,
          FILTER_MESSAGES.FILTER_ADDED,
          HttpStatus.CREATED,
        );
      } catch (error) {
        logger.error(`Create filter -> ${error}`);
        throw new InternalServerErrorException(error.message);
      }
    });
  }

  // ---------------------------
  // GET USER FILTERS
  // ---------------------------

  /**
   * Retrieves all active task filters associated with a user.
   *
   * - Filters by user ID and active status
   *
   * @param userId - User identifier
   * @returns ApiResponse containing list of filters
   */
  async getFilter(type: string, userId: string) {
    logger.info('Fetch filter...');

    try {
      const filters = await this.filterRepository.find({
        where: { user_id: userId, type, is_active: true },
      });

      if (filters.length === 0) {
        throw new NotFoundException(FILTER_MESSAGES.FILTER_NOT_FOUND);
      }

      logger.info(`Fetch filter -> ${HttpStatus.OK}`);

      const response = filters.map((filter) => ({
        id: filter.id,
        userId: filter.user_id,
        type: filter.type,
        filterName: filter.filter_name,
        filterData: filter.filter_data,
        isActive: filter.is_active,
        createdAt: filter.created_at,
        updatedAt: filter.updated_at,
      }));

      return new ApiResponseBuilder().success(
        response,
        FILTER_MESSAGES.FILTER_FETCHED,
        HttpStatus.OK,
      );
    } catch (error) {
      logger.error(`Fetch filter -> ${error}`);
      return new ApiResponseBuilder().error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ---------------------------
  // REMOVE TASK FILTER
  // ---------------------------

  /**
   * Soft deletes a task filter by marking it inactive.
   *
   * - Validates ID and filter status
   * - Runs inside a DB transaction
   *
   * @param id - Filter ID
   * @returns ApiResponse confirming deletion
   */
  async removeFilter(id: string) {
    logger.info('Remove filter...');

    return this.dataSource.transaction(async (manager) => {
      try {
        const filter = await manager.findOne(Filter, { where: { id } });

        if (!filter) {
          throw new NotFoundException(`Filter with ID ${id} not found`);
        }

        if (!filter.is_active) {
          throw new BadRequestException(
            `Filter with ID ${id} is already deleted`,
          );
        }

        filter.is_active = false;
        await manager.save(Filter, filter);

        logger.info(`Remove filter -> ${HttpStatus.OK}`);

        return new ApiResponseBuilder().success(
          filter,
          FILTER_MESSAGES.FILTER_DELETED,
          HttpStatus.OK,
        );
      } catch (error) {
        logger.error(`Remove filter -> ${error}`);
        throw new InternalServerErrorException(error.message);
      }
    });
  }
}