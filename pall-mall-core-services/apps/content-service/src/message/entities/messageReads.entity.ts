import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  Unique,
  JoinColumn,
} from 'typeorm';
import { Message } from './message.entity';

@Entity('message_reads')
@Unique(['message_id', 'user_id'])
export class MessageRead {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  message_id: string;

  @Column('uuid')
  user_id: string;

  @ManyToOne(() => Message, (message) => message.reads, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'message_id' })
  message: Message;

  @CreateDateColumn({ type: 'timestamptz' })
  read_at: Date;
}
