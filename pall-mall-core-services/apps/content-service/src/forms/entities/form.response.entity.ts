import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { FormSubmission } from './form.submission.entity';
import { NodeType, QuestionType } from '@pallmall/common-utils';

@Entity('form_responses')
export class FormResponse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => FormSubmission, (s) => s.form_responses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'submission_id' })
  submission: FormSubmission;

  @Column({ name: 'link_name' })
  link_name: string;

  @Column({ name: 'display_name' })
  display_name: string;

  @Column({ name: 'question_type', enum: QuestionType })
  question_type: QuestionType;

  @Column({ name: 'node_type', enum: NodeType })
  node_type: NodeType;

  @Column({ name: 'answers', type: 'text', array: true, nullable: true })
  answers: string[];

  @Column({ name: 'options', type: 'text', array: true, nullable: true })
  options: string[];

  @Column({ name: 'display_order', nullable: true })
  display_order: number;

  @CreateDateColumn()
  created_at: Date;
}