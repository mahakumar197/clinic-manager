import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity('approvals_admin')
export class ApprovalsAdmin {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  submission_id: string;

  @Column({ type: 'uuid', nullable: true })
  form_id: string;

  @Column({ type: 'uuid', nullable: true })
  task_id: string;

  @Column({ type: 'boolean', nullable: true })
  is_approved: boolean;

  @Column({ type: 'boolean', nullable: true })
  is_rejected: boolean;

  @Column({ type: 'uuid', nullable: true })
  action_by: string;

  @Column({ type: 'timestamp', nullable: true })
  action_at: Date;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
