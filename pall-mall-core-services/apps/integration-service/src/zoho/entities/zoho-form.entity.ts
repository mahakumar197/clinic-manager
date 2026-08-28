import {
  Entity,
  PrimaryColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ZohoFormFieldMapping } from './zoho-form-field-mapping.entity';

@Entity('zoho_forms')
export class ZohoForm {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: true })
  name: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ type: 'text', nullable: true })
  zoho_form_link_name: string;

  @OneToMany(() => ZohoFormFieldMapping, (m) => m.form)
  mappings: ZohoFormFieldMapping[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
