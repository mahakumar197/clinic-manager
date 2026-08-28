import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum PlatformType {
  ANDROID = 'android',
  IOS = 'ios',
}

@Entity('force_updates')
export class ForceUpdate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: PlatformType,
    enumName: 'force_updates_platform_enum',
  })
  platform: PlatformType;

  @Column()
  current_version: string;

  @Column()
  minimum_supported_version: string;

  @Column({ type: 'boolean', default: false })
  is_force_update: boolean;

  @Column({ type: 'text', nullable: true })
  release_notes: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
