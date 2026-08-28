import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { TaskAction } from '@pallmall/common-utils';
import { Task } from './task.entity';

@Entity({ name: 'task_activity' })
export class TaskActivity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  task_id: string;

  @ManyToOne(() => Task, (task) => task.activities)
  @JoinColumn({ name: 'task_id' })
  task: Task;

  @Column({ type: 'enum', enum: TaskAction })
  action: TaskAction;

  @Column({ type: 'boolean' })
  is_active: boolean;

  @Column({ type: 'uuid' })
  performed_by: string;

  @CreateDateColumn()
  performed_at: Date;
}
