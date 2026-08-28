import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('guest_user')
export class GuestUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'device_id' })
  deviceId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
