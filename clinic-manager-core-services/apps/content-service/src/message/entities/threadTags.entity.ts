import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Thread } from './threads.entity';

@Entity('thread_tags')
export class ThreadTag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  thread_id: string;

  @Column('uuid')
  tagged_user_id: string;

  @Column('uuid')
  tagged_by_user_id: string;

  @ManyToOne(() => Thread, (thread) => thread.tags, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'thread_id' })
  thread: Thread;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
