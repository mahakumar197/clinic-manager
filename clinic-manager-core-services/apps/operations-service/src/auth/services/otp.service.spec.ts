import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OtpService } from './otp.service';
import { Otp } from '../entities/otp.entity';
import { User } from '../../users/entities/user.entity';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';

describe('OtpService', () => {
  let service: OtpService;
  let otpRepository: jest.Mocked<Repository<Otp>>;
  let userRepository: jest.Mocked<Repository<User>>;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
  };

  const mockOtp = {
    id: 'otp-123',
    userId: 'user-123',
    code: '123456',
    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
    isUsed: false,
    attempts: 0,
    ipAddress: '127.0.0.1',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OtpService,
        {
          provide: getRepositoryToken(Otp),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            count: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OtpService>(OtpService);
    otpRepository = module.get(getRepositoryToken(Otp));
    userRepository = module.get(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateOtp', () => {
    it('should generate a 6-digit OTP', async () => {
      otpRepository.count.mockResolvedValue(0);
      otpRepository.update.mockResolvedValue({} as any);
      otpRepository.create.mockReturnValue(mockOtp as any);
      otpRepository.save.mockResolvedValue(mockOtp as any);

      const code = await service.generateOtp('user-123', '127.0.0.1');

      expect(code).toMatch(/^\d{6}$/);
      expect(otpRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException if rate limit exceeded', async () => {
      otpRepository.count.mockResolvedValue(3); // Max is 3 per hour

      await expect(
        service.generateOtp('user-123', '127.0.0.1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should invalidate existing OTPs before creating new one', async () => {
      otpRepository.count.mockResolvedValue(0);
      otpRepository.update.mockResolvedValue({} as any);
      otpRepository.create.mockReturnValue(mockOtp as any);
      otpRepository.save.mockResolvedValue(mockOtp as any);

      await service.generateOtp('user-123', '127.0.0.1');

      expect(otpRepository.update).toHaveBeenCalledWith(
        { userId: 'user-123', isUsed: false },
        { isUsed: true },
      );
    });
  });

  describe('verifyOtp', () => {
    it('should verify valid OTP', async () => {
      userRepository.findOne.mockResolvedValue(mockUser as any);
      otpRepository.findOne.mockResolvedValue(mockOtp as any);
      otpRepository.save.mockResolvedValue({ ...mockOtp, isUsed: true } as any);

      const user = await service.verifyOtp('test@example.com', '123456');

      expect(user).toEqual(mockUser);
      expect(otpRepository.save).toHaveBeenCalledTimes(2); // Once for attempts, once for marking used
    });

    it('should throw UnauthorizedException if user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(
        service.verifyOtp('test@example.com', '123456'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw BadRequestException if OTP not found', async () => {
      userRepository.findOne.mockResolvedValue(mockUser as any);
      otpRepository.findOne.mockResolvedValue(null);

      await expect(
        service.verifyOtp('test@example.com', '123456'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if OTP is expired', async () => {
      const expiredOtp = {
        ...mockOtp,
        expiresAt: new Date(Date.now() - 1000), // Expired
      };
      userRepository.findOne.mockResolvedValue(mockUser as any);
      otpRepository.findOne.mockResolvedValue(expiredOtp as any);

      await expect(
        service.verifyOtp('test@example.com', '123456'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if max attempts exceeded', async () => {
      const maxAttemptsOtp = {
        ...mockOtp,
        attempts: 3, // Max is 3
      };
      userRepository.findOne.mockResolvedValue(mockUser as any);
      otpRepository.findOne.mockResolvedValue(maxAttemptsOtp as any);

      await expect(
        service.verifyOtp('test@example.com', '123456'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
