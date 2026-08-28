import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, ILike } from 'typeorm';
import { logger } from '@pallmall/logger';
import { ApiResponseBuilder, HttpStatus } from '@pallmall/shared-types';
import { FormSubmission } from '../entities/form.submission.entity';
import { FormResponse } from '../entities/form.response.entity';
import {
  FormStatus,
  TaskStatusId,
  QuestionType,
  NodeType,
  helpers,
  API_ENDPOINTS,
} from '@pallmall/common-utils';
import { NewFormSubmissionDto } from '../dto/form.dto';
import { Task } from 'src/tasks/entities/task.entity';
import { TaskTrack } from 'src/tasks/entities/task-track.entity';
import { Form } from '../entities/form.entity';
import { ConfigService } from '@nestjs/config';
import { FormFieldMapping } from '../entities/form.field.mapping.entity';

@Injectable()
export class FormResponseService {
  constructor(
    @InjectRepository(FormSubmission)
    private readonly formSubmissionRepository: Repository<FormSubmission>,
    @InjectRepository(FormResponse)
    private readonly formResponseRepository: Repository<FormResponse>,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(TaskTrack)
    private readonly taskTrackRepository: Repository<TaskTrack>,
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
    @InjectRepository(FormFieldMapping)
    private readonly mappingRepo: Repository<FormFieldMapping>,
  ) {}

  // ---------------------------
  // GET NEW FORM SUBMISSIONS
  // ---------------------------

  /**
   * @param formId       - Form ID
   * @param submissionId - Submission ID
   */
  async getNewFormSubmissions(formId: string, submissionId: string) {
    logger.info('getNewFormSubmissions --->', { formId, submissionId });
    try {
      const submissions = await this.formSubmissionRepository
        .createQueryBuilder('fs')
        .leftJoinAndSelect('fs.form', 'f')
        .leftJoinAndSelect('fs.form_responses', 'fr')
        .where('fs.form_id = :formId', { formId })
        .andWhere('fs.id = :submissionId', { submissionId })
        .orderBy('fs.created_at', 'DESC')
        .addOrderBy('fr.created_at', 'ASC')
        .getMany();

      const response = submissions.map((submission) => ({
        submissionId: submission.id,
        status: submission.status,
        submittedAt: submission.submitted_at,
        signature: submission.signature_image,
        form: submission.form,
        answers: (submission.form_responses ?? []).map((fr) => ({
          questionId: fr.link_name,
          question: fr.display_name,
          questionType: fr.question_type,
          nodeType: fr.node_type,
          displayOrder: null,
          options: fr.options,
          answer: fr.answers,
        })),
      }));

      logger.info('getNewFormSubmissions --->', { status: HttpStatus.OK });
      return new ApiResponseBuilder().success(
        response,
        'Form submissions retrieved successfully',
        HttpStatus.OK,
      );
    } catch (error) {
      logger.error('getNewFormSubmissions --->', error);
      return new ApiResponseBuilder().error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ---------------------------
  // SUBMIT NEW FORM
  // ---------------------------

  /**
   * Submits a new form using Zoho field structure.
   * - questionId from payload is stored as link_name
   * - displayName is stored as display_name
   * - If submittedBy exists, stored in submitted_by; else is_guest = true
   * - If both submittedBy and taskId exist, the linked task is marked completed
   */
  async submitNewForm(dto: NewFormSubmissionDto, submittedBy: string | null) {
    logger.info('submitNewForm ...');
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const submission = queryRunner.manager.create(FormSubmission, {
        form: dto.formId ? ({ id: dto.formId } as any) : undefined,
        submitted_by: submittedBy ?? null,
        status: FormStatus.SUBMITTED,
        submitted_at: new Date(),
        is_guest: !submittedBy,
        task_id: dto.taskId ?? null,
        signature_image: dto.signature_image ?? null,
      });
      await queryRunner.manager.save(submission);

      const responses = dto.answers.map((field) => {
        const normalizedAnswers =
          field.answer === null || field.answer === undefined
            ? null
            : Array.isArray(field.answer)
              ? field.answer.map((v) => String(v))
              : [String(field.answer)];

        return queryRunner.manager.create(FormResponse, {
          submission,
          link_name: field.questionId,
          display_name: field.displayName,
          question_type: field.questionType,
          node_type: field.nodeType,
          answers: normalizedAnswers,
          options: field.options ?? null,
        });
      });
      await queryRunner.manager.save(responses);

      if (dto.taskId && submittedBy) {
        const task = await queryRunner.manager.findOne(Task, {
          where: { id: dto.taskId },
        });
        if (!task) {
          throw new NotFoundException('Task not found');
        }
        task.status = TaskStatusId.COMPLETED;
        task.is_completed = true;
        task.completed_at = new Date();
        await queryRunner.manager.save(task);

        const existingTrack = await queryRunner.manager.findOne(TaskTrack, {
          where: {
            task_id: dto.taskId,
            patient_id: submittedBy,
          },
        });
        if (existingTrack) {
          existingTrack.form_response = [
            ...(existingTrack.form_response ?? []),
            { formId: dto.formId, submissionId: submission.id },
          ];
          existingTrack.steps = [
            ...(existingTrack.steps ?? []),
            ...(dto.steps ?? []),
          ];
          await queryRunner.manager.save(existingTrack);
        } else {
          const taskTrack = queryRunner.manager.create(TaskTrack, {
            task_id: dto.taskId,
            patient_id: submittedBy,
            form_response: [
              { formId: dto.formId, submissionId: submission.id },
            ],
            steps: dto.steps,
          });
          await queryRunner.manager.save(taskTrack);
        }
      }

      await queryRunner.commitTransaction();

      logger.info(`submitNewForm ---> ${HttpStatus.CREATED}`);
      return new ApiResponseBuilder().success(
        {
          submissionId: submission.id,
          responseCount: responses.length,
        },
        'Form submitted successfully',
        HttpStatus.CREATED,
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      logger.error('submitNewForm --->', error);
      return new ApiResponseBuilder().error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await queryRunner.release();
    }
  }
  extractEmail = (payload: Record<string, any>): string | null => {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/;
    for (const value of Object.values(payload)) {
      if (typeof value === 'string') {
        const match = value.match(emailRegex);
        if (match) return match[0];
      }
    }
    return null;
  };

  private extractEmails(payload: Record<string, any>): string[] {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/gi;

    const emails = new Set<string>();

    for (const value of Object.values(payload)) {
      if (typeof value !== 'string') {
        continue;
      }

      const matches = value.match(emailRegex);

      if (!matches?.length) {
        continue;
      }

      matches.forEach((email) => emails.add(email.toLowerCase()));
    }

    return [...emails];
  }

  extractFormKey = (url: string): string | null => {
    try {
      const match = url.match(/\/form\/([^/]+)\//);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  };

  extractUrlFromPayload = (requestBody: Record<string, any>): string | null => {
    const urlRegex = /https?:\/\/[^\s]+/;
    for (const value of Object.values(requestBody)) {
      if (typeof value === 'string' && urlRegex.test(value)) {
        return value.match(urlRegex)?.[0] || null;
      }
    }
    return null;
  };

  // ---------------------------
  // SAVE WEBHOOK FORM SUBMISSION
  // ---------------------------
  async saveWebhookSubmission(payload: any) {
    logger.info('saveWebhookSubmission ...', payload);
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const email = this.extractEmail(payload);
      let user;
      if (email) {
        try {
          const operationsBase = this.configService.get('BASE_OPERATIONS');
          user = await helpers.fetchUserByNameOrEmail(
            operationsBase,
            API_ENDPOINTS.OPERATIONS_SERVICE.FIND_USER_BY_NAME_OR_EMAIL,
            email,
          );
        } catch (error) {
          const message = error?.response?.data?.message;
          if (message === 'User not found') {
            logger.warn(`User not found for email: ${email}`);
            user = null;
          } else {
            logger.error('User fetch failed unexpectedly', error);
            user = null;
          }
        }
      }
      const url = this.extractUrlFromPayload(payload);
      const formKey = this.extractFormKey(url);
      let formRecord;
      if (formKey) {
        formRecord = await queryRunner.manager
          .createQueryBuilder(Form, 'form')
          .where('LOWER(form.form_link) LIKE :link', {
            link: `%/form/${formKey.toLowerCase()}/%`,
          })
          .getOne();
      }
      if (!formRecord) {
        throw new Error('Form not found');
      }
      let taskId = null;
      if (user) {
        const task = await queryRunner.manager
          .createQueryBuilder(Task, 'task')
          .setLock('pessimistic_write')
          .where('task.patient_id = :patientId', { patientId: user.id })
          .andWhere('task.zoho_form = :formId', { formId: formRecord.id })
          .andWhere('task.is_completed = true')
          .orderBy('task.postop_date IS NULL', 'ASC')
          .addOrderBy('task.postop_date', 'ASC')
          .addOrderBy('task.created_at', 'ASC')
          .getOne();
        if (task) {
          taskId = task.id;
        }
      }
      const submission = queryRunner.manager.create(FormSubmission, {
        form: formRecord ? { id: formRecord.id } : null,
        status: FormStatus.SUBMITTED,
        submitted_at: new Date(),
        is_guest: user?.id ? false : true,
        submitted_by: user?.id ?? null,
        task_id: taskId ?? null,
      });
      await queryRunner.manager.save(submission);
      const mappings = await queryRunner.manager.find(FormFieldMapping, {
        where: {
          form: { id: formRecord.id },
          status: true,
        },
      });
      const mappingMap = new Map(
        mappings.map((m) => [m.zoho_field_name, m.question]),
      );
      const requestBody = payload;
      const responsesToSave = Object.entries(requestBody)
        .filter(([key]) => mappingMap.has(key))
        .sort(([a], [b]) => {
          const numA = parseInt(a.split('_')[1]);
          const numB = parseInt(b.split('_')[1]);
          return numA - numB;
        })
        .map(([key, value], index) => {
          const displayName = mappingMap.get(key)!;
          return queryRunner.manager.create(FormResponse, {
            submission,
            link_name: key,
            display_name: displayName,
            question_type: QuestionType.TEXT,
            node_type: NodeType.QUESTION,
            answers:
              value !== undefined
                ? Array.isArray(value)
                  ? value.map(String)
                  : [String(value)]
                : [],
            options: [],
            display_order: index + 1,
          });
        });
      await queryRunner.manager.save(responsesToSave);
      await queryRunner.commitTransaction();
      logger.info(`saveWebhookSubmission ---> ${HttpStatus.CREATED}`);
      return new ApiResponseBuilder().success(
        { submissionId: submission.id },
        'Webhook form submitted successfully',
        HttpStatus.CREATED,
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      logger.error('saveWebhookSubmission --->', error);
      return new ApiResponseBuilder().error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async saveWebhookSubmissionNew(payload: any, formType: string) {
    logger.info('saveWebhookSubmission ...', payload);
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const emails = this.extractEmails(payload);
      let user;
      if (emails.length) {
        try {
          const operationsBase = this.configService.get('BASE_OPERATIONS');
          const users = await helpers.fetchUsersByEmails(
            operationsBase,
            API_ENDPOINTS.OPERATIONS_SERVICE.FIND_USER_BY_EMAILS,
            emails,
          );
          user = users?.find((u) => u.role === 'PATIENT') || null;
          logger.info(`Matched patient user: ${user?.email || 'none'}`);
        } catch (error) {
          const message = error?.response?.data?.message;
          if (message === 'User not found') {
            logger.warn(`User not found for email: ${emails}`);
            user = null;
          } else {
            logger.error('User fetch failed unexpectedly', error);
            user = null;
          }
        }
      }
      const formRecord = await queryRunner.manager.findOne(Form, {
        where: {
          name: formType,
        },
      });
      if (!formRecord) {
        throw new Error('Form not found');
      }
      console.log('formRecord', formRecord);
      let taskId = null;
      if (user) {
        const task = await queryRunner.manager
          .createQueryBuilder(Task, 'task')
          .setLock('pessimistic_write')
          .where('task.patient_id = :patientId', { patientId: user.id })
          .andWhere('task.zoho_form = :formId', { formId: formRecord.id })
          .andWhere('task.is_completed = true')
          .orderBy('task.postop_date IS NULL', 'ASC')
          .addOrderBy('task.postop_date', 'ASC')
          .addOrderBy('task.created_at', 'ASC')
          .getOne();
        if (task) {
          taskId = task.id;
        }
      }
      const submission = queryRunner.manager.create(FormSubmission, {
        form: formRecord ? { id: formRecord.id } : null,
        status: FormStatus.SUBMITTED,
        submitted_at: new Date(),
        is_guest: user?.id ? false : true,
        submitted_by: user?.id ?? null,
        task_id: taskId ?? null,
      });
      await queryRunner.manager.save(submission);
      const mappings = await queryRunner.manager.find(FormFieldMapping, {
        where: {
          form: { id: formRecord.id },
          status: true,
        },
      });
      const mappingMap = new Map(
        mappings.map((m) => [m.zoho_field_name, m.question]),
      );
      const requestBody = payload;
      const responsesToSave = Object.entries(requestBody)
        .filter(([key]) => mappingMap.has(key))
        .sort(([a], [b]) => {
          const numA = parseInt(a.split('_')[1]);
          const numB = parseInt(b.split('_')[1]);
          return numA - numB;
        })
        .map(([key, value], index) => {
          const displayName = mappingMap.get(key)!;
          return queryRunner.manager.create(FormResponse, {
            submission,
            link_name: key,
            display_name: displayName,
            question_type: QuestionType.TEXT,
            node_type: NodeType.QUESTION,
            answers:
              value !== undefined
                ? Array.isArray(value)
                  ? value.map(String)
                  : [String(value)]
                : [],
            options: [],
            display_order: index + 1,
          });
        });
      await queryRunner.manager.save(responsesToSave);
      await queryRunner.commitTransaction();
      logger.info(`saveWebhookSubmission ---> ${HttpStatus.CREATED}`);
      return new ApiResponseBuilder().success(
        { submissionId: submission.id },
        'Webhook form submitted successfully',
        HttpStatus.CREATED,
      );
      // return new ApiResponseBuilder().success(
      //   { payload, formType },
      //   'Webhook form submitted successfully',
      //   HttpStatus.CREATED,
      // );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      logger.error('saveWebhookSubmission --->', error);
      return new ApiResponseBuilder().error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await queryRunner.release();
    }
  }

  private mapZohoType(type: string): QuestionType {
    logger.debug('mapZohoType --->', { type });
    if (!type) return QuestionType.TEXT;

    const normalized = type.toLowerCase();

    switch (normalized) {
      case 'text':
      case 'singleline':
      case 'name':
        return QuestionType.TEXT;

      case 'number':
      case 'decimal':
        return QuestionType.NUMBER;

      case 'email':
        return QuestionType.EMAIL;

      case 'phone':
      case 'phonenumber':
        return QuestionType.PHONE;

      case 'date':
        return QuestionType.DATE;

      case 'time':
        return QuestionType.TIME;

      case 'datetime':
        return QuestionType.DATETIME;

      case 'radio':
      case 'choice':
        return QuestionType.RADIO;

      case 'checkbox':
      case 'multiplechoice':
        return QuestionType.CHECKBOX;

      case 'dropdown':
      case 'select':
        return QuestionType.SELECT;

      case 'textarea':
      case 'multiline':
      case 'paragraph':
        return QuestionType.TEXTAREA;

      case 'fileupload':
      case 'file':
        return QuestionType.FILE;

      case 'image':
      case 'imageupload':
        return QuestionType.IMAGE;

      case 'video':
        return QuestionType.VIDEO;

      case 'audio':
        return QuestionType.AUDIO;

      case 'location':
      case 'address':
      case 'map':
        return QuestionType.LOCATION;

      case 'signature':
        return QuestionType.SIGNATURE;

      case 'slider':
        return QuestionType.SLIDER;

      case 'rating':
      case 'star':
        return QuestionType.RATING;

      default:
        return QuestionType.TEXT;
    }
  }

  // ---------------------------
  // GET FORM RESPONSES BY FORM
  // ---------------------------

  async getFormResponsesByFormId(submissionId: string) {
    logger.info('getFormResponsesByFormId --->', { submissionId });

    try {
      const responses = await this.formResponseRepository
        .createQueryBuilder('fr')
        .leftJoinAndSelect('fr.submission', 'fs')
        .leftJoinAndSelect('fs.form', 'f')
        .where('fs.id = :submissionId', { submissionId })
        .orderBy('fr.created_at', 'ASC')
        .getMany();

      const formatted = responses.map((fr) => ({
        submissionId: fr.submission?.id,
        questionId: fr.link_name,
        question: fr.display_name,
        questionType: fr.question_type,
        nodeType: fr.node_type,
        options: fr.options,
        answer: fr.answers,
      }));

      logger.info('getFormResponsesByFormId --->', { status: HttpStatus.OK });

      return new ApiResponseBuilder().success(
        formatted,
        'Form responses fetched successfully',
        HttpStatus.OK,
      );
    } catch (error) {
      logger.error('getFormResponsesByFormId --->', error);

      return new ApiResponseBuilder().error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async mapZohoData(formName: string, webhookData: Record<string, any>) {
    // Fetch all active mappings for this form
    const mappings = await this.mappingRepo.find({
      where: { form_name: formName, status: true },
    });

    // Map Field_XX -> question
    const mapped: Record<string, any> = {};
    mappings.forEach((mapping) => {
      const answer = webhookData[mapping.zoho_field_name] ?? null;
      mapped[mapping.question] = answer;
    });

    return mapped;
  }

  async mapWebhookData(formName: string, webhookData: Record<string, any>) {
    const mappings = await this.mappingRepo.find({
      where: { form_name: formName, status: true },
    });

    const mapped: Record<string, any> = {};
    mappings.forEach((mapping) => {
      mapped[mapping.question] = webhookData[mapping.zoho_field_name] ?? null;
    });

    return mapped;
  }

  // Save submission + mapped responses
  async webhookSubmission(payload: any) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const formName = payload.form?.form_name || 'Unknown Form';
      const info = payload.info || payload.fields || payload;

      // Map webhook fields to questions
      const mappedData = await this.mapWebhookData(formName, info);
      logger.log('Mapped Data:', mappedData);

      // Create FormSubmission
      const submission = queryRunner.manager.create(FormSubmission, {
        form_name: formName,
        submitted_at: new Date(),
      });
      await queryRunner.manager.save(submission);

      // Create FormResponses
      const responsesToSave = Object.entries(mappedData).map(
        ([question, answer], index) => {
          return queryRunner.manager.create(FormResponse as any, {
            submission,
            display_name: question,
            node_type: 'QUESTION',
            question_type: 'TEXT',
            answers:
              answer !== undefined
                ? Array.isArray(answer)
                  ? answer
                  : [String(answer)]
                : [],
            display_order: index + 1,
          });
        },
      );

      await queryRunner.manager.save(responsesToSave);
      await queryRunner.commitTransaction();

      return { submissionId: submission.id, mappedData };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      logger.error('Failed to save webhook submission', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async upsertMappings(mappings: Partial<FormFieldMapping>[]) {
    const results = [];

    for (const mapping of mappings) {
      const existing = await this.mappingRepo.findOne({
        where: {
          form: { id: mapping?.form?.id },
          form_name: mapping.form_name,
          zoho_field_name: mapping.zoho_field_name,
        },
        relations: ['form'],
      });

      if (existing) {
        Object.assign(existing, mapping);
        results.push(await this.mappingRepo.save(existing));
      } else {
        const newMapping = this.mappingRepo.create(mapping);
        results.push(await this.mappingRepo.save(newMapping));
      }
    }

    return results;
  }
}
