import { Injectable } from '@nestjs/common';
import { CreateDropdownDto } from '../dto/master.dto';
import { Dropdown } from '../entities/dropdown.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiResponseBuilder, HttpStatus } from '@pallmall/shared-types';
import { DROPDOWN_MESSAGES } from '@pallmall/common-utils';
import { In } from 'typeorm';
import { logger } from '@pallmall/logger';

@Injectable()
export class DropdownsService {
  constructor(
    @InjectRepository(Dropdown)
    private dropdownRepository: Repository<Dropdown>,
  ) {}

  async create(createDropdownDto: CreateDropdownDto) {
    logger.info('create (Dropdown) --->');
    try {
      const dropdown = await this.dropdownRepository.create({
        ...createDropdownDto,
        isActive: true,
      });
      await this.dropdownRepository.save(dropdown);
      return new ApiResponseBuilder().success(
        dropdown,
        DROPDOWN_MESSAGES.DROPDOWN_ADDED,
        HttpStatus.CREATED,
      );
    } catch (error) {
      logger.error('create (Dropdown) error --->', error);
      return new ApiResponseBuilder().error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(type: string) {
    logger.info(`findAll (Dropdown) ---> type: ${type}`);
    try {
      const dropdowns = await this.dropdownRepository.find({
        select: ['id', 'beValue', 'enValue'],
        where: {
          type,
          isActive: true,
        },
      });
      return new ApiResponseBuilder().success(
        dropdowns,
        DROPDOWN_MESSAGES.DROPDOWN_FETCHED,
        HttpStatus.OK,
      );
    } catch (error) {
      logger.error('findAll (Dropdown) error --->', error);
      return new ApiResponseBuilder().error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAllByIds(ids: string[]) {
    logger.info('findAllByIds (Dropdown) --->');
    try {
      const dropdowns = await this.dropdownRepository.find({
        where: {
          id: In(ids),
          isActive: true,
        },
      });
      return new ApiResponseBuilder().success(
        dropdowns,
        DROPDOWN_MESSAGES.DROPDOWN_FETCHED,
        HttpStatus.OK,
      );
    } catch (error) {
      logger.error('findAllByIds (Dropdown) error --->', error);
      return new ApiResponseBuilder().error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}