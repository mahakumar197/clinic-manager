import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export const createDataSource = (
  options: Partial<DataSourceOptions>,
): DataSource => {
  return new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'admin',
    password: process.env.DB_PASSWORD || 'password',
    synchronize: false,
    logging: process.env.NODE_ENV === 'development',
    ...options,
  } as DataSourceOptions);
};

export * from 'typeorm';
