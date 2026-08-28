import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { HomeCarousel } from './home-carousel.entity';

@Entity('app_home_config')
export class AppHomeConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'app_name', length: 150 })
  appName: string;

  @Column({ name: 'home_desc', type: 'text' })
  homeDesc: string;

  @OneToMany(() => HomeCarousel, (carousel) => carousel.homeConfig)
  carousels: HomeCarousel[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
