import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { FormSubmissionDto } from '../dto/zoho.dto';
import { helpers } from '@pallmall/common-utils';
import { InjectRepository } from '@nestjs/typeorm';
import { ZohoForm } from '../entities/zoho-form.entity';
import { ZohoFormFieldMapping } from '../entities/zoho-form-field-mapping.entity';
import { Repository } from 'typeorm';
import { logger } from '@pallmall/logger';

@Injectable()
export class ZohoFormsService {
  @InjectRepository(ZohoForm)
  private readonly zohoFormRepository: Repository<ZohoForm>;
  @InjectRepository(ZohoFormFieldMapping)
  private readonly zohoFormFieldMappingRepository: Repository<ZohoFormFieldMapping>;
  private readonly http: AxiosInstance;
  private readonly ZOHO_URL_ASK_THE_SURGEON =
    'https://forms.zohopublic.com/pmmedical/form/AsktheSurgeonAPP/formperma/eOMgeys1reTQ5WOSlZjoK6uL1ryhi4KRoSVduSQTTkc/records';
  private readonly ZOHO_ASK_TEAM_URL =
    'https://forms.zohopublic.com/pmmedical/form/AsktheTeamAPP/formperma/cnrgsDK01z6GYWsIZhC06vqdHnZDueGQayVIs0NA4ZI/records';
  private readonly ZOHO_SSQ_URL =
    'https://forms.pallmallmedical.co.uk/pmmedical/form/SurgeryScreeningQuestionnaireSSQ/formperma/3uJX0MV5lk9X00G3BimphrkBA-C4Jj8vSBX983sWif4/records';
  private readonly ZOHO_POST_OP_DAILY_URL =
    'https://forms.zohopublic.com/pmmedical/form/PostSurgeryRecoveryCheckIn/formperma/H35Xa3DKhNJhea0kSOLuudUYuXvx5nO_hWHQpOf1nu4/records';
  private readonly ZOHO_POST_OP_WEEKLY_URL =
    'https://forms.zohopublic.com/pmmedical/form/PostSurgeryRecoveryCheckInWeeks312/formperma/yvKhmuI_Hj9B9f83fm4CEs6ZcoW3ZKk1Wahhyal89Z4/records';
  private readonly ZOHO_POST_OP_MONTHLY_URL =
    'https://forms.zohopublic.com/pmmedical/form/PostSurgeryRecoveryCheckInMonths412/formperma/A49ppB1Tc9Z-OR4G30h5G4G4D72OKIiCWKDhGSm-_fU/records';
  constructor() {
    this.http = axios.create({
      timeout: 10000,
      headers: {
        Accept: 'application/zoho.forms-v1+json',
        'Content-Type': 'application/json',
      },
    });
  }

  private async downloadFromAzure(url: string, retries = 4): Promise<Buffer> {
    try {
      const res = await axios.get(url, { responseType: 'arraybuffer' });
      return Buffer.from(res.data);
    } catch (err: any) {
      const status = err?.response?.status;

      if (status === 403 && retries > 0) {
        // Azure SAS not valid yet (st is in the future) → wait and retry
        await new Promise((r) => setTimeout(r, 1500));
        return this.downloadFromAzure(url, retries - 1);
      }

      throw err;
    }
  }

  private async uploadImageToZoho(
    fileBuffer: Buffer,
    filename: string,
    zohoField: string,
    zohoFormLinkName: string,
  ): Promise<string> {
    const uploadId = `pmmedical_${Date.now()}_${Math.random().toString(36).slice(2)}`;

    const res = await axios.post(
      'https://us4-files.zohopublic.com/forms/v2/stream/publicupload',
      fileBuffer,
      {
        headers: {
          'Content-Type': 'image/png',
          'x-fieldlinkname': zohoField,
          'x-filename': encodeURIComponent(filename),
          'x-formlinkname': zohoFormLinkName,
          'x-portalname': 'pmmedical',
          'x-service': 'forms',
          'x-streammode': 1,
          'x-live_form_upload': true,
          'upload-id': uploadId,
          'x-assured-response': true,
          'x-fclient-version': 2,
        },
        maxBodyLength: Infinity,
        timeout: 30000,
      },
    );

    const filePath = res.data?.filePath || res.data?.filepath;
    if (!filePath) {
      throw new InternalServerErrorException('Zoho image upload failed');
    }
    return filePath;
  }

  private async downloadAsBase64(url: string): Promise<string> {
    const res = await axios.get(url, {
      responseType: 'arraybuffer',
    });

    const contentType = res.headers['content-type'] || 'image/png';

    const base64 = Buffer.from(res.data).toString('base64');

    return `data:${contentType};base64,${base64}`;
  }

  private resolveConditionalSideEffectsConfig(
    mappings: ZohoFormFieldMapping[],
  ) {
    const trigger = mappings.find(
      (m) => m.meta?.role === 'SIDE_EFFECTS_TRIGGER',
    );

    const detail = mappings.find((m) => m.meta?.role === 'SIDE_EFFECTS_DETAIL');

    return {
      trigger,
      detail,
    };
  }

  private async buildZohoPayload(dto: FormSubmissionDto) {
    const form = await this.zohoFormRepository.findOne({
      where: { id: dto.formId },
    });

    if (!form) {
      throw new BadRequestException(`Invalid formId: ${dto.formId}`);
    }

    const mappings = await this.zohoFormFieldMappingRepository.find({
      where: {
        form_id: dto.formId,
        is_active: true,
      },
    });

    if (!mappings.length) {
      throw new BadRequestException(
        `No Zoho field mapping configured for formId: ${dto.formId}`,
      );
    }

    const answerMap = dto.answers.reduce<Record<string, any>>((acc, curr) => {
      acc[curr.questionId] = curr.answer;
      return acc;
    }, {});

    const buildBasePayload = async () => {
      const CHECKBOX_KEYS = new Set(['Checkbox', 'Checkbox1']);
      const DATE_KEYS = new Set(['Date', 'Date1', 'Date2']);

      return mappings.reduce<Promise<Record<string, any>>>(async (accP, m) => {
        const payload = await accP;

        const raw = answerMap[m.question_id];

        // FE always sends array, normalize once
        const values = Array.isArray(raw) ? raw : raw != null ? [raw] : [];

        if (!values.length) return payload;

        // ---- Date fields ----
        if (DATE_KEYS.has(m.zoho_field_key)) {
          const rawVal = values[0];
          payload[m.zoho_field_key] =
            typeof rawVal === 'string'
              ? this.normalizeZohoDate(rawVal)
              : rawVal;
          return payload;
        }

        // ---- Image fields ----
        if (m.zoho_field_key.startsWith('ImageUpload')) {
          payload[m.zoho_field_key] = await Promise.all(
            values.map(async (azureUrl: string) => {
              const signedUrl = await helpers.getFileUrlFromAzure(
                azureUrl.trim(),
              );
              console.log('Signed Azure URL:', signedUrl);

              const buffer = await this.downloadFromAzure(signedUrl);

              const filename =
                azureUrl.split('/').pop()?.split('?')[0] || 'image.png';

              const zohoKey = m.zoho_field_key.replace('-v2', '');

              return this.uploadImageToZoho(
                buffer,
                filename,
                zohoKey,
                form.zoho_form_link_name, // <-- daily / weekly dynamic
              );
            }),
          );

          return payload;
        }

        // ---- Nested keys ----
        if (m.zoho_field_key.includes('.')) {
          const [parent, child] = m.zoho_field_key.split('.');
          payload[parent] = payload[parent] || {};
          payload[parent][child] = values[0] ?? '';
          return payload;
        }

        // ---- Checkboxes ----
        if (CHECKBOX_KEYS.has(m.zoho_field_key)) {
          payload[m.zoho_field_key] = values.filter(Boolean);
          return payload;
        }

        // ---- Default ----
        payload[m.zoho_field_key] = values[0] ?? '';
        return payload;
      }, Promise.resolve({}));
    };

    // -----------------------------
    // SSQ-SPECIFIC LOGIC
    // -----------------------------
    if (form.name?.includes('SSQ')) {
      const payload = await buildBasePayload();

      const checkbox1Mapping = mappings.find(
        (m) => m.zoho_field_key === 'Checkbox1',
      );

      const checkbox1Provided =
        !!checkbox1Mapping &&
        dto.answers.some(
          (a) =>
            a.questionId === checkbox1Mapping.question_id &&
            Array.isArray(a.answer) &&
            a.answer.length > 0,
        );

      if (checkbox1Provided) {
        payload.Date2 = '';
      }

      payload.GeoComplete = { GeoComplete_val: '' };
      payload.SingleLine2 = 'Surgery Screening Questionnaire';

      if (dto.signature_image) {
        if (dto.signature_image.startsWith('data:')) {
          payload.Signature = dto.signature_image;
        } else {
          const signedUrl = await helpers.getFileUrlFromAzure(
            dto.signature_image.trim(),
          );
          payload.Signature = await this.downloadAsBase64(signedUrl);
        }
      }

      return payload;
    }
    // -----------------------------
    // GENERIC FORMS
    // -----------------------------
    const payload = await buildBasePayload();

    payload.GeoComplete = { GeoComplete_val: '' };

    if (dto.signature_image) {
      payload.Signature = dto.signature_image;
    }

    if (
      form.name === 'postOpDaily' ||
      form.name === 'postOpWeekly' ||
      form.name === 'postOpMonthly'
    ) {
      const { trigger, detail } =
        this.resolveConditionalSideEffectsConfig(mappings);
      if (!trigger || !detail) {
        throw new BadRequestException(
          'Side effects mapping is not configured for postOpDaily form',
        );
      }
      const sideEffectsAnswer = dto.answers.find(
        (a) => a.questionId === trigger.question_id,
      )?.answer;
      const sideEffectsDetail = dto.answers.find(
        (a) => a.questionId === detail.question_id,
      )?.answer;
      const normalizedSideEffects = Array.isArray(sideEffectsAnswer)
        ? sideEffectsAnswer[0]
        : sideEffectsAnswer;
      if (normalizedSideEffects === 'Yes') {
        if (!sideEffectsDetail) {
          throw new BadRequestException(
            'Side effects details are required when Yes is selected',
          );
        }
        payload[detail.zoho_field_key] = Array.isArray(sideEffectsDetail)
          ? sideEffectsDetail[0]
          : sideEffectsDetail;
      } else {
        delete payload[detail.zoho_field_key];
      }
    }

    return payload;
  }
  private formatZohoDateTime(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');

    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const month = monthNames[date.getMonth()];

    const year = date.getFullYear();

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}-${month}-${year} ${hours}:${minutes}`;
  }

  private normalizeZohoDate(input: string): string {
    // If already in Zoho display format
    if (/^\d{2}-[A-Za-z]{3}-\d{4}$/.test(input)) {
      return input;
    }

    const d = new Date(input);

    if (Number.isNaN(d.getTime())) {
      throw new BadRequestException(`Invalid date: ${input}`);
    }

    const day = String(d.getDate()).padStart(2, '0');

    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const month = monthNames[d.getMonth()];

    const year = d.getFullYear();

    return `${day}-${month}-${year}`; // ✅ Zoho format
  }

  private resolvePostOpZohoUrl(formName: string) {
    switch (formName) {
      case 'postOpDaily':
        return this.ZOHO_POST_OP_DAILY_URL;

      case 'postOpWeekly':
        return this.ZOHO_POST_OP_WEEKLY_URL;

      case 'postOpMonthly':
        return this.ZOHO_POST_OP_MONTHLY_URL;

      default:
        throw new BadRequestException(
          `Unsupported post-op form type: ${formName}`,
        );
    }
  }

  async submitAskTheSurgeonForm(dto: FormSubmissionDto) {
    logger.info('Submit ask the surgeon zoho form -->');
    const payload = await this.buildZohoPayload(dto);
    payload.REFERRER_NAME =
      'https://forms.zohopublic.com/pmmedical/form/AsktheSurgeonAPP/thankyou/formperma/eOMgeys1reTQ5WOSlZjoK6uL1ryhi4KRoSVduSQTTkc';
    if (!payload.Email || !payload.PhoneNumber) {
      throw new BadRequestException(
        'Missing Email or Phone for Zoho submission',
      );
    }
    try {
      const { data } = await this.http.post(
        this.ZOHO_URL_ASK_THE_SURGEON,
        payload,
      );
      logger.info(`Submit ask the surgeon zoho form -->${HttpStatus.OK}`);
      return { success: true, zohoResponse: data };
    } catch (error: any) {
      throw new InternalServerErrorException({
        message: 'Zoho submission failed',
        zohoError: error?.response?.data || error?.message,
      });
    }
  }
  async submitAskTheTeamForm(dto: FormSubmissionDto) {
    logger.info('Submit ask the team zoho form -->');
    const payload = await this.buildZohoPayload(dto);
    if (!payload.Email || !payload.PhoneNumber || !payload.SingleLine) {
      throw new BadRequestException(
        'Missing required fields for Ask the Team submission',
      );
    }
    try {
      const { data } = await this.http.post(this.ZOHO_ASK_TEAM_URL, payload);
      logger.info(`Submit ask the team zoho form -->${HttpStatus.OK}`);
      return { success: true, zohoResponse: data };
    } catch (error: any) {
      throw new InternalServerErrorException({
        message: 'Ask the Team Zoho submission failed',
        zohoError: error?.response?.data || error?.message,
      });
    }
  }

  async submitSSQForm(dto: FormSubmissionDto) {
    logger.info('Submit SSQ zoho form -->');
    const payload = await this.buildZohoPayload(dto);
    if (!payload.Name?.Name_First || !payload.Name?.Name_Last) {
      throw new BadRequestException('Missing patient name');
    }
    // return payload;
    try {
      const { data } = await this.http.post(this.ZOHO_SSQ_URL, payload);
      logger.info(`Submit SSQ zoho form -->${HttpStatus.OK}`);
      return { success: true, zohoResponse: data };
    } catch (error: any) {
      throw new InternalServerErrorException({
        message: 'SSQ Zoho submission failed',
        zohoError: error?.response?.data || error?.message,
      });
    }
  }

  async submitPostOpForm(dto: FormSubmissionDto) {
    logger.info('Submit PostOp zoho form -->');
    const form = await this.zohoFormRepository.findOne({
      where: { id: dto.formId },
    });

    if (!form) {
      throw new BadRequestException(`Invalid formId: ${dto.formId}`);
    }
    console.log(form.name, 'form name');

    const payload = await this.buildZohoPayload(dto);

    payload.ZohoCRM = {};
    payload.DateTime = this.formatZohoDateTime(new Date());

    const zohoUrl = this.resolvePostOpZohoUrl(form.name);
    try {
      const { data } = await this.http.post(zohoUrl, payload);
      logger.info(`Submit PostOp zoho form -->${HttpStatus.OK}`);
      return { success: true, zohoResponse: data };
    } catch (error: any) {
      throw new InternalServerErrorException({
        message: `${form.name} Zoho submission failed`,
        zohoError: error?.response?.data || error?.message,
      });
    }
  }
}
