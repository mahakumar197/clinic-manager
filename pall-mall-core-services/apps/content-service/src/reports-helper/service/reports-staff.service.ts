import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import {
  API_ENDPOINTS,
  DateFilterType,
  FormStatus,
  helpers,
  TaskCategoryId,
  TaskCategory,
  recoveryFormIds,
  RatingsQuestionIds,
} from '@pallmall/common-utils';
import {
  ApiResponseBuilder,
  HttpStatus,
  UserRole,
} from '@pallmall/shared-types';
import { logger } from '@pallmall/logger';
import { Task } from '../../tasks/entities/task.entity';
import { FormSubmission } from '../../forms/entities/form.submission.entity';
import { ReportsStaffQueryDto } from '../dto/reports.dto';
import { Dropdown } from 'src/master/entities/dropdown.entity';
import { ConfigService } from '@nestjs/config';
import { FormAnswer } from 'src/forms/entities/form.answer.entity';

@Injectable()
export class ReportsStaffsService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
    @InjectRepository(FormSubmission)
    private readonly formSubmissionRepo: Repository<FormSubmission>,
    @InjectRepository(FormAnswer)
    private readonly formAnswerRepo: Repository<FormAnswer>,
    @InjectRepository(Dropdown)
    private readonly dropdownRepo: Repository<Dropdown>,
    private readonly configService: ConfigService,
  ) {}

  // ---------------------------
  // HELPERS
  // ---------------------------

  private getWeekRange() {
    logger.debug('getWeekRange --->');
    const now = new Date();
    const startOfWeek = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - now.getDay(),
    );
    const endOfWeek = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - now.getDay() + 6,
    );
    return { startOfWeek, endOfWeek };
  }

  private getLastWeekRange() {
    logger.debug('getLastWeekRange --->');
    const now = new Date();
    const startOfLastWeek = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - now.getDay() - 7,
    );
    const endOfLastWeek = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - now.getDay() - 1,
    );
    return { startOfLastWeek, endOfLastWeek };
  }

  private async resolveFilter(
    query: ReportsStaffQueryDto,
  ): Promise<DateFilterType> {
    logger.debug('resolveFilter --->');
    if (query.startDate && query.endDate) {
      return DateFilterType.CUSTOM;
    }

    if (query.filter) {
      const dropdown = await this.dropdownRepo.findOne({
        where: { id: query.filter },
        select: ['beValue'],
      });
      return this.normalizeDateFilter(dropdown.beValue);
    }
    return DateFilterType.LAST_30_DAYS;
  }

  private normalizeDateFilter(value?: string): DateFilterType {
    logger.debug('normalizeDateFilter --->');
    if (!value) return DateFilterType.LAST_30_DAYS;

    switch (value) {
      case 'LAST_30_DAYS':
        return DateFilterType.LAST_30_DAYS;

      case 'LAST_MONTH':
        return DateFilterType.LAST_MONTH;

      case 'LAST_YEAR':
        return DateFilterType.LAST_YEAR;

      case 'CUSTOM':
        return DateFilterType.CUSTOM;

      default:
        throw new BadRequestException(`Invalid date filter: ${value}`);
    }
  }

  private async countApprovedTasks(
    userId: string,
    from: Date,
    to: Date,
  ): Promise<number> {
    logger.debug('countApprovedTasks --->');
    const categoryId = await this.dropdownRepo.findOne({
      where: {
        beValue: TaskCategory.FORM_RESPONSE,
      },
    });
    return this.taskRepo.count({
      where: {
        assigned_to: userId,
        is_completed: true,
        category: categoryId?.id,
        is_approved: true,
        created_at: Between(from, to),
      },
    });
  }

  private async countFormSubmissions(userId: string): Promise<number> {
    logger.debug('countFormSubmissions --->');
    const tasks = await this.taskRepo.find({
      where: {
        assigned_to: userId,
        is_completed: true,
        category: TaskCategoryId.FORM_RESPONSE,
      },
      select: ['id'],
    });

    if (!tasks.length) return 0;

    return this.formSubmissionRepo.count({
      where: {
        task_id: In(tasks.map((t) => t.id)),
        status: FormStatus.SUBMITTED,
      },
    });
  }

  private percentageChange(current: number, previous: number): number {
    logger.debug('percentageChange --->');
    if (previous === 0) return 0;
    return Number((((current - previous) / previous) * 100).toFixed(2));
  }

  private async avgResponseTime(userId: string, from: Date, to: Date) {
    logger.debug('avgResponseTime --->');
    try {
      const avgResponse = await this.taskRepo
        .createQueryBuilder('task')
        .select(
          `AVG(EXTRACT(EPOCH FROM (task.completed_at - task.created_at)) / 3600)`,
          'avg_hours',
        )
        .where('task.assigned_to = :userId', { userId })
        .andWhere('task.is_completed = true')
        .andWhere('task.completed_at IS NOT NULL')
        .andWhere('task.created_at BETWEEN :from AND :to', { from, to })
        .getRawOne();
      const tasks = await this.taskRepo.find({
        where: {
          assigned_to: userId,
          is_completed: true,
          category: TaskCategoryId.FORM_RESPONSE,
        },
      });
      const avgResponseTimeInHours = Number(avgResponse?.avg_hours ?? 0);
      return avgResponseTimeInHours;
    } catch (error) {
      logger.error('avgResponseTime --->', error);
      throw new ApiResponseBuilder().error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async resolveDateRange(
    filter: string,
    startDate?: string,
    endDate?: string,
  ): Promise<{ from: Date; to: Date }> {
    logger.debug('resolveDateRange --->');
    try {
      const now = new Date();
      let from: Date;
      let to: Date = now;

      switch (filter) {
        case DateFilterType.LAST_30_DAYS:
          from = new Date();
          from.setDate(now.getDate() - 30);
          break;
        case DateFilterType.LAST_MONTH:
          from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          to = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
          break;
        case DateFilterType.LAST_YEAR:
          from = new Date(now.getFullYear() - 1, 0, 1);
          to = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59);
          break;
        case DateFilterType.CUSTOM:
          if (!startDate || !endDate) {
            throw new BadRequestException(
              'startDate and endDate are required for CUSTOM filter',
            );
          }
          from = new Date(startDate);
          to = new Date(endDate);
          break;
        default:
          throw new BadRequestException('Invalid date filter');
      }
      return { from, to };
    } catch (error) {
      logger.error('resolveDateRange --->', error);
      throw error;
    }
  }

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

  async getWeeklyApprovalsGraph(userId: string, query: ReportsStaffQueryDto) {
    try {
      const { startOfWeek, endOfWeek } = this.getWeekRange();
      const taskType = await this.dropdownRepo.findOne({
        where: {
          beValue: TaskCategory.FORM_RESPONSE,
        },
      });
      const approvals = await this.taskRepo.find({
        where: {
          assigned_to: userId,
          category: taskType?.id,
          is_completed: true,
          is_approved: true,
          approved_at: Between(startOfWeek, endOfWeek),
        },
        select: ['id', 'approved_at'],
      });
      const weekTemplate = [
        'sunday',
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
      ].map((day) => ({ day, count: 0 }));
      if (!approvals.length) {
        return new ApiResponseBuilder().success(
          weekTemplate,
          'Weekly approvals graph fetched successfully',
          HttpStatus.OK,
        );
      }
      const taskIdToDayMap = approvals.reduce(
        (acc, task) => {
          const day = task.approved_at
            .toLocaleDateString('en-US', { weekday: 'long' })
            .toLowerCase();

          acc[task.id] = day;
          return acc;
        },
        {} as Record<string, string>,
      );
      const submissions = await this.formSubmissionRepo.find({
        where: {
          task_id: In(Object.keys(taskIdToDayMap)),
          status: FormStatus.APPROVED,
        },
        select: ['task_id'],
      });
      const countsByDay = submissions.reduce(
        (acc, submission) => {
          const day = taskIdToDayMap[submission.task_id];
          if (day) {
            acc[day] = (acc[day] || 0) + 1;
          }
          return acc;
        },
        {} as Record<string, number>,
      );
      const result = weekTemplate.map(({ day }) => ({
        day,
        count: countsByDay[day] ?? 0,
      }));

      return new ApiResponseBuilder().success(
        result,
        'Weekly approvals graph fetched successfully',
        HttpStatus.OK,
      );
    } catch (error) {
      logger.error('getWeeklyApprovalsGraph --->', error);
      throw new ApiResponseBuilder().error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private generateMonthBuckets(from: Date, to: Date): string[] {
    logger.debug('generateMonthBuckets --->');
    const months: string[] = [];
    const cursor = new Date(from);

    cursor.setDate(1);

    while (cursor <= to) {
      months.push(
        cursor.toLocaleString('en-US', { month: 'short' }).toLowerCase(),
      );
      cursor.setMonth(cursor.getMonth() + 1);
    }

    return months;
  }

  private async resolveTrendDateRange(
    filter: DateFilterType,
    startDate?: string,
    endDate?: string,
  ): Promise<{ from: Date; to: Date }> {
    logger.debug('resolveTrendDateRange --->');
    const now = new Date();

    switch (filter) {
      case DateFilterType.LAST_MONTH: {
        const year = now.getUTCFullYear();
        const month = now.getUTCMonth();
        const from = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
        const to = new Date(Date.UTC(year, month, 0, 23, 59, 59));
        return { from, to };
      }
      case DateFilterType.LAST_30_DAYS: {
        const from = new Date(Date.UTC(now.getUTCFullYear(), 0, 1, 0, 0, 0));
        const to = new Date(
          Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0, 23, 59, 59),
        );

        return { from, to };
      }
      case DateFilterType.LAST_YEAR: {
        const year = now.getUTCFullYear() - 1;

        const from = new Date(Date.UTC(year, 0, 1, 0, 0, 0));

        const to = new Date(Date.UTC(year, 11, 31, 23, 59, 59));

        return { from, to };
      }

      case DateFilterType.CUSTOM: {
        if (!startDate || !endDate) {
          throw new BadRequestException(
            'startDate and endDate are required for CUSTOM filter',
          );
        }

        return {
          from: new Date(startDate),
          to: new Date(endDate),
        };
      }

      default:
        throw new BadRequestException('Invalid trend filter');
    }
  }

  private resolveFormBreakdownDateRange(
    filter: DateFilterType,
    startDate?: string,
    endDate?: string,
  ): { from: Date; to: Date } {
    logger.debug('resolveFormBreakdownDateRange --->');
    const now = new Date();
    if (startDate && endDate) {
      const from = new Date(startDate);
      const to = new Date(endDate);
      if (isNaN(from.getTime()) || isNaN(to.getTime())) {
        throw new BadRequestException('Invalid startDate or endDate');
      }
      if (from > to) {
        throw new BadRequestException('startDate must be before endDate');
      }
      return { from, to };
    }
    switch (filter) {
      case DateFilterType.LAST_30_DAYS: {
        const from = new Date(
          Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0),
        );
        const to = now;
        return { from, to };
      }
      case DateFilterType.LAST_MONTH: {
        const from = new Date(
          Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1, 0, 0, 0),
        );
        const to = new Date(
          Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0, 23, 59, 59),
        );
        return { from, to };
      }
      case DateFilterType.LAST_YEAR: {
        const year = now.getUTCFullYear() - 1;
        const from = new Date(Date.UTC(year, 0, 1, 0, 0, 0));
        const to = new Date(Date.UTC(year, 11, 31, 23, 59, 59));
        return { from, to };
      }
      default:
        throw new BadRequestException('Invalid filter for form breakdown');
    }
  }

  // ---------------------------
  // GET CARDS
  // ---------------------------
  /**
   * Fetches cards for a user.
   *
   * @param userId - User ID
   * @param query - Reports query
   * @returns Cards data
   */

  async getCards(userId: string, query: ReportsStaffQueryDto) {
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

      const { startOfWeek, endOfWeek } = this.getWeekRange();
      const { startOfLastWeek, endOfLastWeek } = this.getLastWeekRange();
      const [
        totalTasksCount,
        totalTasksCountPrev,
        tasksCountThisWeek,
        tasksCountLastWeek,
        avgResponseTime,
        avgResponseTimePrev,
        formSubmissions,
      ] = await Promise.all([
        this.countApprovedTasks(userId, from, to),
        this.countApprovedTasks(userId, prevFrom, prevTo),
        this.countApprovedTasks(userId, startOfWeek, endOfWeek),
        this.countApprovedTasks(userId, startOfLastWeek, endOfLastWeek),
        this.avgResponseTime(userId, from, to),
        this.avgResponseTime(userId, prevFrom, prevTo),
        this.countFormSubmissions(userId),
      ]);

      const response = {
        totalTaskCount: {
          count: totalTasksCount,
          change: this.percentageChange(totalTasksCount, totalTasksCountPrev),
        },
        weekTaskCount: {
          count: tasksCountThisWeek,
          change: this.percentageChange(tasksCountThisWeek, tasksCountLastWeek),
        },
        avgResponse: {
          avgResponseTimeInHours: avgResponseTime,
          avgResponseChange: this.percentageChange(
            avgResponseTime,
            avgResponseTimePrev,
          ),
        },
        formSubmissions,
      };
      return new ApiResponseBuilder().success(
        response,
        'Dashboard cards fetched successfully',
        HttpStatus.OK,
      );
    } catch (error) {
      logger.error('getCards --->', error);
      throw new ApiResponseBuilder().error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  // ---------------------------
  // GET RESPONSE TIME TREND
  // ---------------------------
  /**
   * Fetches response time trend for a user.
   *
   * @param userId - User ID
   * @param query - Reports query
   * @returns Response time trend data
   */

  async getResponseTimeTrend(userId: string, query: ReportsStaffQueryDto) {
    logger.info('getResponseTimeTrend --->');
    const filter = await this.resolveFilter(query);
    const { from, to } = await this.resolveTrendDateRange(
      filter,
      query.startDate,
      query.endDate,
    );
    const categoryId = await this.dropdownRepo.findOne({
      where: {
        beValue: TaskCategory.FORM_RESPONSE,
      },
    });
    const rawData = await this.taskRepo
      .createQueryBuilder('task')
      .select(`TO_CHAR(task.completed_at, 'Mon')`, 'month')
      .addSelect(
        `AVG(EXTRACT(EPOCH FROM (task.completed_at - task.created_at)) / 3600)`,
        'value',
      )
      .where('task.assigned_to = :userId', { userId })
      .andWhere('task.category = :categoryId', { categoryId: categoryId.id })
      .andWhere('task.is_completed = true')
      .andWhere('task.completed_at IS NOT NULL')
      .andWhere('task.completed_at BETWEEN :from AND :to', {
        from,
        to,
      })
      .groupBy(`TO_CHAR(task.completed_at, 'Mon')`)
      .orderBy(`MIN(task.completed_at)`, 'ASC')
      .getRawMany();
    const monthBuckets = this.generateMonthBuckets(from, to);
    const result = monthBuckets.map((month) => {
      const match = rawData.find((r) => r.month.toLowerCase() === month);
      return {
        month,
        value: match ? Number(Number(match.value).toFixed(2)) : 0,
      };
    });
    return new ApiResponseBuilder().success(
      result,
      'Response time trend fetched successfully',
      HttpStatus.OK,
    );
  }

  // ---------------------------
  // GET FORM TYPE BREAKDOWN
  // ---------------------------
  /**
   * Fetches form type breakdown for a user.
   *
   * @param userId - User ID
   * @param query - Reports query
   * @returns Form type breakdown data
   */

  async formTypeBreakdown(userId: string, query: ReportsStaffQueryDto) {
    logger.info('formTypeBreakdown --->');
    try {
      const filter = await this.resolveFilter(query);
      const { from, to } = this.resolveFormBreakdownDateRange(
        filter,
        query.startDate,
        query.endDate,
      );
      console.log('from', from);
      console.log('to', to);
      const categoryId = await this.dropdownRepo.findOne({
        where: {
          beValue: TaskCategory.FORM_RESPONSE,
        },
      });
      const tasks = await this.taskRepo.find({
        where: {
          assigned_to: userId,
          category: categoryId?.id,
          is_completed: true,
          is_approved: true,
          completed_at: Between(from, to),
        },
        select: ['id'],
      });

      if (!tasks.length) {
        return new ApiResponseBuilder().success(
          [],
          'Form type breakdown fetched successfully',
          HttpStatus.OK,
        );
      }

      const taskIds = tasks.map((t) => t.id);

      const rawBreakdown = await this.formSubmissionRepo
        .createQueryBuilder('formSubmission')
        .select('form.form_type', 'formType')
        .addSelect('COUNT(formSubmission.id)', 'count')
        .leftJoin('formSubmission.form', 'form')
        .where('formSubmission.task_id IN (:...taskIds)', { taskIds })
        .andWhere('formSubmission.status = :status', {
          status: FormStatus.APPROVED,
        })
        .groupBy('form.form_type')
        .getRawMany();

      const total = rawBreakdown.reduce((sum, r) => sum + Number(r.count), 0);

      const result = rawBreakdown.map((r) => ({
        formType: r.formType,
        count: Number(r.count),
        percentage:
          total === 0 ? 0 : Math.round((Number(r.count) / total) * 100),
      }));

      return new ApiResponseBuilder().success(
        result,
        'Form type breakdown fetched successfully',
        HttpStatus.OK,
      );
    } catch (error) {
      logger.error('formTypeBreakdown --->', error);
      throw new ApiResponseBuilder().error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ---------------------------
  // GET PERFORMANCE SUMMARY
  // ---------------------------
  /**
   * Fetches performance summary for a user.
   *
   * @param userId - User ID
   * @returns Performance summary data
   */

  async performanceSummary(userId: string) {
    try {
      const category = await this.dropdownRepo.findOne({
        where: { beValue: TaskCategory.FORM_RESPONSE },
        select: ['id'],
      });
      if (!category) {
        throw new BadRequestException('Task category not found');
      }
      const [userCompletedTasks, userTotalTasks] = await Promise.all([
        this.taskRepo.count({
          where: {
            assigned_to: userId,
            category: category.id,
            is_completed: true,
            is_approved: true,
          },
        }),
        this.taskRepo.count({
          where: {
            assigned_to: userId,
            category: category.id,
          },
        }),
      ]);
      const individualCompletionRate =
        userTotalTasks === 0
          ? 0
          : Math.round((userCompletedTasks / userTotalTasks) * 100);
      const uri = this.configService.get('BASE_OPERATIONS');
      const userMap = await helpers.fetchUsersByIds(
        uri,
        API_ENDPOINTS.OPERATIONS_SERVICE.USER_DATA_FETCH,
        [userId],
      );
      const userRole = userMap?.[userId]?.role;
      if (!userRole) {
        throw new BadRequestException('User role not found');
      }
      const teamUsers = await helpers.fetchUsersByRole(
        uri,
        API_ENDPOINTS.OPERATIONS_SERVICE.USER_LIST_FETCH,
        userRole,
      );
      const teamUserIds = teamUsers.map((u) => u.id);
      if (!teamUserIds.length) {
        return new ApiResponseBuilder().success(
          {
            completionRate: individualCompletionRate,
            teamAverage: 0,
            comparisonText: 'No team data available',
          },
          'Performance summary fetched successfully',
          HttpStatus.OK,
        );
      }
      const [teamCompletedTasks, teamTotalTasks] = await Promise.all([
        this.taskRepo.count({
          where: {
            assigned_to: In(teamUserIds),
            category: category.id,
            is_completed: true,
            is_approved: true,
          },
        }),
        this.taskRepo.count({
          where: {
            assigned_to: In(teamUserIds),
            category: category.id,
          },
        }),
      ]);
      const teamCompletionRate =
        teamTotalTasks === 0
          ? 0
          : Math.round((teamCompletedTasks / teamTotalTasks) * 100);
      const comparisonText =
        individualCompletionRate >= teamCompletionRate
          ? `Above team average (${teamCompletionRate}%)`
          : `Below team average (${teamCompletionRate}%)`;
      const staffCompletedTasks = await this.taskRepo.find({
        where: {
          assigned_to: userId,
          category: category.id,
          is_completed: true,
        },
      });
      const staffTotalTasks = staffCompletedTasks.length;
      const formSubmissionsForRatings = await this.formSubmissionRepo.find({
        where: {
          task_id: In(staffCompletedTasks.map((t) => t.id)),
          form: {
            id: In([
              recoveryFormIds.DAYS_1_TO_14,
              recoveryFormIds.WEEKS_3_TO_12,
              recoveryFormIds.MONTHS_4_TO_12,
            ]),
          },
        },
      });
      const staffRatings = await this.formAnswerRepo.find({
        where: {
          submission: { id: In(formSubmissionsForRatings.map((s) => s.id)) },
          question: {
            id: In([
              RatingsQuestionIds.DAYS_1_TO_14,
              RatingsQuestionIds.WEEKS_3_TO_12,
              RatingsQuestionIds.MONTHS_4_TO_12,
            ]),
          },
        },
      });
      const ratingValues = staffRatings
        .map((r) => Number(r.answer?.[0]))
        .filter((v) => !isNaN(v) && v >= 1 && v <= 5);
      const qualityScore =
        ratingValues.length === 0
          ? 0
          : Math.round(
              (ratingValues.reduce((sum, v) => sum + v, 0) /
                (ratingValues.length * 5)) *
                100,
            );
      let qualityLabel = 'No rating data';
      if (qualityScore >= 90) {
        qualityLabel = 'Excellent performance rating';
      } else if (qualityScore >= 75) {
        qualityLabel = 'Good performance rating';
      } else if (qualityScore >= 60) {
        qualityLabel = 'Average performance rating';
      } else {
        qualityLabel = 'Needs improvement';
      }

      const [userCompleted, userTotal] = await Promise.all([
        this.taskRepo.count({
          where: {
            assigned_to: userId,
            category: category.id,
            is_completed: true,
            is_approved: true,
          },
        }),
        this.taskRepo.count({
          where: {
            assigned_to: userId,
            category: category.id,
          },
        }),
      ]);

      const userCompletionRate =
        userTotal === 0 ? 0 : Math.round((userCompleted / userTotal) * 100);

      const userAvgResponse = await this.taskRepo
        .createQueryBuilder('task')
        .select(
          `AVG(EXTRACT(EPOCH FROM (task.completed_at - task.created_at)) / 3600)`,
          'avg_hours',
        )
        .where('task.assigned_to = :userId', { userId })
        .andWhere('task.is_completed = true')
        .andWhere('task.is_approved = true')
        .andWhere('task.completed_at IS NOT NULL')
        .getRawOne();

      const userAvgHours = Number(userAvgResponse?.avg_hours ?? 0);

      const staffUsers = await helpers.fetchUsersByRole(
        uri,
        API_ENDPOINTS.OPERATIONS_SERVICE.USER_LIST_FETCH,
        `${UserRole.DOCTOR},${UserRole.NURSE},${UserRole.COORDINATOR},${UserRole.SURGEON}`,
      );

      const staffUserIds = staffUsers.map((u) => u.id);

      const [staffCompleted, staffTotal] = await Promise.all([
        this.taskRepo.count({
          where: {
            assigned_to: In(staffUserIds),
            category: category.id,
            is_completed: true,
            is_approved: true,
          },
        }),
        this.taskRepo.count({
          where: {
            assigned_to: In(staffUserIds),
            category: category.id,
          },
        }),
      ]);

      const staffCompletionRate =
        staffTotal === 0 ? 0 : Math.round((staffCompleted / staffTotal) * 100);

      const staffAvgResponse = await this.taskRepo
        .createQueryBuilder('task')
        .select(
          `AVG(EXTRACT(EPOCH FROM (task.completed_at - task.created_at)) / 3600)`,
          'avg_hours',
        )
        .where('task.assigned_to IN (:...ids)', { ids: staffUserIds })
        .andWhere('task.is_completed = true')
        .andWhere('task.is_approved = true')
        .andWhere('task.completed_at IS NOT NULL')
        .getRawOne();

      const staffAvgHours = Number(staffAvgResponse?.avg_hours ?? 0);

      const outstandingPerformance =
        userCompletionRate >= staffCompletionRate &&
        userAvgHours <= staffAvgHours;

      return new ApiResponseBuilder().success(
        {
          completionRate: individualCompletionRate,
          teamAverage: teamCompletionRate,
          comparisonText,
          qualityScore,
          qualityLabel,
          outstandingPerformance,
        },
        'Performance summary fetched successfully',
        HttpStatus.OK,
      );
    } catch (error) {
      logger.error('performanceSummary --->', error);
      throw new ApiResponseBuilder().error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ---------------------------
  // GET ALL REPORTS
  // ---------------------------
  /**
   * Fetches all reports for a user.
   *
   * @param userId - User ID
   * @param filters - Reports filters
   * @returns All reports data
   */

  async getAllReports(userId: string, filters: ReportsStaffQueryDto) {
    logger.info(`getAllReports for user ${userId}...`);

    try {
      if (!userId) {
        throw new BadRequestException('User ID is required for staff reports');
      }

      const [
        cardsData,
        weeklyApprovalsData,
        responseTimeData,
        formBreakdownData,
        performanceData,
      ] = await Promise.all([
        this.getCards(userId, filters),
        this.getWeeklyApprovalsGraph(userId, filters),
        this.getResponseTimeTrend(userId, filters),
        this.formTypeBreakdown(userId, filters),
        this.performanceSummary(userId),
      ]);

      const dashboardCard = cardsData?.data
        ? Object.entries(cardsData.data).map(([key, value]) => {
            if (typeof value === 'object' && value !== null) {
              return {
                key,
                ...value,
              };
            }
            return {
              key,
              value,
            };
          })
        : [];

      const performanceSummary = performanceData?.data
        ? Object.entries(performanceData.data).map(([key, value]) => ({
            key,
            value,
          }))
        : [];

      const response = {
        dashboardCard,
        weeklyFormApprovals: weeklyApprovalsData?.data ?? [],
        responseTimeTrend: responseTimeData?.data ?? [],
        formTypeBreakdown: formBreakdownData?.data ?? [],
        performanceSummary,
      };

      logger.info(`getAllReports ---> ${HttpStatus.OK}`);

      return new ApiResponseBuilder().success(
        response,
        'All staff reports fetched successfully',
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
}