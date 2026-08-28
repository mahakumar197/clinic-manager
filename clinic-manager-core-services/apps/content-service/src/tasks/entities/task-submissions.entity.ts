import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { FormStatus, TaskSubmissionType } from '@pallmall/common-utils';
import { Task } from './task.entity';
import { TaskUpload } from './task-upload.entity';
import { TaskESignature } from './task.eSignature.entity';

@Entity('task_submissions')
export class TaskSubmission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  task_id: string;

  @ManyToOne(() => Task, (task) => task.submissions)
  @JoinColumn({ name: 'task_id' })
  task: Task;

  @Column({ nullable: true })
  submitted_by: string;

  @Column({ type: 'enum', enum: FormStatus })
  status: FormStatus;

  @Column()
  submitted_at: Date;

  @Column({ type: 'text', nullable: true })
  signature_image: string;

  @Column({ type: 'boolean', nullable: true })
  is_guest: boolean;

  @CreateDateColumn()
  created_at: Date;

  @Column({ type: 'enum', enum: TaskSubmissionType })
  type: TaskSubmissionType;

  @OneToMany(() => TaskUpload, (a) => a.submission)
  uploads: TaskUpload[];

  @OneToMany(() => TaskESignature, (a) => a.submission)
  esignatures: TaskESignature[];
}
