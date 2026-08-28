import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { NotificationChannel } from '@pallmall/common-utils';

@Entity('escalation_rules')
export class EscalationRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'integer' })
  base_trigger_event: number;

  @Column({ type: 'integer' })
  condition: number;

  @Column({ type: 'integer' })
  action: number;

  @Column({
    type: 'enum',
    enum: NotificationChannel,
    array: true,
  })
  channels: NotificationChannel[];

  @Column({ type: 'jsonb' })
  recipients: Record<string, any>;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
