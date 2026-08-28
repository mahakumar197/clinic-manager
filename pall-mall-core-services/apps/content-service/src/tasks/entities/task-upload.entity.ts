import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Task } from './task.entity';
import { TaskSubmission } from './task-submissions.entity';

@Entity({ name: 'task_uploads' })
export class TaskUpload {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => TaskSubmission, (s) => s.uploads, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'submission_id' })
  submission: TaskSubmission;

  @Column({ type: 'uuid' })
  task_id: string;

  @ManyToOne(() => Task, (task) => task.uploads)
  @JoinColumn({ name: 'task_id' })
  task: Task;

  @Column({ type: 'uuid' })
  patient_id: string;

  @Column({ type: 'text' })
  file_content: string;

  @Column({ type: 'boolean' })
  is_active: boolean;

  @CreateDateColumn()
  uploaded_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
