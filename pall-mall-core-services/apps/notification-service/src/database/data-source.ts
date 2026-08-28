import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'admin',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME_NOTIFICATION || 'pallmall_notifications_db',
  entities: [
    'dist/notifications/entities/*.entity.js',
    'dist/admin-notifications/entities/*.entity.js',
  ],
  migrations: ['dist/database/migrations/*.js'],
  synchronize: false,
  logging: false,
});
