import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('escalation_logs')
export class EscalationLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  escalation_rule_id: string;

  @Column()
  entity_id: string;

  @Column({ type: 'timestamp' })
  scheduled_at: Date;

  @Column({ default: false })
  is_executed: boolean;

  @CreateDateColumn()
  created_at: Date;
}
