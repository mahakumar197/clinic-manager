import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'dropdowns' })
export class Dropdown {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'text' })
  type: string;

  @Column({ type: 'text' })
  beValue: string;

  @Column({ type: 'text', nullable: true })
  enValue: string;

  @Column({ type: 'boolean' })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
