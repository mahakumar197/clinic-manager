import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';

@Entity({ name: 'approval_doctor_comments' })
export class ApprovalDoctorComment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  submission_id: string;

  @Column({ type: 'uuid', nullable: true })
  task_submission_id: string;

  @Column({ type: 'text' })
  comment: string;

  @Column({ type: 'uuid' })
  commented_by: string;

  @Column({ type: 'boolean' })
  is_active: boolean;

  @CreateDateColumn()
  commented_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
