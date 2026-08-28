import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Thread } from './threads.entity';
import { Attachment } from './attachments.entity';
import { MessageRead } from './messageReads.entity';
import { MessageType, MessageVisibility } from '@pallmall/common-utils';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  message_id: string;

  @Column({ type: 'uuid' })
  thread_id: string;

  @Column({ type: 'uuid' })
  sender_id: string;

  @ManyToOne(() => Thread, (thread) => thread.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'thread_id' })
  thread: Thread;

  @Column({ type: 'text', nullable: true })
  message_text: string;

  @Column({
    type: 'enum',
    enum: MessageType,
    default: MessageType.TEXT,
  })
  message_type: MessageType;

  @Column({
    type: 'enum',
    enum: MessageVisibility,
    default: MessageVisibility.PATIENT,
  })
  visibility: MessageVisibility;

  @OneToMany(() => Attachment, (attachment) => attachment.message, {
    cascade: true,
  })
  attachments: Attachment[];

  @OneToMany(() => MessageRead, (mr) => mr.message)
  reads: MessageRead[];

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
