import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum AuditAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
  PASSWORD_RESET = 'password_reset',
  PERMISSION_CHANGE = 'permission_change',
  DATA_EXPORT = 'data_export',
  DATA_ACCESS = 'data_access',
}

export enum AuditEntity {
  USER = 'user',
  PATIENT = 'patient',
  MEDICAL_RECORD = 'medical_record',
  APPOINTMENT = 'appointment',
  PRESCRIPTION = 'prescription',
  NOTIFICATION = 'notification',
  CONTENT = 'content',
}

export interface AuditMetadata {
  sessionId?: string;
  deviceInfo?: string;
  location?: {
    ip: string;
    country?: string;
    city?: string;
  };
  userAgent?: string;
  correlationId?: string;
  reason?: string;
  complianceFlags?: string[];
  phiAccessed?: boolean;
  dataClassification?: 'public' | 'internal' | 'confidential' | 'restricted';
}

@Entity('audit_logs')
@Index(['userId', 'createdAt'])
@Index(['entityType', 'entityId'])
@Index(['action', 'createdAt'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', nullable: true })
  @Index()
  userId: string;

  @Column({ name: 'user_name', nullable: true })
  userName: string;

  @Column({
    type: 'enum',
    enum: AuditAction,
  })
  action: AuditAction;

  @Column({
    name: 'entity_type',
    type: 'enum',
    enum: AuditEntity,
  })
  entityType: AuditEntity;

  @Column({ name: 'entity_id' })
  entityId: string;

  @Column({ name: 'old_value', type: 'jsonb', nullable: true })
  oldValue: Record<string, unknown>;

  @Column({ name: 'new_value', type: 'jsonb', nullable: true })
  newValue: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true })
  metadata: AuditMetadata;

  @Column({ name: 'ip_address', nullable: true })
  ipAddress: string;

  @Column({ name: 'user_agent', nullable: true })
  userAgent: string;

  @Column({ name: 'correlation_id', nullable: true })
  correlationId: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn({ name: 'created_at' })
  @Index()
  createdAt: Date;
}