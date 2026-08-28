import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ZohoToken } from '../entities/zoho-token.entity';
import { firstValueFrom } from 'rxjs';
import { API_ENDPOINTS, helpers } from '@pallmall/common-utils';
import { ZohoFormToken } from '../entities/zoho.forms.token.entity';
import {
  UserRole,
  ApiResponseBuilder,
  HttpStatus,
} from '@pallmall/shared-types';
import { logger } from '@pallmall/logger';
import axios from 'axios';
import { ZohoWebhookLog } from '../entities/zoho-form-log.entity';

@Injectable()
export class ZohoService {
  private readonly logger = new Logger(ZohoService.name);
  private readonly apiDomain: string;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly initialRefreshToken: string;
  private readonly operationsServiceUrl: string;
  private readonly grantType: string;
  private readonly scope: string;
  private readonly soid: string;
  private readonly zohoFormsClientId: string;
  private readonly zohoFormsClientSecret: string;
  private readonly zohoFormsRefreshToken: string;
  private readonly zohoFormsGrantType: string;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
    @InjectRepository(ZohoToken)
    private tokenRepository: Repository<ZohoToken>,
    @InjectRepository(ZohoFormToken)
    private formTokenRepository: Repository<ZohoFormToken>,
    @InjectRepository(ZohoWebhookLog)
    private webhookLogRepository: Repository<ZohoWebhookLog>,
  ) {
    this.apiDomain = this.configService.get<string>('ZOHO_API_DOMAIN');
    this.clientId = this.configService.get<string>('ZOHO_CLIENT_ID');
    this.clientSecret = this.configService.get<string>('ZOHO_CLIENT_SECRET');
    this.initialRefreshToken =
      this.configService.get<string>('ZOHO_REFRESH_TOKEN');
    this.operationsServiceUrl =
      this.configService.get<string>('BASE_OPERATIONS');
    this.grantType = this.configService.get<string>('ZOHO_GRANT_TYPE');
    this.scope = this.configService.get<string>('ZOHO_SCOPE');
    this.soid = this.configService.get<string>('ZOHO_SOID');
    this.zohoFormsClientId = this.configService.get<string>(
      'ZOHO_FORM_CLIENT_ID',
    );
    this.zohoFormsClientSecret = this.configService.get<string>(
      'ZOHO_FORM_CLIENT_SECRET',
    );
    this.zohoFormsRefreshToken = this.configService.get<string>(
      'ZOHO_FORM_REFRESH_TOKEN',
    );
    this.zohoFormsGrantType = this.configService.get<string>(
      'ZOHO_FORM_GRANT_TYPE',
    );

    if (!this.clientId || !this.clientSecret) {
      this.logger.warn('Zoho credentials not fully configured');
    }
  }

  /**
   * Get valid access token from DB or fetch/refresh if expired
   */
  async getAccessToken(): Promise<string> {
    // Fetch the most recently updated token record
    const tokenRecords = await this.tokenRepository.find({
      order: { updated_at: 'DESC' },
      take: 1,
    });

    let tokenRecord = tokenRecords.length > 0 ? tokenRecords[0] : null;

    if (
      tokenRecord &&
      new Date(tokenRecord.expires_at).getTime() > Date.now() + 300000
    ) {
      return tokenRecord.access_token;
    }

    if (this.grantType === 'client_credentials') {
      return this.fetchClientCredentialsAccessToken(tokenRecord);
    } else {
      return this.refreshAccessToken(tokenRecord);
    }
  }

  /**
   * Force generate a new access token, bypassing the expiration logic.
   * This will update the database with a fresh token.
   */
  async forceGenerateAccessToken(): Promise<string> {
    const tokenRecords = await this.tokenRepository.find({
      order: { updated_at: 'DESC' },
      take: 1,
    });

    const tokenRecord = tokenRecords.length > 0 ? tokenRecords[0] : null;

    this.logger.log('Force generating new Zoho access token...');

    if (this.grantType === 'client_credentials') {
      return this.fetchClientCredentialsAccessToken(tokenRecord);
    } else {
      return this.refreshAccessToken(tokenRecord);
    }
  }

  async forceGenerateAccessTokenforZohoForms(): Promise<string> {
    const tokenRecords = await this.formTokenRepository.find({
      order: { updated_at: 'DESC' },
      take: 1,
    });

    const tokenRecord = tokenRecords.length > 0 ? tokenRecords[0] : null;

    this.logger.log('Force generating new Zoho Forms access token...');

    if (this.zohoFormsGrantType === 'client_credentials') {
      return this.fetchClientCredentialsAccessTokenForForms(tokenRecord);
    } else {
      return this.refreshAccessTokenForForms(tokenRecord);
    }
  }

  /**
   * Build OAuth token request params for client_credentials grant type
   */
  private buildClientCredentialsParams() {
    return {
      client_id: this.clientId,
      client_secret: this.clientSecret,
      grant_type: 'client_credentials',
      scope: this.scope,
      soid: this.soid,
    };
  }

  /**
   * Build OAuth token request params for refresh_token grant type
   */
  private buildRefreshTokenParams(refreshToken: string) {
    return {
      refresh_token: refreshToken,
      client_id: this.clientId,
      client_secret: this.clientSecret,
      grant_type: 'refresh_token',
    };
  }

  /**
   * Save or update token record in database
   */
  private async saveTokenRecord(
    tokenRecord: ZohoToken | null,
    accessToken: string,
    expiresAt: Date,
    refreshToken?: string,
  ): Promise<void> {
    if (tokenRecord) {
      tokenRecord.access_token = accessToken;
      tokenRecord.expires_at = expiresAt;
      if (refreshToken !== undefined) {
        tokenRecord.refresh_token = refreshToken;
      }
    } else {
      tokenRecord = this.tokenRepository.create({
        access_token: accessToken,
        refresh_token: refreshToken || '',
        expires_at: expiresAt,
      });
    }

    await this.tokenRepository.save(tokenRecord);
  }

  /**
   * Fetch token using client_credentials grant type
   */
  private async fetchClientCredentialsAccessToken(
    tokenRecord: ZohoToken | null,
  ): Promise<string> {
    this.logger.log('Fetching Zoho access token via client_credentials...');
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          API_ENDPOINTS.ZOHO_SERVICE.OAUTH_TOKEN_URL,
          null,
          {
            params: this.buildClientCredentialsParams(),
          },
        ),
      );

      const { access_token, expires_in } = response.data;
      if (!access_token) {
        throw new Error(
          `Zoho token response did not include access_token: ${JSON.stringify(response.data)}`,
        );
      }
      const expiresAt = new Date(Date.now() + expires_in * 1000);

      await this.saveTokenRecord(tokenRecord, access_token, expiresAt, '');
      return access_token;
    } catch (error) {
      this.logger.error(
        'Failed to fetch Zoho client credentials token',
        error.response?.data || error.message,
      );
      throw error;
    }
  }

  /**
   * Refresh token using refresh_token grant type
   */
  private async refreshAccessToken(
    tokenRecord: ZohoToken | null,
  ): Promise<string> {
    const refreshToken = tokenRecord?.refresh_token || this.initialRefreshToken;
    if (!refreshToken) {
      throw new Error('No Zoho refresh token available');
    }

    this.logger.log('Refreshing Zoho access token...');
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          API_ENDPOINTS.ZOHO_SERVICE.OAUTH_TOKEN_URL,
          null,
          {
            params: this.buildRefreshTokenParams(refreshToken),
          },
        ),
      );

      const { access_token, expires_in } = response.data;
      const expiresAt = new Date(Date.now() + expires_in * 1000);

      await this.saveTokenRecord(
        tokenRecord,
        access_token,
        expiresAt,
        refreshToken,
      );
      return access_token;
    } catch (error) {
      this.logger.error(
        'Failed to refresh Zoho token',
        error.response?.data || error.message,
      );
      throw error;
    }
  }

  /**
   * Build OAuth token request params for client_credentials grant type (Forms)
   */
  private buildClientCredentialsParamsForForms() {
    return {
      client_id: this.zohoFormsClientId,
      client_secret: this.zohoFormsClientSecret,
      grant_type: 'client_credentials',
      scope: this.scope,
      soid: this.soid,
    };
  }

  /**
   * Build OAuth token request params for refresh_token grant type (Forms)
   */
  private buildRefreshTokenParamsForForms(refreshToken: string) {
    return {
      refresh_token: refreshToken,
      client_id: this.zohoFormsClientId,
      client_secret: this.zohoFormsClientSecret,
      grant_type: 'refresh_token',
    };
  }

  /**
   * Save or update form token record in database
   */
  private async saveFormTokenRecord(
    tokenRecord: ZohoFormToken | null,
    accessToken: string,
    expiresAt: Date,
    refreshToken?: string,
  ): Promise<void> {
    if (tokenRecord) {
      tokenRecord.access_token = accessToken;
      tokenRecord.expires_at = expiresAt;
      if (refreshToken !== undefined) {
        tokenRecord.refresh_token = refreshToken;
      }
    } else {
      tokenRecord = this.formTokenRepository.create({
        access_token: accessToken,
        refresh_token: refreshToken || '',
        expires_at: expiresAt,
      });
    }

    await this.formTokenRepository.save(tokenRecord);
  }

  /**
   * Fetch form token using client_credentials grant type
   */
  private async fetchClientCredentialsAccessTokenForForms(
    tokenRecord: ZohoFormToken | null,
  ): Promise<string> {
    this.logger.log(
      'Fetching Zoho Forms access token via client_credentials...',
    );
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          API_ENDPOINTS.ZOHO_SERVICE.OAUTH_TOKEN_URL,
          null,
          {
            params: this.buildClientCredentialsParamsForForms(),
          },
        ),
      );

      const { access_token, expires_in } = response.data;
      if (!access_token) {
        throw new Error(
          `Zoho Forms token response did not include access_token: ${JSON.stringify(response.data)}`,
        );
      }
      const expiresAt = new Date(Date.now() + expires_in * 1000);

      await this.saveFormTokenRecord(tokenRecord, access_token, expiresAt, '');
      return access_token;
    } catch (error) {
      this.logger.error(
        'Failed to fetch Zoho Forms client credentials token',
        error.response?.data || error.message,
      );
      throw error;
    }
  }

  /**
   * Refresh form token using refresh_token grant type
   */
  private async refreshAccessTokenForForms(
    tokenRecord: ZohoFormToken | null,
  ): Promise<string> {
    const refreshToken =
      tokenRecord?.refresh_token || this.zohoFormsRefreshToken;
    if (!refreshToken) {
      throw new Error('No Zoho Forms refresh token available');
    }

    this.logger.log('Refreshing Zoho Forms access token...');
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          API_ENDPOINTS.ZOHO_SERVICE.OAUTH_TOKEN_URL,
          null,
          {
            params: this.buildRefreshTokenParamsForForms(refreshToken),
          },
        ),
      );

      const { access_token, expires_in } = response.data;
      const expiresAt = new Date(Date.now() + expires_in * 1000);

      await this.saveFormTokenRecord(
        tokenRecord,
        access_token,
        expiresAt,
        refreshToken,
      );
      return access_token;
    } catch (error) {
      this.logger.error(
        'Failed to refresh Zoho Forms token',
        error.response?.data || error.message,
      );
      throw error;
    }
  }

  /**
   * Generic method to call Zoho CRM API
   */
  private async callZohoApi(
    method: 'get' | 'post',
    path: string,
    params: any = {},
    data: any = null,
  ) {
    const accessToken = await this.getAccessToken();
    const url = `${this.apiDomain}${path}`;

    try {
      const response = await firstValueFrom(
        this.httpService.request({
          method,
          url,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params,
          data,
        }),
      );
      return response.data;
    } catch (error) {
      this.logger.error(
        `Zoho API error [${path}]:`,
        error.response?.data || error.message,
      );
      throw error;
    }
  }

  /**
   * Search Consultation Appointments by email
   */
  async searchAppointments(email: string) {
    const encodedEmail = email.replace('@', '%40');
    const path = `${API_ENDPOINTS.ZOHO_SERVICE.CRM_APPOINTMENTS_SEARCH}?email=${encodedEmail}`;
    const response = await this.callZohoApi('get', path);
    return response?.data || [];
  }

  /**
   * Search Clinician by name (Surgeon search)
   */
  async searchClinician(name: string) {
    const response = await this.callZohoApi(
      'get',
      API_ENDPOINTS.ZOHO_SERVICE.CRM_CLINICIANS_SEARCH,
      {
        word: name,
      },
    );
    return response.data || [];
  }

  /**
   * Search Cosm Surgery by MedDBase_ID
   */
  async searchCosmSurgery(medDBaseId: string) {
    const criteria = `(MedDBase_ID:equals:${medDBaseId})`;
    const response = await this.callZohoApi(
      'get',
      API_ENDPOINTS.ZOHO_SERVICE.CRM_COSM_SURGERY_SEARCH,
      {
        criteria,
      },
    );
    return response.data || [];
  }

  async PatientAppointments(email: string, userId: string) {
    const appointments = await this.searchAppointments(email);
    const enrichedAppointments = [];

    for (const appt of appointments) {
      const medDBaseId = appt.MedDBase_ID;
      const surgeonName = appt.Surgeon_NEW;

      let surgeonEmail = null;
      if (surgeonName) {
        const clinicians = await this.searchClinician(surgeonName);
        if (clinicians.length > 0 && clinicians[0].Email) {
          surgeonEmail = clinicians[0].Email;
        } else {
          surgeonEmail = this.generateFallbackEmail(surgeonName);
        }
        // Sync Surgeon
        await this.syncUser(surgeonName, surgeonEmail, UserRole.DOCTOR);
      }

      let surgeryDetails = null;
      let coordinatorEmail = null;
      let coordinatorName = null;

      if (medDBaseId) {
        const surgeries = await this.searchCosmSurgery(medDBaseId);
        if (surgeries.length > 0) {
          surgeryDetails = surgeries[0];
          coordinatorName = surgeryDetails.Owner?.name || UserRole.COORDINATOR;
          coordinatorEmail = surgeryDetails.Owner?.email;

          if (!coordinatorEmail) {
            coordinatorEmail = this.generateFallbackEmail(coordinatorName);
          }
          // Sync Coordinator
          await this.syncUser(
            coordinatorName,
            coordinatorEmail,
            UserRole.COORDINATOR,
          );
        }
      }

      enrichedAppointments.push({
        consultation: {
          date: this.formatDateOnly(appt.Consultant_Date_Time),
          location: appt.Appointment_Location,
          surgeon: appt.Surgeon_NEW,
          surgeonEmail: surgeonEmail,
          status: appt.Consultation_complete,
          procedure: appt.Procedure_name_NEW,
          coordinator: appt.Coordinator_Covering_Clinic,
          medDBaseId: appt.MedDBase_ID,
        },
        surgery: surgeryDetails
          ? {
              medDBaseId: surgeryDetails.MedDBase_ID,
              coordinator: coordinatorName,
              coordinatorEmail: coordinatorEmail,
              status: surgeryDetails.Surgery_complete,
              date: surgeryDetails.Surgery_date,
              surgeon: surgeryDetails.Surgeon_NEW,
              category: surgeryDetails.Procedure_Category,
              procedure: surgeryDetails.Procedure_name,
              anaesthesia: surgeryDetails.Anaestheisa,
              hospitalStay: surgeryDetails.Hospital_stay,
              implants: surgeryDetails.Implants_Requested,
              preOpDate: surgeryDetails.Pre_op_date_time,
              secondConsultDate: surgeryDetails.nd_Consult_Date_Time,
              postOpDate: surgeryDetails.Week_1_post_op,
              postOpLocation: surgeryDetails.Post_op_location,
            }
          : null,
      });
    }

    try {
      const uri = this.configService.get('BASE_OPERATIONS');
      const url = API_ENDPOINTS.OPERATIONS_SERVICE.USER_DATA_FETCH;

      const userMap = await helpers.fetchUsersByIds(uri, url, [userId]);
      await helpers.taskAutomation(
        this.configService.get('BASE_CONTENT'),
        API_ENDPOINTS.CONTENT_SERVICE.TASK_AUTOMATION,
        userMap[userId]?.patient_phase_id,
        userId,
      );
    } catch (err) {
      logger.error('Task automation side-effects failed', err);
    }

    return new ApiResponseBuilder().success(
      enrichedAppointments,
      'Appointments retrieved successfully',
      HttpStatus.OK,
    );
  }

  async orchestratePatientAppointments(email: string) {
    const appointments = await this.searchAppointments(email);
    const enrichedAppointments = [];

    for (const appt of appointments) {
      const medDBaseId = appt.MedDBase_ID;
      const surgeonName = appt.Surgeon_NEW;

      let surgeonEmail = null;
      if (surgeonName) {
        const clinicians = await this.searchClinician(surgeonName);
        if (clinicians.length > 0 && clinicians[0].Email) {
          surgeonEmail = clinicians[0].Email;
        } else {
          surgeonEmail = this.generateFallbackEmail(surgeonName);
        }
        // Sync Surgeon
        await this.syncUser(surgeonName, surgeonEmail, UserRole.DOCTOR);
      }

      let surgeryDetails = null;
      let coordinatorEmail = null;
      let coordinatorName = null;

      if (medDBaseId) {
        const surgeries = await this.searchCosmSurgery(medDBaseId);
        if (surgeries.length > 0) {
          surgeryDetails = surgeries[0];
          coordinatorName = surgeryDetails.Owner?.name || UserRole.COORDINATOR;
          coordinatorEmail = surgeryDetails.Owner?.email;

          if (!coordinatorEmail) {
            coordinatorEmail = this.generateFallbackEmail(coordinatorName);
          }
          // Sync Coordinator
          await this.syncUser(
            coordinatorName,
            coordinatorEmail,
            UserRole.COORDINATOR,
          );
        }
      }

      enrichedAppointments.push({
        consultation: {
          date: this.formatDateOnly(appt.Consultant_Date_Time),
          location: appt.Appointment_Location,
          surgeon: appt.Surgeon_NEW,
          surgeonEmail: surgeonEmail,
          status: appt.Consultation_complete,
          procedure: appt.Procedure_name_NEW,
          coordinator: appt.Coordinator_Covering_Clinic,
          medDBaseId: appt.MedDBase_ID,
        },
        surgery: surgeryDetails
          ? {
              medDBaseId: surgeryDetails.MedDBase_ID,
              coordinator: coordinatorName,
              coordinatorEmail: coordinatorEmail,
              status: surgeryDetails.Surgery_complete,
              date: surgeryDetails.Surgery_date,
              surgeon: surgeryDetails.Surgeon_NEW,
              category: surgeryDetails.Procedure_Category,
              procedure: surgeryDetails.Procedure_name,
              anaesthesia: surgeryDetails.Anaestheisa,
              hospitalStay: surgeryDetails.Hospital_stay,
              implants: surgeryDetails.Implants_Requested,
              preOpDate: surgeryDetails.Pre_op_date_time,
              secondConsultDate: surgeryDetails.nd_Consult_Date_Time,
              postOpDate: surgeryDetails.Week_1_post_op,
              postOpLocation: surgeryDetails.Post_op_location,
            }
          : null,
      });
    }

    return new ApiResponseBuilder().success(
      enrichedAppointments,
      'Appointments retrieved successfully',
      HttpStatus.OK,
    );
  }

  // private formatDateOnly(dateStr?: string | null): string | null {
  //   if (!dateStr) return null;
  //   const d = new Date(dateStr);
  //   return isNaN(d.getTime()) ? null : d.toISOString().split('T')[0];
  // }

  private formatDateOnly(dateStr?: string | null): string | null {
    if (!dateStr) return null;

    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    return `${day}-${month}-${year}`;
  }

  /**
   * Sync user with operations-service
   */
  private async syncUser(name: string, email: string, role: string) {
    const url = `${this.operationsServiceUrl}${API_ENDPOINTS.OPERATIONS_SERVICE.SYNC_USER}`;
    try {
      await firstValueFrom(
        this.httpService.post(url, {
          name,
          email,
          role,
        }),
      );
    } catch (error) {
      this.logger.error(
        `Failed to sync user ${email} at ${url}:`,
        error.response?.data || error.message,
      );
    }
  }

  // ---------------------------
  // CATCH ZOHO FORM WEBHOOK AND FORWARD TO CONTENT SERVICE
  // ---------------------------
  async catchAndForwardZohoWebhook(payload: any, req: any) {
    this.logger.log(`Catching new Zoho Form webhook`);
    const contentServiceUrl = `${this.configService.get('BASE_CONTENT')}${API_ENDPOINTS.CONTENT_SERVICE.WEBHOOK_SYNC}`;
    try {
      try {
        const log = await this.saveWebhookLog(payload);
        console.log('Webhook log saved:', log.logId);
      } catch (logErr) {
        console.error('Failed to save webhook log:', logErr.message);
      }
      const response = await firstValueFrom(
        this.httpService.post(contentServiceUrl, payload),
      );
      this.logger.log('Successfully forwarded to Content Service new API');
      return response.data;
    } catch (error: any) {
      this.logger.error(
        'Failed to forward to Content Service:',
        error?.response?.data || error?.message,
      );
      throw error;
    }
  }

  async catchAndForwardZohoWebhookNew(
    payload: any,
    options: { formType: string },
  ) {
    this.logger.log(`Catching Zoho webhook: ${options.formType}`);
    const contentServiceUrl = `${this.configService.get('BASE_CONTENT')}${API_ENDPOINTS.CONTENT_SERVICE.WEBHOOK_SYNC_NEW}`;
    try {
      try {
        const log = await this.saveWebhookLog(payload);
        this.logger.log(`Webhook log saved: ${log?.logId}`);
      } catch (logErr) {
        this.logger.error(`Failed to save webhook log: ${logErr.message}`);
      }
      const response = await firstValueFrom(
        this.httpService.post(contentServiceUrl, payload, {
          params: {
            formType: options.formType,
          },
        }),
      );

      this.logger.log(`Successfully forwarded webhook: ${options.formType}`);

      return response.data;
    } catch (error: any) {
      this.logger.error(
        `Failed forwarding webhook (${options.formType})`,
        error?.response?.data || error?.message,
      );

      throw error;
    }
  }

  /**
   * Generate a fallback email for a user based on their name
   */
  private generateFallbackEmail(name: string): string {
    const cleanName = name.replace(/\s+/g, '').toLowerCase();
    return `${cleanName}@mailinator.com`;
  }

  async processWebhook(payload: any) {
    try {
      this.logger.log('Processing Zoho webhook payload');

      const stage = payload.patient_stage;

      if (!stage) {
        this.logger.warn('Patient stage not present in payload');
        return;
      }

      switch (stage) {
        case 'phase_2':
          await this.handlePhase2(payload);
          break;

        case 'phase_3':
          await this.handlePhase3(payload);
          break;

        case 'phase_4':
          await this.handlePhase4(payload);
          break;

        default:
          this.logger.warn(`Unhandled stage: ${stage}`);
      }
    } catch (err) {
      this.logger.error('Webhook processing failed', err);
    }
  }

  /**
   * Phase 2 Handler
   */
  private async handlePhase2(payload: any) {
    const {
      consult_date,
      patient_email,
      appointment_location,
      surgeon_name,
      consultat_status,
      procedure_name,
      send_to_app,
    } = payload;
    const phase = 2;

    this.logger.log(`Handling Phase 2 webhook for ${patient_email}`);

    await this.triggerTaskAutomation(patient_email, phase, payload);
  }

  /**
   * Phase 3 Handler
   */
  private async handlePhase3(payload: any) {
    const {
      unique_id,
      coordinator,
      patient_email,
      surgery_status,
      surgery_date,
      surgeon_name,
      procedure_category,
      procedure_name,
      anaesthesia,
      hospital_stay,
      implants,
      pre_op_date_time,
      second_consult_date_time,
      post_op_date_time,
      post_op_location,
      send_to_app,
    } = payload;
    const phase = 3;

    this.logger.log(`Handling Phase 3 webhook for ${patient_email}`);

    await this.triggerTaskAutomation(patient_email, phase, payload);
  }

  /**
   * Phase 4 Handler
   */
  private async handlePhase4(payload: any) {
    const { patient_email } = payload;
    const phase = 4;

    this.logger.log(`Handling Phase 4 webhook for ${patient_email}`);

    await this.triggerTaskAutomation(patient_email, phase, payload);
  }

  /**
   * Core Task Automation Trigger
   */
  private async triggerTaskAutomation(
    patientEmail: string,
    phase: number,
    payload: any,
  ) {
    try {
      const operationsBase = this.configService.get('BASE_OPERATIONS');

      /**
       * Fetch user by email
       */
      const user = await helpers.fetchUserByNameOrEmail(
        operationsBase,
        API_ENDPOINTS.OPERATIONS_SERVICE.FIND_USER_BY_NAME_OR_EMAIL,
        patientEmail,
      );

      if (!user?.id) {
        this.logger.warn(`User not found for email: ${patientEmail}`);
        return;
      }

      /**
       * Fetch patient phase id
       */
      const userMap = await helpers.fetchUsersByIds(
        operationsBase,
        API_ENDPOINTS.OPERATIONS_SERVICE.USER_DATA_FETCH,
        [user.id],
      );

      const patientPhaseId = userMap[user.id]?.patient_phase_id;

      if (!patientPhaseId) {
        this.logger.warn(`Patient phase id missing for user ${user.id}`);
        return;
      }

      /**
       * Trigger task automation
       */
      const uri = this.configService.get('BASE_CONTENT');
      const urlPath = API_ENDPOINTS.CONTENT_SERVICE.WEBHOOK_TASK_AUTOMATION;
      const url = `${uri}${urlPath}?currentPatientPhaseId=${patientPhaseId}&userId=${user.id}&NewPatientPhaseId=${phase}`;
      await axios.post(url, payload);

      this.logger.log(`Task automation triggered for user ${user.id}`);
    } catch (err) {
      this.logger.error('Task automation side-effects failed', err);
    }
  }

  // async saveWebhookLog(payload: any) {
  //   try {
  //     const log = this.webhookLogRepository.create({
  //       webhook_data: payload,
  //       created_at: new Date(),
  //     });
  //     await this.webhookLogRepository.save(log);
  //     this.logger.log(`Webhook logged with ID: ${log.id}`);
  //     return { success: true, logId: log.id, message: 'Webhook logged successfully' };
  //   } catch (error) {
  //     this.logger.error('Failed to save webhook log', error);
  //     throw error;
  //   }
  // }

  async catchZohoWebhook(payload: any) {
    // Save raw webhook
    try {
      const log = await this.saveWebhookLog(payload);
      console.log('Webhook log saved:', log.logId);
    } catch (logErr) {
      console.error('Failed to save webhook log:', logErr.message);
    }
    // Forward to Content Service
    const contentServiceUrl = `${this.configService.get('BASE_CONTENT')}${API_ENDPOINTS.CONTENT_SERVICE.WEBHOOK_SYNC_MAPPED}`;
    const response = await firstValueFrom(
      this.httpService.post(contentServiceUrl, payload),
    );
    return response.data;
  }

  async saveWebhookLog(payload: any) {
    const log = this.webhookLogRepository.create({ webhook_data: payload });
    await this.webhookLogRepository.save(log);
    return { logId: log.id };
  }
}
