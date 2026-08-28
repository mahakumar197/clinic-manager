import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Procedures } from './entities/procedures.entity';
import {
  ProcedureStatus,
  ContentStatus,
  CONTENT_MESSAGES,
} from '@pallmall/common-utils';
import { CreateProcedureDto, listProcedureDto } from './dto/procedure.dto';
import {
  ApiResponse,
  ApiResponseBuilder,
  HttpStatus,
  PaginatedApiResponse,
} from '@pallmall/shared-types';
import { helpers } from '@pallmall/common-utils';
import { logger } from '@pallmall/logger';

@Injectable()
export class ProceduresService {
  constructor(
    @InjectRepository(Procedures)
    private proceduresRepository: Repository<Procedures>,
    private dataSource: DataSource,
  ) {}

  // ---------------------------
  // CREATE PROCEDURE
  // ---------------------------

  /**
   * Creates a procedure.
   *
   * @param createProcedureDto - Create procedure DTO
   * @returns Created procedure
   */

  async createProcedures(
    createProcedureDto: CreateProcedureDto,
  ): Promise<ApiResponse<Procedures>> {
    logger.info('createProcedures --->');
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const procedures = this.proceduresRepository.create(createProcedureDto);

      const savedProcedure = await queryRunner.manager.save(procedures);

      await queryRunner.commitTransaction();

      return new ApiResponseBuilder().success(
        savedProcedure,
        CONTENT_MESSAGES.PROCEDURE_CREATED,
        HttpStatus.CREATED,
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      logger.error('Error creating procedure:', error);
      throw new InternalServerErrorException(error.message);
    } finally {
      await queryRunner.release();
    }
  }

  // ---------------------------
  // FIND ALL PROCEDURES
  // ---------------------------

  /**
   * Finds all procedures.
   *
   * - Applies search, type, and status filters
   * - Loads content count per procedure
   * - Paginates results
   * - Computes aggregate content counts by status
   * - Enriches thumbnail URLs
   *
   * @param query - Query parameters
   * @returns All procedures (paginated)
   */
  async findAllProcedures(
    query: listProcedureDto,
  ): Promise<
    PaginatedApiResponse<Omit<Procedures, 'content'> & { contentCount: number }>
  > {
    logger.info('findAllProcedures --->');
    try {
      const { page = 1, limit = 10, search, type, status } = query;
      const skip = (page - 1) * limit;

      const queryBuilder = this.buildProceduresQueryBuilder(
        search,
        type,
        status,
      );

      const total = await queryBuilder.getCount();

      const procedures = await this.fetchPaginatedProcedures(
        queryBuilder,
        skip,
        limit,
      );

      const data = await this.mapProceduresResponse(procedures);

      const aggregateCounts = await this.getAggregateContentCounts();

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
        CONTENT_MESSAGES.PROCEDURE_FETCHED,
      ) as PaginatedApiResponse<
        Omit<Procedures, 'content'> & { contentCount: number }
      >;

      response.meta.count = aggregateCounts;

      return response;
    } catch (error) {
      logger.error('Error fetching procedures:', error);
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Builds the base query builder for fetching procedures.
   *
   * - Loads content count excluding deleted content
   * - Applies search, type and status filters
   *
   * @param search - Search string
   * @param type - Procedure type
   * @param status - Procedure status
   * @returns Configured QueryBuilder
   */
  private buildProceduresQueryBuilder(
    search?: string,
    type?: string,
    status?: ProcedureStatus,
  ) {
    logger.debug('buildProceduresQueryBuilder --->');
    const queryBuilder = this.proceduresRepository
      .createQueryBuilder('procedures')
      .loadRelationCountAndMap(
        'procedures.contentCount',
        'procedures.content',
        'content',
        (qb) => qb.where('content.deleted_at IS NULL'),
      );

    if (search) {
      queryBuilder.andWhere(
        '(procedures.title ILIKE :search OR procedures.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (type) {
      queryBuilder.andWhere('procedures.type = :type', { type });
    }

    if (status) {
      queryBuilder.andWhere('procedures.status = :status', { status });
    } else {
      queryBuilder.andWhere('procedures.status = :status', {
        status: ProcedureStatus.ACTIVE,
      });
    }

    return queryBuilder;
  }

  /**
   * Fetches paginated procedures.
   *
   * @param queryBuilder - Base query builder
   * @param skip - Records to skip
   * @param limit - Records to fetch
   * @returns List of procedures
   */
  private async fetchPaginatedProcedures(
    queryBuilder,
    skip: number,
    limit: number,
  ) {
    logger.debug('fetchPaginatedProcedures --->');
    return queryBuilder
      .orderBy('procedures.created_at', 'DESC')
      .skip(skip)
      .take(limit)
      .getMany();
  }

  /**
   * Maps procedures to API response format.
   *
   * - Removes content relation
   * - Resolves thumbnail URLs from Azure
   * - Attaches content count
   *
   * @param procedures - Raw procedure entities
   * @returns Transformed procedure list
   */
  private async mapProceduresResponse(procedures: Procedures[]) {
    logger.debug('mapProceduresResponse --->');
    return Promise.all(
      procedures.map(async (procedure) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { content, ...procedureData } = procedure;

        return {
          ...procedureData,
          thumbnail: procedureData.thumbnail_url
            ?  await helpers.getFileUrlFromAzure(procedureData.thumbnail_url)
            : null,
          contentCount: procedure['contentCount'] || 0,
        };
      }),
    );
  }

  /**
   * Computes aggregate content counts by status across all procedures.
   *
   * - Groups content by status
   * - Computes total active procedures count
   *
   * @returns Aggregate content counts object
   */
  private async getAggregateContentCounts() {
    logger.debug('getAggregateContentCounts --->');
    const countsQuery = this.proceduresRepository
      .createQueryBuilder('procedures')
      .leftJoin('procedures.content', 'content', 'content.deleted_at IS NULL')
      .select('content.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('content.status');

    const counts = await countsQuery.getRawMany();

    const totalProcedureCount = await this.proceduresRepository.count({
      where: { status: ProcedureStatus.ACTIVE },
    });

    type ContentStatusCounts = Record<ContentStatus, number> & {
      total: number;
    };

    const aggregateCounts = Object.values(ContentStatus).reduce(
      (acc, status) => {
        acc[status] = Number(
          counts.find((item) => item.status === status)?.count ?? 0,
        );
        return acc;
      },
      {} as ContentStatusCounts,
    );

    aggregateCounts.total = totalProcedureCount;

    return aggregateCounts;
  }
}