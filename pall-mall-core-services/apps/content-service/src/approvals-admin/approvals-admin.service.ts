import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AddCommentsDto,
  ApproveOrRejectTaskSubmissionDto,
  FormListFiltersDto,
  TaskListFiltersDto,
} from './dto/approvals-admin.dto';
import { logger } from '@pallmall/logger';
import { FormSubmission } from 'src/forms/entities/form.submission.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApprovalsAdmin } from './entities/approvals-admin.entity';
import { ApiResponseBuilder, HttpStatus } from '@pallmall/shared-types';
import {
  FormStatus,
  FORM_APPROVALS_MESSAGES,
  DateFilterType,
  FormPriority,
  EscalationHelper,
  EscalationCondition,
  NOTIFICATION_EVENT_TYPE,
  TaskSubmissionType,
  TaskStatusId,
} from '@pallmall/common-utils';
import { Task } from 'src/tasks/entities/task.entity';
import { In, DataSource } from 'typeorm';
import { helpers, API_ENDPOINTS } from '@pallmall/common-utils';
import { ConfigService } from '@nestjs/config';
import { ApproveOrRejectSubmissionDto } from './dto/approvals-admin.dto';
import { Dropdown } from '../master/entities/dropdown.entity';
import { ApprovalAdminComment } from './entities/approval-admin-comments.entity';
import { TaskSubmission } from 'src/tasks/entities/task-submissions.entity';
import { TaskUpload } from 'src/tasks/entities/task-upload.entity';
import { TaskESignature } from 'src/tasks/entities/task.eSignature.entity';
import { FormSubmissionService } from 'src/forms/services/form.submission.service';
import { TaskComment } from 'src/tasks/entities/task-comments.entity';
import { ApprovalDoctorComment } from 'src/approval-doctor/entities/approval-doctor-comments.entity';

@Injectable()
export class ApprovalsAdminService {
  private escalationHelper: EscalationHelper;

  constructor(
    @InjectRepository(FormSubmission)
    private readonly formSubmissionRepository: Repository<FormSubmission>,
    @InjectRepository(ApprovalsAdmin)
    private readonly approvalsAdminRepository: Repository<ApprovalsAdmin>,
    @InjectRepository(Task)
    private readonly tasksRepo: Repository<Task>,
    @InjectRepository(Dropdown)
    private readonly dropdownRepo: Repository<Dropdown>,
    @InjectRepository(ApprovalAdminComment)
    private readonly approvalAdminCommentRepo: Repository<ApprovalAdminComment>,
    @InjectRepository(TaskSubmission)
    private readonly taskSubmissionRepo: Repository<TaskSubmission>,
    @InjectRepository(TaskUpload)
    private readonly taskUploadRepo: Repository<TaskUpload>,
    @InjectRepository(TaskESignature)
    private readonly taskESignatureRepo: Repository<TaskESignature>,
    @InjectRepository(TaskComment)
    private readonly taskCommentRepo: Repository<TaskComment>,
    @InjectRepository(ApprovalDoctorComment)
    private readonly approvalDoctorCommentRepo: Repository<ApprovalDoctorComment>,
    private readonly formSubmissionService: FormSubmissionService,
    private configService: ConfigService,
    private dataSource: DataSource,
  ) {
    this.escalationHelper = new EscalationHelper();
  }

  async addComments(dto: AddCommentsDto, userId: string) {
    logger.info('addComments --->');
    console.log('userId', userId);
    try {
      const addComment = await this.approvalAdminCommentRepo.create({
        submission_id: dto.submissionId,
        comment: dto.comment,
        commented_by: userId,
        is_active: true,
      });
      await this.approvalAdminCommentRepo.save(addComment);
      const submission = await this.formSubmissionRepository.findOne({
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

  async getComments(submissionId: string) {
    logger.info('fetchComments --->');

    try {
      const comments = await this.approvalAdminCommentRepo.find({
        where: { submission_id: submissionId },
        order: { commented_at: 'DESC' },
      });

      const doctorComments = await this.approvalDoctorCommentRepo.find({
        where: { submission_id: submissionId },
        order: { commented_at: 'DESC' },
      });

      // combine
      const allComments = [...comments, ...doctorComments];

      if (!allComments.length) {
        return new ApiResponseBuilder().success(
          [],
          FORM_APPROVALS_MESSAGES.COMMENTS_FETCHED,
          HttpStatus.OK,
        );
      }

      // fetch users
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

      // GLOBAL SORT AFTER MERGE
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
      logger.error('fetchComments --->', error);

      return new ApiResponseBuilder().error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async fetchSubmissionsWithPatient(query: FormListFiltersDto) {
    logger.info('fetchSubmissionsWithPatient --->');
    try {
      const {
        dateFilter,
        formPriority,
        search,
        statusFilter,
        startDate,
        endDate,
      } = query;
      let dropdownValue;
      let priorityValue;
      let statusValue;
      if (dateFilter) {
        dropdownValue = await this.dropdownRepo.findOne({
          where: { id: dateFilter },
        });
      }
      if (formPriority) {
        const priority = await this.dropdownRepo.findOne({
          where: { id: formPriority },
        });
        priorityValue = priority?.beValue;
      }
      if (statusFilter) {
        const status = await this.dropdownRepo.findOne({
          where: { id: statusFilter },
        });
        statusValue = status?.beValue;
      }
      const { startOfDay, endOfDay } = this.getDateRangeFromFilter(
        dropdownValue,
        startDate,
        endDate,
      );
      const countQb = this.formSubmissionRepository
        .createQueryBuilder('submission')
        .leftJoinAndSelect('submission.form', 'form')
        .where('submission.status IN (:...statuses)', {
          statuses: [
            FormStatus.SUBMITTED,
            FormStatus.APPROVED,
            FormStatus.REJECTED,
          ],
        });
      const countSource = await countQb.getMany();
      const counts = countSource.reduce(
        (acc, submission) => {
          acc.total += 1;
          if (submission.status === FormStatus.APPROVED) {
            acc.approved += 1;
            return acc;
          }
          if (submission.status === FormStatus.REJECTED) {
            acc.rejected += 1;
            return acc;
          }
          acc.pending += 1;

          switch (submission.form?.priority) {
            case FormPriority.HIGH:
              acc.high += 1;
              acc.urgent += 1;
              break;
            case FormPriority.MID:
              acc.mid += 1;
              acc.medium += 1;
              break;
            case FormPriority.LOW:
              acc.low += 1;
              break;
          }
          return acc;
        },
        {
          approved: 0,
          pending: 0,
          rejected: 0,
          high: 0,
          mid: 0,
          medium: 0,
          low: 0,
          urgent: 0,
          total: 0,
        },
      );
      const listQb = this.formSubmissionRepository
        .createQueryBuilder('submission')
        .leftJoinAndSelect('submission.form', 'form')
        .where('submission.status IN (:...statuses)', {
          statuses: [
            FormStatus.SUBMITTED,
            FormStatus.APPROVED,
            FormStatus.REJECTED,
          ],
        });
      if (startOfDay && endOfDay) {
        listQb.andWhere(
          'submission.submitted_at BETWEEN :startOfDay AND :endOfDay',
          { startOfDay, endOfDay },
        );
      }
      if (priorityValue) {
        listQb.andWhere('form.priority = :priorityValue', { priorityValue });
      }
      if (statusValue) {
        if (statusValue === 'Pending') {
          listQb.andWhere('submission.status = :pendingStatus', {
            pendingStatus: FormStatus.SUBMITTED,
          });
        } else {
          listQb.andWhere('submission.status = :statusValue', {
            statusValue,
          });
        }
      }
      const submissions = await listQb
        .orderBy('submission.created_at', 'DESC')
        .getMany();
      if (!submissions.length) {
        return new ApiResponseBuilder().success(
          { submissions: [], counts },
          FORM_APPROVALS_MESSAGES.SUBMISSIONS_FETCHED,
          HttpStatus.OK,
        );
      }
      const taskIds = [
        ...new Set(
          submissions
            .map((s) => s.task_id)
            .filter((id): id is string => Boolean(id)),
        ),
      ];
      const tasks = taskIds.length
        ? await this.tasksRepo.find({ where: { id: In(taskIds) } })
        : [];
      const taskMap = new Map(tasks.map((t) => [t.id, t]));
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
      let response = await Promise.all(
        submissions.map(async (submission) => {
          const task = submission.task_id
            ? (taskMap.get(submission.task_id) ?? null)
            : null;

          let patient = submission.submitted_by
            ? (userMap[submission.submitted_by] ?? null)
            : null;

          if (submission.is_guest) {
            const guestSubmission =
              await this.formSubmissionService.getFormSubmissions(
                submission.form.id,
                submission.id,
              );
            const answers = guestSubmission?.data?.[0]?.answers ?? [];

            const getAnswer = (keywords: string[]) =>
              answers.find((a) =>
                keywords.some((k) =>
                  a.question?.toLowerCase().includes(k.toLowerCase()),
                ),
              )?.answer?.[0] ?? null;

            const firstName = getAnswer(['first name']);
            const lastName = getAnswer(['last name']);
            const email = getAnswer(['email']);
            const phoneNumber = getAnswer(['phone']);
            patient = {
              id: null,
              userName: firstName + ' ' + lastName,
              email: email ?? null,
              phoneNumber: phoneNumber ?? null,
              role: 'GUEST',
            };
          }

          return {
            ...submission,
            task,
            patient,
          };
        }),
      );
      if (search) {
        const keyword = search.toLowerCase().trim();

        response = response.filter((item) => {
          const formName = item.form?.name?.toLowerCase().trim() ?? '';

          const userName =
            item.patient?.userName?.toLowerCase().trim() ??
            (item.is_guest ? 'guest user' : '');

          return formName.includes(keyword) || userName.includes(keyword);
        });
      }
      return new ApiResponseBuilder().success(
        { submissions: response, counts },
        FORM_APPROVALS_MESSAGES.SUBMISSIONS_FETCHED,
        HttpStatus.OK,
      );
    } catch (error) {
      logger.error('fetchSubmissionsWithPatient --->', error);
      return new ApiResponseBuilder().error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async fetchSubmissionDetailsById(submissionId: string) {
    logger.info('fetchSubmissionDetailsById --->');

    try {
      if (!submissionId) {
        throw new BadRequestException('Submission ID required.');
      }

      const submission = await this.formSubmissionRepository
        .createQueryBuilder('submission')
        .leftJoinAndSelect('submission.form', 'form')
        .where('submission.id = :id', { id: submissionId })
        .getOne();

      if (!submission) {
        throw new NotFoundException(
          FORM_APPROVALS_MESSAGES.SUBMISSION_NOT_FOUND,
        );
      }

      const task = submission.task_id
        ? await this.tasksRepo.findOne({
            where: { id: submission.task_id },
          })
        : null;

      const userIds = [submission?.submitted_by, task?.assigned_to].filter(
        (id): id is string => Boolean(id),
      );

      const uri = this.configService.get('BASE_OPERATIONS');
      const url = API_ENDPOINTS.OPERATIONS_SERVICE.USER_DATA_FETCH;

      const userMap =
        userIds.length > 0
          ? await helpers.fetchUsersByIds(uri, url, userIds)
          : {};

      let response = {};
      if (submission.submitted_by) {
        response = {
          ...submission,
          task,
          patient: submission.submitted_by
            ? (userMap[submission.submitted_by] ?? null)
            : null,
          assigned_to_user: task ? (userMap[task.assigned_to] ?? null) : null,
        };
      } else {
        const guestSubmission =
          await this.formSubmissionService.getFormSubmissions(
            submission.form.id,
            submission.id,
          );
        const answers = guestSubmission?.data?.[0]?.answers ?? [];

        const getAnswer = (keywords: string[]) =>
          answers.find((a) =>
            keywords.some((k) =>
              a.question?.toLowerCase().includes(k.toLowerCase()),
            ),
          )?.answer?.[0] ?? null;

        const firstName = getAnswer(['first name']);
        const lastName = getAnswer(['last name']);
        const email = getAnswer(['email']);
        const phoneNumber = getAnswer(['phone']);
        let patient = {
          id: null,
          userName: firstName + ' ' + lastName,
          email: email ?? null,
          phoneNumber: phoneNumber ?? null,
          role: 'GUEST',
        };
        response = {
          ...submission,
          task,
          patient,
          assigned_to_user: task ? (userMap[task.assigned_to] ?? null) : null,
        };
      }

      logger.info(`fetchSubmissionDetailsById ---> ${HttpStatus.OK}`);

      return new ApiResponseBuilder().success(
        response,
        FORM_APPROVALS_MESSAGES.SUBMISSIONS_FETCHED,
        HttpStatus.OK,
      );
    } catch (error) {
      logger.error('fetchSubmissionDetailsById --->', error);

      return new ApiResponseBuilder().error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async approveOrRejectSubmission(
    dto: ApproveOrRejectSubmissionDto,
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
      const submission = await queryRunner.manager.findOne(FormSubmission, {
        where: { id: dto.submissionId },
      });

      if (!submission) {
        throw new NotFoundException(`Submission ${dto.submissionId} not found`);
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

      const existingApproval = await queryRunner.manager.findOne(
        ApprovalsAdmin,
        {
          where: { submission_id: dto.submissionId },
        },
      );

      if (existingApproval) {
        await queryRunner.manager.update(
          ApprovalsAdmin,
          { submission_id: dto.submissionId },
          {
            form_id: dto.formId,
            is_approved: dto.isApproved,
            is_rejected: dto.isRejected,
            action_by: userId,
            action_at: new Date(),
          },
        );
      } else {
        const approval = queryRunner.manager.create(ApprovalsAdmin, {
          form_id: dto.formId,
          submission_id: dto.submissionId,
          is_approved: dto.isApproved,
          is_rejected: dto.isRejected,
          action_by: userId,
          action_at: new Date(),
        });

        await queryRunner.manager.save(approval);
      }

      await queryRunner.manager.update(
        FormSubmission,
        { id: dto.submissionId },
        {
          status: dto.isApproved ? FormStatus.APPROVED : FormStatus.REJECTED,
        },
      );

      if (submission.task_id) {
        let taskUpdate = {};
        if (dto.isApproved) {
          taskUpdate = {
            is_active: true,
            status: TaskStatusId.COMPLETED,
            is_completed: true,
            is_approved: true,
            is_rejected: false,
            rejected_by: null,
            rejected_at: null,
            approved_by: userId,
            approved_at: new Date(),
          };
        } else {
          taskUpdate = {
            is_active: true,
            status: TaskStatusId.PENDING,
            is_completed: false,
            is_approved: false,
            is_rejected: true,
            rejected_by: userId,
            rejected_at: new Date(),
          };
        }

        await queryRunner.manager.update(
          Task,
          { id: submission.task_id },
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
        const task = await this.tasksRepo.findOne({
          where: { id: submission.task_id },
        });

        logger.info('Triggering escalation for NOT_APPROVED form submission', {
          submissionId: dto.submissionId,
          formId: dto.formId,
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
              formId: dto.formId,
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
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async fetchTaskSubmissionsWithPatient(query: TaskListFiltersDto) {
    logger.info('fetchTaskSubmissionsWithPatient --->');
    try {
      const {
        taskTypeFilter,
        search,
        statusFilter,
        dateFilter,
        startDate,
        endDate,
      } = query;
      let dropdownValue;
      let statusValue;
      let dateFilterValue;
      if (taskTypeFilter) {
        dropdownValue = await this.dropdownRepo.findOne({
          where: { id: taskTypeFilter },
        });
      }
      if (statusFilter) {
        const status = await this.dropdownRepo.findOne({
          where: { id: statusFilter },
        });
        statusValue = status?.beValue;
      }
      if (dateFilter) {
        dateFilterValue = await this.dropdownRepo.findOne({
          where: { id: dateFilter },
        });
      }
      const { startOfDay, endOfDay } = this.getDateRangeFromFilter(
        dateFilterValue,
        startDate,
        endDate,
      );
      const countQb = this.taskSubmissionRepo
        .createQueryBuilder('submission')
        .leftJoinAndSelect('submission.task', 'task')
        .where('submission.status IN (:...statuses)', {
          statuses: [
            FormStatus.SUBMITTED,
            FormStatus.APPROVED,
            FormStatus.REJECTED,
          ],
        });
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
        });
      if (taskTypeFilter) {
        listQb.andWhere('submission.type = :taskType', {
          taskType: dropdownValue?.beValue,
        });
      }
      if (statusValue) {
        let mappedStatus;
        if (statusValue.toUpperCase() === 'PENDING') {
          mappedStatus = FormStatus.SUBMITTED;
        } else if (statusValue.toUpperCase() === 'APPROVED') {
          mappedStatus = FormStatus.APPROVED;
        } else if (statusValue.toUpperCase() === 'REJECTED') {
          mappedStatus = FormStatus.REJECTED;
        }
        if (mappedStatus) {
          listQb.andWhere('submission.status = :status', {
            status: mappedStatus,
          });
        }
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
      const addComment = await this.approvalAdminCommentRepo.create({
        task_submission_id: dto.submissionId,
        comment: dto.comment,
        commented_by: userId,
        is_active: true,
      });
      await this.approvalAdminCommentRepo.save(addComment);
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

      const existingApproval = await queryRunner.manager.findOne(
        ApprovalsAdmin,
        {
          where: { submission_id: dto.submissionId },
        },
      );

      if (existingApproval) {
        await queryRunner.manager.update(
          ApprovalsAdmin,
          { submission_id: dto.submissionId },
          {
            task_id: dto.taskId,
            is_approved: dto.isApproved,
            is_rejected: dto.isRejected,
            action_by: userId,
            action_at: new Date(),
          },
        );
      } else {
        const approval = queryRunner.manager.create(ApprovalsAdmin, {
          task_id: dto.taskId,
          submission_id: dto.submissionId,
          is_approved: dto.isApproved,
          is_rejected: dto.isRejected,
          action_by: userId,
          action_at: new Date(),
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
            status: TaskStatusId.COMPLETED,
            is_completed: true,
            is_approved: true,
            is_rejected: false,
            rejected_by: null,
            rejected_at: null,
            approved_by: userId,
            approved_at: new Date(),
          };
        } else {
          taskUpdate = {
            is_active: true,
            status: TaskStatusId.PENDING,
            is_completed: false,
            is_approved: false,
            is_rejected: true,
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
        const task = await this.tasksRepo.findOne({
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
      throw error;
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

      const comments = await this.approvalAdminCommentRepo.find({
        where: { task_submission_id: taskSubmissionId },
      });

      const doctorComments = await this.approvalDoctorCommentRepo.find({
        where: { task_submission_id: taskSubmissionId },
      });

      const allComments = [...comments, ...doctorComments];

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

  private getDateRangeFromFilter(
    dropdownValue: any,
    startDate?: string,
    endDate?: string,
  ): { startOfDay?: Date; endOfDay?: Date } {
    logger.info('getDateRangeFromFilter --->');
    if (!dropdownValue) return {};

    const now = new Date();
    let startOfDay: Date | undefined;
    let endOfDay: Date | undefined;

    if (
      dropdownValue.beValue === DateFilterType.CUSTOM ||
      dropdownValue.beValue === 'CUSTOM_RANGE'
    ) {
      if (!startDate || !endDate) {
        throw new BadRequestException(
          'startDate and endDate are required for CUSTOM filter',
        );
      }

      if (new Date(startDate) > new Date(endDate)) {
        throw new BadRequestException(
          'startDate cannot be greater than endDate',
        );
      }

      const start = new Date(startDate);
      start.setUTCHours(0, 0, 0, 0);

      const end = new Date(endDate);
      end.setUTCHours(23, 59, 59, 999);

      startOfDay = start;
      endOfDay = end;
    } else if (dropdownValue.beValue === DateFilterType.LAST_30_DAYS) {
      startOfDay = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      endOfDay = now;
    } else if (dropdownValue.beValue === DateFilterType.LAST_MONTH) {
      startOfDay = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1),
      );
      endOfDay = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0, 23, 59, 59, 999),
      );
    } else if (dropdownValue.beValue === DateFilterType.LAST_YEAR) {
      startOfDay = new Date(Date.UTC(now.getUTCFullYear() - 1, 0, 1));
      endOfDay = new Date(
        Date.UTC(now.getUTCFullYear() - 1, 11, 31, 23, 59, 59, 999),
      );
    }

    return { startOfDay, endOfDay };
  }
}