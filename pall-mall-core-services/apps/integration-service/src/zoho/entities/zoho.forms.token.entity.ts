import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
} from 'typeorm';

@Entity('zoho_form_tokens')
export class ZohoFormToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  access_token: string;

  @Column({ type: 'text' })
  refresh_token: string;

  @Column({ type: 'timestamp' })
  expires_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
