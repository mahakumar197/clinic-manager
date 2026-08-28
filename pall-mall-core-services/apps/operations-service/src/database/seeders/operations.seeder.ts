import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AppDataSource } from '../data-source';
import { User } from '../../users/entities/user.entity';

export class OperationsSeeder {
  async run(dataSource: DataSource): Promise<void> {
    const userRepository = dataSource.getRepository(User);

    // Check if admin already exists
    const existingAdmin = await userRepository.findOne({
      where: { email: 'admin@pallmall.com' },
    });

    if (existingAdmin) {
      console.log('Admin user already exists, skipping seed');
      return;
    }

    // Create admin user
    const adminPassword = await bcrypt.hash('Admin@123456', 12);
    await userRepository.save({
      email: 'admin@pallmall.com',
      passwordHash: adminPassword,
      first_name: 'System',
      last_name: 'Administrator',
      role: 'ADMIN',
      isActive: true,
      isEmailVerified: true,
    } as any);

    // Create sample doctor
    const doctorPassword = await bcrypt.hash('Doctor@123456', 12);
    await userRepository.save({
      email: 'doctor@pallmall.com',
      passwordHash: doctorPassword,
      first_name: 'John',
      last_name: 'Smith',
      role: 'DOCTOR',
      isActive: true,
      isEmailVerified: true,
    } as any);

    // Create sample patient
    const patientPassword = await bcrypt.hash('Patient@123456', 12);
    await userRepository.save({
      email: 'patient@pallmall.com',
      passwordHash: patientPassword,
      first_name: 'Jane',
      last_name: 'Doe',
      role: 'PATIENT',
      isActive: true,
      isEmailVerified: true,
    } as any);

    console.log('✅ Operations Service seeded successfully');
    console.log('Admin: admin@pallmall.com / Admin@123456');
    console.log('Doctor: doctor@pallmall.com / Doctor@123456');
    console.log('Patient: patient@pallmall.com / Patient@123456');
  }
}

// Run seeder if executed directly
if (require.main === module) {
  AppDataSource.initialize()
    .then(async (dataSource) => {
      const seeder = new OperationsSeeder();
      await seeder.run(dataSource);
      await dataSource.destroy();
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error running seeder:', error);
      process.exit(1);
    });
}
