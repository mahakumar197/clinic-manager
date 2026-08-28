import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

@Entity({ name: 'content_role_permissions' })
@Unique(['role', 'module'])
export class RolePermission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  role: string;

  @Column({ name: 'module', type: 'varchar' })
  module: string;

  @Column({ name: 'enabled', type: 'boolean', default: false })
  isPermitted: boolean;

  @Column({ name: 'updated_by', type: 'varchar', nullable: true })
  updatedBy?: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
