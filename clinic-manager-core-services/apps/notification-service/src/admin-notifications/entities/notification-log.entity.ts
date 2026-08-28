import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { TriggerEvent } from '@pallmall/common-utils';
import { NotificationChannel } from '@pallmall/common-utils';

@Entity('notification_logs')
export class NotificationLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  rule_id: string;

  @Column({ type: 'enum', enum: TriggerEvent })
  trigger_event: TriggerEvent;

  @Column({ type: 'enum', enum: NotificationChannel })
  channel: NotificationChannel;

  @Column({ type: 'jsonb' })
  recipients: Record<string, any>;

  @Column({ default: true })
  success: boolean;

  @Column({ type: 'text', nullable: true })
  error: string;

  @CreateDateColumn()
  created_at: Date;
}
