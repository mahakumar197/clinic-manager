import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('zoho_webhook_logs')
export class ZohoWebhookLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'json' })
  webhook_data: any;

  @CreateDateColumn()
  created_at: Date;
}