import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { FormQuestion } from './form.question.entity';
import { FormSubmission } from './form.submission.entity';
import { FormPriority, FormType } from '@pallmall/common-utils';
import { FormFieldMapping } from './form.field.mapping.entity';

@Entity('forms')
export class Form {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text' })
  phase: string;

  @Column({ type: 'text', nullable: true })
  procedure_type: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: 1 })
  version: number;

  @Column({ type: 'enum', enum: FormPriority, nullable: true })
  priority: FormPriority;

  @Column({ type: 'enum', enum: FormType, nullable: true })
  form_type: FormType;

  @Column({ type: 'boolean', nullable: true })
  page_exists: boolean;

  @Column({ type: 'boolean', nullable: true })
  eSignature_required: boolean;

  @Column({ type: 'text', nullable: true })
  form_link: string;

  @OneToMany(() => FormQuestion, (q) => q.form)
  questions: FormQuestion[];

  @OneToMany(() => FormSubmission, (s) => s.form)
  submissions: FormSubmission[];

  @OneToMany(() => FormFieldMapping, (f) => f.form)
  fields: FormFieldMapping[];

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
