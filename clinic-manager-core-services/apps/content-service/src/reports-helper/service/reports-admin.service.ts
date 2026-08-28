import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, Repository } from 'typeorm';
import {
  API_ENDPOINTS,
  ContentStatus,
  ContentType,
  DateFilterType,
  FormStatus,
  helpers,
  RatingsQuestionIds,
  recoveryFormIds,
  TaskCategoryId,
} from '@pallmall/common-utils';
import {
  ApiResponseBuilder,
  HttpStatus,
  UserRole,
} from '@pallmall/shared-types';
import { logger } from '@pallmall/logger';
import { Task } from '../../tasks/entities/task.entity';
import { FormSubmission } from '../../forms/entities/form.submission.entity';
import { PerformanceQueryDto, ReportsQueryDto } from '../dto/reports.dto';
import { ConfigService } from '@nestjs/config';
import { Content } from 'src/content/entities/content.entity';
import { TaskSubmission } from 'src/tasks/entities/task-submissions.entity';
import { GuestUser } from 'src/home/entities/guest-user.entity';
import { FormAnswer } from 'src/forms/entities/form.answer.entity';
import { Dropdown } from 'src/master/entities/dropdown.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
    @InjectRepository(FormSubmission)
    private readonly formSubmissionRepo: Repository<FormSubmission>,
    @InjectRepository(TaskSubmission)
    private readonly taskSubmissionRepo: Repository<TaskSubmission>,
    @InjectRepository(Content)
    private readonly contentRepo: Repository<Content>,
    @InjectRepository(GuestUser)
    private readonly guestUserRepo: Repository<GuestUser>,
    @InjectRepository(FormAnswer)
    private readonly formAnswerRepo: Repository<FormAnswer>,
    @InjectRepository(Dropdown)
    private readonly dropdownRepo: Repository<Dropdown>,
    private configService: ConfigService,
  ) {}

  // ---------------------------
  // GET DASHBOARD CARDS
  // ---------------------------

  /**
   * Gets dashboard cards.
   *
   * @param query - Query parameters
   * @returns Dashboard cards
   */

  async getDashboardCards(query: ReportsQueryDto) {
    logger.info('getDashboardCards...');

    try {
      const filter = await this.resolveFilter(query);

      const { from, to } = await this.resolveDateRange(
        filter,
        query.startDate,
        query.endDate,
      );

      const { prevFrom, prevTo } = await this.getPreviousDateRange(
        filter,
        from,
        to,
      );

      const currentConversion = await this.getConversionRate(from, to);
      const previousConversion = await this.getConversionRate(prevFrom, prevTo);

      const currentAvgResponse = await this.getAverageResponseTime(from, to);
      const previousAvgResponse = await this.getAverageResponseTime(
        prevFrom,
        prevTo,
      );

      const conversionChange =
        previousConversion.percentage === 0
          ? 0
          : (
              ((currentConversion.percentage - previousConversion.percentage) /
                previousConversion.percentage) *
              100
            ).toFixed(1);

      const avgResponseChange =
        Math.round(
          (currentAvgResponse.avgHours - previousAvgResponse.avgHours) * 10,
        ) / 10;

      logger.info(`getDashboardCards ---> ${HttpStatus.OK}`);

      return new ApiResponseBuilder().success(
        {
          conversionRate: {
            ...currentConversion,
            change: Number(conversionChange),
          },

          averageResponse: {
            ...currentAvgResponse,
            change: Number(avgResponseChange),
          },
        },
        'Dashboard cards fetched successfully',
        HttpStatus.OK,
      );
    } catch (error) {
      logger.error('getDashboardCards --->', error);

      return new ApiResponseBuilder().error(
        error,
        error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ---------------------------
  // RESOLVE DATE RANGE
  // ---------------------------

  /**
   * Resolves date range.
   *
   * @param filter - Date filter
   * @param startDate - Start date
   * @param endDate - End date
   * @returns Date range
   */

  private async resolveDateRange(
    filter: DateFilterType,
    startDate?: string,
    endDate?: string,
  ): Promise<{ from: Date; to: Date }> {
    logger.debug('resolveDateRange --->');
    try {
      const now = new Date();
      let from: Date;
      let to: Date;

      switch (filter) {
        case DateFilterType.LAST_30_DAYS: {
          from = new Date(
            Date.UTC(
              now.getUTCFullYear(),
              now.getUTCMonth(),
              now.getUTCDate() - 30,
              0,
              0,
              0,
              0,
            ),
          );

          to = new Date(
            Date.UTC(
              now.getUTCFullYear(),
              now.getUTCMonth(),
              now.getUTCDate(),
              23,
              59,
              59,
              999,
            ),
          );
          break;
        }

        case DateFilterType.LAST_MONTH: {
          const year =
            now.getUTCMonth() === 0
              ? now.getUTCFullYear() - 1
              : now.getUTCFullYear();

          const month = now.getUTCMonth() === 0 ? 11 : now.getUTCMonth() - 1;

          from = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
          to = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));
          break;
        }

        case DateFilterType.LAST_YEAR: {
          const year = now.getUTCFullYear() - 1;

          from = new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0));
          to = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));
          break;
        }

        case DateFilterType.CUSTOM: {
          if (!startDate || !endDate) {
            throw new BadRequestException(
              'startDate and endDate are required for CUSTOM filter',
            );
          }

          from = new Date(startDate);
          to = new Date(endDate);

          from.setUTCHours(0, 0, 0, 0);
          to.setUTCHours(23, 59, 59, 999);
          break;
        }

        default:
          throw new BadRequestException('Invalid date filter');
      }

      return { from, to };
    } catch (error) {
      logger.error('resolveDateRange --->', error);
      throw error;
    }
  }

  // ---------------------------
  // GET PREVIOUS DATE RANGE
  // ---------------------------

  /**
   * Gets previous date range.
   *
   * @param filter - Date filter
   * @param from - From date
   * @param to - To date
   * @returns Previous date range
   */
  private async getPreviousDateRange(
    filter: DateFilterType,
    from: Date,
    to: Date,
  ): Promise<{ prevFrom: Date; prevTo: Date }> {
    logger.debug('getPreviousDateRange --->');
    try {
      const prevFrom = new Date(from);
      const prevTo = new Date(to);

      switch (filter) {
        case DateFilterType.LAST_30_DAYS:
          prevFrom.setDate(prevFrom.getDate() - 30);
          prevTo.setDate(prevTo.getDate() - 30);
          break;

        case DateFilterType.LAST_MONTH:
          prevFrom.setMonth(prevFrom.getMonth() - 1);
          prevTo.setMonth(prevTo.getMonth() - 1);
          break;

        case DateFilterType.LAST_YEAR:
          prevFrom.setFullYear(prevFrom.getFullYear() - 1);
          prevTo.setFullYear(prevTo.getFullYear() - 1);
          break;

        case DateFilterType.CUSTOM:
          const diffMs = to.getTime() - from.getTime();
          prevFrom.setTime(from.getTime() - diffMs);
          prevTo.setTime(to.getTime() - diffMs);
          break;
      }

      return { prevFrom, prevTo };
    } catch (error) {
      logger.error('getPreviousDateRange --->', error);
      throw error;
    }
  }

  // ---------------------------
  // GET CONVERSION RATE
  // ---------------------------

  /**
   * Gets conversion rate.
   *
   * @param from - From date
   * @param to - To date
   * @returns Conversion rate
   */
  private async getConversionRate(from: Date, to: Date) {
    logger.debug('getConversionRate --->');
    try {
      const totalFormSubmissions = await this.formSubmissionRepo
        .createQueryBuilder('fs')
        .where('fs.submitted_at BETWEEN :from AND :to', { from, to })
        .getCount();

      const approvedRejectedForms = await this.formSubmissionRepo
        .createQueryBuilder('fs')
        .where('fs.submitted_at BETWEEN :from AND :to', { from, to })
        .andWhere('fs.status IN (:...statuses)', {
          statuses: [FormStatus.APPROVED, FormStatus.REJECTED],
        })
        .getCount();

      const totalTaskSubmissions = await this.taskSubmissionRepo
        .createQueryBuilder('ts')
        .where('ts.submitted_at BETWEEN :from AND :to', { from, to })
        .getCount();

      const approvedRejectedTasks = await this.taskSubmissionRepo
        .createQueryBuilder('ts')
        .where('ts.submitted_at BETWEEN :from AND :to', { from, to })
        .andWhere('ts.status IN (:...statuses)', {
          statuses: [FormStatus.APPROVED, FormStatus.REJECTED],
        })
        .getCount();

      const totalSubmissions = totalFormSubmissions + totalTaskSubmissions;
      const approvedRejected = approvedRejectedForms + approvedRejectedTasks;

      const percentage =
        totalSubmissions === 0
          ? 0
          : Math.round((approvedRejected / totalSubmissions) * 100);

      return { percentage };
    } catch (error) {
      logger.error('getConversionRate --->', error);
      throw error;
    }
  }

  // ---------------------------
  // GET AVERAGE RESPONSE TIME
  // ---------------------------

  /**
   * Gets average response time.
   *
   * @param from - From date
   * @param to - To date
   * @returns Average response time
   */
  private async getAverageResponseTime(from: Date, to: Date) {
    logger.debug('getAverageResponseTime --->');
    try {
      const tasks = await this.taskRepo
        .createQueryBuilder('t')
        .andWhere('t.is_completed = true')
        .andWhere('t.is_approved = true')
        .andWhere('t.completed_at IS NOT NULL')
        .andWhere('t.completed_at BETWEEN :from AND :to', { from, to })
        // .andWhere('t.category IN (:...categories)', {
        //   categories: [
        //     TaskCategoryId.FORM_RESPONSE,
        //     TaskCategoryId.WATCH_CONTENT,
        //   ],
        // })
        .getMany();

      if (!tasks.length) {
        return {
          avgHours: 0,
        };
      }

      const durations = tasks
        .map((task) => {
          const diff = task.completed_at.getTime() - task.created_at.getTime();
          return Math.round((diff / 3600000) * 10) / 10;
        })
        .filter(Boolean) as number[];

      const totalHours = durations.reduce((a, b) => a + b, 0);
      const avgHours = Math.round((totalHours / durations.length) * 10) / 10;

      return {
        avgHours,
      };
    } catch (error) {
      logger.error('getAverageResponseTime --->', error);
      throw error;
    }
  }

  // ---------------------------
  // GET HEADCOUNT BY ROLE
  // ---------------------------

  /**
   * Gets headcount by role.
   *
   * @param query - Query parameters
   * @returns Headcount by role
   */
  async getHeadcountByRole(query: ReportsQueryDto) {
    logger.info('getHeadcountByRole...');

    try {
      const filter = await this.resolveFilter(query);

      const { from, to } = await this.resolveDateRange(
        filter,
        query.startDate,
        query.endDate,
      );

      const users = await helpers.fetchUsersByRole(
        this.configService.get('BASE_OPERATIONS'),
        API_ENDPOINTS.OPERATIONS_SERVICE.USER_LIST_FETCH,
        [
          UserRole.COORDINATOR,
          UserRole.DOCTOR,
          UserRole.NURSE,
          UserRole.SURGEON,
          UserRole.ADMIN,
          UserRole.PATIENT,
        ],
      );

      const usersArray = Array.isArray(users)
        ? users
        : Object.values(users || []);

      const uniqueUsersMap = new Map<string, any>();
      usersArray.forEach((user: any) => {
        if (user?.id) {
          uniqueUsersMap.set(user.id, user);
        }
      });

      const uniqueUsers = Array.from(uniqueUsersMap.values());

      const filteredUsers = uniqueUsers.filter((user: any) => {
        if (!user?.createdAt) return false;
        const createdAt = new Date(user.createdAt);
        return createdAt >= from && createdAt <= to;
      });

      const totalUsers = filteredUsers.length;

      const roleCount: Record<string, number> = {
        DOCTOR: 0,
        NURSE: 0,
        COORDINATOR: 0,
        SURGEON: 0,
        ADMIN: 0,
        PATIENT: 0,
      };

      filteredUsers.forEach((user: any) => {
        if (user?.role && roleCount[user.role] !== undefined) {
          roleCount[user.role]++;
        }
      });

      const response = [
        {
          role: 'Doctor',
          count: roleCount.DOCTOR,
          percentage: totalUsers
            ? Math.round((roleCount.DOCTOR / totalUsers) * 100)
            : 0,
        },
        {
          role: 'Nurse',
          count: roleCount.NURSE,
          percentage: totalUsers
            ? Math.round((roleCount.NURSE / totalUsers) * 100)
            : 0,
        },
        {
          role: 'Coordinator',
          count: roleCount.COORDINATOR,
          percentage: totalUsers
            ? Math.round((roleCount.COORDINATOR / totalUsers) * 100)
            : 0,
        },
        {
          role: 'Surgeon',
          count: roleCount.SURGEON,
          percentage: totalUsers
            ? Math.round((roleCount.SURGEON / totalUsers) * 100)
            : 0,
        },
        {
          role: 'Admin',
          count: roleCount.ADMIN,
          percentage: totalUsers
            ? Math.round((roleCount.ADMIN / totalUsers) * 100)
            : 0,
        },
        {
          role: 'Patient',
          count: roleCount.PATIENT,
          percentage: totalUsers
            ? Math.round((roleCount.PATIENT / totalUsers) * 100)
            : 0,
        },
      ];

      logger.info(`getHeadcountByRole ---> ${HttpStatus.OK}`);

      return new ApiResponseBuilder().success(
        response,
        'Headcount fetched successfully',
        HttpStatus.OK,
      );
    } catch (error) {
      logger.error('getHeadcountByRole --->', error);
      return new ApiResponseBuilder().error(
        error,
        error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ---------------------------
  // GET USER TASK PERFORMANCE
  // ---------------------------

  /**
   * Gets user task performance.
   *
   * @param userId - User ID
   * @param from - From date
   * @param to - To date
   * @returns User task performance
   */
  private async getUserTaskPerformance(userId: string, from: Date, to: Date) {
    logger.debug('getUserTaskPerformance --->');
    const tasks = await this.taskRepo
      .createQueryBuilder('t')
      .where('t.assigned_to = :userId', { userId })
      .andWhere('t.is_completed = true')
      .andWhere('t.is_approved = true')
      .andWhere('t.completed_at IS NOT NULL')
      .andWhere('t.completed_at BETWEEN :from AND :to', { from, to })
      // .andWhere('t.category IN (:...categories)', {
      //   categories: [
      //     TaskCategoryId.FORM_RESPONSE,
      //     TaskCategoryId.WATCH_CONTENT,
      //   ],
      // })
      .getMany();

    if (!tasks.length) {
      return {
        tasksCompleted: 0,
        avgResponse: '0h',
        avgResponseHours: 0,
      };
    }

    const durations = tasks
      .map((task) => {
        if (!task.created_at || !task.completed_at) return null;
        const diff = task.completed_at.getTime() - task.created_at.getTime();
        return diff > 0 ? diff / 3600000 : null;
      })
      .filter((v): v is number => v !== null);

    if (!durations.length) {
      return {
        tasksCompleted: 0,
        avgResponse: '0h',
        avgResponseHours: 0,
      };
    }

    const totalHours = durations.reduce((a, b) => a + b, 0);
    const avgHours = Math.round((totalHours / durations.length) * 10) / 10;

    return {
      tasksCompleted: durations.length,
      avgResponse: `${avgHours}h`,
      avgResponseHours: avgHours,
    };
  }

  // ---------------------------
  // GET USER QUALITY SCORE
  // ---------------------------

  /**
   * Gets user quality score.
   *
   * @param userId - User ID
   * @param from - From date
   * @param to - To date
   * @returns User quality score
   */
  private async getUserQualityScore(
    userId: string,
    from: Date,
    to: Date,
  ): Promise<number> {
    logger.debug('getUserQualityScore --->');
    const completedTasks = await this.taskRepo.find({
      where: {
        assigned_to: userId,
        is_completed: true,
        completed_at: Between(from, to),
      },
      select: ['id'],
    });

    if (!completedTasks.length) return 0;

    const submissions = await this.formSubmissionRepo.find({
      where: {
        task_id: In(completedTasks.map((t) => t.id)),
        form: {
          id: In([
            recoveryFormIds.DAYS_1_TO_14,
            recoveryFormIds.WEEKS_3_TO_12,
            recoveryFormIds.MONTHS_4_TO_12,
          ]),
        },
      },
      select: ['id'],
    });

    if (!submissions.length) return 0;

    const ratings = await this.formAnswerRepo.find({
      where: {
        submission: { id: In(submissions.map((s) => s.id)) },
        question: {
          id: In([
            RatingsQuestionIds.DAYS_1_TO_14,
            RatingsQuestionIds.WEEKS_3_TO_12,
            RatingsQuestionIds.MONTHS_4_TO_12,
          ]),
        },
      },
    });

    const ratingValues = ratings
      .map((r) => Number(r.answer?.[0]))
      .filter((v) => !isNaN(v) && v >= 1 && v <= 5);

    if (!ratingValues.length) return 0;

    return Math.round(
      (ratingValues.reduce((sum, v) => sum + v, 0) /
        (ratingValues.length * 5)) *
        100,
    );
  }

  // ---------------------------
  // GET PERFORMANCE BY USER
  // ---------------------------

  /**
   * Gets performance by user.
   *
   * @param query - Query parameters
   * @returns Performance by user
   */
  async getPerformanceByUser(query: PerformanceQueryDto) {
    logger.info('getPerformanceByUser...');

    try {
      const page = query.page ?? 1;
      const limit = query.limit ?? 10;
      const search = query.search?.toLowerCase();
      const filter = await this.resolveFilter(query);

      const { from, to } = await this.resolveDateRange(
        filter,
        query.startDate,
        query.endDate,
      );

      const users = await helpers.fetchUsersByRole(
        this.configService.get('BASE_OPERATIONS'),
        API_ENDPOINTS.OPERATIONS_SERVICE.USER_LIST_FETCH,
        [
          UserRole.DOCTOR,
          UserRole.NURSE,
          UserRole.COORDINATOR,
          UserRole.SURGEON,
          UserRole.ADMIN,
        ],
      );

      let usersArray = Array.isArray(users)
        ? users
        : Object.values(users || []);

      usersArray = usersArray.filter((user: any) => user.status === 'active');

      if (search) {
        usersArray = usersArray.filter(
          (user: any) =>
            user.userName?.toLowerCase().includes(search) ||
            user.role?.toLowerCase().includes(search),
        );
      }

      const performanceList = (
        await Promise.all(
          usersArray.map(async (user: any) => {
            const { tasksCompleted, avgResponse, avgResponseHours } =
              await this.getUserTaskPerformance(user.id, from, to);

            const qualityScore = await this.getUserQualityScore(
              user.id,
              from,
              to,
            );

            return {
              userName: user.userName || '-',
              role: user.role
                ? user.role.charAt(0) + user.role.slice(1).toLowerCase()
                : '-',
              tasksCompleted,
              avgResponse,
              avgResponseHours,
              qualityScore,
            };
          }),
        )
      ).filter(Boolean);

      performanceList.sort((a: any, b: any) => b.qualityScore - a.qualityScore);

      const finalList = performanceList.map(
        ({ avgResponseHours, qualityScore, ...rest }) => ({
          ...rest,
          satisfaction: `${qualityScore}%`,
        }),
      );

      const paginated = helpers.paginate(finalList, page, limit);

      logger.info(`getPerformanceByUser ---> ${HttpStatus.OK}`);

      return new ApiResponseBuilder().paginated(
        [{ performance: paginated.items }],
        paginated.meta,
        'Performance data fetched successfully',
      );
    } catch (error) {
      logger.error('getPerformanceByUser --->', error);
      return new ApiResponseBuilder().error(
        error,
        error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ---------------------------
  // GET CONTENT PERFORMANCE
  // ---------------------------

  /**
   * Gets content performance.
   *
   * @param query - Query parameters
   * @returns Content performance
   */
  async getContentPerformance(query: ReportsQueryDto) {
    logger.info('getContentPerformance...');

    try {
      const filter = await this.resolveFilter(query);
      const { from, to } = await this.resolveDateRange(
        filter,
        query.startDate,
        query.endDate,
      );

      const rawData = await this.contentRepo
        .createQueryBuilder('c')
        .select('c.type', 'type')
        .addSelect('SUM(c.view_count)', 'totalViews')
        .addSelect('SUM(c.like_count)', 'totalLikes')
        .where('c.created_at BETWEEN :from AND :to', { from, to })
        .andWhere('c.status = :status', { status: ContentStatus.PUBLISHED })
        .andWhere('c.deleted_at IS NULL')
        .groupBy('c.type')
        .getRawMany();

      const typeLabelMap = {
        [ContentType.VIDEO]: 'Videos',
        [ContentType.IMAGE]: 'Images',
        [ContentType.BLOG]: 'Blogs',
        [ContentType.ELEARNING]: 'Guides',
      };

      const response = Object.values(ContentType).map((type) => {
        const record = rawData.find((r) => r.type === type);

        const totalViews = Number(record?.totalViews ?? 0);
        const totalLikes = Number(record?.totalLikes ?? 0);

        const engagement =
          totalViews === 0
            ? 0
            : Math.round((totalLikes / totalViews) * 1000) / 10;

        return {
          label: typeLabelMap[type],
          totalViews,
          engagement,
        };
      });

      logger.info(`getContentPerformance ---> ${HttpStatus.OK}`);

      return new ApiResponseBuilder().success(
        response,
        'Content performance fetched successfully',
        HttpStatus.OK,
      );
    } catch (error) {
      logger.error('getContentPerformance --->', error);
      return new ApiResponseBuilder().error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ---------------------------
  // GET APP ENGAGEMENT TRENDS
  // ---------------------------

  /**
   * Gets app engagement trends.
   *
   * @param query - Query parameters
   * @returns App engagement trends
   */
  async getAppEngagementTrends(query: ReportsQueryDto) {
    logger.info('getAppEngagementTrends...');

    try {
      const filter = await this.resolveFilter(query);

      const { from, to } = await this.resolveDateRange(
        filter,
        query.startDate,
        query.endDate,
      );

      const months: string[] = [];
      const cursor = new Date(from);

      while (cursor <= to) {
        months.push(
          cursor.toLocaleString('en-US', { month: 'short' }).toLowerCase(),
        );
        cursor.setMonth(cursor.getMonth() + 1);
      }

      const activeMap: Record<string, number> = {};
      const guestMap: Record<string, number> = {};

      months.forEach((month) => {
        activeMap[month] = 0;
        guestMap[month] = 0;
      });

      const users = await helpers.fetchUsersByRole(
        this.configService.get('BASE_OPERATIONS'),
        API_ENDPOINTS.OPERATIONS_SERVICE.USER_LIST_FETCH,
        [
          UserRole.PATIENT,
        ],
      );

      const usersArray = Array.isArray(users)
        ? users
        : Object.values(users || []);

      usersArray.forEach((user: any) => {
        if (!user?.createdAt) return;
        if (user.isActive !== true) return;
        if (user.status !== 'active') return;

        const createdAt = new Date(user.createdAt);
        if (createdAt < from || createdAt > to) return;

        const month = createdAt
          .toLocaleString('en-US', { month: 'short' })
          .toLowerCase();

        if (user.patient_phase_id === 140) {
          guestMap[month]++;
        } else {
          activeMap[month]++;
        }
      });

      const guestCounts = await this.guestUserRepo
        .createQueryBuilder('g')
        .select([
          `COUNT(DISTINCT g.device_id) as count`,
          `TO_CHAR(g.created_at, 'Mon') as month`,
        ])
        .where('g.created_at BETWEEN :from AND :to', { from, to })
        .groupBy(`TO_CHAR(g.created_at, 'Mon')`)
        .getRawMany();

      guestCounts.forEach((row) => {
        const month = row.month.toLowerCase();
        if (guestMap[month] !== undefined) {
          guestMap[month] += Number(row.count);
        }
      });

      const appEngagementTrend = months.map((month) => ({
        month,
        activeuser: activeMap[month] ?? 0,
        guestuser: guestMap[month] ?? 0,
      }));

      return new ApiResponseBuilder().success(
        appEngagementTrend,
        'App engagement trends fetched successfully',
        HttpStatus.OK,
      );
    } catch (error) {
      logger.error('getAppEngagementTrends --->', error);
      return new ApiResponseBuilder().error(
        error,
        error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ---------------------------
  // RESOLVE FILTER
  // ---------------------------

  /**
   * Resolves filter.
   *
   * @param query - Query parameters
   * @returns Date filter
   */
  private async resolveFilter(query: ReportsQueryDto): Promise<DateFilterType> {
    logger.debug('resolveFilter --->');
    if (query.startDate && query.endDate) {
      return DateFilterType.CUSTOM;
    }

    if (query.filter) {
      const dropdown = await this.dropdownRepo.findOne({
        where: { id: query.filter },
        select: ['beValue'],
      });

      if (!dropdown) {
        throw new BadRequestException('Invalid filter id');
      }

      return this.normalizeDateFilter(dropdown.beValue);
    }

    return DateFilterType.LAST_30_DAYS;
  }

  // ---------------------------
  // NORMALIZE DATE FILTER
  // ---------------------------

  /**
   * Normalizes date filter.
   *
   * @param value - Date filter value
   * @returns Date filter
   */
  private normalizeDateFilter(value: string): DateFilterType {
    logger.debug('normalizeDateFilter --->');
    const map: Record<string, DateFilterType> = {
      LAST_30_DAYS: DateFilterType.LAST_30_DAYS,
      LAST_MONTH: DateFilterType.LAST_MONTH,
      LAST_YEAR: DateFilterType.LAST_YEAR,
      CUSTOM: DateFilterType.CUSTOM,
    };

    const filter = map[value];
    if (!filter) {
      throw new BadRequestException('Invalid date filter value');
    }

    return filter;
  }

  // ---------------------------
  // GET ALL REPORTS
  // ---------------------------

  /**
   * Gets all reports.
   *
   * @param filters - Query parameters
   * @returns All reports
   */
  async getAllReports(filters?: ReportsQueryDto) {
    try {
      const filterType = await this.resolveFilter(filters);

      const { from, to } = await this.resolveDateRange(
        filterType,
        filters.startDate,
        filters.endDate,
      );

      const [
        dashboardCardData,
        performance,
        contentPerformanceData,
        headcountData,
        appEngagementData,
      ] = await Promise.all([
        this.getDashboardCards(filters),
        this.getPerformanceWithoutPagination(from, to),
        this.getContentPerformance(filters),
        this.getHeadcountByRole(filters),
        this.getAppEngagementTrends(filters),
      ]);

      return new ApiResponseBuilder().success(
        {
          dashboardCard: dashboardCardData?.data
            ? Object.entries(dashboardCardData.data).map(([key, value]) => ({
                key,
                ...value,
              }))
            : [],
          performance,
          contentPerformance: contentPerformanceData?.data ?? [],
          headcount: headcountData?.data ?? [],
          appEngagement: appEngagementData?.data ?? [],
        },
        'All reports fetched successfully',
        HttpStatus.OK,
      );
    } catch (error) {
      logger.error('getAllReports --->', error);
      return new ApiResponseBuilder().error(
        error,
        error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ---------------------------
  // GET PERFORMANCE WITHOUT PAGINATION
  // ---------------------------

  /**
   * Gets performance without pagination.
   *
   * @param from - From date
   * @param to - To date
   * @returns Performance without pagination
   */
  private async getPerformanceWithoutPagination(from: Date, to: Date) {
    logger.debug('getPerformanceWithoutPagination --->');
    try {
      const users = await helpers.fetchUsersByRole(
        this.configService.get('BASE_OPERATIONS'),
        API_ENDPOINTS.OPERATIONS_SERVICE.USER_LIST_FETCH,
        [
          UserRole.DOCTOR,
          UserRole.NURSE,
          UserRole.COORDINATOR,
          UserRole.SURGEON,
          UserRole.ADMIN,
        ],
      );

      const usersArray = Array.isArray(users)
        ? users
        : Object.values(users || []);

      const performanceList = (
        await Promise.all(
          usersArray.map(async (user: any) => {
            const { tasksCompleted, avgResponseHours } =
              await this.getUserTaskPerformance(user.id, from, to);

            const qualityScore = await this.getUserQualityScore(
              user.id,
              from,
              to,
            );

            return {
              userName: user.userName || '-',
              role: user.role
                ? user.role.charAt(0) + user.role.slice(1).toLowerCase()
                : '-',
              tasksCompleted,
              avgResponse: `${avgResponseHours}h`,
              satisfaction: `${qualityScore}%`,
            };
          }),
        )
      ).filter(Boolean);
      return performanceList;
    } catch (error) {
      logger.error('getPerformanceWithoutPagination --->', error);
      throw error;
    }
  }
}