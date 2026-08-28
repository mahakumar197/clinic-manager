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

interface FormResponse {
  formId: string;
  submissionId: string;
}

@Entity({ name: 'task_tracks' })
export class TaskTrack {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  patient_id: string;

  @Column({ type: 'uuid' })
  task_id: string;

  @ManyToOne(() => Task, (task) => task.tracks)
  @JoinColumn({ name: 'task_id' })
  task: Task;

  @Column({ type: 'jsonb', nullable: true })
  track_data: Record<string, string>;

  @Column({ type: 'jsonb', nullable: true })
  form_response: FormResponse[];

  @Column({ type: 'text', array: true, nullable: true })
  steps: string[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
