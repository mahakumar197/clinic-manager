import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProfile } from './entities/user-profile.entity';
import { UpdateUserProfileDto } from './dto/create-user-profile.dto';
import { User } from '../users/entities/user.entity';
import { PatientInformation } from '../users/entities/patient-information.entity';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { API_ENDPOINTS } from '@pallmall/common-utils';
import { UsersService } from '../users/users.service';
import { logger } from '@pallmall/logger';

@Injectable()
export class UserProfileService {
  constructor(
    @InjectRepository(UserProfile)
    private readonly profileRepo: Repository<UserProfile>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(PatientInformation)
    private readonly patientInfoRepo: Repository<PatientInformation>,

    private readonly usersService: UsersService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async createOrUpdateProfile(userId: string, dto: UpdateUserProfileDto) {
    logger.info('createOrUpdateProfile --->');
    try {
      const user = await this.userRepo.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new BadRequestException('User not found');
      }

      if (dto.fullName) user.userName = dto.fullName;
      if (dto.phone) user.phoneNumber = dto.phone;
      if (dto.dateOfBirth) user.dob = new Date(dto.dateOfBirth);

      await this.userRepo.save(user);

      let profile = await this.profileRepo.findOne({
        where: { user: { id: userId } },
        relations: ['user'],
      });

      if (!profile) {
        profile = this.profileRepo.create({
          user,
          ...dto,
        });
      } else {
        Object.assign(profile, dto);
      }

      await this.profileRepo.save(profile);

      return {
        fullName: user.userName,
        email: user.email,
        phone: user.phoneNumber,
        gender: profile.gender,
        age: profile.age,
        dob: user.dob,
        height: profile.height,
        weight: profile.weight,
        bloodGroup: profile.bloodGroup,
        profileImage: profile.profileImage,
      };
    } catch (error) {
      throw new BadRequestException(
        error?.message || 'Failed to create or update profile',
      );
    }
  }

  async getProfile(userId: string, authToken?: string) {
    logger.info('getProfile --->');
    try {
      const profile = await this.profileRepo.findOne({
        where: { user: { id: userId } },
        relations: ['user'],
      });

      if (!profile) return null;
      let phaseId: number | null = profile.user.patient_phase_id ?? null;
      let phaseLabel: string | null = null;

      if (authToken) {
        const integrationServiceUrl =
          this.configService.get<string>('BASE_INTEGRATION');
        const appointmentsUrl = `${integrationServiceUrl}${API_ENDPOINTS.ZOHO_SERVICE.APPOINTMENTS}`;

        const resp = await firstValueFrom(
          this.httpService.get(appointmentsUrl, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: authToken,
            },
          }),
        ).catch((err) => {
          logger.warn(
            `Failed to fetch appointments for user ${userId}: ${err?.message || err}`,
          );
          return undefined as any;
        });
        const appointmentsData = resp?.data?.data || [];
        const hasAppointments =
          Array.isArray(appointmentsData) && appointmentsData.length > 0;

        let taskAssignedTo: string | undefined;

        if (hasAppointments && appointmentsData.length > 0) {
          const appointment = appointmentsData[0];

          const surgeonName =
            appointment.surgery?.surgeon || appointment.consultation?.surgeon;
          const coordinatorName =
            appointment.surgery?.coordinator ||
            appointment.consultation?.coordinator;

          let doctorId: string | null = null;
          let coordinatorId: string | null = null;

          if (surgeonName) {
            const doctor = await this.usersService.findByName(surgeonName);
            if (doctor) doctorId = doctor.id;
          }

          if (coordinatorName) {
            const coordinator =
              await this.usersService.findByName(coordinatorName);
            if (coordinator) coordinatorId = coordinator.id;
          }

          taskAssignedTo = doctorId || coordinatorId || undefined;

          const procedureName =
            appointment.procedure_name || appointment.surgery?.procedure;
          const hospitalName =
            appointment.hospital_name || appointment.surgery?.hospital;

          (async () => {
            try {
              const metadata = {
                appointments: {
                  consultation: appointment.consultation
                    ? {
                        date: appointment.consultation.date,
                      }
                    : null,
                  surgery: appointment.surgery
                    ? {
                        date: appointment.surgery.date,
                        scheduledTime: appointment.surgery.scheduled_time,
                      }
                    : null,
                },
                lastSyncedAt: new Date().toISOString(),
              };

              const patientInfo = await this.patientInfoRepo.findOne({
                where: { patientId: userId },
              });

              if (patientInfo) {
                patientInfo.doctorId = doctorId || patientInfo.doctorId;
                patientInfo.coordinatorId =
                  coordinatorId || patientInfo.coordinatorId;
                patientInfo.procedureName =
                  procedureName || patientInfo.procedureName;
                patientInfo.hospitalName =
                  hospitalName || patientInfo.hospitalName;
                patientInfo.metaData = metadata;
                await this.patientInfoRepo.save(patientInfo);
                logger.info(`Updated patient_information for user ${userId}`);
              } else {
                const newPatientInfo = new PatientInformation();
                newPatientInfo.patientId = userId;
                if (doctorId) newPatientInfo.doctorId = doctorId;
                if (coordinatorId) newPatientInfo.coordinatorId = coordinatorId;
                if (procedureName) newPatientInfo.procedureName = procedureName;
                if (hospitalName) newPatientInfo.hospitalName = hospitalName;
                newPatientInfo.metaData = metadata;
                await this.patientInfoRepo.save(newPatientInfo);
                logger.info(`Created patient_information for user ${userId}`);
              }
            } catch (err) {
              logger.warn(
                `Failed to store appointment data: ${err?.message || err}`,
              );
            }
          })();
        }

        const contentServiceUrl =
          this.configService.get<string>('BASE_CONTENT');
        const endpoint = (
          API_ENDPOINTS as any
        ).CONTENT_SERVICE.DROPDOWN_FETCH.replace(/\/+$/g, '');
        const ddUrl = `${contentServiceUrl}${endpoint}/patientPhase`;

        const ddResp = await firstValueFrom(
          this.httpService.get(ddUrl, {
            headers: { 'Content-Type': 'application/json' },
          }),
        ).catch((err) => {
          logger.warn(
            `Failed to fetch dropdowns for patient phase: ${err?.message || err}`,
          );
          return undefined as any;
        });

        const list = ddResp?.data?.data || ddResp?.data || [];
        const dropdownMap: Record<string, { id: number; label: string }> =
          Array.isArray(list)
            ? list.reduce((acc: any, d: any) => {
                if (d?.id && d?.beValue)
                  acc[d.beValue.toLowerCase()] = { id: d.id, label: d.beValue };
                return acc;
              }, {})
            : {};
        const key = hasAppointments ? 'consultation' : 'guest';
        let resolved = dropdownMap[key];
        if (resolved) {
          if (phaseId !== 143 && phaseId !== 142) {
            phaseId = resolved.id;
            phaseLabel = resolved.label;
          }
          const currentPhaseId = profile.user.patient_phase_id;
          const currentPhaseEntry = Object.values(dropdownMap).find(
            (d) => d.id === currentPhaseId,
          );
          const currentKey = currentPhaseEntry?.label?.toLowerCase() ?? null;

          const isPreOrPost = currentKey
            ? currentKey.includes('pre') || currentKey.includes('post')
            : false;
          const shouldUpdate =
            !isPreOrPost &&
            (!currentPhaseId ||
              (currentKey === 'guest' && key === 'consultation'));
          if (shouldUpdate && profile.user.patient_phase_id !== phaseId) {
            await this.userRepo.update(profile.user.id, {
              patient_phase_id: phaseId,
            } as any);
            // AUTO-CREATE TASKS FOR NEW PHASE
            try {
              const contentServiceUrl =
                this.configService.get<string>('BASE_CONTENT');
              const autoCreateUrl = `${contentServiceUrl}${API_ENDPOINTS.CONTENT_SERVICE.TASK_AUTO_CREATE}`;

              // Default procedure type to Rhinoplasty (28) for now - can be enhanced later
              const procedureType = 28;

              await firstValueFrom(
                this.httpService.post(
                  autoCreateUrl,
                  {
                    patientId: profile.user.id,
                    patientPhaseId: phaseId,
                    procedureType: procedureType,
                    assignedTo: taskAssignedTo, // Use doctor or coordinator extracted from appointment data
                  },
                  {
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: authToken,
                    },
                  },
                ),
              ).catch((err) => {
                logger.warn(
                  `Failed to auto-create tasks for user ${profile.user.id}: ${err.message}`,
                );
              });

              logger.info(
                `Triggered auto-task creation for user ${profile.user.id}, phase ${phaseId}`,
              );
            } catch (err) {
              logger.warn(
                `Error triggering auto-task creation: ${err.message}`,
              );
            }
          }
        } else {
          logger.warn(`Patient phase key ${key} not found in dropdowns`);
        }
      }

      return {
        fullName: profile.user.userName,
        email: profile.user.email,
        phone: profile.user.phoneNumber,
        gender: profile.gender,
        age: profile.age,
        dateOfBirth: profile.user.dob,
        height: profile.height,
        weight: profile.weight,
        bloodGroup: profile.bloodGroup,
        phase: phaseId ? { id: phaseId, label: phaseLabel } : null,
        profileImage: profile.profileImage,
      };
    } catch (error) {
      throw new BadRequestException(
        error?.message || 'Failed to fetch user profile',
      );
    }
  }
}