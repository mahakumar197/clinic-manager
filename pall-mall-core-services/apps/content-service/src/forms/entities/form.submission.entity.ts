import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Form } from './form.entity';
import { FormAnswer } from './form.answer.entity';
import { FormResponse } from './form.response.entity';
import { FormStatus } from '@pallmall/common-utils';

@Entity('form_submissions')
export class FormSubmission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Form, (form) => form.submissions)
  @JoinColumn({ name: 'form_id' })
  form: Form;

  @Column({ nullable: true })
  submitted_by: string;

  @Column({ type: 'enum', enum: FormStatus })
  status: FormStatus;

  @Column()
  submitted_at: Date;

  @Column({ nullable: true })
  task_id: string;

  @Column({ type: 'text', nullable: true })
  signature_image: string;

  @Column({ type: 'boolean', nullable: true })
  is_guest: boolean;

  @OneToMany(() => FormAnswer, (a) => a.submission)
  answers: FormAnswer[];

  @OneToMany(() => FormResponse, (r) => r.submission)
  form_responses: FormResponse[];

  @CreateDateColumn()
  created_at: Date;
}
