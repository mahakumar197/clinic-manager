import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToOne,
} from 'typeorm';
import { UserRole } from '@pallmall/shared-types';
import { UserProfile } from '../../user-profile/entities/user-profile.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'password_hash', type: 'varchar', nullable: true })
  passwordHash: string | null;

  @Column({ name: 'user_name', nullable: true })
  userName?: string;

  @Column({ name: 'phone_number', nullable: true, unique: true })
  phoneNumber?: string;

  @Column({ type: 'date', nullable: true })
  dob: Date | null;

  @Column({
    type: 'enum',
    enum: UserRole,
  })
  role: UserRole;

  @Column({ name: 'google_id', type: 'varchar', nullable: true, unique: true })
  googleId: string | null;

  @Column({ name: 'facebook_id', type: 'varchar', nullable: true, unique: true })
  facebookId: string | null;

  @Column({ name: 'apple_id', type: 'varchar', nullable: true, unique: true })
  appleId: string | null;

  @Column({ name: 'refresh_token', nullable: true })
  refreshToken?: string;

  @Column({ name: 'token_version', default: 0 })
  tokenVersion: number;

  @Column({ name: 'failed_login_attempts', default: 0 })
  failedLoginAttempts: number;

  @Column({ name: 'locked_until', type: 'timestamp', nullable: true })
  lockedUntil: Date | null;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'is_email_verified', default: false })
  isEmailVerified: boolean;

  @Column({
    name: 'auth_provider',
    type: 'enum',
    enum: ['EMAIL', 'GOOGLE', 'FACEBOOK', 'APPLE'],
    default: 'EMAIL',
  })
  authProvider: 'EMAIL' | 'GOOGLE' | 'FACEBOOK' | 'APPLE';

  @OneToOne(() => UserProfile, (profile) => profile.user)
  profile: UserProfile;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date | null;

  // user management fields
  @Column({ type: 'varchar', nullable: true })
  first_name?: string;

  @Column({ type: 'varchar', nullable: true })
  last_name?: string;

  @Column({ type: 'varchar', nullable: true })
  department: string;

  @Column({ type: 'text', nullable: true })
  additional_notes?: string;

  @Column({ default: false })
  two_fa_enabled: boolean;

  @Column({ type: 'timestamp', nullable: true })
  suspended_until: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  last_login: Date | null;

  @Column({ type: 'varchar', nullable: true })
  suspension_reason: string | null;

  @Column({ name: 'fcmtoken', type: 'text', nullable: true })
  fcmToken?: string;

  @Column({ type: 'varchar', nullable: true, default: 'active' })
  status: string | null;

  @Column({ type: 'int', nullable: true })
  patient_phase_id: number;
}