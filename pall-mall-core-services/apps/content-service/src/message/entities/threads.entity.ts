import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Message } from './message.entity';
import { ThreadTag } from './threadTags.entity';
import { ThreadStar } from './threadStar.entity';
import { ThreadStatus } from '@pallmall/common-utils';

@Entity('threads')
export class Thread {
  @PrimaryGeneratedColumn('uuid')
  thread_id: string;

  @Column({ type: 'uuid' })
  patient_user_id: string;

  @Column('uuid', { array: true, nullable: true })
  assigned_user_ids: string[] | null;

  @Column({ type: 'text', nullable: true })
  subject: string;

  @OneToMany(() => Message, (message) => message.thread)
  messages: Message[];

  @OneToMany(() => ThreadTag, (tag) => tag.thread)
  tags: ThreadTag[];

  @OneToMany(() => ThreadStar, (star) => star.thread)
  stars: ThreadStar[];

  @Column({
    type: 'enum',
    enum: ThreadStatus,
    default: ThreadStatus.OPEN,
  })
  status: ThreadStatus;

  @Column({ type: 'timestamptz', nullable: true })
  archived_at: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  deleted_at: Date | null;

  @Column({ type: 'uuid', nullable: true })
  deleted_by: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
