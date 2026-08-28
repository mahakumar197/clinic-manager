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

@Entity({ name: 'task_comments' })
export class TaskComment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  task_id: string;

  @ManyToOne(() => Task, (task) => task.comments)
  @JoinColumn({ name: 'task_id' })
  task: Task;

  @Column({ type: 'text' })
  comment: string;

  @Column({ type: 'uuid', nullable: true })
  attachment_id: string;

  @Column({ type: 'uuid' })
  commented_by: string;

  @Column({ type: 'boolean' })
  is_active: boolean;

  @CreateDateColumn()
  commented_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
