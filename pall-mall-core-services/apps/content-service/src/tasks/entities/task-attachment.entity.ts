import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Task } from './task.entity';
import { MimeType } from '@pallmall/common-utils';

@Entity({ name: 'task_attachments' })
export class TaskAttachment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  task_id: string;

  @ManyToOne(() => Task, (task) => task.attachments)
  @JoinColumn({ name: 'task_id' })
  task: Task;

  @Column({ type: 'text' })
  filename: string;

  @Column({ type: 'text' })
  s3_key: string;

  @Column({ type: 'enum', enum: MimeType })
  mime_type: MimeType;

  @Column({ type: 'boolean' })
  in_comment: boolean;

  @Column({ type: 'boolean' })
  is_active: boolean;

  @Column({ type: 'uuid' })
  uploaded_by: string;

  @CreateDateColumn()
  uploaded_at: Date;
}
