import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProcedureModel } from '@pallmall/common-utils';

@Entity('elearnings')
export class Elearning {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'enum', enum: ProcedureModel })
  type: ProcedureModel;

  @Column({ type: 'text' })
  thumbnail_url: string;

  @Column({ type: 'text', nullable: true })
  icon_url: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
