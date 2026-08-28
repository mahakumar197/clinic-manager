import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Procedures } from '../../procedures/entities/procedures.entity';
import { ContentType, ContentStatus } from '@pallmall/common-utils';
@Entity('contents')
export class Content {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ContentType,
  })
  type: ContentType;

  @Column({ type: 'text', nullable: true })
  content: string; // HTML content or markdown

  @Column({ nullable: true })
  img_count: number;

  @Column({ nullable: true })
  thumbnail_url: string;

  @Column({
    type: 'text',
    array: true,
    nullable: true,
  })
  content_url: string[];

  @Column({ type: 'jsonb', nullable: true })
  eLearnings: JSON;

  @Column({ type: 'text', nullable: true })
  blog_header: string;

  @Column({
    type: 'enum',
    enum: ContentStatus,
    default: ContentStatus.DRAFT,
  })
  status: ContentStatus;

  @Column({ nullable: true })
  author_id: string;

  @Column({ nullable: true })
  author_name: string;

  @Column({ default: 0 })
  view_count: number;

  @Column({ default: 0 })
  like_count: number;

  @Column({ type: 'text', array: true, nullable: true })
  liked_users: string[];

  @Column({ type: 'timestamp', nullable: true })
  published_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  @Column({ nullable: true })
  procedure_id: string;

  @ManyToOne(() => Procedures, { nullable: true })
  @JoinColumn({ name: 'procedure_id' })
  procedure: Procedures;
}
