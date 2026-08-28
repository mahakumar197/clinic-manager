import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import {
  CreateTaskDto,
  UpdateTaskDto,
  TaskFilterQueryDto,
} from '../dto/task.dto';
import { Brackets, In } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from '../entities/task.entity';
import { TaskActivity } from '../entities/task-activity.entity';
import { TaskComment } from '../entities/task-comments.entity';
import { TaskAttachment } from '../entities/task-attachment.entity';
import { TaskTemplate } from '../entities/task-templates.entity';
import { TaskAssignee } from '../entities/task-assignees.entity';
import { TaskConfig } from '../entities/task-config.entity';
import { HttpService } from '@nestjs/axios';
import {
  TaskAction,
  TASK_MESSAGES,
  API_ENDPOINTS,
  helpers,
  TaskStatus,
  TASK_STATUS_MAP,
  TASK_PHASE_MAP,
  PROCEDURE_TYPE_MAP,
  TASK_CATEGORY_MAP,
  TaskCategory,
  ScreenId,
  NotificationHelper,
  NOTIFICATION_EVENT_TYPE,
  TaskPhaseId,
  PatientPhaseId,
  PATIENT_PHASE_TO_TASK_PHASE_MAP,
  TaskStatusId,
  recoveryFormIds,
  TASK_PHASE_TO_PATIENT_PHASE_MAP,
  WebhookToPatientPhaseMap,
} from '@pallmall/common-utils';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { ApiResponseBuilder, HttpStatus } from '@pallmall/shared-types';
import { logger } from '@pallmall/logger';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { Dropdown } from 'src/master/entities/dropdown.entity';

@Injectable()
export class TasksService {
  private notificationHelper: NotificationHelper;

  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(TaskActivity)
    private taskActivityRepository: Repository<TaskActivity>,
    @InjectRepository(TaskComment)
    private taskCommentRepository: Repository<TaskComment>,
    @InjectRepository(TaskAttachment)
    private taskAttachmentRepository: Repository<TaskAttachment>,
    @InjectRepository(TaskAssignee)
    private taskAssigneeRepository: Repository<TaskAssignee>,
    @InjectRepository(TaskConfig)
    private taskConfigRepository: Repository<TaskConfig>,
    private dataSource: DataSource,
    private configService: ConfigService,
    private httpService: HttpService,
    @InjectRepository(Dropdown)
    private readonly dropdownRepo: Repository<Dropdown>,
  ) {
    this.notificationHelper = new NotificationHelper();
  }

  // ---------------------------
  // CREATE TASK
  // ---------------------------

  /**
   * Creates a new task inside a transactional context.
   *
   * - Saves task
   * - Adds activity log
   * - Assigns user
   *
   * @param dto - Task payload
   * @returns Saved Task Response
   */
  async createTask(dto: CreateTaskDto, createdBy: string) {
    logger.info(`Create task...`);
    return this.dataSource.transaction(async (manager) => {
      try {
        let screenId;
        switch (dto.category) {
          case TASK_CATEGORY_MAP[TaskCategory.FORM_RESPONSE]:
            screenId = ScreenId.FORM_RESPONSE;
            break;
          case TASK_CATEGORY_MAP[TaskCategory.WATCH_CONTENT]:
            screenId = ScreenId.WATCH_CONTENT;
            break;
          case TASK_CATEGORY_MAP[TaskCategory.E_SIGNATURE]:
            screenId = ScreenId.E_SIGNATURE;
            break;
          case TASK_CATEGORY_MAP[TaskCategory.FILE_UPLOAD]:
            screenId = ScreenId.FILE_UPLOAD;
            break;
          default:
            break;
        }
        const task = manager.create(Task, {
          patient_id: dto.patientId,
          procedure_type: dto.procedureType,
          task_template: dto.taskTemplate,
          task_name: dto.taskName,
          task_description: dto.taskDescription,
          phase: dto.phase,
          category: dto.category,
          zoho_form: dto.zohoform,
          content_id: dto.contentId,
          assigned_to: dto.assignedTo,
          due_date: dto.dueDate,
          is_active: true,
          is_approved: false,
          is_completed: false,
          screen_id: screenId,
          status: TASK_STATUS_MAP[TaskStatus.PENDING],
        });
        const savedTask = await manager.save(Task, task);

        await this.createTaskActivity(
          manager,
          savedTask.id,
          TaskAction.TASK_CREATED,
          createdBy,
        );

        await this.createTaskAssignee(
          manager,
          savedTask.id,
          dto.assignedTo,
          createdBy,
        );

        // Fetch assignedTo user's role for notification
        const priority = 'normal';
        let assignedUserRole: string | undefined = undefined;
        try {
          const uri = this.configService.get('BASE_OPERATIONS');
          const url = API_ENDPOINTS.OPERATIONS_SERVICE.USER_DATA_FETCH;
          const userMap = await helpers.fetchUsersByIds(uri, url, [
            dto.assignedTo,
          ]);
          assignedUserRole = userMap[dto.assignedTo]?.role || undefined;
        } catch (err) {
          logger.warn(
            'Could not fetch assigned user role for notification:',
            err,
          );
        }
        await this.notificationHelper.sendNotificationSafely(
          {
            userId: dto.assignedTo,
            userRole: assignedUserRole,
            eventType: NOTIFICATION_EVENT_TYPE.TASK_CREATED,
            title: 'New Task Assigned',
            message: `You have been assigned a new task: ${dto.taskName}`,
            patientName: 'Patient',
            patientReference: dto.patientId,
            priority,
            relatedEntityId: savedTask.id,
            dueAt: dto.dueDate ? new Date(dto.dueDate) : undefined,
            metadata: {
              taskName: dto.taskName,
              taskDescription: dto.taskDescription,
              category: dto.category,
              phase: dto.phase,
              assignedBy: createdBy,
            },
          },
          logger,
        );

        logger.info(`Create task -> ${HttpStatus.CREATED}`);
        return new ApiResponseBuilder().success(
          savedTask,
          TASK_MESSAGES.TASK_CREATED,
          HttpStatus.CREATED,
        );
      } catch (error) {
        logger.error(`Create task -> ${error}`);
        return new ApiResponseBuilder().error(
          error,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    });
  }

  // ---------------------------
  // AUTO-CREATE TASKS FOR PHASE
  // ---------------------------

  /**
   * Automatically creates tasks for a patient based on their phase
   * Reads from task_config table and creates tasks using existing createTask method
   *
   * @param patientId - Patient UUID
   * @param patientPhaseId - New patient phase ID (140=Guest, 141=Consultation, 142=Pre-Op, 143=Post-Op)
   * @param procedureType - Procedure type ID (28-34) - currently not used as all tasks are global
   * @param createdBy - User ID who triggered the phase change (system or admin)
   * @param assignedTo - Optional assignee UUID (doctor or coordinator). If not provided, tasks are assigned to the patient.
   * @returns Array of created tasks
   */
  async autoCreateTasksForPhase(
    patientId: string,
    patientPhaseId: number,
    procedureType: number,
    createdBy: string = 'system',
    assignedTo?: string,
  ) {
    logger.info(
      `Auto-creating tasks for patient ${patientId}, phase ${patientPhaseId}`,
    );

    try {
      const configs = await this.taskConfigRepository.find({
        where: {
          patient_phase_id: patientPhaseId,
          is_global: true,
          is_active: true,
        },
        order: { display_order: 'ASC' },
      });

      if (configs.length === 0) {
        logger.info(`No task configs found for phase ${patientPhaseId}`);
        return new ApiResponseBuilder().success(
          [],
          'No tasks configured for this phase',
          HttpStatus.OK,
        );
      }

      logger.info(`Found ${configs.length} task configs to create`);

      const createdTasks = [];
      for (const config of configs) {
        let dueDate: string | undefined;
        if (config.due_date_offset_days) {
          const date = new Date();
          date.setDate(date.getDate() + config.due_date_offset_days);
          dueDate = date.toISOString().split('T')[0];
        }

        let taskPhaseId: number;
        switch (patientPhaseId) {
          case PatientPhaseId.Consultation:
            taskPhaseId = TaskPhaseId.CONSULTATION;
            break;
          case PatientPhaseId.PRE_OP:
            taskPhaseId = TaskPhaseId.PRE_OP;
            break;
          case PatientPhaseId.POST_OP:
            taskPhaseId = TaskPhaseId.POST_OP;
            break;
          default:
            taskPhaseId = TaskPhaseId.CONSULTATION;
        }

        const taskDto: CreateTaskDto = {
          patientId: patientId,
          procedureType: procedureType,
          taskName: config.task_name,
          taskDescription: config.task_description,
          phase: taskPhaseId,
          category: config.category,
          zohoform: config.zoho_form,
          contentId: config.content_id,
          assignedTo: assignedTo || patientId,
          dueDate: dueDate,
        };

        const result = await this.createTask(taskDto, createdBy);
        if (result.statusCode === HttpStatus.CREATED) {
          createdTasks.push(result.data);
        }
      }

      logger.info(
        `Successfully created ${createdTasks.length} tasks for patient ${patientId}`,
      );
      return new ApiResponseBuilder().success(
        createdTasks,
        `${createdTasks.length} tasks created successfully`,
        HttpStatus.CREATED,
      );
    } catch (error) {
      logger.error(`Auto-create tasks error: ${error}`);
      return new ApiResponseBuilder().error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ---------------------------
  // LIST TASKS (FILTERED + PAGINATED)
  // ---------------------------

  /**
   * Retrieves paginated and filtered task results.
   *
   * - Supports search, filters, pagination
   * - Returns tasks + aggregated status counts
   *
   * @param filters - Filter options
   * @returns Paginated task list
   */
  async findAllTasks(filters: TaskFilterQueryDto) {
    logger.info(`Find all tasks...`);
    try {
      const page = filters.page || 1;
      const limit = filters.limit || 10;
      const isExport = filters.export === true;
      const {
        procedureType,
        status,
        phases,
        search,
        dueDate,
        dueDateOrder,
        startDate,
        endDate,
        dateFilter,
      } = filters;
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const deletedTaskIdsQB = this.taskActivityRepository
        .createQueryBuilder('activity')
        .select('activity.task_id')
        .where('activity.action = :deletedAction', {
          deletedAction: TaskAction.TASK_DELETED,
        })
        .andWhere('activity.performed_at >= :thirtyDaysAgo', { thirtyDaysAgo })
        .andWhere('activity.is_active = true');

      const taskQB = this.taskRepository
        .createQueryBuilder('task')
        .leftJoin(
          'dropdowns',
          'procedure_type',
          `"procedure_type"."id" = "task"."procedure_type"
         AND "procedure_type"."type" = 'ProcedureType'
         AND "procedure_type"."isActive" = true`,
        )
        .leftJoin(
          'dropdowns',
          'phase',
          `"phase"."id" = "task"."phase"AND "phase"."type" = 'TaskPhase'AND "phase"."isActive" = true`,
        )
        .leftJoin(
          'dropdowns',
          'category',
          `"category"."id" = "task"."category"AND "category"."type" = 'TaskCategory'AND "category"."isActive" = true`,
        )
        .leftJoin(
          'dropdowns',
          'status',
          `"status"."id" = "task"."status"AND "status"."type" = 'TaskStatus'AND "status"."isActive" = true`,
        )
        .addSelect([
          'procedure_type.beValue',
          'phase.beValue',
          'category.beValue',
          'status.beValue',
        ])
        .where(
          `(task.is_active = true OR (task.id IN (${deletedTaskIdsQB.getQuery()}) AND task.status = :deletedStatus))`,
          {
            ...deletedTaskIdsQB.getParameters(),
            deletedStatus: TASK_STATUS_MAP[TaskStatus.DELETED],
          },
        );

      if (procedureType) {
        taskQB.andWhere('"task"."procedure_type" = :procedureType', {
          procedureType: filters.procedureType,
        });
      }
      if (status) {
        taskQB.andWhere('"task"."status" = :status', {
          status: filters.status,
        });
      }
      if (phases) {
        taskQB.andWhere('"task"."phase" = :phase', {
          phase: filters.phases,
        });
      }
      if (dueDate) {
        taskQB.andWhere('"task"."due_date" = :dueDate', {
          dueDate: filters.dueDate,
        });
      }

      let start: Date | null = null;
      let end: Date | null = null;
      if (dateFilter) {
        const dropdown = await this.dropdownRepo.findOne({
          where: { id: dateFilter },
        });

        const filterType = dropdown?.beValue;
        const now = new Date();

        if (filterType === 'THIS_WEEK') {
          const day = now.getDay();
          const diffToMonday = day === 0 ? -6 : 1 - day;

          start = new Date(now);
          start.setDate(now.getDate() + diffToMonday);

          end = new Date(start);
          end.setDate(start.getDate() + 6);
        } else if (filterType === 'THIS_MONTH') {
          start = new Date(now.getFullYear(), now.getMonth(), 1);
          end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        } else if (filterType === 'THIS_YEAR') {
          start = new Date(now.getFullYear(), 0, 1);
          end = new Date(now.getFullYear(), 11, 31);
        } else if (filterType === 'CUSTOM_RANGE') {
          if (!startDate || !endDate) {
            throw new BadRequestException('startDate and endDate required');
          }

          start = new Date(startDate);
          end = new Date(endDate);
        }

        if (start && end) {
          if (start > end) {
            throw new BadRequestException(
              'startDate cannot be greater than endDate',
            );
          }

          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);

          taskQB.andWhere(`"task"."due_date" BETWEEN :start AND :end`, {
            start,
            end,
          });
        }
      }
      if (dueDateOrder) {
        taskQB.orderBy('"task"."due_date"', dueDateOrder == 1 ? 'ASC' : 'DESC');
        taskQB.addOrderBy('"task"."created_at"', 'DESC');
      } else {
        taskQB.orderBy('"task"."created_at"', 'DESC');
      }
      const { raw, entities } = await taskQB.getRawAndEntities();
      const userIds = [
        ...new Set(
          entities
            .flatMap((t) => [t.patient_id, t.assigned_to])
            .filter(Boolean),
        ),
      ];
      const uri = this.configService.get('BASE_OPERATIONS');
      const url = API_ENDPOINTS.OPERATIONS_SERVICE.USER_DATA_FETCH;
      const userMap =
        userIds.length > 0
          ? await helpers.fetchUsersByIds(uri, url, userIds)
          : {};
      let filteredIndexes = entities.map((_, i) => i);
      if (search) {
        const s = search.toLowerCase();
        filteredIndexes = filteredIndexes.filter((i) => {
          const task = entities[i];
          const patientName =
            userMap[task.patient_id]?.userName?.toLowerCase() ?? '';
          const assigneeName =
            userMap[task.assigned_to]?.userName?.toLowerCase() ?? '';
          return (
            task.task_name.toLowerCase().includes(s) ||
            raw[i]?.procedure_type_beValue?.toLowerCase().includes(s) ||
            patientName.includes(s) ||
            assigneeName.includes(s)
          );
        });
      }
      const formatDate = (date: string | Date) => {
        if (!date) return null;
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
      };
      const enrichedTasks: any[] = filteredIndexes.map((i) => ({
        ...entities[i],
        due_date: formatDate(entities[i].due_date),
        procedureType: raw[i]?.procedure_type_beValue ?? null,
        phase: raw[i]?.phase_beValue ?? null,
        category: raw[i]?.category_beValue ?? null,
        status: raw[i]?.status_beValue ?? null,
        patientName: userMap[entities[i].patient_id]?.userName ?? null,
        assigneeName: userMap[entities[i].assigned_to]?.userName ?? null,
      }));
      const statusCountMap = await this.fetchTaskStatusCounts();
      const taskCount = await this.taskRepository.count({
        where: { is_active: true },
      });
      statusCountMap.total = taskCount;
      // const paginated = helpers.paginate(enrichedTasks, page, limit);
      let sortedTasks = enrichedTasks.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );

      let finalTasks = sortedTasks;
      let meta = null;

      if (!isExport) {
        const paginated = helpers.paginate(sortedTasks, page, limit);
        finalTasks = paginated.items;
        meta = paginated.meta;
      }

      logger.info(`Find all tasks -> ${HttpStatus.OK}`);
      // return new ApiResponseBuilder().paginated(
      //   [
      //     {
      //       tasks: paginated.items,
      //       statusCounts: statusCountMap,
      //     },
      //   ],
      //   paginated.meta,
      //   TASK_MESSAGES.TASK_FETCHED,
      // );
      if (isExport) {
        return new ApiResponseBuilder().success(
          {
            tasks: finalTasks,
            statusCounts: statusCountMap,
          },
          TASK_MESSAGES.TASK_FETCHED,
        );
      }

      return new ApiResponseBuilder().paginated(
        [
          {
            tasks: finalTasks,
            statusCounts: statusCountMap,
          },
        ],
        meta,
        TASK_MESSAGES.TASK_FETCHED,
      );
    } catch (error) {
      logger.error(`Find all tasks -> ${error}`);
      return new ApiResponseBuilder().error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ---------------------------
  // FETCH SINGLE TASK WITH DETAILS
  // ---------------------------

  /**
   * Retrieves a task with related comments, assignees, and activity logs.
   *
   * @param id - Task ID
   * @returns Task details
   */
  async findOneTask(id: string) {
    try {
      logger.info('Find one task...');
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const [
        taskResult,
        activity,
        comments,
        assignees,
        originalAttachments,
        attachmentsInComment,
      ] = await Promise.all([
        this.taskRepository
          .createQueryBuilder('task')
          .where('task.id = :id', { id })
          .andWhere(
            `(
              task.is_active = true
              OR (
                task.is_active = false
                AND task.status = :deletedStatus
                AND delete_activity.id IS NOT NULL
              )
            )`,
            { deletedStatus: TASK_STATUS_MAP[TaskStatus.DELETED] },
          )
          .leftJoin(
            'task_activity',
            'delete_activity',
            `delete_activity."task_id" = task.id
            AND delete_activity.action = :deletedAction
            AND delete_activity.performed_at >= :thirtyDaysAgo`,
            { deletedAction: TaskAction.TASK_DELETED, thirtyDaysAgo },
          )
          .leftJoin(
            'dropdowns',
            'procedure_type',
            `"procedure_type"."id" = "task"."procedure_type"
         AND "procedure_type"."type" = 'ProcedureType'
         AND "procedure_type"."isActive" = true`,
          )
          .leftJoin(
            'dropdowns',
            'phase',
            `"phase"."id" = "task"."phase"AND "phase"."type" = 'TaskPhase'AND "phase"."isActive" = true`,
          )
          .leftJoin(
            'dropdowns',
            'category',
            `"category"."id" = "task"."category"AND "category"."type" = 'TaskCategory'AND "category"."isActive" = true`,
          )
          .leftJoin(
            'dropdowns',
            'status',
            `"status"."id" = "task"."status"AND "status"."type" = 'TaskStatus'AND "status"."isActive" = true`,
          )
          .addSelect([
            'procedure_type.beValue',
            'phase.beValue',
            'category.beValue',
            'status.beValue',
          ])
          .getRawAndEntities(),
        this.taskActivityRepository.find({
          where: { task_id: id, is_active: true },
          order: { performed_at: 'DESC' },
        }),
        this.taskCommentRepository.find({
          where: { task_id: id, is_active: true },
          order: { commented_at: 'DESC' },
        }),
        this.taskAssigneeRepository.find({
          where: { task_id: id, is_active: true },
          order: { assigned_at: 'DESC' },
        }),
        this.taskAttachmentRepository.find({
          where: { task_id: id, is_active: true, in_comment: false },
          order: { uploaded_at: 'DESC' },
        }),
        this.taskAttachmentRepository.find({
          where: { task_id: id, is_active: true, in_comment: true },
          order: { uploaded_at: 'DESC' },
        }),
      ]);
      const taskEntity = taskResult.entities[0];
      const taskRaw = taskResult.raw[0];
      if (!taskEntity) {
        throw new BadRequestException(`Task with ID ${id} not found`);
      }
      const formatDate = (date: string | Date) => {
        if (!date) return null;
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
      };
      const { due_date, ...restTaskEntity } = taskEntity;
      const task = {
        ...restTaskEntity,
        due_date: formatDate(due_date),
        procedure_type: taskRaw?.procedure_type_beValue,
        phase: taskRaw?.phase_beValue,
        category: taskRaw?.category_beValue,
        status: taskRaw?.status_beValue,
        procedure_type_id: taskEntity.procedure_type,
        phase_id: taskEntity.phase,
        category_id: taskEntity.category,
        status_id: taskEntity.status,
      };

      const userIds = this.extractUserIds(
        task,
        activity,
        comments,
        assignees,
        originalAttachments,
        attachmentsInComment,
      );
      const uri = this.configService.get('BASE_OPERATIONS');
      const url = API_ENDPOINTS.OPERATIONS_SERVICE.USER_DATA_FETCH;
      const usersMap = await helpers.fetchUsersByIds(uri, url, userIds);
      const mapped = this.mapUsers(
        task,
        activity,
        comments,
        assignees,
        originalAttachments,
        attachmentsInComment,
        usersMap,
      );
      logger.info(`Find one task -> ${HttpStatus.OK}`);
      return new ApiResponseBuilder().success(
        mapped,
        TASK_MESSAGES.TASK_FETCHED,
        HttpStatus.OK,
      );
    } catch (error) {
      logger.error(`Find one task -> ${error}`);
      return new ApiResponseBuilder().error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ---------------------------
  // UPDATE TASK
  // ---------------------------
  /**
   * Updates task information and reassigns user if changed.
   *
   * Runs inside a database transaction.
   */
  async updateTask(id: string, dto: UpdateTaskDto, updatedBy: string) {
    try {
      logger.info(`Update task...`);
      return this.dataSource.transaction(async (manager) => {
        const existingTask = await manager.findOne(Task, { where: { id } });
        if (!existingTask) {
          throw new NotFoundException(`Task with ID ${id} not found`);
        }
        const oldAssignee = existingTask.assigned_to;
        if (dto.patientId) existingTask.patient_id = dto.patientId;
        if (dto.procedureType) existingTask.procedure_type = dto.procedureType;
        if (dto.taskTemplate) existingTask.task_template = dto.taskTemplate;
        if (dto.taskName) existingTask.task_name = dto.taskName;
        if (dto.taskDescription)
          existingTask.task_description = dto.taskDescription;
        if (dto.phase) existingTask.phase = dto.phase;
        if (dto.category) existingTask.category = dto.category;
        if (dto.zohoform) existingTask.zoho_form = dto.zohoform;
        if (dto.contentId) existingTask.content_id = dto.contentId;
        if (dto.assignedTo) existingTask.assigned_to = dto.assignedTo;
        if (dto.dueDate) existingTask.due_date = dto.dueDate;
        if (dto.assignedTo && dto.assignedTo !== oldAssignee) {
          existingTask.assigned_to = dto.assignedTo;
          await manager.save(Task, existingTask);
          await this.createTaskAssignee(manager, id, dto.assignedTo, updatedBy);
          await this.createTaskActivity(
            manager,
            id,
            TaskAction.TASK_REASSIGN,
            updatedBy,
          );
        } else {
          await manager.save(Task, existingTask);
        }
        await this.createTaskActivity(
          manager,
          id,
          TaskAction.TASK_UPDATED,
          updatedBy,
        );
        logger.info(`Update task -> ${HttpStatus.OK}`);
        return new ApiResponseBuilder().success(
          existingTask,
          TASK_MESSAGES.TASK_UPDATED,
          HttpStatus.OK,
        );
      });
    } catch (error) {
      logger.error(`Update task -> ${error}`);
      return new ApiResponseBuilder().error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ---------------------------
  // SOFT DELETE TASK
  // ---------------------------

  /**
   * Soft deletes a task by marking it inactive.
   */
  async removeTask(id: string, removedBy: string) {
    try {
      logger.info(`Remove task...`);
      return this.dataSource.transaction(async (manager) => {
        const task = await manager.findOne(Task, { where: { id } });

        if (!task) throw new NotFoundException(`Task with ID ${id} not found`);
        if (!task.is_active)
          throw new BadRequestException(`Task already deleted`);

        task.deleted_data = {
          task_name: task.task_name,
          task_description: task.task_description,
          procedure_type: task.procedure_type,
          phase: task.phase,
          category: task.category,
          zoho_form: task.zoho_form,
          content_id: task.content_id,
          assigned_to: task.assigned_to,
          due_date: task.due_date,
          status: task.status,
          is_completed: task.is_completed,
          is_approved: task.is_approved,
          screen_id: task.screen_id,
          approved_by: task.approved_by,
          approved_at: task.approved_at,
          completed_at: task.completed_at,
        };

        task.is_active = false;
        task.status = TASK_STATUS_MAP[TaskStatus.DELETED];
        await manager.save(Task, task);

        await this.createTaskActivity(
          manager,
          id,
          TaskAction.TASK_DELETED,
          removedBy,
        );

        logger.info(`Remove task -> ${HttpStatus.OK}`);
        return new ApiResponseBuilder().success(
          task,
          TASK_MESSAGES.TASK_DELETED,
          HttpStatus.OK,
        );
      });
    } catch (error) {
      return new ApiResponseBuilder().error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ---------------------------
  // REASSIGN TASK
  // ---------------------------

  async reAssignTask(
    taskId: string,
    newAssignee: string,
    reAssignedBy: string,
  ) {
    try {
      logger.info(`Reassign task...`);

      return this.dataSource.transaction(async (manager) => {
        const task = await manager.findOne(Task, { where: { id: taskId } });

        if (!task) {
          throw new NotFoundException(`Task with ID ${taskId} not found`);
        }

        if (task.assigned_to === newAssignee) {
          throw new BadRequestException(
            `Task is already assigned to this user`,
          );
        }

        task.assigned_to = newAssignee;
        const updatedTask = await manager.save(task);

        await this.createTaskAssignee(
          manager,
          taskId,
          newAssignee,
          reAssignedBy,
        );

        await this.createTaskActivity(
          manager,
          taskId,
          TaskAction.TASK_REASSIGN,
          reAssignedBy,
        );

        const priority = 'normal';
        let assignedUserRole: string | undefined = undefined;

        try {
          const uri = this.configService.get('BASE_OPERATIONS');
          const url = API_ENDPOINTS.OPERATIONS_SERVICE.USER_DATA_FETCH;

          const userMap = await helpers.fetchUsersByIds(uri, url, [
            newAssignee,
          ]);

          assignedUserRole = userMap[newAssignee]?.role || undefined;
        } catch (err) {
          logger.warn(
            'Could not fetch reassigned user role for notification:',
            err,
          );
        }

        await this.notificationHelper.sendNotificationSafely(
          {
            userId: newAssignee,
            userRole: assignedUserRole,
            eventType: NOTIFICATION_EVENT_TYPE.TASK_CREATED,
            title: 'Task Reassigned',
            message: `A task has been reassigned to you: ${task.task_name}`,
            patientName: 'Patient',
            patientReference: task.patient_id,
            priority,
            relatedEntityId: task.id,
            dueAt: task.due_date ? new Date(task.due_date) : undefined,
            metadata: {
              taskName: task.task_name,
              taskDescription: task.task_description,
              category: task.category,
              phase: task.phase,
              reassignedBy: reAssignedBy,
            },
          },
          logger,
        );

        return new ApiResponseBuilder().success(
          updatedTask,
          TASK_MESSAGES.TASK_REASSIGN,
          HttpStatus.OK,
        );
      });
    } catch (error) {
      return new ApiResponseBuilder().error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ---------------------------
  // HELPERS
  // ---------------------------

  async createTaskActivity(
    manager: EntityManager,
    taskId: string,
    action: TaskAction,
    createdBy: string,
  ) {
    logger.debug('createTaskActivity --->');
    const activity = manager.create(TaskActivity, {
      task_id: taskId,
      action,
      is_active: true,
      performed_by: createdBy,
    });

    await manager.save(TaskActivity, activity);
  }

  async createTaskAssignee(
    manager: EntityManager,
    taskId: string,
    assigneeId: string,
    assignedBy: string,
  ) {
    logger.debug('createTaskAssignee --->');
    const assignee = manager.create(TaskAssignee, {
      task_id: taskId,
      assignee_id: assigneeId,
      is_active: true,
      assigned_by: assignedBy,
    });

    await manager.save(TaskAssignee, assignee);
  }

  private extractUserIds(
    task: Task,
    activity: TaskActivity[],
    comments: TaskComment[],
    assignees: TaskAssignee[],
    originalAttachments: TaskAttachment[],
    attachmentsInComment: TaskAttachment[],
  ): string[] {
    logger.debug('extractUserIds --->');
    const userIds = new Set<string>();

    const push = (val?: string) => val && userIds.add(val);

    push(task.patient_id);
    push(task.assigned_to);

    activity.forEach((a) => push(a.performed_by));
    comments.forEach((c) => push(c.commented_by));
    assignees.forEach((a) => {
      push(a.assignee_id);
      push(a.assigned_by);
    });
    originalAttachments.forEach((a) => push(a.uploaded_by));
    attachmentsInComment.forEach((a) => push(a.uploaded_by));

    return Array.from(userIds);
  }

  private mapUsers(
    task: Task,
    activity: TaskActivity[],
    comments: TaskComment[],
    assignees: TaskAssignee[],
    nonCommentAttachments: TaskAttachment[],
    allAttachments: TaskAttachment[],
    usersMap: Record<string, any>,
  ) {
    logger.debug('mapUsers --->');
    const attachmentMap = new Map(allAttachments.map((a) => [a.id, a]));
    return {
      task: {
        ...task,
        patient: usersMap[task.patient_id] ?? null,
        assignedUser: usersMap[task.assigned_to] ?? null,
      },
      activity: activity.map((a) => ({
        ...a,
        performedByUser: usersMap[a.performed_by] ?? null,
      })),
      comments: comments.map((c) => {
        const attachment = c.attachment_id
          ? attachmentMap.get(c.attachment_id)
          : null;
        return {
          ...c,
          commentedByUser: usersMap[c.commented_by] ?? null,
          attachment: attachment
            ? {
                ...attachment,
                uploadedByUser: usersMap[attachment.uploaded_by] ?? null,
              }
            : null,
        };
      }),
      assignees: assignees.map((a) => ({
        ...a,
        assigneeUser: usersMap[a.assignee_id] ?? null,
        assignedByUser: usersMap[a.assigned_by] ?? null,
      })),
      attachments: nonCommentAttachments.map((a) => ({
        ...a,
        uploadedByUser: usersMap[a.uploaded_by] ?? null,
      })),
    };
  }

  async fetchTaskStatusCounts() {
    logger.info('fetchTaskStatusCounts --->');
    try {
      const result = await this.taskRepository
        .createQueryBuilder('task')
        .innerJoin(
          'dropdowns',
          'status',
          `"status"."id" = "task"."status"
         AND "status"."type" = 'TaskStatus'
         AND "status"."isActive" = true`,
        )
        .select('status.beValue', 'status')
        .addSelect('COUNT(task.id)', 'count')
        .where('"task"."is_active" = true')
        .groupBy('status.beValue')
        .getRawMany();
      return result.reduce(
        (acc, row) => {
          acc[row.status] = Number(row.count);
          return acc;
        },
        {} as Record<string, number>,
      );
    } catch (error) {
      logger.error(`Fetch task status counts -> ${error}`);
      throw error;
    }
  }

  // ---------------------------
  // ESCALATION SUPPORT
  // ---------------------------

  /**
   * Get tasks for escalation checking
   * Used by cron job to check for overdue tasks
   */
  async getTasksForEscalation(status?: number) {
    logger.info('getTasksForEscalation --->');
    try {
      const queryBuilder = this.taskRepository
        .createQueryBuilder('task')
        .where('task.is_active = :isActive', { isActive: true });

      if (status) {
        queryBuilder.andWhere('task.status = :status', { status });
      }

      queryBuilder.andWhere('task.due_date IS NOT NULL');

      const tasks = await queryBuilder
        .select([
          'task.id',
          'task.patient_id',
          'task.task_name',
          'task.task_description',
          'task.status',
          'task.due_date',
          'task.assigned_to',
          'task.created_at',
        ])
        .orderBy('task.due_date', 'ASC')
        .getMany();

      return new ApiResponseBuilder().success(
        tasks,
        'Tasks fetched for escalation check',
        HttpStatus.OK,
      );
    } catch (error) {
      logger.error(`Error fetching tasks for escalation: ${error.message}`);
      throw error;
    }
  }
  // ---------------------------
  // RECOVER TASK
  // ---------------------------
  /**
   * Recovers a task by updating its status and activity.
   *
   * @param taskId - Task ID to recover
   * @param recoveredBy - User ID of the person recovering the task
   * @returns ApiResponseBuilder with success or error response
   */
  async recoverTask(taskId: string, recoveredBy: string) {
    try {
      logger.info('Recover task...');

      return this.dataSource.transaction(async (manager) => {
        const task = await manager.findOne(Task, {
          where: { id: taskId },
        });

        if (!task)
          throw new NotFoundException(`Task with ID ${taskId} not found`);

        if (task.is_active)
          throw new BadRequestException('Task is already active');

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const deleteActivity = await manager.findOne(TaskActivity, {
          where: {
            task_id: taskId,
            action: TaskAction.TASK_DELETED,
          },
          order: { performed_at: 'DESC' },
        });

        if (!deleteActivity)
          throw new BadRequestException('Delete activity not found');

        if (deleteActivity.performed_at < thirtyDaysAgo)
          throw new BadRequestException(
            'Recovery period expired (30 days exceeded)',
          );

        Object.assign(task, task.deleted_data);

        task.is_active = true;
        task.deleted_data = null;

        await manager.save(Task, task);

        await this.createTaskActivity(
          manager,
          taskId,
          TaskAction.TASK_REVOKED,
          recoveredBy,
        );

        logger.info(`Task recovered -> ${HttpStatus.OK}`);

        return new ApiResponseBuilder().success(
          task,
          'Task recovered successfully',
          HttpStatus.OK,
        );
      });
    } catch (error) {
      logger.error(error);
      return new ApiResponseBuilder().error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ---------------------------
  // TASK AUTOMATION
  // ---------------------------

  /**
   * Automates tasks based on patient phase.
   *
   * - Validates task completion for current phase
   * - Prevents automation for final phase
   * - Advances patient phase via Operations service
   * - Creates new phase tasks from global task configs
   * - Copies procedure type & assignee from previous phase
   * - Creates task activity & assignee records
   *
   * @param userId - User ID
   * @param patientPhaseId - Patient phase ID
   * @returns void
   */
  async taskAutomation(userId: string, patientPhaseId: string) {
    logger.info('taskAutomation --->');
    try {
      const taskPhase = this.resolveTaskPhase(patientPhaseId);

      const { totalTasks, completedAndApprovedCount } =
        await this.getTaskCompletionStats(userId, taskPhase);
      logger.info('taskAutomation counts', {
        totalTasks,
        completedAndApprovedCount,
      });

      if (!this.shouldAdvancePhase(totalTasks, completedAndApprovedCount))
        return;

      if (this.isFinalPhase(patientPhaseId)) {
        logger.warn('Patient already in final phase. No automation needed.');
        return;
      }

      const nextPatientPhaseId = Number(patientPhaseId) + 1;
      if (nextPatientPhaseId === PatientPhaseId.POST_OP) {
        const email = await this.getPatientEmail(userId);
        const surgeryDate = await this.getPatientSurgeryDate(email);
        if (!surgeryDate) {
          logger.warn(
            `Skipping phase advancement. Surgery date not found for ${userId}`,
          );
          return;
        }
      }

      const userData = await this.advancePatientPhase(userId);
      const newPhaseId = this.resolveTaskPhase(userData.patient_phase_id);
      const isPostOpPhase =
        userData.patient_phase_id === PatientPhaseId.POST_OP;

      let newTaskConfigs = await this.getGlobalTaskConfigsForPhase(
        userData.patient_phase_id,
      );
      if (!newTaskConfigs.length) return;

      const hasExistingTasks = await this.hasExistingTasksForPhase(
        userId,
        newPhaseId,
      );
      if (hasExistingTasks) return;

      const previousPhaseTasks = await this.getCompletedTasksForPhase(
        userId,
        taskPhase,
      );
      if (!previousPhaseTasks.length) {
        logger.warn('No completed tasks found in previous phase', {
          userId,
          taskPhase,
        });
        return;
      }

      if (isPostOpPhase) {
        newTaskConfigs = await this.expandFinalPhaseTasks(
          newTaskConfigs,
          userData.email,
        );
      }

      await this.createTasksForNewPhase(
        userId,
        newPhaseId,
        newTaskConfigs,
        previousPhaseTasks[0],
        isPostOpPhase,
      );

      logger.info('taskAutomation completed', {
        userId,
        newPhaseId,
        createdTasks: newTaskConfigs.length,
      });
    } catch (error) {
      logger.error('taskAutomation error', error);
      throw error;
    }
  }

  // ---------------------------
  // WEBHOOK TASK AUTOMATION
  // ---------------------------

  /**
   * Webhook-triggered task automation — skips task completion/approval checks.
   *
   * - Skips validation of task completion & approval for the current phase
   * - Prevents automation for final phase
   * - Advances patient phase via Operations service
   * - Creates new phase tasks from global task configs
   * - Copies procedure type & assignee from previous phase tasks
   * - Post-op expansion logic remains the same
   *
   * @param userId - User ID
   * @param patientPhaseId - Patient phase ID
   * @returns void
   */
  async webhookTaskAutomation(
  userId: string,
  currentPatientPhaseId: string,
  NewPatientPhaseId: string,
  payload: any,
) {
  logger.info('webhookTaskAutomation --->');
  try {
    const targetPhase =
      WebhookToPatientPhaseMap[Number(NewPatientPhaseId)];

    if (Number(currentPatientPhaseId) === targetPhase) {
      logger.warn('Patient already in same phase. No automation needed.');
      return;
    }

    logger.info('webhookTaskAutomation: skipping task completion checks', {
      userId,
      NewPatientPhaseId,
    });

    if (targetPhase === PatientPhaseId.POST_OP) {
      const email = await this.getPatientEmail(userId);
      const surgeryDate = await this.getPatientSurgeryDate(email);

      if (!surgeryDate) {
        logger.warn(
          `Skipping phase advancement. Surgery date not found for ${userId}`,
        );
        return;
      }
    }

    const userData = await this.advancePatientPhaseWebhook(
      userId,
      targetPhase,
    );

    const newPhaseId = this.resolveTaskPhase(userData.patient_phase_id);
    const isPostOpPhase =
      userData.patient_phase_id === PatientPhaseId.POST_OP;

    let newTaskConfigs = await this.getGlobalTaskConfigsForPhase(
      userData.patient_phase_id,
    );

    if (!newTaskConfigs.length) {
      logger.warn('No task configs found for phase');
      return;
    }

    const hasExistingTasks = await this.hasExistingTasksForPhase(
      userId,
      newPhaseId,
    );
    if (hasExistingTasks) return;

    const previousTaskPhase = this.resolveTaskPhase(currentPatientPhaseId);

    const previousPhaseTasks = await this.taskRepository.find({
      where: {
        patient_id: userId,
        is_active: true,
        phase: previousTaskPhase,
      },
      order: { created_at: 'DESC' },
    });

    if (!previousPhaseTasks.length) {
      logger.warn('No tasks found in previous phase', {
        userId,
        previousTaskPhase,
      });
    }

    if (isPostOpPhase) {
      try {
        newTaskConfigs = await this.expandFinalPhaseTasks(
          newTaskConfigs,
          userData.email,
        );

        if (!newTaskConfigs.length) {
          logger.warn(
            'No expanded tasks generated. Skipping task creation.',
          );
          return;
        }
      } catch (error) {
        logger.warn(
          'Skipping task creation due to missing surgery data',
          error?.message,
        );
        return;
      }
    }

    await this.createTasksForNewPhaseViaWebhook(
      userId,
      newPhaseId,
      newTaskConfigs,
      previousPhaseTasks[0],
      isPostOpPhase,
    );

    logger.info('webhookTaskAutomation completed', {
      userId,
      newPhaseId,
      createdTasks: newTaskConfigs.length,
    });
  } catch (error) {
    logger.error('webhookTaskAutomation error', error);
    throw error;
  }
}

  private async getPatientEmail(userId: string): Promise<string> {
    logger.debug('getPatientEmail --->');
    const uri = this.configService.get<string>('BASE_OPERATIONS');
    const url = `${uri}${API_ENDPOINTS.OPERATIONS_SERVICE.USER_DATA_FETCH}?ids=${userId}`;
    const response = await firstValueFrom(this.httpService.get(url));
    const users = response.data?.data;
    if (!users?.length) {
      throw new Error(`User not found for id ${userId}`);
    }
    return users[0].email;
  }

  private async getPatientSurgeryDate(email: string): Promise<Date | null> {
    logger.debug('getPatientSurgeryDate --->');
    const uri = this.configService.get<string>('BASE_INTEGRATION');
    const urlPath = API_ENDPOINTS.ZOHO_SERVICE.APPOINTMENTS_VIA_EMAIL;

    const appointments = await helpers.fetchPatientAppointmentsWithEmail(
      uri,
      urlPath,
      email,
    );

    if (!appointments?.length || !appointments[0]?.surgery?.date) {
      return null;
    }

    return new Date(appointments[0].surgery.date);
  }
  /**
   * Resolves task phase from patient phase.
   *
   * @param patientPhaseId - Patient phase ID
   * @returns Task phase ID
   */
  private resolveTaskPhase(patientPhaseId: string): number {
    logger.debug('resolveTaskPhase --->');
    return PATIENT_PHASE_TO_TASK_PHASE_MAP[patientPhaseId];
  }

  /**
   * Fetches task completion stats for a phase.
   *
   * @param userId - User ID
   * @param taskPhase - Task phase
   * @returns Total tasks and completed & approved count
   */
  private async getTaskCompletionStats(userId: string, taskPhase: number) {
    logger.debug('getTaskCompletionStats --->');
    const totalTasks = await this.taskRepository.count({
      where: {
        patient_id: userId,
        is_active: true,
        phase: taskPhase,
      },
    });

    const completedAndApprovedCount = await this.taskRepository.count({
      where: {
        patient_id: userId,
        is_active: true,
        phase: taskPhase,
        is_completed: true,
        is_approved: true,
        is_rejected: false,
      },
    });

    const rejectedTasks = await this.taskRepository.count({
      where: {
        patient_id: userId,
        is_active: true,
        phase: taskPhase,
        is_completed: true,
        is_approved: true,
        is_rejected: true,
      },
    });

    return { totalTasks, completedAndApprovedCount, rejectedTasks };
  }

  /**
   * Determines whether patient phase can be advanced.
   *
   * @param totalTasks - Total tasks in current phase
   * @param completedAndApprovedCount - Completed & approved tasks
   * @returns Boolean indicating whether to advance phase
   */
  private shouldAdvancePhase(
    totalTasks: number,
    completedAndApprovedCount: number,
  ): boolean {
    logger.debug('shouldAdvancePhase --->');
    return totalTasks > 0 && completedAndApprovedCount === totalTasks;
  }

  /**
   * Checks if current phase is the final phase.
   *
   * @param patientPhaseId - Patient phase ID
   * @returns Boolean indicating final phase
   */
  private isFinalPhase(patientPhaseId: string): boolean {
    logger.debug('isFinalPhase --->');
    return patientPhaseId === String(PatientPhaseId.POST_OP);
  }

  /**
   * Calls Operations service to advance patient phase.
   *
   * @param userId - User ID
   * @returns Updated user data
   */
  private async advancePatientPhase(userId: string) {
    logger.debug('advancePatientPhase --->');
    const uri = this.configService.get<string>('BASE_OPERATIONS');
    const url = `${uri}${API_ENDPOINTS.OPERATIONS_SERVICE.UPDATE_PATIENT_PHASE}?userId=${userId}`;

    const { data } = await firstValueFrom(this.httpService.put(url, {}));
    return data;
  }

  private async advancePatientPhaseWebhook(userId: string, phase: number) {
    logger.debug('advancePatientPhaseWebhook --->');
    const uri = this.configService.get<string>('BASE_OPERATIONS');
    const url = `${uri}${API_ENDPOINTS.OPERATIONS_SERVICE.UPDATE_PATIENT_PHASE_WEBHOOK}?userId=${userId}&phase=${phase}`;

    const { data } = await firstValueFrom(this.httpService.put(url, {}));
    return data;
  }

  /**
   * Fetches global task configurations for a phase.
   *
   * @param patientPhaseId - Patient phase ID
   * @returns Task configurations
   */
  private async getGlobalTaskConfigsForPhase(patientPhaseId: number) {
    logger.debug('getGlobalTaskConfigsForPhase --->');
    const newTaskConfigs = await this.taskConfigRepository.find({
      where: {
        patient_phase_id: patientPhaseId,
        is_global: true,
        is_active: true,
      },
      order: { display_order: 'ASC' },
    });

    if (!newTaskConfigs.length) {
      logger.warn('No task config found for phase', patientPhaseId);
    }

    return newTaskConfigs;
  }

  /**
   * Checks whether tasks already exist for the given phase.
   *
   * @param userId - User ID
   * @param newPhaseId - New task phase
   * @returns Boolean indicating if tasks exist
   */
  private async hasExistingTasksForPhase(
    userId: string,
    newPhaseId: number,
  ): Promise<boolean> {
    logger.debug('hasExistingTasksForPhase --->');
    const existingTasks = await this.taskRepository.count({
      where: {
        patient_id: userId,
        phase: newPhaseId,
        is_active: true,
      },
    });

    if (existingTasks > 0) {
      logger.warn('Tasks already created for phase', newPhaseId);
      return true;
    }

    return false;
  }

  /**
   * Fetches completed and approved tasks for a phase.
   *
   * @param userId - User ID
   * @param taskPhase - Task phase
   * @returns Completed tasks list
   */
  private async getCompletedTasksForPhase(userId: string, taskPhase: number) {
    logger.debug('getCompletedTasksForPhase --->');
    const tasks = await this.taskRepository.find({
      where: {
        patient_id: userId,
        is_active: true,
        phase: taskPhase,
        is_completed: true,
        is_approved: true,
      },
      order: { created_at: 'DESC' },
    });

    if (!tasks.length) {
      logger.warn('No completed tasks found in previous phase');
    }

    return tasks;
  }

  /**
   * Creates tasks, activities, and assignees for the new phase.
   *
   * - For NON-POST_OP phases: retains existing logic (single task per config, due_date_offset_days)
   * - For POST_OP phase (143): expands daily/weekly/monthly recovery tasks and sets postop_date + due_date
   *
   * @param userId - User ID
   * @param newPhaseId - New task phase
   * @param newTaskConfigs - Task configurations
   * @param referenceTask - Previous phase task (for procedure & assignee)
   */
  private async createTasksForNewPhase(
    userId: string,
    newPhaseId: number,
    newTaskConfigs: any[],
    referenceTask: Task,
    isPostOpPhase: boolean,
  ) {
    logger.debug('createTasksForNewPhase --->');
    await this.dataSource.transaction(async (manager) => {
      let createdTasks: Task[] = [];
      if (!isPostOpPhase) {
        const tasks = manager.getRepository(Task).create(
          newTaskConfigs.map((cfg) => {
            const dueDateStr = cfg.due_date_offset_days
              ? new Date(
                  Date.now() + cfg.due_date_offset_days * 24 * 60 * 60 * 1000,
                )
                  .toISOString()
                  .split('T')[0]
              : null;
            return {
              patient_id: userId,
              phase: Number(newPhaseId),
              procedure_type: referenceTask.procedure_type ?? null,
              task_name: cfg.task_name,
              task_description: cfg.task_description,
              category: cfg.category,
              zoho_form: cfg.zoho_form ?? null,
              content_id: cfg.content_id ?? null,
              screen_id: cfg.screen_id ?? null,
              status: TaskStatusId.PENDING,
              due_date: dueDateStr,
              postop_date: null,
              assigned_to: referenceTask.assigned_to ?? null,
              is_active: true,
            };
          }),
        );
        createdTasks = await manager.getRepository(Task).save(tasks);
      }
      if (isPostOpPhase) {
        const expandedConfigs = newTaskConfigs;
        const tasks = manager.getRepository(Task).create(
          expandedConfigs.map((cfg) => {
            let postopDateStr: string | null = null;
            let dueDateStr: string | null = null;
            if (cfg.__postopDate) {
              const postopDate = new Date(cfg.__postopDate);
              postopDateStr = postopDate.toISOString().split('T')[0];

              const dueDate = new Date(postopDate);
              dueDate.setDate(dueDate.getDate() + 7);
              dueDateStr = dueDate.toISOString().split('T')[0];
            }
            return {
              patient_id: userId,
              phase: Number(newPhaseId),
              procedure_type: referenceTask.procedure_type ?? null,
              task_name: cfg.task_name,
              task_description: cfg.task_description,
              category: cfg.category,
              zoho_form: cfg.zoho_form ?? null,
              content_id: cfg.content_id ?? null,
              screen_id: cfg.screen_id ?? null,
              status: TaskStatusId.PENDING,
              postop_date: postopDateStr,
              due_date: dueDateStr,
              assigned_to: referenceTask.assigned_to ?? null,
              is_active: true,
            };
          }),
        );
        createdTasks = await manager.getRepository(Task).save(tasks);
      }
      await this.createTaskActivities(manager, createdTasks);
      await this.createTaskAssignees(manager, createdTasks);
    });
  }

  private async createTasksForNewPhaseViaWebhook(
    userId: string,
    newPhaseId: number,
    newTaskConfigs: any[],
    referenceTask: Task,
    isPostOpPhase: boolean,
  ) {
    logger.debug('createTasksForNewPhaseViaWebhook --->');
    await this.dataSource.transaction(async (manager) => {
      let createdTasks: Task[] = [];
      if (!isPostOpPhase) {
        const tasks = manager.getRepository(Task).create(
          newTaskConfigs.map((cfg) => {
            const dueDateStr = cfg.due_date_offset_days
              ? new Date(
                  Date.now() + cfg.due_date_offset_days * 24 * 60 * 60 * 1000,
                )
                  .toISOString()
                  .split('T')[0]
              : null;
            return {
              patient_id: userId,
              phase: Number(newPhaseId),
              procedure_type: referenceTask?.procedure_type ?? 28,
              task_name: cfg.task_name,
              task_description: cfg.task_description,
              category: cfg.category,
              zoho_form: cfg.zoho_form ?? null,
              content_id: cfg.content_id ?? null,
              screen_id: cfg.screen_id ?? null,
              status: TaskStatusId.PENDING,
              due_date: dueDateStr,
              postop_date: null,
              assigned_to: referenceTask?.assigned_to ?? this.configService.get<string>('ADMIN_USER_ID'),
              is_active: true,
            };
          }),
        );
        createdTasks = await manager.getRepository(Task).save(tasks);
      }
      if (isPostOpPhase) {
        const expandedConfigs = newTaskConfigs;
        const tasks = manager.getRepository(Task).create(
          expandedConfigs.map((cfg) => {
            let postopDateStr: string | null = null;
            let dueDateStr: string | null = null;
            if (cfg.__postopDate) {
              const postopDate = new Date(cfg.__postopDate);
              postopDateStr = postopDate.toISOString().split('T')[0];

              const dueDate = new Date(postopDate);
              dueDate.setDate(dueDate.getDate() + 7);
              dueDateStr = dueDate.toISOString().split('T')[0];
            }
            return {
              patient_id: userId,
              phase: Number(newPhaseId),
              procedure_type: referenceTask?.procedure_type ?? 28,
              task_name: cfg.task_name,
              task_description: cfg.task_description,
              category: cfg.category,
              zoho_form: cfg.zoho_form ?? null,
              content_id: cfg.content_id ?? null,
              screen_id: cfg.screen_id ?? null,
              status: TaskStatusId.PENDING,
              postop_date: postopDateStr,
              due_date: dueDateStr,
              assigned_to: referenceTask?.assigned_to ?? this.configService.get<string>('ADMIN_USER_ID'),
              is_active: true,
            };
          }),
        );
        createdTasks = await manager.getRepository(Task).save(tasks);
      }
      await this.createTaskActivities(manager, createdTasks);
      await this.createTaskAssignees(manager, createdTasks);
    });
  }
  /**
   * Creates activity records for newly created tasks.
   *
   * @param manager - Transaction manager
   * @param tasks - Created tasks
   */
  private async createTaskActivities(manager, tasks: Task[]) {
    logger.debug('createTaskActivities --->');
    const activities = tasks.map((task) => ({
      task_id: task.id,
      action: TaskAction.TASK_CREATED,
      is_active: true,
      performed_by: this.configService.get<string>('ADMIN_USER_ID'),
      performed_at: new Date(),
    }));

    await manager.getRepository(TaskActivity).save(activities);
  }

  /**
   * Creates assignee records for newly created tasks.
   *
   * @param manager - Transaction manager
   * @param tasks - Created tasks
   */
  private async createTaskAssignees(manager, tasks: Task[]) {
    logger.debug('createTaskAssignees --->');
    const assignees = tasks
      .filter((task) => !!task.assigned_to)
      .map((task) => ({
        task_id: task.id,
        assignee_id: task.assigned_to,
        is_active: true,
        assigned_by: this.configService.get<string>('ADMIN_USER_ID'),
        assigned_at: new Date(),
        updated_at: new Date(),
      }));

    if (assignees.length) {
      await manager.getRepository(TaskAssignee).save(assignees);
    }
  }
  /**
   * Expands recovery task configs into multiple tasks for final phase.
   *
   * - Days 1–14   → 14 daily tasks
   * - Days 15–90  → 12 weekly tasks
   * - Days 91–365 → 9 monthly tasks
   */
  async expandFinalPhaseTasks(taskConfigs: any[], email: string) {
    logger.debug('expandFinalPhaseTasks --->');
    const uri = this.configService.get<string>('BASE_INTEGRATION');
    const urlPath = API_ENDPOINTS.ZOHO_SERVICE.APPOINTMENTS_VIA_EMAIL;
    const appointments = await helpers.fetchPatientAppointmentsWithEmail(
      uri,
      urlPath,
      email,
    );
    if (!appointments?.length || !appointments[0]?.surgery?.date) {
      throw new BadRequestException('Surgery date not found for patient');
    }
    const surgeryDateStr = appointments[0].surgery.date;
    const surgeryDate = new Date(surgeryDateStr);
    const baseDate = new Date(surgeryDate);
    baseDate.setDate(baseDate.getDate() + 1);
    return taskConfigs.flatMap((cfg) => {
      if (cfg.zoho_form === recoveryFormIds.DAYS_1_TO_14) {
        return Array.from({ length: 14 }).map((_, i) => ({
          ...cfg,
          __postopDate: this.addDays(baseDate, i),
        }));
      }
      if (cfg.zoho_form === recoveryFormIds.WEEKS_3_TO_12) {
        return Array.from({ length: 12 }).map((_, i) => ({
          ...cfg,
          __postopDate: this.addDays(baseDate, 14 + (i + 1) * 7),
        }));
      }
      if (cfg.zoho_form === recoveryFormIds.MONTHS_4_TO_12) {
        return Array.from({ length: 9 }).map((_, i) => ({
          ...cfg,
          __postopDate: this.addDays(baseDate, 90 + (i + 1) * 30),
        }));
      }
      return [
        {
          ...cfg,
          __postopDate: baseDate,
        },
      ];
    });
  }

  private addDays(date: Date, days: number): Date {
    logger.debug('addDays --->');
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  }

  async listTaskNames(taskPhase: number) {
    logger.info('listTaskNames --->');
    try {
      const phase = TASK_PHASE_TO_PATIENT_PHASE_MAP[taskPhase];
      const taskNames = await this.taskConfigRepository.find({
        select: ['task_name'],
        where: {
          patient_phase_id: phase,
          is_active: true,
        },
      });
      return new ApiResponseBuilder().success(
        taskNames,
        'Task names retrieved successfully',
        HttpStatus.OK,
      );
    } catch (error) {
      logger.error('listTaskNames --->', error);
      throw error;
    }
  }
}