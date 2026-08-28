import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'task_config' })
export class TaskConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'integer',
    comment:
      'Patient phase (140=Guest, 141=Consultation, 142=Pre-Op, 143=Post-Op)',
  })
  patient_phase_id: number;

  @Column({
    type: 'boolean',
    default: true,
    comment:
      'True if task applies to all procedures, false if procedure-specific',
  })
  is_global: boolean;

  @Column({
    type: 'integer',
    nullable: true,
    comment:
      'Specific procedure type ID (28=Rhinoplasty, 29=Breast Augmentation, etc.) - null if is_global=true',
  })
  procedure_type: number;

  @Column({
    type: 'text',
    comment: 'Task name to be used when creating the task',
  })
  task_name: string;

  @Column({ type: 'text', nullable: true, comment: 'Task description' })
  task_description: string;

  @Column({
    type: 'integer',
    comment:
      'Task category ID (16=Form Response, 17=Watch Content, 18=E-Signature, 19=File Upload)',
  })
  category: number;

  @Column({
    type: 'text',
    nullable: true,
    comment: 'Zoho form ID if category is Form Response (16)',
  })
  zoho_form: string;

  @Column({
    type: 'text',
    nullable: true,
    comment: 'Content ID if category is Watch Content (17)',
  })
  content_id: string;

  @Column({
    type: 'text',
    nullable: true,
    comment: 'Screen ID for mobile app navigation',
  })
  screen_id: string;

  @Column({
    type: 'integer',
    nullable: true,
    comment: 'Number of days from phase start to set as due date (optional)',
  })
  due_date_offset_days: number;

  @Column({
    type: 'boolean',
    default: true,
    comment: 'Whether this configuration is active',
  })
  is_active: boolean;

  @Column({
    type: 'integer',
    default: 0,
    comment: 'Display order for tasks within the same phase',
  })
  display_order: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
