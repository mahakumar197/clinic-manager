import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { FormSubmission } from './form.submission.entity';
import { FormQuestion } from './form.question.entity';

@Entity('form_answers')
export class FormAnswer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => FormSubmission, (s) => s.answers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'submission_id' })
  submission: FormSubmission;

  @ManyToOne(() => FormQuestion)
  @JoinColumn({ name: 'question_id' })
  question: FormQuestion;

  @Column({ type: 'text', array: true, nullable: true })
  answer: string[];

  @CreateDateColumn()
  created_at: Date;
}
