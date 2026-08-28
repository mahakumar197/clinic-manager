import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsEnum,
  IsDateString,
  IsOptional,
  IsObject,
  MinLength,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Gender, BloodGroup } from '../entities/patient.entity';
import { RecordType } from '../entities/medical-record.entity';

/* ========================================================================== */
/* REQUEST DTOs (INPUT)                                                       */
/* ========================================================================== */

// --- MEDICAL RECORD INPUT ---

export class CreateMedicalRecordDto {
  @ApiProperty({ enum: RecordType, example: RecordType.CONSULTATION })
  @IsEnum(RecordType)
  recordType: RecordType;

  @ApiProperty({ example: 'Annual Checkup' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Patient came for routine annual checkup' })
  @IsString()
  description: string;

  @ApiProperty({ example: 'Mild hypertension', required: false })
  @IsOptional()
  @IsString()
  diagnosis?: string;

  @ApiProperty({
    example: 'Prescribed medication and lifestyle changes',
    required: false,
  })
  @IsOptional()
  @IsString()
  treatment?: string;

  @ApiProperty({ example: 'Lisinopril 10mg once daily', required: false })
  @IsOptional()
  @IsString()
  prescription?: string;

  @ApiProperty({ example: 'doctor-uuid', required: false })
  @IsOptional()
  @IsString()
  doctorId?: string;

  @ApiProperty({ example: 'Dr. Smith', required: false })
  @IsOptional()
  @IsString()
  doctorName?: string;

  @ApiProperty({
    example: '2024-01-15',
    description: 'Visit date (YYYY-MM-DD)',
  })
  @IsDateString()
  visitDate: string;

  @ApiProperty({
    example: { files: ['report.pdf', 'scan.jpg'] },
    required: false,
    description: 'JSON object containing file references',
  })
  @IsOptional()
  @IsObject()
  attachments?: any;

  @ApiProperty({
    example: { bloodPressure: '120/80', heartRate: 72 },
    required: false,
    description: 'JSON object containing lab results',
  })
  @IsOptional()
  @IsObject()
  labResults?: any;

  @ApiProperty({ example: 'Follow up in 3 months', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

// --- PATIENT INPUT ---

export class CreatePatientDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  @MinLength(2)
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @MinLength(2)
  lastName: string;

  @ApiProperty({
    example: '1990-01-15',
    description: 'Date of birth (YYYY-MM-DD)',
  })
  @IsDateString()
  dateOfBirth: string;

  @ApiProperty({ enum: Gender, example: Gender.MALE })
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+1234567890' })
  @IsString()
  phone: string;

  @ApiProperty({ example: '+0987654321', required: false })
  @IsOptional()
  @IsString()
  alternatePhone?: string;

  @ApiProperty({ example: '123 Main St, Apt 4B', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: 'New York', required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ example: 'NY', required: false })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ example: 'USA', required: false })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ example: '10001', required: false })
  @IsOptional()
  @IsString()
  zipCode?: string;

  @ApiProperty({
    enum: BloodGroup,
    example: BloodGroup.O_POSITIVE,
    required: false,
  })
  @IsOptional()
  @IsEnum(BloodGroup)
  bloodGroup?: BloodGroup;

  @ApiProperty({ example: 'Jane Doe', required: false })
  @IsOptional()
  @IsString()
  emergencyContactName?: string;

  @ApiProperty({ example: '+1234567890', required: false })
  @IsOptional()
  @IsString()
  emergencyContactPhone?: string;

  @ApiProperty({ example: 'Spouse', required: false })
  @IsOptional()
  @IsString()
  emergencyContactRelation?: string;

  @ApiProperty({ example: 'Penicillin, Peanuts', required: false })
  @IsOptional()
  @IsString()
  allergies?: string;

  @ApiProperty({ example: 'Diabetes, Hypertension', required: false })
  @IsOptional()
  @IsString()
  chronicConditions?: string;

  @ApiProperty({ example: 'Metformin 500mg, Lisinopril 10mg', required: false })
  @IsOptional()
  @IsString()
  currentMedications?: string;

  @ApiProperty({ example: 'Blue Cross', required: false })
  @IsOptional()
  @IsString()
  insuranceProvider?: string;

  @ApiProperty({ example: 'BC123456789', required: false })
  @IsOptional()
  @IsString()
  insurancePolicyNumber?: string;

  @ApiProperty({ example: 'doctor-uuid', required: false })
  @IsOptional()
  @IsString()
  assignedDoctorId?: string;

  @ApiProperty({
    example: 'Patient prefers morning appointments',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdatePatientDto extends PartialType(CreatePatientDto) {}

// --- QUERY INPUT ---

export class PatientQueryDto {
  @ApiProperty({ required: false, example: 1, description: 'Page number' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ required: false, example: 10, description: 'Items per page' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiProperty({
    required: false,
    example: 'John',
    description: 'Search by name',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ enum: Gender, required: false })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiProperty({ enum: BloodGroup, required: false })
  @IsOptional()
  @IsEnum(BloodGroup)
  bloodGroup?: BloodGroup;

  @ApiProperty({
    required: false,
    example: 'doctor-uuid',
    description: 'Filter by assigned doctor',
  })
  @IsOptional()
  @IsString()
  assignedDoctorId?: string;

  @ApiProperty({
    required: false,
    example: 'true',
    description: 'Filter active patients',
  })
  @IsOptional()
  @Type(() => Boolean)
  isActive?: boolean;
}

/* ========================================================================== */
/* RESPONSE OBJECTS*/
/* ========================================================================== */

export class PatientResponseObject {
  @ApiProperty({ example: 'uuid-1234-5678' })
  id: string;
  @ApiProperty({ example: 'John' })
  firstName: string;
  @ApiProperty({ example: 'Doe' })
  lastName: string;
  @ApiProperty({ example: '1990-01-15' })
  dateOfBirth: Date;
  @ApiProperty({ enum: Gender, example: Gender.MALE })
  gender: Gender;
  @ApiProperty({ example: 'john.doe@example.com' })
  email: string;
  @ApiProperty({ example: '+1234567890' })
  phone: string;
  @ApiProperty({ example: true })
  isActive: boolean;
  @ApiProperty({ example: 'Dr. Smith', nullable: true })
  assignedDoctorId: string;
  @ApiProperty({ enum: BloodGroup, example: BloodGroup.O_POSITIVE })
  bloodGroup: BloodGroup;
  @ApiProperty()
  createdAt: Date;
  @ApiProperty()
  updatedAt: Date;
}

export class MedicalRecordResponseObject {
  @ApiProperty({ example: 'rec-uuid-123' })
  id: string;
  @ApiProperty({ example: 'patient-uuid-123' })
  patientId: string;
  @ApiProperty({ enum: RecordType, example: RecordType.CONSULTATION })
  recordType: RecordType;
  @ApiProperty({ example: 'Annual Checkup' })
  title: string;
  @ApiProperty()
  visitDate: Date;
  @ApiProperty({ example: { files: ['report.pdf'] }, nullable: true })
  attachments: any;
  @ApiProperty({ example: { bloodPressure: '120/80' }, nullable: true })
  labResults: any;
  @ApiProperty()
  createdAt: Date;
}

class PaginationMeta {
  @ApiProperty({ example: 1 })
  page: number;
  @ApiProperty({ example: 10 })
  limit: number;
  @ApiProperty({ example: 25 })
  total: number;
  @ApiProperty({ example: 3 })
  totalPages: number;
  @ApiProperty({ example: true })
  hasNext: boolean;
  @ApiProperty({ example: false })
  hasPrev: boolean;
}

class RequestMeta {
  @ApiProperty({ example: 'v1' })
  version: string;
  @ApiProperty({ example: '2024-01-22T10:00:00Z' })
  timestamp: string;
  @ApiProperty({ example: 'req-uuid-123' })
  requestId: string;
}

class PaginatedRequestMeta extends RequestMeta {
  @ApiProperty({ type: () => PaginationMeta })
  pagination: PaginationMeta;
}

/* ========================================================================== */
/* API RESPONSE WRAPPERS (SWAGGER)                                            */
/* ========================================================================== */

export class CreatePatientResponseDto {
  @ApiProperty({ example: true })
  success: boolean;
  @ApiProperty({ type: () => PatientResponseObject })
  data: PatientResponseObject;
  @ApiProperty({ example: 'Patient created successfully' })
  message: string;
  @ApiProperty({ type: () => RequestMeta })
  meta: RequestMeta;
}

export class GetPatientsResponseDto {
  @ApiProperty({ example: true })
  success: boolean;
  @ApiProperty({ type: () => [PatientResponseObject] })
  data: PatientResponseObject[];
  @ApiProperty({ example: 'Patients retrieved successfully' })
  message: string;
  @ApiProperty({ type: () => PaginatedRequestMeta })
  meta: PaginatedRequestMeta;
}

export class GetPatientResponseDto {
  @ApiProperty({ example: true })
  success: boolean;
  @ApiProperty({ type: () => PatientResponseObject })
  data: PatientResponseObject;
  @ApiProperty({ type: () => RequestMeta })
  meta: RequestMeta;
}

export class GenericResponseDto {
  @ApiProperty({ example: true })
  success: boolean;
  @ApiProperty({ example: 'Operation successful' })
  message: string;
}

export class GetMedicalRecordsResponseDto {
  @ApiProperty({ example: true })
  success: boolean;
  @ApiProperty({ type: () => [MedicalRecordResponseObject] })
  data: MedicalRecordResponseObject[];
  @ApiProperty({ type: () => RequestMeta })
  meta: RequestMeta;
}

export class CreateMedicalRecordResponseDto {
  @ApiProperty({ example: true })
  success: boolean;
  @ApiProperty({ type: () => MedicalRecordResponseObject })
  data: MedicalRecordResponseObject;
  @ApiProperty({ example: 'Medical record created successfully' })
  message: string;
}
