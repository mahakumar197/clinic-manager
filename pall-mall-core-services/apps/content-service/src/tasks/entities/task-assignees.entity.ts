import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { TaskAction } from '@pallmall/common-utils';
import { Task } from './task.entity';

@Entity({ name: 'task_assignees' })
export class TaskAssignee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  task_id: string;

  @ManyToOne(() => Task, (task) => task.assignees)
  @JoinColumn({ name: 'task_id' })
  task: Task;

  @Column({ type: 'uuid' })
  assignee_id: string;

  @Column({ type: 'boolean' })
  is_active: boolean;

  @Column({ type: 'uuid' })
  assigned_by: string;

  @CreateDateColumn()
  assigned_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
