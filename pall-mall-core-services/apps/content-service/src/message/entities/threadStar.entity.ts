import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Thread } from './threads.entity';

@Entity('thread_stars')
@Unique(['thread_id', 'user_id'])
export class ThreadStar {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  thread_id: string;

  @Column('uuid')
  user_id: string;

  @ManyToOne(() => Thread, (t) => t.stars, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'thread_id' })
  thread: Thread;

  @CreateDateColumn({ type: 'timestamptz' })
  starred_at: Date;
}
