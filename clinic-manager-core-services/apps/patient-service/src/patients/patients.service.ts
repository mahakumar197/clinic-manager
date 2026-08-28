import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike } from 'typeorm';
import { Patient } from './entities/patient.entity';
import { MedicalRecord } from './entities/medical-record.entity';

import {
  CreatePatientDto,
  UpdatePatientDto,
  CreateMedicalRecordDto,
  PatientQueryDto,
} from './dto/patient.dtos';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
    @InjectRepository(MedicalRecord)
    private medicalRecordRepository: Repository<MedicalRecord>,
  ) {}

  /**
   * Create a new patient
   */
  async create(createPatientDto: CreatePatientDto) {
    // Check if patient with email already exists
    const existingPatient = await this.patientRepository.findOne({
      where: { email: createPatientDto.email },
    });

    if (existingPatient) {
      throw new BadRequestException('Patient with this email already exists');
    }

    const patient = this.patientRepository.create(createPatientDto);
    return await this.patientRepository.save(patient);
  }

  /**
   * Get all patients with pagination and filtering
   */
  async findAll(query: PatientQueryDto): Promise<PaginatedResult<Patient>> {
    const {
      page = 1,
      limit = 10,
      search,
      gender,
      bloodGroup,
      assignedDoctorId,
      isActive,
    } = query;

    const queryBuilder = this.patientRepository.createQueryBuilder('patient');

    // Apply filters
    if (search) {
      queryBuilder.where(
        '(patient.firstName ILIKE :search OR patient.lastName ILIKE :search OR patient.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (gender) {
      queryBuilder.andWhere('patient.gender = :gender', { gender });
    }

    if (bloodGroup) {
      queryBuilder.andWhere('patient.bloodGroup = :bloodGroup', { bloodGroup });
    }

    if (assignedDoctorId) {
      queryBuilder.andWhere('patient.assignedDoctorId = :assignedDoctorId', {
        assignedDoctorId,
      });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('patient.isActive = :isActive', { isActive });
    }

    // Exclude soft-deleted records
    queryBuilder.andWhere('patient.deletedAt IS NULL');

    // Pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Order by creation date
    queryBuilder.orderBy('patient.createdAt', 'DESC');

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get patient by ID
   */
  async findOne(id: string): Promise<Patient> {
    const patient = await this.patientRepository.findOne({
      where: { id },
      relations: ['medicalRecords'],
    });

    if (!patient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }

    return patient;
  }

  /**
   * Update patient
   */
  async update(
    id: string,
    updatePatientDto: UpdatePatientDto,
  ): Promise<Patient> {
    const patient = await this.findOne(id);

    // If email is being updated, check for duplicates
    if (updatePatientDto.email && updatePatientDto.email !== patient.email) {
      const existingPatient = await this.patientRepository.findOne({
        where: { email: updatePatientDto.email },
      });

      if (existingPatient) {
        throw new BadRequestException('Patient with this email already exists');
      }
    }

    Object.assign(patient, updatePatientDto);
    return await this.patientRepository.save(patient);
  }

  /**
   * Soft delete patient
   */
  async remove(id: string): Promise<{ message: string }> {
    const patient = await this.findOne(id);
    await this.patientRepository.softDelete(id);
    return {
      message: `Patient ${patient.firstName} ${patient.lastName} deleted successfully`,
    };
  }

  /**
   * Get patient's medical records
   */
  async getMedicalRecords(patientId: string): Promise<MedicalRecord[]> {
    await this.findOne(patientId); // Verify patient exists

    return await this.medicalRecordRepository.find({
      where: { patientId },
      order: { visitDate: 'DESC' },
    });
  }

  /**
   * Add medical record to patient
   */
  async addMedicalRecord(
    patientId: string,
    createMedicalRecordDto: CreateMedicalRecordDto,
  ): Promise<MedicalRecord> {
    await this.findOne(patientId); // Verify patient exists

    const medicalRecord = this.medicalRecordRepository.create({
      ...createMedicalRecordDto,
      patientId,
    });

    return await this.medicalRecordRepository.save(medicalRecord);
  }

  /**
   * Get specific medical record
   */
  async getMedicalRecord(
    patientId: string,
    recordId: string,
  ): Promise<MedicalRecord> {
    await this.findOne(patientId); // Verify patient exists

    const record = await this.medicalRecordRepository.findOne({
      where: { id: recordId, patientId },
    });

    if (!record) {
      throw new NotFoundException(
        `Medical record with ID ${recordId} not found`,
      );
    }

    return record;
  }

  /**
   * Update medical record (creates new version)
   */
  async updateMedicalRecord(
    patientId: string,
    recordId: string,
    updateData: Partial<CreateMedicalRecordDto>,
  ): Promise<MedicalRecord> {
    const existingRecord = await this.getMedicalRecord(patientId, recordId);

    // Create new version
    const newVersion = this.medicalRecordRepository.create({
      ...existingRecord,
      ...updateData,
      id: undefined, // Generate new ID
      version: existingRecord.version + 1,
      previousVersionId: existingRecord.id,
    });

    return await this.medicalRecordRepository.save(newVersion);
  }

  /**
   * Get patient statistics
   */
  async getStatistics(): Promise<any> {
    const total = await this.patientRepository.count();
    const active = await this.patientRepository.count({
      where: { isActive: true },
    });
    const inactive = total - active;

    const byGender = await this.patientRepository
      .createQueryBuilder('patient')
      .select('patient.gender', 'gender')
      .addSelect('COUNT(*)', 'count')
      .groupBy('patient.gender')
      .getRawMany();

    return {
      total,
      active,
      inactive,
      byGender,
    };
  }
}
