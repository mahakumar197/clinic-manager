import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PatientForm } from './entity/patient-form.entity';
import { helpers } from '@pallmall/common-utils/dist/helpers';
import { API_ENDPOINTS } from '@pallmall/common-utils/dist/apiEndpoints';
@Injectable()
export class WebhooksService {
    httpService: any;

  constructor(
    private configService: ConfigService,
    @InjectRepository(PatientForm)
    private patientFormRepo: Repository<PatientForm>,
  ) { }

    async getPatientFormsByMail(email: string) {
        const forms = await this.patientFormRepo.find({
            where: {
                email,
            },
            order: {
                created_at: 'DESC',
            },
        });
        return {
            success: true,
            count: forms.length,
            data: forms,
        };
    }

    async getPatientForms(userId: string) {
        const uri = this.configService.get('BASE_OPERATIONS');
        const url = API_ENDPOINTS.OPERATIONS_SERVICE.USER_DATA_FETCH;

        const userMap = await helpers.fetchUsersByIds(
            uri,
            url,
            [userId],
        );

        const user = userMap[userId];

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return this.patientFormRepo.find({
            where: {
                email: user.email,
            },
            order: {
                created_at: 'DESC',
            },
        });
    }
}