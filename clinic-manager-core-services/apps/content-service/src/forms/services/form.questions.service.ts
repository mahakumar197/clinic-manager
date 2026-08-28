import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateFormQuestionDto, UpdateFormQuestionDto } from '../dto/form.dto';
import { logger } from '@pallmall/logger';
import { InjectRepository } from '@nestjs/typeorm';
import { FormQuestion } from '../entities/form.question.entity';
import { Repository } from 'typeorm';
import { ApiResponseBuilder, HttpStatus } from '@pallmall/shared-types';

@Injectable()
export class FormQuestionsService {
  constructor(
    @InjectRepository(FormQuestion)
    private readonly formQuestionsRepository: Repository<FormQuestion>,
  ) {}
  // ---------------------------
  // ADD FORM QUESTION
  // ---------------------------

  /**
   * Adds a form question.
   *
   * @param dto - Create form question DTO
   * @returns Added form question
   */
  async addFormQuestion(dto: CreateFormQuestionDto) {
    logger.info('addFormQuestion --->', dto);
    const queryRunner =
      this.formQuestionsRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager
        .createQueryBuilder()
        .update(FormQuestion)
        .set({
          display_order: () => '"display_order" + 1',
        })
        .where('form_id = :formId', { formId: dto.formId })
        .andWhere('"display_order" >= :displayOrder', {
          displayOrder: dto.displayOrder,
        })
        .execute();
      const question = queryRunner.manager.create(FormQuestion, {
        form: { id: dto.formId },
        question: dto.question,
        question_type: dto.questionType,
        display_order: dto.displayOrder,
        options: dto.options,
        validations: dto.validations,
        node_type: dto.nodeType,
        page: dto.page,
        page_name: dto.pageName,
        is_active: true,
      });
      await queryRunner.manager.save(question);
      await queryRunner.commitTransaction();
      return new ApiResponseBuilder().success(
        question,
        'Form question added successfully',
        HttpStatus.CREATED,
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      logger.error('addFormQuestion --->', error);
      return new ApiResponseBuilder().error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ---------------------------
  // REMOVE FORM QUESTION
  // ---------------------------

  /**
   * Removes a form question.
   *
   * @param id - Form question ID
   * @returns Removed form question
   */
  async removeFormQuestion(id: string) {
    logger.info('removeFormQuestion --->', id);
    try {
      const form = await this.formQuestionsRepository.findOne({
        where: { id },
      });
      if (!form) {
        throw new NotFoundException('Form question not found');
      }
      await this.formQuestionsRepository.update(id, { is_active: false });
      logger.info(`removeFormQuestion ---> ${HttpStatus.OK}`);
      return new ApiResponseBuilder().success(
        form,
        'Form question removed successfully',
        HttpStatus.OK,
      );
    } catch (error) {
      logger.error('removeFormQuestion --->', error);
      return new ApiResponseBuilder().error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ---------------------------
  // UPDATE FORM QUESTION
  // ---------------------------

  /**
   * Updates a form question.
   *
   * @param id - Form question ID
   * @param updateFormQuestionDto - Update form question DTO
   * @returns Updated form question
   */
  async updateFormQuestion(
    id: string,
    updateFormQuestionDto: UpdateFormQuestionDto,
  ) {
    logger.info('updateFormQuestion --->', updateFormQuestionDto);
    try {
      const form = await this.formQuestionsRepository.findOne({
        where: { id },
      });
      if (!form) {
        throw new NotFoundException('Form question not found');
      }
      if (updateFormQuestionDto.question)
        form.question = updateFormQuestionDto.question;
      if (updateFormQuestionDto.questionType)
        form.question_type = updateFormQuestionDto.questionType;
      if (updateFormQuestionDto.displayOrder)
        form.display_order = updateFormQuestionDto.displayOrder;
      if (updateFormQuestionDto.options)
        form.options = updateFormQuestionDto.options;
      if (updateFormQuestionDto.validations)
        form.validations = updateFormQuestionDto.validations;
      await this.formQuestionsRepository.save(form);
      logger.info(`updateFormQuestion ---> ${HttpStatus.OK}`);
      return new ApiResponseBuilder().success(
        form,
        'Form question updated successfully',
        HttpStatus.OK,
      );
    } catch (error) {
      logger.error('updateFormQuestion --->', error);
      return new ApiResponseBuilder().error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
