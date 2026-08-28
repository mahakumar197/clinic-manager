import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

import { Task } from './task.entity';

@Entity({ name: 'task_templates' })
export class TaskTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'json' })
  template: JSON;

  @Column({ type: 'uuid' })
  created_by: string;

  @Column({ type: 'boolean' })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Task, (task) => task.task_template)
  tasks: Task[];
}
