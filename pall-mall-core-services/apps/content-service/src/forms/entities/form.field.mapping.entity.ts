import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Form } from './form.entity';

@Entity('form_field_mapping')
export class FormFieldMapping {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Form, (form) => form.submissions)
  @JoinColumn({ name: 'form_id' })
  form: Form;

  @Column({ type: 'varchar', length: 255 })
  form_name: string;

  @Column({ type: 'varchar', length: 255 })
  zoho_field_name: string;

  @Column({ type: 'varchar', length: 255 })
  question: string;

  @Column({ type: 'boolean', default: true })
  status: boolean;

  @CreateDateColumn()
  created_at: Date;
}