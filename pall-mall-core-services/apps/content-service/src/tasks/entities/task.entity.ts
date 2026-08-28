import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { TaskActivity } from './task-activity.entity';
import { TaskComment } from './task-comments.entity';
import { TaskAttachment } from './task-attachment.entity';
import { TaskAssignee } from './task-assignees.entity';
import { TaskUpload } from './task-upload.entity';
import { TaskTrack } from './task-track.entity';
import { TaskSubmission } from './task-submissions.entity';
import { TaskESignature } from './task.eSignature.entity';

@Entity({ name: 'tasks' })
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  patient_id: string;

  @Column({ type: 'integer' })
  procedure_type: number;

  @Column({ type: 'uuid', nullable: true })
  task_template: string;

  @Column({ type: 'text' })
  task_name: string;

  @Column({ type: 'text', nullable: true })
  task_description: string;

  @Column({ type: 'integer' })
  phase: number;

  @Column({ type: 'integer' })
  category: number;

  @Column({ type: 'text', nullable: true })
  zoho_form: string;

  @Column({ type: 'text', nullable: true })
  content_id: string;

  @Column({ type: 'uuid', nullable: true })
  assigned_to: string;

  @Column({ type: 'date', nullable: true })
  due_date: string;

  @Column({ type: 'integer' })
  status: number;

  @Column({ type: 'boolean' })
  is_active: boolean;

  @Column({ type: 'boolean', nullable: true })
  is_completed: boolean;

  @Column({ type: 'boolean', nullable: true })
  is_approved: boolean;

  @Column({ type: 'text', nullable: true })
  screen_id: string;

  @Column({ type: 'uuid', nullable: true })
  approved_by: string;

  @Column({ type: 'timestamp', nullable: true })
  approved_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  completed_at: Date;

  @Column({ type: 'date', nullable: true })
  postop_date: Date;

  @Column({ type: 'boolean', default: false })
  is_rejected: boolean;

  @Column({ type: 'uuid', nullable: true })
  rejected_by: string;

  @Column({ type: 'timestamp', nullable: true })
  rejected_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => TaskActivity, (activity) => activity.task)
  activities: TaskActivity[];

  @OneToMany(() => TaskComment, (comment) => comment.task)
  comments: TaskComment[];

  @OneToMany(() => TaskAttachment, (attachment) => attachment.task)
  attachments: TaskAttachment[];

  @OneToMany(() => TaskAssignee, (assignee) => assignee.task)
  assignees: TaskAssignee[];

  @OneToMany(() => TaskTrack, (track) => track.task)
  tracks: TaskTrack[];

  @OneToMany(() => TaskUpload, (upload) => upload.task)
  uploads: TaskUpload[];

  @OneToMany(() => TaskSubmission, (submission) => submission.task)
  submissions: TaskSubmission[];

  @OneToMany(() => TaskESignature, (esignature) => esignature.task)
  esignatures: TaskESignature[];

  @Column({ type: 'json', nullable: true })
  deleted_data: Record<string, unknown>;
}
