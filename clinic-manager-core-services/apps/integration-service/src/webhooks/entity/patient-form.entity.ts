import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('patient_forms')
export class PatientForm {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: true })
    patient_name: string;

    @Column({ nullable: true })
    email: string;

    @Column({ type: 'uuid', nullable: true })
    userId: string;

    @Column()
    unique_id: string;

    @Column({ nullable: true })
    form_name: string;

    @Column({ nullable: true })
    form_link: string;

    @Column({ type: 'text', nullable: true })
    helper_form_name: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}