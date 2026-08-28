import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not } from 'typeorm';
import { User } from './entities/user.entity';
import {
  UserRole,
  ApiResponseBuilder,
  HttpStatus,
} from '@pallmall/shared-types';
import {
  TASK_PHASE_MAP,
  PROCEDURE_TYPE_MAP,
  TaskPhase,
  ProcedureType,
  helpers,
  getBlobFileUrl,
  PatientPhaseId,
  AUTH_MESSAGES,
  PATIENT_PHASE_TO_TASK_PHASE_MAP,
  TaskPhaseId,
  TASK_PHASEID_MAP,
  KafkaNotificationEvent,
  NOTIFICATION_EVENT_TYPE,
  KafkaProducerService,
} from '@pallmall/common-utils';
import { PatientInformation } from './entities/patient-information.entity';
import { DoctorPatientListQueryDto } from './dto/users.dto';
import { v4 as uuid } from 'uuid';
import { logger } from '@pallmall/logger';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(PatientInformation)
    private patientInfoRepository: Repository<PatientInformation>,
    private readonly kafkaProducer: KafkaProducerService,
  ) {}

  async findOneByEmail(email: string): Promise<User | null> {
    logger.info('findOneByEmail --->');
    return this.usersRepository.findOneBy({ email });
  }

  async create(userData: Partial<User>): Promise<User> {
    logger.info('create --->');
    const user = this.usersRepository.create({
      ...userData,
      role: userData.role ?? UserRole.PATIENT,
    });
    const savedUser = await this.usersRepository.save(user);

    // Publish notification event — fire-and-forget, never throws
    const event: KafkaNotificationEvent = {
      id: uuid(),
      source: 'operations-service',
      userId: savedUser.id,
      eventType: NOTIFICATION_EVENT_TYPE.TASK_CREATED,
      title: 'Welcome to PallMall',
      message: `Your account has been created successfully.`,
      priority: 'normal',
      metadata: { role: savedUser.role },
    };
    await this.kafkaProducer.publish(event);

    return savedUser;
  }

  async findOneById(id: string): Promise<User | null> {
    logger.info('findOneById --->');
    return this.usersRepository.findOneBy({ id });
  }

  async findByName(name: string): Promise<User | null> {
    logger.info('findByName --->');
    return this.usersRepository.findOneBy({ userName: name });
  }

  async findByNameOrEmail(name: string): Promise<User | null> {
    logger.info('findByNameOrEmail --->');
    return this.usersRepository.findOne({
      where: [{ userName: name }, { email: name }],
    });
  }

  async find(ids: string[]): Promise<User[]> {
    logger.info('find --->');
    return this.usersRepository.find({ where: { id: In(ids) } });
  }

  async findByRole(
    role: string[],
    search: string,
    exclude: string[],
  ): Promise<User[]> {
    logger.info('findByRole --->');
    const qb = this.usersRepository.createQueryBuilder('user');
    qb.select([
      'user.id',
      'user.email',
      'user.userName',
      'user.phoneNumber',
      'user.dob',
      'user.role',
      'user.isActive',
      'user.isEmailVerified',
      'user.createdAt',
      'user.updatedAt',
      'user.status',
      'user.patient_phase_id',
    ]);
    if (role?.length) {
      qb.andWhere('user.role IN (:...role)', { role });
    }
    if (exclude?.length) {
      qb.andWhere('user.role NOT IN (:...exclude)', { exclude });
    }
    if (search) {
      qb.andWhere('user.userName ~* :regex', {
        regex: search,
      });
    }
    const users = await qb.getMany();
    return Promise.all(
      users.map(async (user) => {
        if (user.role !== 'PATIENT') {
          return user;
        }
        const patientPhaseId = user.patient_phase_id;
        const [phase, procedureType] = await Promise.all([
          this.pickTaskPhase(patientPhaseId),
          this.pickRandomEnumValue(ProcedureType),
        ]);

        return {
          ...user,
          medicalData: {
            procedureType,
            procedureTypeId: PROCEDURE_TYPE_MAP[procedureType],
            phase: TASK_PHASEID_MAP[phase],
            phaseId: phase,
          },
        };
      }),
    );
  }

  private pickRandomEnumValue<T extends object>(enumObj: T): T[keyof T] {
    logger.debug('pickRandomEnumValue --->');
    const values = Object.values(enumObj).filter((v) => typeof v === 'string');
    return values[Math.floor(Math.random() * values.length)] as T[keyof T];
  }

  private pickTaskPhase(patientPhaseId: number): TaskPhaseId {
    logger.debug('pickTaskPhase --->');
    return (
      PATIENT_PHASE_TO_TASK_PHASE_MAP[patientPhaseId as PatientPhaseId] ??
      TaskPhaseId.CONSULTATION
    );
  }

  async findByEmails(emails: string[]): Promise<User[]> {
    logger.info('findByEmails --->');
    if (!emails || emails.length === 0) {
      return [];
    }
    return this.usersRepository.find({
      where: { email: In(emails) },
      select: [
        'id',
        'email',
        'userName',
        'role',
        'phoneNumber',
        'dob',
        'isActive',
        'createdAt',
        'updatedAt',
      ],
    });
  }

  async findByNames(names: string[]): Promise<User[]> {
    logger.info('findByNames --->');
    if (!names || names.length === 0) {
      return [];
    }
    return this.usersRepository.find({
      where: { userName: In(names), isActive: true },
    });
  }

  async update(id: string, updateData: Partial<User>): Promise<User> {
    logger.info('update --->');
    await this.usersRepository.update(id, updateData);
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }
    return user;
  }

  // last login
  async updateLastLogin(id: string): Promise<void> {
    logger.info('updateLastLogin --->');
    if (!id) return;
    await this.usersRepository.update(id, { last_login: new Date() } as any);
  }

  async getPatientsForDoctor(
    doctorId: string,
    queryDto: DoctorPatientListQueryDto,
  ) {
    logger.info('getPatientsForDoctor --->');
    const { page = 1, limit = 10, search, startDate, endDate } = queryDto;
    const query = this.patientInfoRepository
      .createQueryBuilder('pi')
      .leftJoinAndSelect('pi.patient', 'user')
      .leftJoinAndSelect('user.profile', 'user_profile')
      .where('pi.doctor_id = :doctorId', { doctorId })
      .andWhere('user.patient_phase_id = :phaseId', {
        phaseId: PatientPhaseId.POST_OP,
      })
      .andWhere('user.isActive = :isActive', { isActive: true });

    if (search) {
      query.andWhere(
        '(user.userName ILIKE :search OR pi.procedureName ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (startDate) {
      query.andWhere('pi.updatedAt >= :startDate', { startDate });
    }

    if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);
      query.andWhere('pi.updatedAt <= :endDate', { endDate: endDateTime });
    }

    const [items, total] = await query
      .orderBy('pi.updatedAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    const paginatedItems = await Promise.all(
      items.map(async (item) => {
        let patientImage = null;
        const patient = item.patient;
        if (patient?.profile?.profileImage) {
          try {
            patientImage = await getBlobFileUrl(patient.profile.profileImage);
          } catch (e) {
            logger.error(
              `Failed to generate SAS URL for profile image: ${e.message}`,
            );
          }
        }

        let recoveryDay = null;
        const surgeryDateStr = item.metaData?.surgery?.date;
        if (surgeryDateStr) {
          const surgeryDate = new Date(surgeryDateStr);
          const today = new Date();
          const diffTime = today.getTime() - surgeryDate.getTime();
          recoveryDay = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        }

        return {
          id: item.patientId || null,
          patientName: patient?.userName || null,
          patientEmail: patient?.email || null,
          patientImage,
          procedureName: item.procedureName || null,
          hospitalName: item.hospitalName || null,
          updatedAt: item.updatedAt || null,
          recoveryDay: recoveryDay !== null ? `Day ${recoveryDay}` : null,
          patientPhaseId: patient?.patient_phase_id || null,
          status: item.metaData?.surgery?.status || null,
        };
      }),
    );

    return new ApiResponseBuilder().paginated(
      paginatedItems,
      {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      AUTH_MESSAGES.DOCTOR_PATIENTS_LIST_RETRIEVED_SUCCESSFULLY,
    );
  }
}