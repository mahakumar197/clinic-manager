import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Put,
  Delete,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PatientsService } from './patients.service';

import {
  CreatePatientDto,
  UpdatePatientDto,
  PatientQueryDto,
  CreateMedicalRecordDto,
  CreatePatientResponseDto,
  GetPatientsResponseDto,
  GetPatientResponseDto,
  GenericResponseDto,
  GetMedicalRecordsResponseDto,
  CreateMedicalRecordResponseDto,
} from './dto/patient.dtos';

@ApiTags('patients')
@Controller({
  path: 'patients',
  version: '1',
})
@ApiBearerAuth()
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new patient',
    description: 'Creates a new patient record with validation',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Patient created successfully',
    type: CreatePatientResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation failed or patient already exists',
  })
  create(@Body() createPatientDto: CreatePatientDto) {
    return this.patientsService.create(createPatientDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all patients with pagination and filtering',
    description:
      'Retrieves a paginated list of patients with optional filtering',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Patients retrieved successfully',
    type: GetPatientsResponseDto,
  })
  findAll(@Query() query: PatientQueryDto) {
    return this.patientsService.findAll(query);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get patient statistics' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  getStatistics() {
    return this.patientsService.getStatistics();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get patient by ID' })
  @ApiResponse({
    status: 200,
    description: 'Patient found',
    type: GetPatientResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  findOne(@Param('id') id: string) {
    return this.patientsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update patient' })
  @ApiResponse({
    status: 200,
    description: 'Patient updated successfully',
    type: GetPatientResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  update(@Param('id') id: string, @Body() updatePatientDto: UpdatePatientDto) {
    return this.patientsService.update(id, updatePatientDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete patient' })
  @ApiResponse({
    status: 200,
    description: 'Patient deleted successfully',
    type: GenericResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  remove(@Param('id') id: string) {
    return this.patientsService.remove(id);
  }

  @Get(':id/medical-records')
  @ApiOperation({ summary: 'Get patient medical records' })
  @ApiResponse({
    status: 200,
    description: 'Medical records retrieved successfully',
    type: GetMedicalRecordsResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  getMedicalRecords(@Param('id') id: string) {
    return this.patientsService.getMedicalRecords(id);
  }

  @Post(':id/medical-records')
  @ApiOperation({ summary: 'Create medical record for patient' })
  @ApiResponse({
    status: 201,
    description: 'Medical record created successfully',
    type: CreateMedicalRecordResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  createMedicalRecord(
    @Param('id') patientId: string,
    @Body() createMedicalRecordDto: CreateMedicalRecordDto,
  ) {
    return this.patientsService.addMedicalRecord(
      patientId,
      createMedicalRecordDto,
    );
  }

  @Get(':patientId/medical-records/:recordId')
  @ApiOperation({ summary: 'Get medical record by ID' })
  @ApiResponse({
    status: 200,
    description: 'Medical record found',
    type: CreateMedicalRecordResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Patient or medical record not found',
  })
  getMedicalRecord(
    @Param('patientId') patientId: string,
    @Param('recordId') recordId: string,
  ) {
    return this.patientsService.getMedicalRecord(patientId, recordId);
  }

  @Put(':patientId/medical-records/:recordId')
  @ApiOperation({ summary: 'Update medical record' })
  @ApiResponse({
    status: 200,
    description: 'Medical record updated (new version created)',
    type: CreateMedicalRecordResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Patient or medical record not found',
  })
  updateMedicalRecord(
    @Param('patientId') patientId: string,
    @Param('recordId') recordId: string,
    @Body() updateMedicalRecordDto: CreateMedicalRecordDto,
  ) {
    return this.patientsService.updateMedicalRecord(
      patientId,
      recordId,
      updateMedicalRecordDto,
    );
  }
}
