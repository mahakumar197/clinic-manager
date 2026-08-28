import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { NotificationType } from './notification.entity';

@Entity('notification_templates')
export class NotificationTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string; // e.g., 'OTP_EMAIL', 'WELCOME_EMAIL', 'APPOINTMENT_REMINDER'

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column()
  subject: string;

  @Column({ type: 'text' })
  content: string; // Template with placeholders like {{name}}, {{otp}}

  @Column({ name: 'default_data', type: 'jsonb', nullable: true })
  defaultData: any;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}