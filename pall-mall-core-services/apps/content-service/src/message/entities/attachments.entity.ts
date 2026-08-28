import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Message } from './message.entity';
import { FileType } from '@pallmall/common-utils';

@Entity('attachments')
export class Attachment {
  @PrimaryGeneratedColumn('uuid')
  attachment_id: string;

  @ManyToOne(() => Message, (message) => message.attachments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'message_id' })
  message: Message;

  @Column({ type: 'text' })
  file_url: string;

  @Column({
    type: 'enum',
    enum: FileType,
  })
  file_type: FileType;

  @Column({ type: 'text', nullable: true })
  file_duration: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
