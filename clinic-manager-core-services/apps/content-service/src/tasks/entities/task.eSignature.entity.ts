import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TaskSubmission } from './task-submissions.entity';
import { Task } from './task.entity';

@Entity({ name: 'task_esignatures' })
export class TaskESignature {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => TaskSubmission, (s) => s.esignatures, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'submission_id' })
  submission: TaskSubmission;

  @Column({ type: 'uuid' })
  patient_id: string;

  @Column({ type: 'uuid' })
  task_id: string;

  @ManyToOne(() => Task, (task) => task.esignatures)
  @JoinColumn({ name: 'task_id' })
  task: Task;

  @Column({ type: 'uuid', nullable: true })
  form_id: string;

  @Column({ type: 'text' })
  signature: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
