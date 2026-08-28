import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { User } from './user.entity';

@Entity({ name: 'patient_information' })
export class PatientInformation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'patient_id', type: 'uuid' })
  patientId: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'patient_id' })
  patient: User;

  @Column({ name: 'doctor_id', type: 'uuid', nullable: true })
  doctorId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'doctor_id' })
  doctor: User;

  @Column({ name: 'coordinator_id', type: 'uuid', nullable: true })
  coordinatorId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'coordinator_id' })
  coordinator: User;

  @Column({ name: 'procedure_name', type: 'text', nullable: true })
  procedureName: string;

  @Column({ name: 'hospital_name', type: 'text', nullable: true })
  hospitalName: string;

  @Column({ name: 'meta_data', type: 'jsonb', nullable: true })
  metaData: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}