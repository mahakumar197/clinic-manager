import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { ApiResponseBuilder, HttpStatus } from '@pallmall/shared-types';

import { logger } from '@pallmall/logger';

import {
  helpers,
  API_ENDPOINTS,
  FormStatus,
  FormApprovalStatus,
  FormPriority,
  FormFlags,
  FORM_APPROVALS_MESSAGES,
  EscalationHelper,
  EscalationCondition,
  NOTIFICATION_EVENT_TYPE,
  TaskSubmissionType,
  TaskStatusId,
} from '@pallmall/common-utils';

import { FormSubmission } from '../forms/entities/form.submission.entity';
import { FormApproval } from './entities/form-approval.entity';
import { Task } from '../tasks/entities/task.entity';
import { Dropdown } from '../master/entities/dropdown.entity';
import { ApprovalDoctorComment } from './entities/approval-doctor-comments.entity';
import { ApprovalDoctorQuickResponse } from './entities/approval-doctor-quick_response.entity';
import { ApprovalAdminComment } from 'src/approvals-admin/entities/approval-admin-comments.entity';
import {
  FetchQueueDto,
  ReviewSubmissionDto,
  AddCommentsDto,
  AddQuickResponseDto,
  TaskListFiltersDto,
  ApproveOrRejectTaskSubmissionDto,
} from './dto/approval-doctor.dto';
import { TaskUpload } from 'src/tasks/entities/task-upload.entity';
import { TaskSubmission } from 'src/tasks/entities/task-submissions.entity';
import { TaskESignature } from 'src/tasks/entities/task.eSignature.entity';
import { TaskComment } from 'src/tasks/entities/task-comments.entity';

@Injectable()
export class ApprovalDoctorService {
  private escalationHelper: EscalationHelper;

  constructor(
    @InjectRepository(FormSubmission)
    private readonly submissionRepo: Repository<FormSubmission>,
    @InjectRepository(FormApproval)
    private readonly approvalRepo: Repository<FormApproval>,
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
    @InjectRepository(Dropdown)
    private readonly dropdownRepo: Repository<Dropdown>,
    @InjectRepository(ApprovalDoctorComment)
    private readonly commentRepo: Repository<ApprovalDoctorComment>,
    @InjectRepository(ApprovalAdminComment)
    private readonly approvalAdminCommentRepo: Repository<ApprovalAdminComment>,
    @InjectRepository(ApprovalDoctorQuickResponse)
    private readonly quickResponseRepo: Repository<ApprovalDoctorQuickResponse>,
    @InjectRepository(TaskSubmission)
    private readonly taskSubmissionRepo: Repository<TaskSubmission>,
    @InjectRepository(TaskUpload)
    private readonly taskUploadRepo: Repository<TaskUpload>,
    @InjectRepository(TaskESignature)
    private readonly taskESignatureRepo: Repository<TaskESignature>,
    @InjectRepository(TaskComment)
    private readonly taskCommentRepo: Repository<TaskComment>,
    private configService: ConfigService,
    private dataSource: DataSource,
  ) {
    this.escalationHelper = new EscalationHelper();
  }

  async addComments(dto: AddCommentsDto, userId: string) {
    logger.info('addComments (Doctor) --->');
    try {
      const addComment = this.commentRepo.create({
        submission_id: dto.submissionId,
        comment: dto.comment,
        commented_by: userId,
        is_active: true,
      });
      const submission = await this.submissionRepo.findOne({
        where: { id: dto.submissionId },
      });
      if (!submission) {
        throw new NotFoundException('Submission not found');
      }
      if (submission.task_id) {
        const taskComment = this.taskCommentRepo.create({
          task_id: submission.task_id,
          comment: dto.comment,
          commented_by: userId,
          is_active: true,
        });
        await this.taskCommentRepo.save(taskComment);
      }
      await this.commentRepo.save(addComment);
      return new ApiResponseBuilder().success(
        {},
        FORM_APPROVALS_MESSAGES.COMMENT_ADDED,
        HttpStatus.CREATED,
      );
    } catch (error) {
      logger.error('addComments (Doctor) error', error);
      return new ApiResponseBuilder().error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getComments(submissionId: string) {
    logger.info('getComments (Doctor) --->');

    try {
      const doctorComments = await this.commentRepo.find({
        where: { submission_id: submissionId },
      });

      const adminComments = await this.approvalAdminCommentRepo.find({
        where: { submission_id: submissionId },
      });

      const allComments = [...doctorComments, ...adminComments];

      if (!allComments.length) {
        return new ApiResponseBuilder().success(
          [],
          FORM_APPROVALS_MESSAGES.COMMENTS_FETCHED,
          HttpStatus.OK,
        );
      }

      const userIds = [
        ...new Set(
          allComments
            .map((c) => c.commented_by)
            .filter((id): id is string => Boolean(id)),
        ),
      ];

      const uri = this.configService.get('BASE_OPERATIONS');
      const url = API_ENDPOINTS.OPERATIONS_SERVICE.USER_DATA_FETCH;

      const userMap =
        userIds.length > 0
          ? await helpers.fetchUsersByIds(uri, url, userIds)
          : {};

      // Sort combined comments
      const sortedComments = allComments.sort(
        (a, b) =>
          new Date(b.commented_at).getTime() -
          new Date(a.commented_at).getTime(),
      );

      const response = sortedComments.map((comment) => ({
        ...comment,
        commentedByUser: userMap[comment.commented_by] ?? null,
      }));

      return new ApiResponseBuilder().success(
        response,
        FORM_APPROVALS_MESSAGES.COMMENTS_FETCHED,
        HttpStatus.OK,
      );
    } catch (error) {
      logger.error('getComments (Doctor) error', error);

      return new ApiResponseBuilder().error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async addQuickResponse(dto: AddQuickResponseDto, userId: string) {
    logger.info('addQuickResponse (Doctor) --->');
    try {
      const addQuickResponse = this.quickResponseRepo.create({
        submission_id: dto.submissionId,
        quick_response: dto.quickResponse,
        quick_response_by: userId,
        is_active: true,
      });
      await this.quickResponseRepo.save(addQuickResponse);
      return new ApiResponseBuilder().success(
        {},
        FORM_APPROVALS_MESSAGES.QUICK_RESPONSE_ADDED,
        HttpStatus.CREATED,
      );
    } catch (error) {
      logger.error('addQuickResponse (Doctor) error', error);
      return new ApiResponseBuilder().error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getQuickResponse(submissionId: string) {
    logger.info('getQuickResponse (Doctor) --->');

    try {
      const responses = await this.quickResponseRepo.find({
        where: { submission_id: submissionId },
        order: { quick_response_at: 'DESC' },
      });
      if (!responses.length) {
        return new ApiResponseBuilder().success(
          [],
          FORM_APPROVALS_MESSAGES.QUICK_RESPONSE_FETCHED,
          HttpStatus.OK,
        );
      }
      const userIds = [
        ...new Set(
          responses
            .map((r) => r.quick_response_by)
            .filter((id): id is string => Boolean(id)),
        ),
      ];
      const uri = this.configService.get('BASE_OPERATIONS');
      const url = API_ENDPOINTS.OPERATIONS_SERVICE.USER_DATA_FETCH;
      const userMap =
        userIds.length > 0
          ? await helpers.fetchUsersByIds(uri, url, userIds)
          : {};
      const response = responses.map((item) => ({
        ...item,
        quickResponseByUser: userMap[item.quick_response_by] ?? null,
      }));
      return new ApiResponseBuilder().success(
        response,
        FORM_APPROVALS_MESSAGES.QUICK_RESPONSE_FETCHED,
        HttpStatus.OK,
      );
    } catch (error) {
      logger.error('getQuickResponse (Doctor) error', error);
      return new ApiResponseBuilder().error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Fetch Doctor Approvals Queue
   */
  async getApprovalsQueue(doctorId: string, query: FetchQueueDto) {
    logger.info(`getApprovalsQueue for doctor: ${doctorId}`);
    try {
      const tasks = await this.taskRepo.find({
        where: { assigned_to: doctorId },
      });
      if (!tasks.length) {
        throw new NotFoundException('No tasks found for the doctor');
      }
      let statusLabel;
      if (query.status) {
        const label = await this.dropdownRepo.findOne({
          where: { id: query.status },
        });
        statusLabel = label?.beValue;
      }
      let statusFilterValue;
      if (query.statusFilter) {
        const label = await this.dropdownRepo.findOne({
          where: { id: query.statusFilter },
        });
        statusFilterValue = label?.beValue;
      }
      const taskIds = tasks.map((t) => t.id);
      const taskMap = new Map(tasks.map((t) => [t.id, t]));

      const submissionQb = this.submissionRepo
        .createQueryBuilder('submission')
        .leftJoinAndSelect('submission.form', 'form')
        .andWhere('submission.task_id IN (:...taskIds)', { taskIds });
      if (query.date) {
        const startOfDay = new Date(`${query.date}T00:00:00.000`);
        const endOfDay = new Date(`${query.date}T23:59:59.999`);
        submissionQb.andWhere(
          'submission.submitted_at BETWEEN :startOfDay AND :endOfDay',
          { startOfDay, endOfDay },
        );
      }
      let dateFilterLabel: string | null = null;

      if (query.dateFilter) {
        const dropdown = await this.dropdownRepo.findOne({
          where: { id: query.dateFilter },
        });

        dateFilterLabel = dropdown?.beValue || null;
      }

      if (dateFilterLabel || (query.startDate && query.endDate)) {
        const now = new Date();
        let start: Date;
        let end: Date;

        if (dateFilterLabel === 'LAST_30_DAYS') {
          start = new Date();
          start.setDate(now.getDate() - 30);
          start.setHours(0, 0, 0, 0);

          end = new Date();
          end.setHours(23, 59, 59, 999);
        } else if (dateFilterLabel === 'LAST_MONTH') {
          start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          start.setHours(0, 0, 0, 0);

          end = new Date(now.getFullYear(), now.getMonth(), 0);
          end.setHours(23, 59, 59, 999);
        } else if (dateFilterLabel === 'LAST_YEAR') {
          start = new Date(now.getFullYear() - 1, 0, 1);
          start.setHours(0, 0, 0, 0);

          end = new Date(now.getFullYear() - 1, 11, 31);
          end.setHours(23, 59, 59, 999);
        } else if (
          dateFilterLabel === 'CUSTOM_RANGE' &&
          query.startDate &&
          query.endDate
        ) {
          start = new Date(`${query.startDate}T00:00:00.000`);
          end = new Date(`${query.endDate}T23:59:59.999`);
        } else {
          start = null;
          end = null;
        }

        if (start && end) {
          submissionQb.andWhere(
            'submission.submitted_at BETWEEN :start AND :end',
            { start, end },
          );
        }
      }
      const statusMap = {
        Pending: FormStatus.SUBMITTED,
        Approved: FormStatus.APPROVED,
        Rejected: FormStatus.REJECTED,
      };
      const mappedStatus = statusMap[statusFilterValue];
      if (mappedStatus) {
        submissionQb.andWhere('submission.status = :status', {
          status: statusMap[statusFilterValue],
        });
      }
      const submissionsData = await submissionQb.getMany();
      const counts = await this.fetchStatusCounts(taskIds);
      const patientIds = [
        ...new Set(
          tasks
            .map((t) => t.patient_id)
            .filter((id): id is string => Boolean(id)),
        ),
      ];
      const uri = this.configService.get('BASE_OPERATIONS');
      const url = API_ENDPOINTS.OPERATIONS_SERVICE.USER_DATA_FETCH;
      const patientMap =
        patientIds.length > 0
          ? await helpers.fetchUsersByIds(uri, url, patientIds)
          : {};
      let response = submissionsData.map((submission) => {
        const task = submission.task_id
          ? (taskMap.get(submission.task_id) ?? null)
          : null;
        let form_flag: FormFlags;
        if (
          submission.status === FormStatus.APPROVED ||
          submission.status === FormStatus.REJECTED
        ) {
          form_flag = FormFlags.COMPLETED;
        } else if (submission.form?.priority === FormPriority.HIGH) {
          form_flag = FormFlags.URGENT;
        } else {
          form_flag = FormFlags.PENDING;
        }
        return {
          ...submission,
          patient_details: task ? (patientMap[task.patient_id] ?? null) : null,
          form_flag,
        };
      });
      if (statusLabel) {
        response = response.filter((item) => item.form_flag === statusLabel);
      }

      if (query.search) {
        const search = query.search.toLowerCase();
        response = response.filter(
          (item) =>
            item.patient_details?.userName?.toLowerCase().includes(search) ||
            item.form?.name?.toLowerCase().includes(search),
        );
      }
      return new ApiResponseBuilder().success(
        { response, counts },
        FORM_APPROVALS_MESSAGES.SUBMISSIONS_FETCHED,
        HttpStatus.OK,
      );
    } catch (error) {
      logger.error('getApprovalsQueue error', error);
      return new ApiResponseBuilder().error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async fetchApprovalsById(id: string) {
    logger.info('fetchApprovalsById --->');
    try {
      const approval = await this.submissionRepo
        .createQueryBuilder('submission')
        .leftJoinAndSelect('submission.form', 'form')
        .where('submission.id = :id', { id })
        .getOne();

      if (!approval) {
        throw new NotFoundException('Approval not found');
      }
      const task = await this.taskRepo.findOne({
        where: { id: approval.task_id },
      });

      if (!task) {
        throw new NotFoundException('Task not found');
      }
      const patientIds: string[] = [];
      const assignedUserIds: string[] = [];
      if (task.patient_id) patientIds.push(task.patient_id);
      if (task.assigned_to) assignedUserIds.push(task.assigned_to);
      const uri = this.configService.get('BASE_OPERATIONS');
      const url = API_ENDPOINTS.OPERATIONS_SERVICE.USER_DATA_FETCH;
      const patientMap =
        patientIds.length > 0
          ? await helpers.fetchUsersByIds(uri, url, patientIds)
          : {};
      const assignedUserMap =
        assignedUserIds.length > 0
          ? await helpers.fetchUsersByIds(uri, url, assignedUserIds)
          : {};
      const patient = task.patient_id
        ? (patientMap[task.patient_id] ?? null)
        : null;
      const assignee = task.assigned_to
        ? (assignedUserMap[task.assigned_to] ?? null)
        : null;
      let form_flag: FormFlags;
      if (
        approval.status === FormStatus.APPROVED ||
        approval.status === FormStatus.REJECTED
      ) {
        form_flag = FormFlags.COMPLETED;
      } else if (approval.form?.priority === FormPriority.HIGH) {
        form_flag = FormFlags.URGENT;
      } else {
        form_flag = FormFlags.PENDING;
      }
      const response = {
        approval,
        task,
        patient,
        assignee,
        form_flag,
      };
      return new ApiResponseBuilder().success(
        response,
        FORM_APPROVALS_MESSAGES.SUBMISSIONS_FETCHED,
        HttpStatus.OK,
      );
    } catch (error) {
      logger.error('fetchApprovalsById error', error);
      return new ApiResponseBuilder().error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Fetch aggregated submission counts by status
   */
  private async fetchStatusCounts(taskIds: string[]) {
    logger.info('fetchStatusCounts --->');
    try {
      const query = this.submissionRepo
        .createQueryBuilder('submission')
        .leftJoin('submission.form', 'form')
        .select('submission.status', 'status')
        .addSelect('form.priority', 'priority')
        .addSelect('COUNT(submission.id)', 'count')
        .where('submission.task_id IN (:...taskIds)', { taskIds });

      const result = await query
        .groupBy('submission.status')
        .addGroupBy('form.priority')
        .getRawMany();

      const counts = {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        high: 0,
        medium: 0,
        low: 0,
        urgent: 0,
      };

      result.forEach((row) => {
        const count = Number(row.count);
        counts.total += count;

        if (row.status === FormStatus.SUBMITTED) {
          counts.pending += count;
          if (row.priority === FormPriority.HIGH) {
            counts.high += count;
            counts.urgent += count;
          } else if (row.priority === FormPriority.MID) {
            counts.medium += count;
          } else if (row.priority === FormPriority.LOW) {
            counts.low += count;
          }
        } else if (row.status === FormStatus.APPROVED) {
          counts.approved += count;
        } else if (row.status === FormStatus.REJECTED) {
          counts.rejected += count;
        }
      });

      return counts;
    } catch (error) {
      logger.error('fetchStatusCounts error', error);
      return {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        high: 0,
        medium: 0,
        low: 0,
        urgent: 0,
      };
    }
  }

  /**
   * Approve or Reject a submission by Doctor
   */
  async reviewSubmission(dto: ReviewSubmissionDto, doctorId: string) {
    logger.info(`reviewSubmission by ${doctorId} --->`);

    if (dto.status === FormApprovalStatus.PENDING) {
      throw new BadRequestException(
        'Cannot set status back to Pending via review',
      );
    }

    return this.dataSource.transaction(async (manager) => {
      try {
        const existingApproval = await manager.findOne(FormApproval, {
          where: { submission_id: dto.submissionId },
        });

        const approvalData = {
          submission_id: dto.submissionId,
          form_id: dto.formId,
          reviewed_by: doctorId,
          status: dto.status,
          reviewed_at: new Date(),
          approved_at:
            dto.status === FormApprovalStatus.APPROVED ? new Date() : null,
          rejected_at:
            dto.status === FormApprovalStatus.REJECTED ? new Date() : null,
        };

        if (existingApproval) {
          await manager.update(
            FormApproval,
            { submission_id: dto.submissionId },
            approvalData,
          );
        } else {
          const newApproval = manager.create(FormApproval, approvalData);
          await manager.save(newApproval);
        }

        const formStatus =
          dto.status === FormApprovalStatus.APPROVED
            ? FormStatus.APPROVED
            : FormStatus.REJECTED;

        await manager.update(
          FormSubmission,
          { id: dto.submissionId },
          { status: formStatus },
        );

        const submission = await manager.findOne(FormSubmission, {
          where: { id: dto.submissionId },
        });

        if (submission.task_id) {
          const task = await manager.findOne(Task, {
            where: { id: submission.task_id },
          });

          if (!task) {
            throw new NotFoundException(`Task ${submission.task_id} not found`);
          }

          if (task.approved_at || task.rejected_at) {
            const approvedAt = task.approved_at
              ? new Date(task.approved_at)
              : null;
            const rejectedAt = task.rejected_at
              ? new Date(task.rejected_at)
              : null;

            let latestTimestamp: Date | null = null;

            if (approvedAt && rejectedAt) {
              latestTimestamp =
                approvedAt > rejectedAt ? approvedAt : rejectedAt;
            } else {
              latestTimestamp = approvedAt || rejectedAt;
            }

            if (latestTimestamp) {
              const now = new Date();
              const diffInMinutes =
                (now.getTime() - latestTimestamp.getTime()) / (1000 * 60);
              if (diffInMinutes <= 5) {
                throw new ConflictException(
                  'This action was recently performed. Please refresh and try again.',
                );
              }
            }
          }
        }

        if (submission && submission.task_id) {
          let taskUpdate = {};
          if (dto.status === FormApprovalStatus.APPROVED) {
            taskUpdate = {
              is_active: true,
              status: TaskStatusId.COMPLETED,
              is_completed: true,
              is_approved: true,
              approved_by: doctorId,
              approved_at: new Date(),
            };
          } else {
            taskUpdate = {
              is_active: true,
              is_completed: false,
              status: TaskStatusId.PENDING,
              is_approved: false,
              is_rejected: true,
              rejected_by: doctorId,
              rejected_at: new Date(),
            };
          }

          await manager.update(Task, { id: submission.task_id }, taskUpdate);
        }
        if (dto.status === FormApprovalStatus.APPROVED) {
          try {
            const uri = this.configService.get('BASE_OPERATIONS');
            const url = API_ENDPOINTS.OPERATIONS_SERVICE.USER_DATA_FETCH;

            const userMap = await helpers.fetchUsersByIds(uri, url, [
              submission.submitted_by,
            ]);
            await helpers.taskAutomation(
              this.configService.get('BASE_CONTENT'),
              API_ENDPOINTS.CONTENT_SERVICE.TASK_AUTOMATION,
              userMap[submission.submitted_by]?.patient_phase_id,
              submission.submitted_by,
            );
          } catch (err) {
            logger.error('Task automation side-effects failed', err);
          }
        }
        // Trigger escalation if form is rejected (NOT_APPROVED)
        if (dto.status === FormApprovalStatus.REJECTED) {
          let task: any = null;
          if (submission && submission.task_id) {
            task = await manager.findOne(Task, {
              where: { id: submission.task_id },
            });
          }

          await this.escalationHelper.triggerEscalationSafely(
            {
              entityId: dto.submissionId,
              entityType: 'form',
              condition: EscalationCondition.NOT_APPROVED,
              baseTriggerEvent: NOTIFICATION_EVENT_TYPE.FORM_SUBMITTED,
              patientId: task?.patient_id || '',
              patientName: 'Patient', // You can fetch patient name from operations service
              patientReference: task?.patient_id || '',
              metadata: {
                formId: dto.formId,
                submissionId: dto.submissionId,
                rejectedBy: doctorId,
                rejectedAt: new Date().toISOString(),
              },
            },
            logger,
          );
        }
        return new ApiResponseBuilder().success(
          {},
          `Submission ${dto.status.toLowerCase()} successfully`,
          HttpStatus.OK,
        );
      } catch (error) {
        logger.error('reviewSubmission failed', error);
        throw error;
      }
    });
  }

  async fetchTaskSubmissionsWithPatient(
    userId: string,
    query: TaskListFiltersDto,
  ) {
    logger.info('fetchTaskSubmissionsWithPatient --->');
    try {
      const tasks = await this.taskRepo.find({
        where: { assigned_to: userId },
      });
      if (!tasks.length) {
        return new ApiResponseBuilder().success(
          {},
          'No tasks found for the user',
          HttpStatus.OK,
        );
      }
      const taskIds = tasks.map((task) => task.id);
      const { date, taskTypeFilter, search, statusFilter } = query;
      let dropdownValue;
      if (taskTypeFilter) {
        dropdownValue = await this.dropdownRepo.findOne({
          where: { id: taskTypeFilter },
        });
      }
      let statusDropdown;
      if (statusFilter) {
        statusDropdown = await this.dropdownRepo.findOne({
          where: { id: statusFilter },
        });
      }
      let startOfDay: Date | undefined;
      let endOfDay: Date | undefined;
      if (date) {
        startOfDay = new Date(`${date}T00:00:00.000Z`);
        endOfDay = new Date(`${date}T23:59:59.999Z`);
      }
      const countQb = this.taskSubmissionRepo
        .createQueryBuilder('submission')
        .leftJoinAndSelect('submission.task', 'task')
        .where('submission.status IN (:...statuses)', {
          statuses: [
            FormStatus.SUBMITTED,
            FormStatus.APPROVED,
            FormStatus.REJECTED,
          ],
        })
        .andWhere('task.id IN (:...taskIds)', { taskIds });
      const countSource = await countQb.getMany();
      const counts = countSource.reduce(
        (acc, submission) => {
          acc.total += 1;
          if (submission.status === FormStatus.APPROVED) acc.approved += 1;
          else if (submission.status === FormStatus.REJECTED) acc.rejected += 1;
          else acc.pending += 1;
          return acc;
        },
        {
          approved: 0,
          pending: 0,
          rejected: 0,
          total: 0,
        },
      );
      const listQb = this.taskSubmissionRepo
        .createQueryBuilder('submission')
        .leftJoinAndSelect('submission.task', 'task')
        .leftJoinAndSelect('submission.uploads', 'uploads')
        .leftJoinAndSelect('submission.esignatures', 'esignatures')
        .where('submission.status IN (:...statuses)', {
          statuses: [
            FormStatus.SUBMITTED,
            FormStatus.APPROVED,
            FormStatus.REJECTED,
          ],
        })
        .andWhere('task.id IN (:...taskIds)', { taskIds });
      if (taskTypeFilter) {
        listQb.andWhere('submission.type = :taskType', {
          taskType: dropdownValue?.beValue,
        });
      }
      const statusMap = {
        Pending: FormStatus.SUBMITTED,
        Approved: FormStatus.APPROVED,
        Rejected: FormStatus.REJECTED,
      };
      if (statusFilter && statusDropdown?.beValue) {
        const statusValue = statusDropdown.beValue;
        listQb.andWhere('submission.status = :status', {
          status: statusMap[statusValue],
        });
      }
      if (startOfDay && endOfDay) {
        listQb.andWhere(
          'submission.submitted_at BETWEEN :startOfDay AND :endOfDay',
          { startOfDay, endOfDay },
        );
      }
      const submissions = await listQb
        .orderBy('submission.created_at', 'DESC')
        .getMany();
      if (!submissions.length) {
        return new ApiResponseBuilder().success(
          { submissions: [], counts },
          'Task submissions fetched successfully',
          HttpStatus.OK,
        );
      }
      const patientIds = [
        ...new Set(
          submissions
            .map((s) => s.submitted_by)
            .filter((id): id is string => Boolean(id)),
        ),
      ];
      const uri = this.configService.get('BASE_OPERATIONS');
      const url = API_ENDPOINTS.OPERATIONS_SERVICE.USER_DATA_FETCH;
      const userMap =
        patientIds.length > 0
          ? await helpers.fetchUsersByIds(uri, url, patientIds)
          : {};
      let response = submissions.map((submission) => ({
        ...submission,
        patient: submission.submitted_by
          ? (userMap[submission.submitted_by] ?? null)
          : null,
      }));
      if (search) {
        const keyword = search.toLowerCase();
        response = response.filter(
          (item) =>
            item.task?.task_name?.toLowerCase().includes(keyword) ||
            item.patient?.userName?.toLowerCase().includes(keyword),
        );
      }
      return new ApiResponseBuilder().success(
        { submissions: response, counts },
        'Task submissions fetched successfully',
        HttpStatus.OK,
      );
    } catch (error) {
      logger.error('fetchTaskSubmissionsWithPatient --->', error);
      return new ApiResponseBuilder().error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async fetchTaskSubmissionDetailsById(taskSubmissionId: string) {
    logger.info('fetchTaskSubmissionDetailsById --->');
    try {
      if (!taskSubmissionId) {
        throw new BadRequestException('Task Submission ID required.');
      }
      const submission = await this.taskSubmissionRepo
        .createQueryBuilder('submission')
        .leftJoinAndSelect('submission.task', 'task')
        .leftJoinAndSelect('submission.uploads', 'uploads')
        .leftJoinAndSelect('submission.esignatures', 'esignatures')
        .where('submission.id = :id', { id: taskSubmissionId })
        .getOne();
      if (!submission) {
        throw new NotFoundException('Task submission not found');
      }
      const task = submission.task ?? null;
      const userIds = [
        task?.patient_id,
        task?.assigned_to,
        submission.submitted_by,
      ].filter((id): id is string => Boolean(id));
      const uri = this.configService.get('BASE_OPERATIONS');
      const url = API_ENDPOINTS.OPERATIONS_SERVICE.USER_DATA_FETCH;
      const userMap =
        userIds.length > 0
          ? await helpers.fetchUsersByIds(uri, url, userIds)
          : {};
      const response = {
        ...submission,
        task,
        uploads: submission.uploads || [],
        esignatures: submission.esignatures || [],
        patient: task?.patient_id ? (userMap[task.patient_id] ?? null) : null,
        assigned_to_user: task?.assigned_to
          ? (userMap[task.assigned_to] ?? null)
          : null,
        submitted_by_user: submission.submitted_by
          ? (userMap[submission.submitted_by] ?? null)
          : null,
      };
      logger.info(`fetchTaskSubmissionDetailsById ---> ${HttpStatus.OK}`);
      return new ApiResponseBuilder().success(
        response,
        'Task submission details fetched successfully',
        HttpStatus.OK,
      );
    } catch (error) {
      logger.error('fetchTaskSubmissionDetailsById --->', error);
      return new ApiResponseBuilder().error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async fetchTaskSubmissionAssetDetailsById(taskSubmissionId: string) {
    logger.info('fetchTaskSubmissionAssetDetailsById --->', {
      taskSubmissionId,
    });

    try {
      if (!taskSubmissionId) {
        throw new BadRequestException('Task submission ID is required.');
      }

      const submission = await this.taskSubmissionRepo
        .createQueryBuilder('submission')
        .leftJoinAndSelect('submission.task', 'task')
        .where('submission.id = :id', { id: taskSubmissionId })
        .getOne();

      if (!submission) {
        throw new NotFoundException('Task submission not found');
      }

      let assets: any[] = [];

      if (submission.type === TaskSubmissionType.FILE_UPLOAD) {
        assets = await this.taskUploadRepo.find({
          where: {
            submission: { id: submission.id },
            is_active: true,
          },
          order: { uploaded_at: 'DESC' },
        });
      }

      if (submission.type === TaskSubmissionType.E_SIGNATURE) {
        assets = await this.taskESignatureRepo.find({
          where: {
            submission: { id: submission.id },
          },
          order: { created_at: 'DESC' },
        });
      }
      let file_url;
      if (submission.type === TaskSubmissionType.E_SIGNATURE) {
        file_url = await helpers.getFileUrlFromAzure(
          assets[0].signature.trim(),
        );
      }
      if (submission.type === TaskSubmissionType.FILE_UPLOAD) {
        file_url = await helpers.getFileUrlFromAzure(
          assets[0].file_content.trim(),
        );
      }
      assets[0].file_url = file_url;
      const response = {
        submission,
        type: submission.type,
        assets,
      };

      return new ApiResponseBuilder().success(
        response,
        'Task submission assets fetched successfully',
        HttpStatus.OK,
      );
    } catch (error) {
      logger.error('fetchTaskSubmissionAssetDetailsById --->', error);
      return new ApiResponseBuilder().error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async addCommentsForTaskUpload(dto: AddCommentsDto, userId: string) {
    logger.info('addComments --->');
    console.log('userId', userId);
    try {
      const addComment = await this.commentRepo.create({
        task_submission_id: dto.submissionId,
        comment: dto.comment,
        commented_by: userId,
        is_active: true,
      });
      await this.commentRepo.save(addComment);
      const submission = await this.taskSubmissionRepo.findOne({
        where: { id: dto.submissionId },
      });
      if (!submission) {
        throw new NotFoundException('Submission not found');
      }
      if (submission.task_id) {
        const taskComment = this.taskCommentRepo.create({
          task_id: submission.task_id,
          comment: dto.comment,
          commented_by: userId,
          is_active: true,
        });
        await this.taskCommentRepo.save(taskComment);
      }
      return new ApiResponseBuilder().success(
        {},
        FORM_APPROVALS_MESSAGES.COMMENT_ADDED,
        HttpStatus.CREATED,
      );
    } catch (error) {
      logger.error('addComments --->', error);
      return new ApiResponseBuilder().error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async approveOrRejectSubmissionForTaskUpload(
    dto: ApproveOrRejectTaskSubmissionDto,
    userId: string,
  ) {
    logger.info('approveOrRejectSubmission --->');

    if (dto.isApproved === dto.isRejected) {
      throw new BadRequestException(
        'Either approve or reject must be true, not both',
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const submission = await queryRunner.manager.findOne(TaskSubmission, {
        where: { id: dto.submissionId },
        relations: ['task'],
      });

      if (!submission) {
        throw new NotFoundException(
          `Task submission ${dto.submissionId} not found`,
        );
      }

      if (submission.task_id) {
        const task = await queryRunner.manager.findOne(Task, {
          where: { id: submission.task_id },
        });

        if (!task) {
          throw new NotFoundException(`Task ${submission.task_id} not found`);
        }

        if (task.approved_at || task.rejected_at) {
          const approvedAt = task.approved_at
            ? new Date(task.approved_at)
            : null;
          const rejectedAt = task.rejected_at
            ? new Date(task.rejected_at)
            : null;

          let latestTimestamp: Date | null = null;

          if (approvedAt && rejectedAt) {
            latestTimestamp = approvedAt > rejectedAt ? approvedAt : rejectedAt;
          } else {
            latestTimestamp = approvedAt || rejectedAt;
          }

          if (latestTimestamp) {
            const now = new Date();
            const diffInMinutes =
              (now.getTime() - latestTimestamp.getTime()) / (1000 * 60);
            if (diffInMinutes <= 5) {
              throw new ConflictException(
                'This action was recently performed. Please refresh and try again.',
              );
            }
          }
        }
      }

      const existingApproval = await queryRunner.manager.findOne(FormApproval, {
        where: { submission_id: dto.submissionId },
      });

      if (existingApproval) {
        await queryRunner.manager.update(
          FormApproval,
          { submission_id: dto.submissionId },
          {
            task_id: dto.taskId,
            status: dto.isApproved
              ? FormApprovalStatus.APPROVED
              : FormApprovalStatus.REJECTED,
            reviewed_by: userId,
            reviewed_at: new Date(),
          },
        );
      } else {
        const approval = queryRunner.manager.create(FormApproval, {
          task_id: dto.taskId,
          submission_id: dto.submissionId,
          status: dto.isApproved
            ? FormApprovalStatus.APPROVED
            : FormApprovalStatus.REJECTED,
          reviewed_by: userId,
          reviewed_at: new Date(),
        });

        await queryRunner.manager.save(approval);
      }

      await queryRunner.manager.update(
        TaskSubmission,
        { id: dto.submissionId },
        {
          status: dto.isApproved ? FormStatus.APPROVED : FormStatus.REJECTED,
        },
      );

      if (submission.task.id) {
        let taskUpdate = {};
        if (dto.isApproved) {
          taskUpdate = {
            is_active: true,
            is_completed: true,
            status: TaskStatusId.COMPLETED,
            is_approved: dto.isApproved ? true : false,
            approved_by: userId,
            approved_at: new Date(),
          };
        } else {
          taskUpdate = {
            is_active: true,
            is_completed: false,
            status: TaskStatusId.PENDING,
            is_approved: dto.isApproved ? true : false,
            is_rejected: dto.isRejected ? true : false,
            rejected_by: userId,
            rejected_at: new Date(),
          };
        }

        await queryRunner.manager.update(
          Task,
          { id: submission.task.id },
          taskUpdate,
        );
      }

      await queryRunner.commitTransaction();
      if (dto.isApproved) {
        try {
          const uri = this.configService.get('BASE_OPERATIONS');
          const url = API_ENDPOINTS.OPERATIONS_SERVICE.USER_DATA_FETCH;

          const userMap = await helpers.fetchUsersByIds(uri, url, [
            submission.submitted_by,
          ]);
          await helpers.taskAutomation(
            this.configService.get('BASE_CONTENT'),
            API_ENDPOINTS.CONTENT_SERVICE.TASK_AUTOMATION,
            userMap[submission.submitted_by]?.patient_phase_id,
            submission.submitted_by,
          );
        } catch (err) {
          logger.error('Task automation side-effects failed', err);
        }
      }
      // Trigger escalation if form is rejected (NOT_APPROVED)
      if (dto.isRejected) {
        const task = await this.taskRepo.findOne({
          where: { id: submission.task.id },
        });

        logger.info('Triggering escalation for NOT_APPROVED form submission', {
          submissionId: dto.submissionId,
          taskId: dto.taskId,
          rejectedBy: userId,
          patientId: task?.patient_id,
        });

        await this.escalationHelper.triggerEscalationSafely(
          {
            entityId: dto.submissionId,
            entityType: 'form',
            condition: EscalationCondition.NOT_APPROVED,
            baseTriggerEvent: NOTIFICATION_EVENT_TYPE.FORM_SUBMITTED,
            patientId: task?.patient_id,
            patientName: 'Patient', // You can fetch patient name from operations service
            patientReference: task?.patient_id,
            metadata: {
              taskId: dto.taskId,
              submissionId: dto.submissionId,
              rejectedBy: userId,
              rejectedAt: new Date().toISOString(),
            },
          },
          logger,
        );

        logger.info('Escalation triggered successfully for submission', {
          submissionId: dto.submissionId,
        });
      }
      return new ApiResponseBuilder().success(
        {},
        FORM_APPROVALS_MESSAGES.FORM_STATUS_UPDATED,
        HttpStatus.OK,
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      logger.error('approveOrRejectSubmission --->', error);

      return new ApiResponseBuilder().error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async getTaskUploadComments(taskSubmissionId: string) {
    logger.info('getTaskUploadComments --->');

    try {
      if (!taskSubmissionId) {
        throw new BadRequestException('Task Submission ID required.');
      }

      const adminComments = await this.approvalAdminCommentRepo.find({
        where: { task_submission_id: taskSubmissionId },
      });

      const doctorComments = await this.commentRepo.find({
        where: { task_submission_id: taskSubmissionId },
      });
      console.log('adminComments', adminComments);
      console.log('doctorComments', doctorComments);
      const allComments = [...adminComments, ...doctorComments];

      if (!allComments.length) {
        throw new NotFoundException(`Task ${taskSubmissionId} not found`);
      }

      const userIds = [
        ...new Set(
          allComments
            .map((c) => c.commented_by)
            .filter((id): id is string => Boolean(id)),
        ),
      ];

      const uri = this.configService.get('BASE_OPERATIONS');
      const url = API_ENDPOINTS.OPERATIONS_SERVICE.USER_DATA_FETCH;

      const userMap =
        userIds.length > 0
          ? await helpers.fetchUsersByIds(uri, url, userIds)
          : {};
      const sortedComments = allComments.sort(
        (a, b) =>
          new Date(b.commented_at).getTime() -
          new Date(a.commented_at).getTime(),
      );

      const response = sortedComments.map((comment) => ({
        ...comment,
        commentedByUser: userMap[comment.commented_by] ?? null,
      }));

      logger.info(`getTaskUploadComments ---> ${HttpStatus.OK}`);

      return new ApiResponseBuilder().success(
        response,
        'Task upload comments fetched successfully',
        HttpStatus.OK,
      );
    } catch (error) {
      logger.error('getTaskUploadComments --->', error);

      return new ApiResponseBuilder().error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}