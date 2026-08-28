import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';

@Entity({ name: 'approval_doctor_quick_response' })
export class ApprovalDoctorQuickResponse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  submission_id: string;

  @Column({ type: 'text' })
  quick_response: string;

  @Column({ type: 'uuid' })
  quick_response_by: string;

  @Column({ type: 'boolean' })
  is_active: boolean;

  @CreateDateColumn()
  quick_response_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
