import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AppHomeConfig } from './app-home-config.entity';

@Entity('home_carousels')
export class HomeCarousel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'home_config_id', type: 'uuid' })
  homeConfigId: string;

  @ManyToOne(() => AppHomeConfig, (config) => config.carousels)
  @JoinColumn({ name: 'home_config_id' })
  homeConfig: AppHomeConfig;

  @Column({ name: 'image_url', type: 'text' })
  imageUrl: string;

  @Column({ length: 150 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'cta_text', length: 50 })
  ctaText: string;

  @Column({ name: 'cta_action', length: 100 })
  ctaAction: string;

  @Column({ name: 'cta_type', length: 20 })
  ctaType: string;

  @Column({ name: 'order_index', type: 'int' })
  orderIndex: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
