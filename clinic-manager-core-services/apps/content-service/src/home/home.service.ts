import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { logger } from '@pallmall/logger';
import { HomeCarousel } from './entities/home-carousel.entity';
import { AppHomeConfig } from './entities/app-home-config.entity';
import {
  ApiError,
  ApiResponse,
  ApiResponseBuilder,
  HttpStatus,
} from '@pallmall/shared-types';
import { HOME_MESSAGES, API_ENDPOINTS, helpers } from '@pallmall/common-utils';
import { GuestUser } from './entities/guest-user.entity';

@Injectable()
export class HomeService {
  constructor(
    @InjectRepository(AppHomeConfig)
    private readonly AppHomeConfigRepository: Repository<AppHomeConfig>,

    @InjectRepository(HomeCarousel)
    private readonly carouselRepository: Repository<HomeCarousel>,

    @InjectRepository(GuestUser)
    private readonly guestUserRepository: Repository<GuestUser>,

    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Fetches data for the home screen, including carousels, forms, and e-learning resources.
   * Updates guest user information if a device ID is provided.
   *
   * @param input - Optional object containing deviceId
   * @returns ApiResponse with enriched home screen data
   */
  async getHomeData(input?: { deviceId?: string }): Promise<ApiResponse<any>> {
    try {
      logger.info(
        `Fetching home data for deviceId: ${input?.deviceId ?? 'unknown'}`,
      );

      await this.updateGuestUser(input?.deviceId);

      const config = await this.getLatestConfig();
      const carousels = await this.getCarousels(config?.id);

      const { forms, elearnings } = await this.fetchExternalContent();

      return new ApiResponseBuilder().success(
        this.formatHomeResponse(config, carousels, forms, elearnings),
        HOME_MESSAGES.HOME_DATA_FETCHED,
        HttpStatus.OK,
      );
    } catch (error) {
      logger.error(`Error in getHomeData: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Updates or inserts a guest user based on device ID.
   * @param deviceId - The unique device identifier
   */
  private async updateGuestUser(deviceId?: string): Promise<void> {
    logger.debug('updateGuestUser --->');
    if (!deviceId || deviceId.length < 10) return;

    await this.guestUserRepository
      .createQueryBuilder()
      .insert()
      .values({ deviceId })
      .orUpdate(['updated_at'], ['device_id'])
      .execute();
  }

  /**
   * Retrieves the latest home configuration.
   * @returns The most recent AppHomeConfig or null
   */
  private async getLatestConfig(): Promise<AppHomeConfig | null> {
    logger.debug('getLatestConfig --->');
    return this.AppHomeConfigRepository.find({
      order: { createdAt: 'DESC' },
      take: 1,
    }).then((res) => res[0] || null);
  }

  /**
   * Retrieves carousels associated with a specific config ID.
   * @param homeConfigId - The ID of the home configuration
   * @returns Array of HomeCarousel entities
   */
  private async getCarousels(homeConfigId?: string): Promise<HomeCarousel[]> {
    logger.debug('getCarousels --->');
    if (!homeConfigId) return [];

    return this.carouselRepository.find({
      where: { homeConfigId },
      order: { orderIndex: 'ASC' },
    });
  }

  /**
   * Fetches forms and e-learning items from external services.
   * @returns Object containing arrays of forms and elearnings
   */
  private async fetchExternalContent(): Promise<{
    forms: any[];
    elearnings: any[];
  }> {
    logger.debug('fetchExternalContent --->');
    const baseUrl = this.configService.get<string>('BASE_CONTENT');
    const [formsRes, elearningRes] = await Promise.all([
      firstValueFrom(
        this.httpService.get(
          `${baseUrl}${API_ENDPOINTS.CONTENT_SERVICE.FORMS_FETCH}`,
        ),
      ),
      firstValueFrom(
        this.httpService.get(
          `${baseUrl}${API_ENDPOINTS.CONTENT_SERVICE.ELEARNINGS_FETCH}`,
        ),
      ),
    ]);

    return {
      forms: this.mapForms(formsRes.data?.data),
      elearnings: await this.mapElearnings(elearningRes.data?.data),
    };
  }

  /**
   * Maps raw form data to the desired format.
   * @param data - Raw form data from the API
   * @returns Mapped form data
   */
  private mapForms(data: any[]): any[] {
    logger.debug('mapForms --->');
    return (data ?? []).map((f) => ({
      id: f.id,
      title: f.title,
      description: f.description,
      type: f.type,
    }));
  }

  /**
   * Maps raw e-learning data and fetches icon URLs from Azure.
   * @param data - Raw e-learning data from the API
   * @returns Mapped e-learning data with SAS URLs
   */
  private async mapElearnings(data: any[]): Promise<any[]> {
    logger.debug('mapElearnings --->');
    return Promise.all(
      (data ?? []).map(async (e) => ({
        id: e.id,
        imageUrl: e.icon_url
          ? await helpers.getFileUrlFromAzure(e.icon_url)
          : null,
        title: e.title,
        type: e.type,
        thumbnail: e.thumbnail,
      })),
    );
  }

  /**
   * Formats the final home data response.
   */
  private formatHomeResponse(
    config: any,
    carousels: any[],
    forms: any[],
    elearnings: any[],
  ): any {
    logger.debug('formatHomeResponse --->');
    return {
      appName: config?.appName ?? 'Pall Mall',
      homeDesc: config?.homeDesc ?? '',
      carousel: carousels.map((c) => ({
        imageUrl: c.imageUrl,
        title: c.title,
        desc: c.description,
        ctaText: c.ctaText,
        ctaAction: c.ctaAction,
      })),
      forms,
      elearnings,
    };
  }
}