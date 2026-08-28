import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { API_ENDPOINTS } from '@pallmall/common-utils';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);
  private readonly integrationServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.integrationServiceUrl =
      this.configService.get<string>('BASE_INTEGRATION');
  }

  // This runs exactly every 45 minutes
  @Cron('*/45 * * * *')
  async handleZohoTokensRefresh() {
    this.logger.log('CRON Trigger: Requesting new Zoho access tokens...');
    try {
      const url = `${this.integrationServiceUrl}${API_ENDPOINTS.ZOHO_SERVICE.GENERATE_TOKEN}`;
      await firstValueFrom(this.httpService.post(url));
      const urlForForms = `${this.integrationServiceUrl}${API_ENDPOINTS.ZOHO_SERVICE.GENERATE_FORM_TOKEN}`;
      await firstValueFrom(this.httpService.post(urlForForms));
      this.logger.log('CRON Success: Zoho tokens updated in database.');
    } catch (error) {
      this.logger.error(
        'CRON Error: Failed to trigger Zoho tokens generation',
        error.response?.data || error.message,
      );
    }
  }
}
