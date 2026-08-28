import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ZohoForm } from './zoho-form.entity';

@Entity('zoho_form_field_mappings')
export class ZohoFormFieldMapping {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  form_id: string;

  @Column('uuid')
  question_id: string;

  @Column({ length: 100 })
  zoho_field_key: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ type: 'jsonb', nullable: true })
  meta: Record<string, any>;

  @ManyToOne(() => ZohoForm, (form) => form.mappings)
  @JoinColumn({ name: 'form_id' })
  form: ZohoForm;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
