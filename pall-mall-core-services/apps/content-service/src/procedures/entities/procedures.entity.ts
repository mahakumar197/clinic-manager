import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { ProcedureModel, ProcedureStatus } from '@pallmall/common-utils';
import { Content } from '../../content/entities/content.entity';

@Entity('procedures')
export class Procedures {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: ProcedureModel,
  })
  type: ProcedureModel;

  @Column({ nullable: true })
  thumbnail_url: string;

  @Column({ nullable: true })
  video_url: string;

  @Column({
    type: 'enum',
    enum: ProcedureStatus,
    default: ProcedureStatus.ACTIVE,
  })
  status: ProcedureStatus;

  @OneToMany(() => Content, (content) => content.procedure)
  content: Content[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
