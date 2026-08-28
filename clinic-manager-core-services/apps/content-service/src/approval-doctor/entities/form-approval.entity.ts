import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

import { FormApprovalStatus } from '@pallmall/common-utils';

@Entity('form_approvals')
export class FormApproval {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  submission_id: string;

  @Column({ type: 'uuid', nullable: true })
  form_id: string;

  @Column({ type: 'uuid', nullable: true })
  task_id: string;

  @Column('uuid', { nullable: true })
  reviewed_by: string;

  @Column({
    type: 'enum',
    enum: FormApprovalStatus,
    nullable: true,
  })
  status: FormApprovalStatus;

  @Column({ type: 'timestamp' })
  reviewed_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  approved_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  rejected_at: Date;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
