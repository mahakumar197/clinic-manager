import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateFormDto } from '../dto/form.dto';
import { logger } from '@pallmall/logger';
import { InjectRepository } from '@nestjs/typeorm';
import { Form } from '../entities/form.entity';
import { FormQuestion } from '../entities/form.question.entity';
import { Repository } from 'typeorm';
import { ApiResponseBuilder, HttpStatus } from '@pallmall/shared-types';
import { mockZohoResponse } from './form.response';

@Injectable()
export class FormsService {
  constructor(
    @InjectRepository(Form)
    private readonly formRepository: Repository<Form>,
  ) {}

  // ---------------------------
  // CREATE FORM
  // ---------------------------

  /**
   * Creates a form.
   *
   * @param createFormDto - Create form DTO
   * @returns Created form
   */

  async createForm(createFormDto: CreateFormDto) {
    logger.info('createForm...');
    try {
      const form = this.formRepository.create({
        name: createFormDto.name,
        phase: createFormDto.phase,
        procedure_type: createFormDto.procedure_type,
        priority: createFormDto.priority,
        form_type: createFormDto.formType,
        description: createFormDto.description,
        page_exists: createFormDto.page_exists,
        is_active: true,
      });
      await this.formRepository.save(form);
      logger.info(`createForm ---> ${HttpStatus.CREATED}`);
      return new ApiResponseBuilder().success(
        form,
        'Form created successfully',
        HttpStatus.CREATED,
      );
    } catch (error) {
      logger.error('createForm --->', error);
      return new ApiResponseBuilder().error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ---------------------------
  // FIND ALL FORMS
  // ---------------------------

  /**
   * Finds all forms.
   *
   * @returns All forms
   */
  async findAll() {
    logger.info('findAll...');
    try {
      const forms = await this.formRepository.find();
      logger.info(`findAll ---> ${HttpStatus.OK}`);
      return new ApiResponseBuilder().success(
        forms,
        'Forms fetched successfully',
        HttpStatus.OK,
      );
    } catch (error) {
      logger.error('findAll --->', error);
      return new ApiResponseBuilder().error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ---------------------------
  // GET FORM BY ID
  // ---------------------------

  /**
   * Gets a form by ID.
   *
   * @param id - Form ID
   * @returns Form
   */
  public async getFormById(id: string): Promise<Form | null> {
    logger.debug('getFormById --->', { id });
    return this.formRepository
      .createQueryBuilder('form')
      .leftJoinAndSelect(
        'form.questions',
        'formQuestion',
        'formQuestion.is_active = true',
      )
      .where('form.id = :id', { id })
      .orderBy('formQuestion.display_order', 'ASC')
      .getOne();
  }

  // ---------------------------
  // FIND ONE FORM
  // ---------------------------

  /**
   * Finds a form by ID.
   *
   * @param id - Form ID
   * @returns Form
   */
  async findOne(id: string) {
    logger.info('findOne...');
    try {
      const form = await this.getFormById(id);
      if (!form) {
        throw new NotFoundException('Form not found');
      }
      logger.info(`findOne ---> ${HttpStatus.OK}`);
      return new ApiResponseBuilder().success(
        form,
        'Form fetched successfully',
        HttpStatus.OK,
      );
    } catch (error) {
      logger.error('findOne --->', error);
      return new ApiResponseBuilder().error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  
  async findOneNew(id: string) {
    logger.info('findOne...');

    try {
      const form = await this.formRepository.findOne({
        where: { id },
      });

      if (!form) {
        throw new NotFoundException('Form not found');
      }

      /**
       * Mock Zoho API response
       */
      const zohoResponse = mockZohoResponse;

      const questions = this.mapZohoFieldsToQuestions(zohoResponse.fields);

      const response = {
        ...form,
        questions,
      };

      logger.info(`findOne ---> ${HttpStatus.OK}`);

      return new ApiResponseBuilder().success(
        response,
        'Form fetched successfully',
        HttpStatus.OK,
      );
    } catch (error) {
      logger.error('findOne --->', error);

      return new ApiResponseBuilder().error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  // ---------------------------
  // ZOHO → INTERNAL MAPPER
  // ---------------------------

  private mapZohoFieldsToQuestions(fields: any[]) {
    logger.debug('mapZohoFieldsToQuestions --->');
    let displayOrder = 1;

    const questions = [];

    fields.forEach((field) => {
      /**
       * Handle fields with subfields (Name, Address etc)
       */
      if (field.subfields) {
        field.subfields.forEach((subfield) => {
          if (subfield.is_hidden) return;

          questions.push({
            id: subfield.link_name,
            question: subfield.display_name,
            question_type: this.mapFieldType(field.type),
            display_order: displayOrder++,
            options: subfield.choices
              ? subfield.choices.map((c) => c.value)
              : null,
            page: 1,
            page_name: 'Dynamic Form',
            validations: {
              required: field.mandatory ?? false,
            },
            node_type: 'Question',
            visibility_rules: null,
            is_active: true,
            created_at: new Date(),
            updated_at: new Date(),
          });
        });
      } else {
        questions.push({
          id: field.link_name,
          question: field.display_name,
          question_type: this.mapFieldType(field.type),
          display_order: displayOrder++,
          options: field.choices ? field.choices.map((c) => c.value) : null,
          page: 1,
          page_name: 'Dynamic Form',
          validations: {
            required: field.mandatory ?? false,
          },
          node_type: 'Question',
          visibility_rules: null,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        });
      }
    });

    return questions;
  }

  // ---------------------------
  // ZOHO TYPE → INTERNAL TYPE
  // ---------------------------

  private mapFieldType(type: number): string {
    logger.debug('mapFieldType --->', { type });
    const typeMap: Record<number, string> = {
      1: 'text',
      2: 'textarea',
      3: 'email',
      4: 'richtext',
      5: 'number',
      6: 'decimal',
      7: 'percent',
      8: 'currency',
      9: 'auto_number',
      10: 'date',
      11: 'datetime',
      12: 'dropdown',
      13: 'radio',
      14: 'multiselect',
      15: 'checkbox',
      16: 'decision',
      17: 'url',
      18: 'image',
      19: 'file',
      20: 'formula',
      21: 'subform',
      22: 'zoho_crm',
      23: 'zoho_crm_link',
      24: 'note',
      25: 'signature',
      26: 'user',
      27: 'phone',
      29: 'name',
      30: 'address',
      31: 'integration',
      32: 'audio',
      33: 'video',
      34: 'time',
      35: 'ocr',
      36: 'object_detection',
      37: 'keyword',
      38: 'sentiment',
      39: 'prediction',
    };

    return typeMap[type] ?? 'text';
  }
}