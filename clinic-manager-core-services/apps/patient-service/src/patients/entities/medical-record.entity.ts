import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Patient } from './patient.entity';

export enum RecordType {
  CONSULTATION = 'consultation',
  LAB_REPORT = 'lab_report',
  PRESCRIPTION = 'prescription',
  DIAGNOSIS = 'diagnosis',
  SURGERY = 'surgery',
  VACCINATION = 'vaccination',
  OTHER = 'other',
}

export interface MedicalAttachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: Date;
  uploadedBy: string;
  url: string;
  checksum: string;
}

export interface LabTestResult {
  testName: string;
  testCode: string;
  value: string | number;
  unit: string;
  referenceRange: string;
  status: 'normal' | 'abnormal' | 'critical';
  performedAt: Date;
  performedBy: string;
  notes?: string;
}

export interface LabResult {
  labName: string;
  labId: string;
  testDate: Date;
  results: LabTestResult[];
  summary: string;
  reportUrl?: string;
}

@Entity('medical_records')
export class MedicalRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'patient_id' })
  patientId: string;

  @ManyToOne(() => Patient, (patient) => patient.medicalRecords)
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @Column({
    name: 'record_type',
    type: 'enum',
    enum: RecordType,
  })
  recordType: RecordType;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ nullable: true })
  diagnosis: string;

  @Column({ type: 'text', nullable: true })
  treatment: string;

  @Column({ type: 'text', nullable: true })
  prescription: string;

  @Column({ name: 'doctor_id', nullable: true })
  doctorId: string;

  @Column({ name: 'doctor_name', nullable: true })
  doctorName: string;

  @Column({ name: 'visit_date', type: 'date' })
  visitDate: Date;

  @Column({ type: 'jsonb', nullable: true })
  attachments: MedicalAttachment[];

  @Column({ name: 'lab_results', type: 'jsonb', nullable: true })
  labResults: LabResult[];

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ default: 1 })
  version: number;

  @Column({ name: 'previous_version_id', nullable: true })
  previousVersionId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}