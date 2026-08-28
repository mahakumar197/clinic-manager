import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserJourney } from './user-journey.entity';

export enum StepStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  SKIPPED = 'skipped',
}

@Entity('journey_steps')
export class JourneyStep {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'journey_id' })
  journeyId: string;

  @ManyToOne(() => UserJourney, (journey) => journey.steps)
  @JoinColumn({ name: 'journey_id' })
  journey: UserJourney;

  @Column({ name: 'step_number' })
  stepNumber: number;

  @Column({ name: 'step_name' })
  stepName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: StepStatus,
    default: StepStatus.PENDING,
  })
  status: StepStatus;

  @Column({ name: 'content_id', nullable: true })
  contentId: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}