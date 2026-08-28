import { Repository } from 'typeorm';

/**
 * Create a mock repository with common methods
 */
export const createMockRepository = <T = any>(): jest.Mocked<Repository<T>> =>
  ({
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    softDelete: jest.fn(),
    count: jest.fn(),
    increment: jest.fn(),
    decrement: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
      getOne: jest.fn(),
      getManyAndCount: jest.fn(),
      getCount: jest.fn(),
      getRawMany: jest.fn(),
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
    })),
  }) as any;

/**
 * Create mock user for testing
 */
export const createMockUser = (overrides = {}) => ({
  id: 'user-123',
  email: 'test@example.com',
  passwordHash: '$2b$12$hashedPassword',
  firstName: 'John',
  lastName: 'Doe',
  role: 'patient',
  isActive: true,
  isEmailVerified: true,
  tokenVersion: 0,
  failedLoginAttempts: 0,
  lockedUntil: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

/**
 * Create mock patient for testing
 */
export const createMockPatient = (overrides = {}) => ({
  id: 'patient-123',
  firstName: 'Jane',
  lastName: 'Smith',
  dateOfBirth: new Date('1990-01-15'),
  gender: 'female',
  email: 'patient@example.com',
  phone: '+1234567890',
  bloodGroup: 'O+',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

/**
 * Create mock tokens for testing
 */
export const createMockTokens = () => ({
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
});

/**
 * Wait for a specified time (for async testing)
 */
export const wait = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Mock request object
 */
export const createMockRequest = (overrides = {}) => ({
  ip: '127.0.0.1',
  headers: {
    'user-agent': 'test-agent',
    'x-correlation-id': 'test-correlation-id',
  },
  user: null,
  socket: {
    remoteAddress: '127.0.0.1',
  },
  ...overrides,
});

/**
 * Mock response object
 */
export const createMockResponse = () => {
  const res: any = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
  };
  return res;
};
