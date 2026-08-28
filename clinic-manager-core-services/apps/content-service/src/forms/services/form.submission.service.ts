import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  FormAnswerInputDto,
  FormSubmissionFilterQueryDto,
} from '../dto/form.dto';
import { logger } from '@pallmall/logger';
import { InjectRepository } from '@nestjs/typeorm';
import { Form } from '../entities/form.entity';
import { FormQuestion } from '../entities/form.question.entity';
import { IsNull, Not, Repository } from 'typeorm';
import { ApiResponseBuilder, HttpStatus } from '@pallmall/shared-types';
import { FormSubmissionDto } from '../dto/form.dto';
import { DataSource, In } from 'typeorm';
import { FormSubmission } from '../entities/form.submission.entity';
import { FormAnswer } from '../entities/form.answer.entity';
import {
  FormStatus,
  helpers,
  NotificationHelper,
  NOTIFICATION_EVENT_TYPE,
  QuestionType,
  NodeType,
  getBlobFileUrl,
  TaskStatusId,
} from '@pallmall/common-utils';
import { Task } from 'src/tasks/entities/task.entity';
import { ConfigService } from '@nestjs/config';
import { API_ENDPOINTS } from '@pallmall/common-utils';
import PDFDocument from 'pdfkit';
import { PassThrough } from 'stream';
import { TaskTrack } from 'src/tasks/entities/task-track.entity';
@Injectable()
export class FormSubmissionService {
  private notificationHelper: NotificationHelper;

  constructor(
    @InjectRepository(FormSubmission)
    private readonly formSubmissionRepository: Repository<FormSubmission>,
    @InjectRepository(FormSubmission)
    private readonly formRepository: Repository<Form>,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(FormQuestion)
    private readonly formQuestionRepository: Repository<FormQuestion>,
    @InjectRepository(TaskTrack)
    private readonly taskTrackRepository: Repository<TaskTrack>,
    private readonly dataSource: DataSource,
    private configService: ConfigService,
  ) {
    this.notificationHelper = new NotificationHelper();
  }

  // ---------------------------
  // SUBMIT FORM
  // ---------------------------

  /**
   * Submits a form.
   *
   * @param dto - Form submission DTO
   * @param submittedBy - Submitted by
   * @returns Form submission
   */
  async submitForm(dto: FormSubmissionDto, submittedBy: string) {
    logger.info('submitForm ...');
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const form = await queryRunner.manager.findOne(Form, {
        where: { id: dto.formId },
      });
      if (!form) {
        throw new NotFoundException('Form not found');
      }
      const formName = form.name.toLowerCase();
      if (formName.includes('ask the team')) {
        dto.answers = dto.answers.map((ans) => {
          if (ans.questionId === '2859d040-0093-4a3c-8953-6a3302edcd00') {
            return {
              ...ans,
              answer: ['TEST'],
            };
          }
          if (ans.questionId === '67a8ee6a-ac84-4a13-a110-8d5df854398e') {
            return {
              ...ans,
              answer: ['PATIENT'],
            };
          }
          return ans;
        });
      }
      if (formName.includes('ask the surgeon')) {
        dto.answers = dto.answers.map((ans) => {
          if (ans.questionId === '59f16677-1b0b-46d1-96a4-902e0b6cf17c') {
            return {
              ...ans,
              answer: ['TEST'],
            };
          }
          if (ans.questionId === '1f282d55-8055-4954-8402-7f1174062f3f') {
            return {
              ...ans,
              answer: ['PATIENT'],
            };
          }

          return ans;
        });
      }
      const submission = queryRunner.manager.create(FormSubmission, {
        form,
        submitted_by: submittedBy,
        status: FormStatus.SUBMITTED,
        submitted_at: new Date(),
        signature_image: dto.signature_image,
        is_guest: dto.is_guest ?? !submittedBy,
        task_id: dto.taskId ?? null,
      });
      await queryRunner.manager.save(submission);
      const questionIds = dto.answers.map((a) => a.questionId);
      const questions = await queryRunner.manager.find(FormQuestion, {
        where: {
          id: In(questionIds),
          form: { id: dto.formId },
        },
      });
      if (questions.length !== questionIds.length) {
        throw new BadRequestException(
          'One or more questions are invalid for this form',
        );
      }
      const questionMap = new Map(questions.map((q) => [q.id, q]));
      const answersToSave = dto.answers.map((a) => {
        let normalizedAnswer: string[] | null = null;
        if (a.answer !== null && a.answer !== undefined && a.answer !== '') {
          normalizedAnswer = Array.isArray(a.answer)
            ? a.answer.map((val) => String(val))
            : [String(a.answer)];
        }
        return queryRunner.manager.create(FormAnswer, {
          submission,
          question: questionMap.get(a.questionId),
          answer: normalizedAnswer,
        });
      });
      await queryRunner.manager.save(answersToSave);
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

      // Trigger notification for form submission
      let userRole: string | undefined;

      // Skip notification if no submittedBy (guest submission)
      if (!submittedBy) {
        logger.debug(
          'No submittedBy provided, skipping user role fetch and notification',
        );
      } else {
        try {
          const uri = this.configService.get('BASE_OPERATIONS');
          const url = API_ENDPOINTS.OPERATIONS_SERVICE.USER_DATA_FETCH;
          const userMap = await helpers.fetchUsersByIds(uri, url, [
            submittedBy,
          ]);
          const userData = userMap[submittedBy];

          if (userData) {
            // Try different possible field names
            userRole =
              userData.roleType ||
              userData.role_type ||
              userData.role ||
              userData.roleId ||
              userData.role_id;
          }
        } catch (fetchErr) {
          logger.debug(
            `Could not fetch user role for form notification: ${fetchErr}`,
          );
        }
      }

      // Only send notification if we have a valid submittedBy
      if (submittedBy) {
        await this.notificationHelper.sendNotificationSafely(
          {
            userId: submittedBy,
            userRole,
            eventType: NOTIFICATION_EVENT_TYPE.FORM_SUBMITTED,
            title: 'Form Submitted',
            message: `Form "${form.name}" has been submitted successfully`,
            priority: 'normal',
            relatedEntityId: submission.id,
            metadata: {
              formId: dto.formId,
              submissionId: submission.id,
              answersCount: 0,
            },
          },
          logger,
        );
      }

      try {
        const uri = this.configService.get('BASE_INTEGRATION');
        const submittedForm = await queryRunner.manager.findOne(Form, {
          where: { id: dto.formId },
        });
        if (submittedForm) {
          let url: string;
          const formName = submittedForm.name.toLowerCase();

          switch (true) {
            case formName.includes('ask the surgeon'):
              url = API_ENDPOINTS.ZOHO_FORM_SERVICE.ASK_THE_SURGEON;
              break;

            case formName.includes('ask the team'):
              url = API_ENDPOINTS.ZOHO_FORM_SERVICE.ASK_THE_TEAM;
              break;

            case formName.includes('ssq'):
            case formName.includes('screening questionnaire'):
              url = API_ENDPOINTS.ZOHO_FORM_SERVICE.SSQ;
              break;

            case formName.includes('post'):
              url = API_ENDPOINTS.ZOHO_FORM_SERVICE.POST_OPS;
              break;

            default:
              url = null;
          }
          if (url) {
            await helpers.zohoFormSubmission(uri, url, {
              formId: dto.formId,
              answers: dto.answers,
            });
          }
        }
      } catch (zohoErr) {
        logger.error('Zoho integration failed (non-blocking):', zohoErr);
      }

      logger.info(`submitForm ---> ${HttpStatus.CREATED}`);
      return new ApiResponseBuilder().success(
        {
          submissionId: submission.id,
          answersCount: dto.answers.length,
        },
        'Form submitted successfully',
        HttpStatus.CREATED,
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      logger.error('submitForm --->', error);
      return new ApiResponseBuilder().error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ---------------------------
  // GET FORM SUBMISSIONS
  // ---------------------------

  /**
   * Gets form submissions.
   *
   * @param formId - Form ID
   * @param userId - User ID
   * @returns Form submissions
   */
  // async getFormSubmissions(formId: string, submissionId: string) {
  //   logger.info('getFormSubmissions --->', { formId, submissionId });
  //   try {
  //     const submissions = await this.formSubmissionRepository
  //       .createQueryBuilder('fs')
  //       .leftJoinAndSelect('fs.answers', 'fa')
  //       .leftJoinAndSelect('fa.question', 'fq')
  //       .leftJoinAndSelect('fs.form', 'f')
  //       .where('fs.form_id = :formId', { formId })
  //       .andWhere('fs.id = :submissionId', { submissionId })
  //       .orderBy('fs.created_at', 'DESC')
  //       .addOrderBy('fq.display_order', 'ASC')
  //       .getMany();
  //     const allFormNodes = await this.formQuestionRepository.find({
  //       where: {
  //         form: { id: formId },
  //         is_active: true,
  //       },
  //       order: { display_order: 'ASC' },
  //     });
  //     const response = await Promise.all(
  //       submissions.map(async (submission) => {
  //         const answerMap = new Map(
  //           submission.answers.map((a) => [a.question.id, a]),
  //         );
  //         const answers = await Promise.all(
  //           allFormNodes.map(async (q) => {
  //             const ans = answerMap.get(q.id);
  //             if (!ans || ans.answer == null) {
  //               return {
  //                 questionId: q.id,
  //                 question: q.question,
  //                 questionType: q.question_type,
  //                 nodeType: q.node_type,
  //                 displayOrder: q.display_order,
  //                 options: q.options,
  //                 answer: null,
  //               };
  //             }
  //             const answerArr: string[] = Array.isArray(ans?.answer)
  //               ? [...ans.answer]
  //               : ans?.answer
  //                 ? [ans.answer]
  //                 : [];
  //             if (
  //               q.question_type === QuestionType.FILE &&
  //               answerArr.length > 0
  //             ) {
  //               answerArr.length = 0;
  //               for (const key of ans!.answer) {
  //                 const url = await helpers.getFileUrlFromAzure(key.trim());
  //                 answerArr.push(url);
  //               }
  //             }
  //             return {
  //               questionId: q.id,
  //               question: q.question,
  //               questionType: q.question_type,
  //               nodeType: q.node_type,
  //               displayOrder: q.display_order,
  //               options: q.options,
  //               answer: answerArr,
  //             };
  //           }),
  //         );
  //         return {
  //           submissionId: submission.id,
  //           status: submission.status,
  //           submittedAt: submission.submitted_at,
  //           signature: submission.signature_image,
  //           form: submission.form,
  //           answers,
  //         };
  //       }),
  //     );
  //     logger.info('getFormSubmissions --->', { status: HttpStatus.OK });
  //     return new ApiResponseBuilder().success(
  //       response,
  //       'Form submissions retrieved successfully',
  //       HttpStatus.OK,
  //     );
  //   } catch (error) {
  //     logger.error('getFormSubmissions --->', error);
  //     return new ApiResponseBuilder().error(
  //       error,
  //       HttpStatus.INTERNAL_SERVER_ERROR,
  //     );
  //   }
  // }

  // ---------------------------
  // GET FORM SUBMISSIONS BY USER
  // ---------------------------

  /**
   * Gets form submissions by user.
   *
   * @param userId - User ID
   * @param filters - Form submission filters
   * @returns Form submissions
   */
  async getFormSubmissionsbyUser(
    userId: string,
    filters: FormSubmissionFilterQueryDto,
  ) {
    logger.info('getFormSubmissionsbyUser --->', { userId, filters });
    try {
      const page = filters.page || 1;
      const limit = filters.limit || 10;
      const { search, formType } = filters;

      const query = this.formSubmissionRepository
        .createQueryBuilder('fs')
        .leftJoinAndSelect('fs.form', 'f')
        .leftJoinAndSelect('fs.answers', 'fa')
        .leftJoinAndSelect('fa.question', 'fq')
        .where('fs.submitted_by = :userId', { userId });

      if (search) {
        query.andWhere('f.name ILIKE :search', { search: `%${search}%` });
      }

      if (formType) {
        query.andWhere('f.form_type = :formType', { formType });
      }

      const submissions = await query
        .orderBy('fs.created_at', 'DESC')
        .addOrderBy('fq.display_order', 'ASC')
        .getMany();

      const formIds = [...new Set(submissions.map((s) => s.form.id))];

      const taskUploads =
        formIds.length > 0
          ? await this.dataSource
              .createQueryBuilder()
              .select('tu.*')
              .addSelect('t.zoho_form', 'form_id')
              .from('task_uploads', 'tu')
              .innerJoin('tasks', 't', 't.id = tu.taskId')
              .where('t.zoho_form IN (:...formIds)', { formIds })
              .andWhere('tu.patient_id = :userId', { userId })
              .andWhere('tu.is_active = true')
              .getRawMany()
          : [];

      // Process uploads to generate SAS URLs
      const processedUploads = await Promise.all(
        taskUploads.map(async (upload) => {
          try {
            const url = await getBlobFileUrl(upload.file_content);
            return { ...upload, fileUrl: url };
          } catch (error) {
            logger.error(
              `Failed to generate SAS URL for upload ${upload.id}`,
              error,
            );
            return { ...upload, fileUrl: null };
          }
        }),
      );

      // Group uploads by form ID
      const uploadsByFormId = processedUploads.reduce(
        (acc, upload) => {
          const formId = upload.form_id;
          if (!acc[formId]) {
            acc[formId] = [];
          }
          if (upload.fileUrl) {
            acc[formId].push({
              uploadId: upload.id,
              fileContent: upload.fileUrl,
              uploadedAt: upload.uploaded_at,
              taskId: upload.taskId,
            });
          }
          return acc;
        },
        {} as Record<string, any[]>,
      );

      const response = submissions.map((submission) => ({
        submissionId: submission.id,
        status: submission.status,
        submittedAt: submission.submitted_at,
        signature: submission.signature_image,
        form: {
          id: submission.form.id,
          name: submission.form.name,
          formType: submission.form.form_type,
          phase: submission.form.phase,
        },
        answers: submission.answers.map((a) => ({
          questionId: a.question.id,
          question: a.question.question,
          questionType: a.question.question_type,
          nodeType: a.question.node_type,
          displayOrder: a.question.display_order,
          options: a.question.options,
          answer: a.answer,
        })),
        uploads: uploadsByFormId[submission.form.id] || [],
      }));

      const paginated = helpers.paginate(response, page, limit);

      logger.info('getFormSubmissionsbyUser --->', { status: HttpStatus.OK });

      return new ApiResponseBuilder().paginated(
        paginated.items,
        paginated.meta,
        'Form submissions retrieved successfully',
      );
    } catch (error) {
      logger.error('getFormSubmissionsbyUser --->', error);
      return new ApiResponseBuilder().error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ---------------------------
  // GENERATE FORM SUBMISSIONS PDF
  // ---------------------------

  /**
   * Generates a PDF of form submissions.
   *
   * @param formId - Form ID
   * @param userId - User ID
   * @returns PDF of form submissions
   */
  async generateFormSubmissionsPdf(
    formId: string,
    userId: string,
  ): Promise<any> {
    logger.info('generateFormSubmissionsPdf --->', { formId, userId });
    try {
      const submissions = await this.formSubmissionRepository
        .createQueryBuilder('fs')
        .leftJoinAndSelect('fs.form', 'f')
        .leftJoinAndSelect('fs.answers', 'fa')
        .leftJoinAndSelect('fa.question', 'fq')
        .where('fs.form_id = :formId', { formId })
        .andWhere(userId ? 'fs.submitted_by = :userId' : '1=1', { userId })
        .orderBy('fs.created_at', 'DESC')
        .addOrderBy('fq.display_order', 'ASC')
        .getMany();

      if (submissions.length === 0) {
        throw new NotFoundException('No submissions found');
      }

      const doc = new PDFDocument({ margin: 50 });
      const stream = new PassThrough();
      doc.pipe(stream);

      doc.fontSize(20).text('Form Submissions Report', { align: 'center' });
      doc.moveDown();

      const formName = submissions[0].form.name;
      doc.fontSize(14).text(`Form: ${formName}`);
      doc.fontSize(12).text(`Generated At: ${new Date().toLocaleString()}`);
      doc.moveDown();

      submissions.forEach((submission, index) => {
        if (index > 0) {
          doc.addPage();
        }

        doc.fontSize(14).text(`Submission #${index + 1}`, { underline: true });
        doc.fontSize(10).text(`Submission ID: ${submission.id}`);
        doc.text(`Status: ${submission.status}`);
        doc.text(`Submitted At: ${submission.submitted_at.toLocaleString()}`);
        doc.moveDown();

        doc.fontSize(12).text('Answers:', { underline: true });
        doc.moveDown(0.5);

        submission.answers.forEach((ans) => {
          doc
            .fontSize(11)
            .fillColor('#333')
            .text(`Q: ${ans.question.question}`);
          doc
            .fontSize(10)
            .fillColor('#000')
            .text(`A: ${ans.answer || 'No answer'}`);
          doc.moveDown(0.5);
        });

        if (submission.signature_image) {
          doc.moveDown();
          doc.fontSize(12).text('Signature:');
          // Note: signature_image is likely a base64 or URL.
          // If it's base64, we might need to strip the prefix.
          try {
            if (submission.signature_image.startsWith('data:image')) {
              const base64Data = submission.signature_image.replace(
                /^data:image\/\w+;base64,/,
                '',
              );
              doc.image(Buffer.from(base64Data, 'base64'), { width: 200 });
            }
          } catch (e) {
            doc.text('[Signature Image Error]');
          }
        }
      });

      doc.end();
      return stream;
    } catch (error) {
      logger.error('generateFormSubmissionsPdf --->', error);
      throw error;
    }
  }

  async getFormSubmissions(formId: string, submissionId: string) {
    logger.info('getFormSubmissions --->', { formId, submissionId });
    try {
      const submissions = await this.formSubmissionRepository
        .createQueryBuilder('fs')
        .leftJoinAndSelect('fs.form_responses', 'fr')
        .leftJoinAndSelect('fs.form', 'f')
        .where('fs.form_id = :formId', { formId })
        .andWhere('fs.id = :submissionId', { submissionId })
        .orderBy('fs.created_at', 'DESC')
        .addOrderBy('fr.display_order', 'ASC')
        .getMany();
      const response = await Promise.all(
        submissions.map(async (submission) => {
          const answers = await Promise.all(
            submission.form_responses.map(async (res) => {
              let answerArr: string[] = res.answers || [];
              if (
                res.question_type === QuestionType.FILE &&
                answerArr.length > 0
              ) {
                const fileUrls = [];
                for (const key of answerArr) {
                  const url = await helpers.getFileUrlFromAzure(key.trim());
                  fileUrls.push(url);
                }
                answerArr = fileUrls;
              }
              return {
                questionId: res.id,
                question: res.display_name,
                questionType: res.question_type,
                nodeType: res.node_type,
                displayOrder: res.display_order,
                options: res.options,
                answer: answerArr.length > 0 ? answerArr : null,
              };
            }),
          );
          return {
            submissionId: submission.id,
            status: submission.status,
            submittedAt: submission.submitted_at,
            signature: submission.signature_image,
            form: submission.form,
            answers,
          };
        }),
      );
      logger.info('getFormSubmissions --->', { status: HttpStatus.OK });
      return new ApiResponseBuilder().success(
        response,
        'Form submissions retrieved successfully',
        HttpStatus.OK,
      );
    } catch (error) {
      logger.error('getFormSubmissions --->', error);
      return new ApiResponseBuilder().error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
