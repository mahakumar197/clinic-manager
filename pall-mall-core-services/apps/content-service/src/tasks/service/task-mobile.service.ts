import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Brackets, In } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ApiResponseBuilder, HttpStatus } from '@pallmall/shared-types';
import { logger } from '@pallmall/logger';
import {
  API_ENDPOINTS,
  ContentStatus,
  ContentType,
  FormStatus,
  ImageCount,
  ImageCountId,
  TASK_MESSAGES,
  TaskCategory,
  TaskPhase,
  TaskPhaseId,
  TaskStatusId,
  TaskSubmissionType,
} from '@pallmall/common-utils';
import { Task } from '../entities/task.entity';
import { Dropdown } from 'src/master/entities/dropdown.entity';
import { Form } from 'src/forms/entities/form.entity';
import { FormsService } from 'src/forms/services/forms.service';
import { ContentService } from 'src/content/content.service';
import { Content } from 'src/content/entities/content.entity';
import { TaskTrack } from '../entities/task-track.entity';
import { TaskTrackDto } from '../dto/task.dto';
import { TaskESignature } from '../entities/task.eSignature.entity';
import { helpers } from '@pallmall/common-utils';
import { TaskUpload } from '../entities/task-upload.entity';
import { FormSubmission } from 'src/forms/entities/form.submission.entity';
import { TaskSubmission } from '../entities/task-submissions.entity';
import { ConfigService } from '@nestjs/config';
import { Elearning } from 'src/elearnings/entities/elearning.entity';

@Injectable()
export class TaskMobileService {
  constructor(
    @InjectRepository(Task)
    private readonly tasksRepo: Repository<Task>,
    @InjectRepository(Content)
    private readonly contentRepo: Repository<Content>,
    @InjectRepository(TaskTrack)
    private readonly taskTrackRepo: Repository<TaskTrack>,
    @InjectRepository(TaskESignature)
    private readonly taskESignatureRepo: Repository<TaskESignature>,
    @InjectRepository(TaskUpload)
    private readonly taskUploadRepo: Repository<TaskUpload>,
    @InjectRepository(Dropdown)
    private readonly dropdownRepo: Repository<Dropdown>,
    private readonly dataSource: DataSource,
    private readonly formsService: FormsService,
    private readonly configService: ConfigService,
    private readonly contentService: ContentService,
    @InjectRepository(FormSubmission)
    private readonly formSubmissionRepository: Repository<FormSubmission>,
  ) {}

  /**
   * Fetches tasks based on patient ID or task ID.
   *
   * @param params - Query parameters
   * @returns Task data
   */

  private async taskFetch(params: { patientId?: string; taskId?: string }) {
    logger.debug('taskFetch --->');
    const qb = this.tasksRepo
      .createQueryBuilder('task')
      .where('task.is_active = true')

      .leftJoin(
        'dropdowns',
        'procedure_type',
        `"procedure_type"."id" = task.procedure_type
       AND "procedure_type"."type" = 'ProcedureType'
       AND "procedure_type"."isActive" = true`,
      )
      .leftJoin(
        'dropdowns',
        'phase',
        `"phase"."id" = task.phase
       AND "phase"."type" = 'TaskPhase'
       AND "phase"."isActive" = true`,
      )
      .leftJoin(
        'dropdowns',
        'category',
        `"category"."id" = task.category
       AND "category"."type" = 'TaskCategory'
       AND "category"."isActive" = true`,
      )
      .leftJoin(
        'dropdowns',
        'status',
        `"status"."id" = task.status
       AND "status"."type" = 'TaskStatus'
       AND "status"."isActive" = true`,
      )
      .select('task')
      .addSelect([
        'procedure_type.beValue AS procedureTypeLabel',
        'phase.beValue AS phaseLabel',
        'category.beValue AS categoryLabel',
        'status.beValue AS statusLabel',
      ])
      .orderBy('task.created_at', 'ASC');

    if (params.patientId) {
      qb.andWhere('task.patient_id = :patientId', {
        patientId: params.patientId,
      });
    }

    if (params.taskId) {
      qb.andWhere('task.id = :taskId', {
        taskId: params.taskId,
      });
    }

    return qb.getRawMany();
  }
  // ---------------------------
  // GET TASKS
  // ---------------------------
  /**
   * Retrieves tasks for a specific patient.
   *
   * @param patientId - Patient ID
   * @returns Task data
   */

  async getTasks(patientId: string) {
    logger.info('Get tasks...');
    try {
      const rows = await this.taskFetch({ patientId });
      if (!rows || rows.length === 0) {
        throw new NotFoundException(
          `No tasks found for patient ID ${patientId}`,
        );
      }
      const groupedByPhase = rows.reduce((acc, row) => {
        const phaseId = row.task_phase;
        if (!acc[phaseId]) {
          acc[phaseId] = {
            phaseId,
            phase: row.phaselabel,
            completed: 0,
            total: 0,
            tasks: [],
          };
        }
        const taskData = Object.keys(row).reduce(
          (task, key) => {
            if (key.startsWith('task_')) {
              task[key.replace('task_', '')] = row[key];
            }
            return task;
          },
          {} as Record<string, string | number | boolean>,
        );
        taskData.procedure_type_label = row.proceduretypelabel;
        taskData.category_label = row.categorylabel;
        taskData.status_label = row.statuslabel;
        taskData.phase_label = row.phaselabel;
        acc[phaseId].total += 1;
        if (taskData.is_completed === true) {
          acc[phaseId].completed += 1;
        }
        acc[phaseId].tasks.push(taskData);
        return acc;
      }, {});
      const PHASE_ORDER: Record<number, number> = {
        15: 1,
        13: 2,
        14: 3,
      };
      const orderedPhases = Object.values(groupedByPhase)
        .sort(
          (a: any, b: any) =>
            (PHASE_ORDER[a.phaseId] ?? 999) - (PHASE_ORDER[b.phaseId] ?? 999),
        )
        .map((phase: any) => {
          if (phase.phaseId === 14) {
            return {
              ...phase,
              tasks: [...phase.tasks].sort((a: any, b: any) => {
                if (!a.postop_date) return 1;
                if (!b.postop_date) return -1;

                return (
                  new Date(a.postop_date).getTime() -
                  new Date(b.postop_date).getTime()
                );
              }),
            };
          }

          return phase;
        });
      logger.info(`Get tasks -> ${HttpStatus.OK}`);
      return new ApiResponseBuilder().success(
        orderedPhases,
        TASK_MESSAGES.TASK_FETCHED,
        HttpStatus.OK,
      );
    } catch (error) {
      logger.error('Get tasks ->', error);
      return new ApiResponseBuilder().error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ---------------------------
  // GET THUMBNAILS
  // ---------------------------
  async getThumbnails() {
    logger.info('getThumbnails --->');
    try {
      const content = await this.contentRepo.find({
        where: {
          status: ContentStatus.PUBLISHED,
        },
        order: {
          published_at: 'DESC',
        },
      });

      const pickThumbnail = async (c: Content): Promise<string | null> => {
        const raw =
          c?.thumbnail_url ||
          (Array.isArray(c?.content_url) && c.content_url.length > 0
            ? c.content_url[0]
            : null);

        if (!raw) return null;

        if (/^https?:\/\//i.test(raw)) {
          return raw;
        }

        return helpers.getFileUrlFromAzure(raw);
      };

      const resolved = await Promise.all(
        content.map(async (c) => ({
          type: c.type,
          thumb: await pickThumbnail(c),
        })),
      );

      const result: Array<
        | { image: string; type: 'image' }
        | { video: string; type: 'video' }
        | { elearning: string; type: 'elearning' }
        | { blog: string; type: 'blog' }
      > = [];

      resolved.forEach(({ type, thumb }) => {
        if (!thumb) return;

        if (type === ContentType.IMAGE && !result.find((r) => 'image' in r)) {
          result.push({ image: thumb, type: 'image' });
        }

        if (type === ContentType.VIDEO && !result.find((r) => 'video' in r)) {
          result.push({ video: thumb, type: 'video' });
        }

        if (
          type === ContentType.ELEARNING &&
          !result.find((r) => 'elearning' in r)
        ) {
          result.push({ elearning: thumb, type: 'elearning' });
        }

        if (type === ContentType.BLOG && !result.find((r) => 'blog' in r)) {
          result.push({ blog: thumb, type: 'blog' });
        }
      });

      logger.info(`Get thumbnails ->${HttpStatus.OK}`);

      return new ApiResponseBuilder().success(
        result,
        TASK_MESSAGES.THUMBNAILS_FETCHED,
        HttpStatus.OK,
      );
    } catch (error) {
      logger.error('Get thumbnails ->', error);
      return new ApiResponseBuilder().error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ---------------------------
  // GET TASK BY ID
  // ---------------------------
  /**
   * Retrieves a task by its ID.
   *
   * @param taskId - Task ID
   * @returns Task data
   */
  async fetchTaskbyId(taskId: string) {
    logger.info('Get task for mobile by id...');

    try {
      const rows = await this.taskFetch({ taskId });

      if (!rows || rows.length === 0) {
        throw new NotFoundException(`Task with id ${taskId} not found`);
      }

      const row = rows[0];
      const task: Record<string, any> = {};

      for (const key of Object.keys(row)) {
        if (key.startsWith('task_')) {
          task[key.replace('task_', '')] = row[key];
        }
      }

      task.procedure_type_label = row.proceduretypelabel;
      task.phase_label = row.phaselabel;
      task.category_label = row.categorylabel;
      task.status_label = row.statuslabel;
      switch (task.category_label) {
        case TaskCategory.FORM_RESPONSE: {
          if (task.phase_label === TaskPhase.POST_OP) {
            const today = new Date();
            const postOpDate = new Date(task.postop_date);
            if (today < postOpDate) {
              throw new NotFoundException(
                `Check dashboard to complete this task.`,
              );
            }
          }
          const forms = await helpers.getPatientSpecificForms(
            process.env.BASE_INTEGRATION,
            API_ENDPOINTS.ZOHO_FORM_SERVICE.GET_PATIENT_FORMS,
            task.patient_id,
          );
          const form = await this.formsService.findOne(task.zoho_form);
          if (!form) {
            throw new NotFoundException(
              `Form with id ${task.zoho_form} not found`,
            );
          }
          const normalize = (value: string) =>
            value
              ?.toLowerCase()
              .replace(/[^a-z0-9\s]/g, '')
              .replace(/\s+/g, ' ')
              .trim();

          const formName = normalize(form.data.name);

          const matchedForm = forms?.find((patientForm) => {
            const patientFormName = normalize(patientForm.form_name);
            const helperFormName = normalize(patientForm.helper_form_name);

            return (
              patientFormName.includes(formName) ||
              formName.includes(patientFormName) ||
              helperFormName.includes(formName) ||
              formName.includes(helperFormName)
            );
          });

          if (!matchedForm) {
            throw new ServiceUnavailableException(
              'Dynamic form was not yet updated. Please try again later.',
            );
          }
          form.data.form_link = matchedForm?.form_link;
          task.form = form.data;
          break;
        }

        case TaskCategory.WATCH_CONTENT: {
          if (!task.content_id || task.content_id === null) {
            break;
          }
          const content = await this.contentService.findOneContent(
            task.content_id,
          );

          let transformedContent = await this.transformContent(
            content.data,
            task.patient_id,
            task.id,
          );
          task.content = transformedContent;
          break;
        }

        default:
          break;
      }

      logger.info(`Get task for mobile by id -> ${HttpStatus.OK}`);

      return new ApiResponseBuilder().success(
        task,
        TASK_MESSAGES.TASK_FETCHED,
        HttpStatus.OK,
      );
    } catch (error) {
      logger.error('Get task by id ->', error);
      throw error;
    }
  }

  // ---------------------------
  // TASK TRACK
  // ---------------------------

  /**
   * Tracks a task.
   *
   * @param taskId - Task ID
   * @param envalue - Envalue
   * @param userId - User ID
   * @param dto - Task track data
   * @returns Task track data
   */
  async taskTrack(
    taskId: string,
    envalue: string,
    userId: string,
    dto: TaskTrackDto,
  ) {
    logger.info('Task track...');
    try {
      const taskData = await this.taskFetch({ taskId });
      if (!taskData) {
        throw new NotFoundException(`Task with id ${taskId} not found`);
      }
      switch (taskData[0].categorylabel) {
        case TaskCategory.WATCH_CONTENT: {
          if (
            !taskData[0].task_content_id ||
            taskData[0].task_content_id === null
          ) {
            break;
          }
          const content = await this.contentService.findOneContent(
            taskData[0].task_content_id,
          );
          if (content.data.type === ContentType.ELEARNING) {
            const orderedLessons = Object.entries(content.data.eLearnings)
              .sort(([keyA], [keyB]) => {
                const a = Number(keyA.replace('lesson', ''));
                const b = Number(keyB.replace('lesson', ''));
                return a - b;
              })
              .map(([lessonKey, lessonValue], index) => ({
                lessonIndex: index + 1,
                lessonKey,
                ...lessonValue,
              }));

            let trackData = await this.taskTrackRepo.findOne({
              where: {
                task_id: taskData[0].task_id,
                patient_id: userId,
              },
            });

            if (trackData) {
              trackData.track_data = {
                ...(trackData.track_data ?? {}),
                [envalue]: 'completed',
              };

              await this.taskTrackRepo.save(trackData);
            } else {
              trackData = this.taskTrackRepo.create({
                task_id: taskData[0].task_id,
                patient_id: userId,
                track_data: {
                  [envalue]: 'completed',
                },
              });

              await this.taskTrackRepo.save(trackData);
            }
            const trackDataLength = Object.keys(
              trackData.track_data as Record<string, string>,
            ).length;

            if (trackDataLength === orderedLessons.length) {
              await this.tasksRepo.update(taskData[0].task_id, {
                is_completed: true,
                is_approved: true,
                status: TaskStatusId.COMPLETED,
                approved_at: new Date(),
                completed_at: new Date(),
              });
              try {
                const uri = this.configService.get('BASE_OPERATIONS');
                const url = API_ENDPOINTS.OPERATIONS_SERVICE.USER_DATA_FETCH;

                const userMap = await helpers.fetchUsersByIds(uri, url, [
                  userId,
                ]);
                await helpers.taskAutomation(
                  this.configService.get('BASE_CONTENT'),
                  API_ENDPOINTS.CONTENT_SERVICE.TASK_AUTOMATION,
                  userMap[userId]?.patient_phase_id,
                  userId,
                );
              } catch (err) {
                logger.error('Task automation side-effects failed', err);
              }
            }
          }
          if (content.data.type === ContentType.VIDEO) {
            let trackData = await this.taskTrackRepo.findOne({
              where: {
                task_id: taskData[0].task_id,
                patient_id: userId,
              },
            });
            if (trackData) {
              trackData.track_data = {
                ...(trackData.track_data ?? {}),
                [envalue]: 'completed',
              };

              await this.taskTrackRepo.save(trackData);
              await this.tasksRepo.update(taskData[0].task_id, {
                is_completed: true,
              });
            } else {
              trackData = this.taskTrackRepo.create({
                task_id: taskData[0].task_id,
                patient_id: userId,
                track_data: {
                  [envalue]: 'completed',
                },
              });
              await this.taskTrackRepo.save(trackData);
              await this.tasksRepo.update(taskData[0].task_id, {
                is_completed: true,
                status: TaskStatusId.COMPLETED,
                completed_at: new Date(),
              });
            }
          }
          break;
        }
        case TaskCategory.E_SIGNATURE: {
          const { signature } = dto;
          const taskTrack = await this.taskTrackRepo.create({
            task_id: taskId,
            patient_id: userId,
            track_data: { signature: signature },
          });
          await this.taskTrackRepo.save(taskTrack);
          await this.tasksRepo.update(taskId, {
            is_completed: true,
            status: TaskStatusId.COMPLETED,
            completed_at: new Date(),
          });
          const saveSignature = await this.taskESignatureRepo.create({
            task_id: taskId,
            patient_id: userId,
            signature: signature,
          });
          await this.taskESignatureRepo.save(saveSignature);
        }
        default:
          break;
      }
      logger.info(`Task track -> ${HttpStatus.OK}`);
      return new ApiResponseBuilder().success(
        {},
        TASK_MESSAGES.TASK_TRACKED,
        HttpStatus.OK,
      );
    } catch (error) {
      logger.error('Task track ->', error);
      return new ApiResponseBuilder().error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ---------------------------
  // FETCH TASK TRACK
  // ---------------------------

  /**
   * Retrieves a task track by task ID and user ID.
   *
   * @param taskId - Task ID
   * @param userId - User ID
   * @returns Task track data
   */
  async fetchTaskTrack(taskId: string, userId: string) {
    logger.info('Fetch task track...');
    try {
      const trackData = await this.taskTrackRepo.findOne({
        where: {
          task_id: taskId,
          patient_id: userId,
        },
      });

      if (!trackData) {
        return new ApiResponseBuilder().success(
          null,
          TASK_MESSAGES.TASK_TRACK_FETCHED,
          HttpStatus.OK,
        );
      }

      const formResponses = trackData.form_response ?? [];

      if (!formResponses.length) {
        return new ApiResponseBuilder().success(
          {
            ...trackData,
            forms: [],
          },
          TASK_MESSAGES.TASK_TRACK_FETCHED,
          HttpStatus.OK,
        );
      }

      const submissionIds = formResponses.map((f) => f.submissionId);

      const submissions = await this.formSubmissionRepository
        .createQueryBuilder('fs')
        .leftJoinAndSelect('fs.answers', 'fa')
        .leftJoinAndSelect('fa.question', 'fq')
        .leftJoinAndSelect('fs.form', 'f')
        .where('fs.id IN (:...submissionIds)', { submissionIds })
        .orderBy('fq.display_order', 'ASC')
        .getMany();

      const forms = submissions.map((submission) => ({
        submissionId: submission.id,
        formId: submission.form.id,
        formName: submission.form.name,
        status: submission.status,
        submittedAt: submission.submitted_at,
        signature: submission.signature_image,
        form: submission.form,
        answers: submission.answers.map((a) => ({
          questionId: a.question.id,
          question: a.question.question,
          questionType: a.question.question_type,
          nodeType: a.question.node_type,
          displayOrder: a.question.display_order,
          options: a.question.options,
          answer: a.answer,
        })),
      }));
      logger.info(`Task track fetched -> ${HttpStatus.OK}`);
      return new ApiResponseBuilder().success(
        {
          id: trackData.id,
          task_id: trackData.task_id,
          patient_id: trackData.patient_id,
          steps: trackData.steps,
          created_at: trackData.created_at,
          updated_at: trackData.updated_at,
          forms,
        },
        TASK_MESSAGES.TASK_TRACK_FETCHED,
        HttpStatus.OK,
      );
    } catch (error) {
      logger.error('Fetch task track ->', error);
      return new ApiResponseBuilder().error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ---------------------------
  // TRANSFORM CONTENT
  // ---------------------------
  /**
   * Transforms content data.
   *
   * @param content - Content data
   * @returns Transformed content data
   */
  private async transformContent(
    content: Content,
    userId: string,
    taskId: string,
  ) {
    logger.debug('transformContent --->');
    if (
      content.type === ContentType.IMAGE &&
      Array.isArray(content.content_url)
    ) {
      const imgCountType =
        content.img_count === ImageCountId.SINGLE
          ? ImageCount.SINGLE
          : ImageCount.MULTIPLE;

      return {
        ...content,
        img_urls: await this.parseImageUrls(
          content.content_url,
          content.img_count,
        ),
        imageCountType: imgCountType,
        thumbnail_url: content.thumbnail_url
          ? await helpers.getFileUrlFromAzure(content.thumbnail_url)
          : null,
      };
    }

    if (content.type === ContentType.VIDEO) {
      return {
        ...content,
        video_url: content.content_url?.[0]
          ? await helpers.getFileUrlFromAzure(content.content_url[0])
          : null,
      };
    }

    if (content.type === ContentType.ELEARNING) {
      const trackData = await this.taskTrackRepo.findOne({
        where: {
          task_id: taskId,
          patient_id: userId,
        },
      });

      const trackMap = trackData?.track_data ?? {};

      const orderedLessons = await Promise.all(
        Object.entries(content.eLearnings)
          .sort(([keyA], [keyB]) => {
            const a = Number(keyA.replace('lesson', ''));
            const b = Number(keyB.replace('lesson', ''));
            return a - b;
          })
          .map(async ([lessonKey, lessonValue]: [string, any], index) => {
            const thumbnailUrl = content.thumbnail_url
              ? await helpers.getFileUrlFromAzure(content.thumbnail_url)
              : null;

            const contentUrl = lessonValue.content_Url
              ? await helpers.getFileUrlFromAzure(lessonValue.content_Url)
              : null;

            const watched = trackMap?.[lessonKey] === 'completed';

            return {
              lessonIndex: index + 1,
              lessonKey,
              ...lessonValue,
              thumbnailUrl,
              contentUrl,
              watched,
            };
          }),
      );

      return {
        ...content,
        eLearnings: orderedLessons,
      };
    }

    return content;
  }

  /**
   * Parses image URLs.
   *
   * @param urls - Array of image URLs
   * @param img_count - Image count
   * @returns Parsed image URLs
   */
  private async parseImageUrls(urls: string[] = [], img_count: number) {
    logger.debug('parseImageUrls --->');
    const emptyResult = {
      url_single: null,
      url_before: null,
      url_after: null,
    };

    if (!Array.isArray(urls) || urls.length === 0) {
      return emptyResult;
    }

    if (img_count === ImageCountId.SINGLE) {
      return {
        ...emptyResult,
        url_single: await helpers.getFileUrlFromAzure(urls[0]),
      };
    }

    await Promise.all(
      urls.map(async (rawUrl) => {
        if (rawUrl.startsWith('before:')) {
          emptyResult.url_before = await helpers.getFileUrlFromAzure(
            rawUrl.replace('before:', ''),
          );
        } else if (rawUrl.startsWith('after:')) {
          emptyResult.url_after = await helpers.getFileUrlFromAzure(
            rawUrl.replace('after:', ''),
          );
        }
      }),
    );

    return emptyResult;
  }

  // ---------------------------
  // TASK FILE UPLOAD
  // ---------------------------
  /**
   * Uploads a file or e-signature for a task.
   *
   * - Validates task existence
   * - Determines task category
   * - Creates task submission
   * - Stores uploaded file / e-signature
   * - Marks task as completed
   *
   * @param taskId - Task ID
   * @param fileContent - File content
   * @param userId - User ID
   * @returns Task submission response
   */
  async taskFileUpload(taskId: string, fileContent: string, userId: string) {
    logger.info('Task file upload...');
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const task = await this.getTaskOrFail(queryRunner, taskId);
      const categoryType = await this.getTaskCategoryOrFail(queryRunner, task);

      const submission = await this.createTaskSubmissionByCategory(
        queryRunner,
        task,
        categoryType,
        userId,
      );

      await this.persistTaskUploadByCategory(
        queryRunner,
        task,
        submission,
        categoryType,
        fileContent,
        userId,
      );

      await this.markTaskAsCompleted(queryRunner, taskId);

      await queryRunner.commitTransaction();

      logger.info(`Task file upload -> ${HttpStatus.OK}`);
      return new ApiResponseBuilder().success(
        { submissionId: submission.id },
        TASK_MESSAGES.TASK_FILE_UPLOADED,
        HttpStatus.OK,
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      logger.error('Task file upload ->', error);
      return new ApiResponseBuilder().error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Fetches task by ID or throws error if not found.
   *
   * @param queryRunner - Transactional query runner
   * @param taskId - Task ID
   * @returns Task entity
   */
  private async getTaskOrFail(queryRunner, taskId: string): Promise<Task> {
    logger.debug('getTaskOrFail --->');
    const task = await queryRunner.manager.findOne(Task, {
      where: { id: taskId },
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return task;
  }

  /**
   * Fetches task category dropdown entry.
   *
   * @param queryRunner - Transactional query runner
   * @param task - Task entity
   * @returns Category dropdown entity
   */
  private async getTaskCategoryOrFail(queryRunner, task: Task) {
    logger.debug('getTaskCategoryOrFail --->');
    const categoryType = await queryRunner.manager.findOne(
      this.dropdownRepo.target,
      { where: { id: task.category } },
    );

    if (!categoryType) {
      throw new BadRequestException('Invalid task category');
    }

    return categoryType;
  }

  /**
   * Creates task submission based on task category.
   *
   * @param queryRunner - Transactional query runner
   * @param task - Task entity
   * @param categoryType - Category dropdown entity
   * @param userId - User ID
   * @returns Created TaskSubmission
   */
  private async createTaskSubmissionByCategory(
    queryRunner,
    task: Task,
    categoryType,
    userId: string,
  ): Promise<TaskSubmission> {
    logger.debug('createTaskSubmissionByCategory --->');
    let submission: TaskSubmission;

    if (categoryType.beValue === TaskCategory.FILE_UPLOAD) {
      submission = queryRunner.manager.create(TaskSubmission, {
        task,
        submitted_by: userId,
        status: FormStatus.SUBMITTED,
        submitted_at: new Date(),
        is_guest: false,
        type: TaskSubmissionType.FILE_UPLOAD,
      });
    } else if (categoryType.beValue === TaskCategory.E_SIGNATURE) {
      submission = queryRunner.manager.create(TaskSubmission, {
        task,
        submitted_by: userId,
        status: FormStatus.SUBMITTED,
        submitted_at: new Date(),
        is_guest: false,
        type: TaskSubmissionType.E_SIGNATURE,
      });
    } else {
      throw new BadRequestException(
        'Unsupported task category for file upload',
      );
    }

    return queryRunner.manager.save(submission);
  }

  /**
   * Persists file upload or e-signature based on task category.
   *
   * @param queryRunner - Transactional query runner
   * @param task - Task entity
   * @param submission - Task submission entity
   * @param categoryType - Category dropdown entity
   * @param fileContent - File content
   * @param userId - User ID
   */
  private async persistTaskUploadByCategory(
    queryRunner,
    task: Task,
    submission: TaskSubmission,
    categoryType,
    fileContent: string,
    userId: string,
  ) {
    logger.debug('persistTaskUploadByCategory --->');
    if (categoryType.beValue === TaskCategory.FILE_UPLOAD) {
      const upload = queryRunner.manager.create(TaskUpload, {
        submission,
        task,
        task_id: task.id,
        patient_id: userId,
        file_content: fileContent,
        is_active: true,
      });
      await queryRunner.manager.save(upload);
    }

    if (categoryType.beValue === TaskCategory.E_SIGNATURE) {
      const eSignature = queryRunner.manager.create(TaskESignature, {
        submission,
        patient_id: userId,
        task_id: task.id,
        signature: fileContent,
      });
      await queryRunner.manager.save(eSignature);
    }
  }

  /**
   * Marks task as completed.
   *
   * @param queryRunner - Transactional query runner
   * @param taskId - Task ID
   */
  private async markTaskAsCompleted(queryRunner, taskId: string) {
    logger.debug('markTaskAsCompleted --->');
    await queryRunner.manager.update(
      Task,
      { id: taskId },
      {
        is_completed: true,
        status: TaskStatusId.COMPLETED,
        completed_at: new Date(),
      },
    );
  }

  // ---------------------------
  // GET POST OP FORM
  // ---------------------------
  /**
   * Retrieves a post-op form for a patient.
   *
   * @param userId - User ID
   * @param token - Token
   * @returns Post-op form data
   */
  async getPostOpForm(userId: string) {
    logger.info('getPostOpForm --->');
    try {
      const today = new Date().toISOString().split('T')[0];
      const task = await this.tasksRepo
        .createQueryBuilder('task')
        .where('task.patient_id = :userId', { userId })
        .andWhere('task.phase = :phase', { phase: TaskPhaseId.POST_OP })
        .andWhere('task.is_active = true')
        .andWhere(
          new Brackets((qb) => {
            qb.where('task.is_completed IS NULL').orWhere(
              'task.is_completed = false',
            );
          }),
        )
        .andWhere('task.postop_date <= :today', { today })
        .orderBy('task.postop_date', 'ASC')
        .addOrderBy('task.created_at', 'ASC')
        .getOne();
      if (!task) {
        const nextTask = await this.tasksRepo
          .createQueryBuilder('task')
          .select(['task.postop_date'])
          .where('task.patient_id = :userId', { userId })
          .andWhere('task.phase = :phase', { phase: TaskPhaseId.POST_OP })
          .andWhere('task.is_active = true')
          .andWhere(
            new Brackets((qb) => {
              qb.where('task.is_completed IS NULL').orWhere(
                'task.is_completed = false',
              );
            }),
          )
          .andWhere('task.postop_date > :today', { today })
          .orderBy('task.postop_date', 'ASC')
          .getOne();
        if (nextTask?.postop_date) {
          const nextDate = new Date(nextTask.postop_date)
            .toISOString()
            .split('T')[0];
          const completedCount = await this.tasksRepo.count({
            where: {
              patient_id: userId,
              phase: TaskPhaseId.POST_OP,
              is_completed: true,
              is_active: true,
            },
          });

          if (completedCount === 0) {
            throw new NotFoundException(
              `Your post-op forms will be available from ${nextDate}.`,
            );
          }
          throw new NotFoundException(
            `All forms are completed up to today. Your next form will be available on ${nextDate}.`,
          );
        }
        throw new NotFoundException(
          `All the forms have been filled. No upcoming forms available.`,
        );
      }
      return await this.fetchTaskbyId(task.id);
    } catch (error) {
      logger.error('getPostOpForm failed', error);
      throw error;
    }
  }

  // ---------------------------
  // GET POST OP PROGRESS
  // ---------------------------
  /**
   * Calculates the post-op form progress (submitted vs total) and days post-op.
   *
   * @param userId - User ID
   * @returns Progress data payload for the UI
   */
  async getPostOpProgress(userId: string) {
    logger.info('getPostOpProgress --->');
    try {
      const postOpTasks = await this.tasksRepo.find({
        where: {
          phase: TaskPhaseId.POST_OP,
          patient_id: userId,
          is_active: true,
        },
        order: {
          postop_date: 'ASC',
        },
      });

      if (!postOpTasks.length) {
        return { progress: '0/0' };
      }
      const grouped = postOpTasks.reduce<Record<string, any[]>>((acc, task) => {
        const key = task.zoho_form;
        if (!key) return acc;
        acc[key] = acc[key] || [];
        acc[key].push(task);
        return acc;
      }, {});
      const sortedGroups = Object.values(grouped).sort(
        (a, b) =>
          new Date(a[0].postop_date).getTime() -
          new Date(b[0].postop_date).getTime(),
      );
      const currentGroup =
        sortedGroups.find((group) =>
          group.some((task) => !task.completed_at),
        ) || sortedGroups.at(-1);

      const total = currentGroup.length;
      const submitted = currentGroup.filter(
        (t) => t.is_completed === true || !!t.completed_at,
      ).length;
      const response = {
        completed: submitted,
        total: total,
      };
      return new ApiResponseBuilder().success(
        response,
        'Count Fetched Successfully',
        HttpStatus.OK,
      );
    } catch (error) {
      logger.error(`Fetch task status counts -> ${error}`);
      throw error;
    }
  }

  async updateTaskCompletion(taskId: string, userId: string) {
    logger.info('updateTaskCompletion --->');
    try {
      const task = await this.tasksRepo.findOne({
        where: { id: taskId },
      });
      if (!task) {
        throw new NotFoundException(`Task not found with ID: ${taskId}`);
      }
      if (task.patient_id !== userId) {
        throw new ConflictException('You are not authorized to update this task');
      }
      task.is_completed = true;
      task.completed_at = new Date();
      task.status = TaskStatusId.COMPLETED;
      await this.tasksRepo.save(task);
      return new ApiResponseBuilder().success(
        task,
        'Task completed successfully',
        HttpStatus.OK,
      );
    } catch (error) {
      logger.error(`Update task completion -> ${error}`);
      throw error;
    }
  }
}