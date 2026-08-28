import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Form } from './form.entity';
import { QuestionType, NodeType } from '@pallmall/common-utils';

@Entity('form_questions')
export class FormQuestion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Form, (form) => form.questions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'form_id' })
  form: Form;

  @Column({ type: 'text' })
  question: string;

  @Column({ type: 'enum', enum: QuestionType })
  question_type: QuestionType;

  @Column({ name: 'display_order' })
  display_order: number;

  @Column({ type: 'text', array: true, nullable: true })
  options: string[];

  @Column({ type: 'integer', nullable: true })
  page: number;

  @Column({ type: 'text', nullable: true })
  page_name: string;

  @Column({ type: 'jsonb', nullable: true })
  validations: Record<string, string>;

  @Column({ type: 'enum', enum: NodeType })
  node_type: NodeType;

  @Column({ type: 'json', nullable: true })
  visibility_rules: JSON;

  @Column({ type: 'boolean' })
  is_active: boolean;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
