import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Task } from '../entities/task.entity';
import { ApiResponseBuilder, HttpStatus } from '@pallmall/shared-types';
import { logger } from '@pallmall/logger';

@Injectable()
export class TaskAnalyticsService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  /**
   * Get task analytics/metrics for dashboard
   * - Total Approvals: This month vs last month
   * - This Week: This week vs last week
   * - Avg Response Time: This month vs last month (whole)
   * - Outstanding Forms: Current count (no comparison)
   */
  async getTaskMetrics() {
    logger.info('getTaskMetrics --->');
    try {
      const now = new Date();

      // Date ranges for This Month vs Last Month (Total Approvals)
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const thisMonthEnd = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
        999,
      );
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(
        now.getFullYear(),
        now.getMonth(),
        0,
        23,
        59,
        59,
        999,
      );

      // Date ranges for This Week vs Last Week
      const thisWeekStart = new Date(now);
      thisWeekStart.setDate(now.getDate() - now.getDay() + 1); // Monday
      thisWeekStart.setHours(0, 0, 0, 0);
      const thisWeekEnd = new Date(now);
      thisWeekEnd.setHours(23, 59, 59, 999);

      const lastWeekStart = new Date(thisWeekStart);
      lastWeekStart.setDate(lastWeekStart.getDate() - 7);
      const lastWeekEnd = new Date(thisWeekStart);
      lastWeekEnd.setMilliseconds(lastWeekEnd.getMilliseconds() - 1);

      // 1. TOTAL APPROVALS - This month vs Last month
      const totalApprovals = await this.taskRepository.count({
        where: {
          is_approved: true,
          approved_at: Between(thisMonthStart, thisMonthEnd),
          is_active: true,
        },
      });

      const lastMonthApprovals = await this.taskRepository.count({
        where: {
          is_approved: true,
          approved_at: Between(lastMonthStart, lastMonthEnd),
          is_active: true,
        },
      });

      const approvalsPercentageChange = this.calculatePercentageChange(
        totalApprovals,
        lastMonthApprovals,
      );

      // 2. THIS WEEK - This week vs Last week
      const thisWeekApprovals = await this.taskRepository.count({
        where: {
          is_approved: true,
          approved_at: Between(thisWeekStart, thisWeekEnd),
          is_active: true,
        },
      });

      const lastWeekApprovals = await this.taskRepository.count({
        where: {
          is_approved: true,
          approved_at: Between(lastWeekStart, lastWeekEnd),
          is_active: true,
        },
      });

      const weekPercentageChange = this.calculatePercentageChange(
        thisWeekApprovals,
        lastWeekApprovals,
      );

      // 3. AVERAGE RESPONSE TIME - This month vs Last month (whole)
      const thisMonthApprovedTasks = await this.taskRepository.find({
        where: {
          is_approved: true,
          approved_at: Between(thisMonthStart, thisMonthEnd),
          is_active: true,
        },
        select: ['created_at', 'approved_at'],
      });

      let avgResponseTimeHours = 0;
      if (thisMonthApprovedTasks.length > 0) {
        const totalResponseTime = thisMonthApprovedTasks.reduce((sum, task) => {
          const createdAt = new Date(task.created_at).getTime();
          const approvedAt = new Date(task.approved_at).getTime();
          return sum + (approvedAt - createdAt);
        }, 0);

        const avgResponseTimeMs =
          totalResponseTime / thisMonthApprovedTasks.length;
        avgResponseTimeHours = Math.round(avgResponseTimeMs / (1000 * 60 * 60)); // Whole number hours
      }

      // Last month's average response time
      const lastMonthApprovedTasks = await this.taskRepository.find({
        where: {
          is_approved: true,
          approved_at: Between(lastMonthStart, lastMonthEnd),
          is_active: true,
        },
        select: ['created_at', 'approved_at'],
      });

      let lastMonthAvgResponseTimeHours = 0;
      if (lastMonthApprovedTasks.length > 0) {
        const totalResponseTime = lastMonthApprovedTasks.reduce((sum, task) => {
          const createdAt = new Date(task.created_at).getTime();
          const approvedAt = new Date(task.approved_at).getTime();
          return sum + (approvedAt - createdAt);
        }, 0);

        const avgResponseTimeMs =
          totalResponseTime / lastMonthApprovedTasks.length;
        lastMonthAvgResponseTimeHours = Math.round(
          avgResponseTimeMs / (1000 * 60 * 60),
        );
      }

      const responseTimePercentageChange = this.calculatePercentageChange(
        avgResponseTimeHours,
        lastMonthAvgResponseTimeHours,
      );

      // 4. OUTSTANDING FORMS - Current count (no comparison)
      const outstandingForms = await this.taskRepository.count({
        where: {
          is_completed: false,
          is_active: true,
        },
      });

      // Build response
      const metrics = {
        totalApprovals: {
          total: totalApprovals,
          percentageChange: approvalsPercentageChange,
          comparisonPeriod: 'vs last month',
        },
        thisWeek: {
          total: thisWeekApprovals,
          percentageChange: weekPercentageChange,
          comparisonPeriod: 'vs last week',
        },
        avgResponseTime: {
          averageHours: avgResponseTimeHours,
          percentageChange: responseTimePercentageChange,
          comparisonPeriod: 'vs last month',
        },
        outstandingForms: {
          total: outstandingForms,
          status: 'Awaiting review',
        },
      };

      logger.info('Task metrics fetched successfully');
      return new ApiResponseBuilder().success(
        metrics,
        'Task metrics fetched successfully',
        HttpStatus.OK,
      );
    } catch (error) {
      logger.error('Error fetching task metrics:', error);
      return new ApiResponseBuilder().error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Helper: Calculate percentage change between current and previous value
   */
  private calculatePercentageChange(current: number, previous: number): number {
    logger.debug('calculatePercentageChange --->');
    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }
    return parseFloat((((current - previous) / previous) * 100).toFixed(1));
  }
}