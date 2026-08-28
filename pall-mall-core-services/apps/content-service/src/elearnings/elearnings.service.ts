import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateElearningDto } from './dto/elearning.dto';
import { logger } from '@pallmall/logger';
import {
  ContentStatus,
  ELearningContentType,
  ImageCount,
  ImageCountId,
  MobileComponentType,
  ProcedureModel,
} from '@pallmall/common-utils';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { Procedures } from 'src/procedures/entities/procedures.entity';
import { ApiResponseBuilder, HttpStatus } from '@pallmall/shared-types';
import { ELEARNING_MESSAGES } from '@pallmall/common-utils';
import {
  ProcedureStatus,
  ContentType,
  ProcedureType,
} from '@pallmall/common-utils';
import { Content } from 'src/content/entities/content.entity';
import { Elearning } from './entities/elearning.entity';
import { helpers } from '@pallmall/common-utils';
import { API_ENDPOINTS } from '@pallmall/common-utils';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ElearningsService {
  constructor(
    @InjectRepository(Elearning)
    private readonly elearningsRepo: Repository<Elearning>,
    @InjectRepository(Procedures)
    private readonly proceduresRepo: Repository<Procedures>,
    @InjectRepository(Content)
    private readonly contentRepo: Repository<Content>,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
  ) {}

  // ---------------------------
  // LIST ELEarnings
  // ---------------------------

  /**
   * Lists elearnings.
   *
   * @returns List of elearnings
   */
  async listElearnings() {
    logger.info('listElearnings --->');
    try {
      const eLearnings = await this.elearningsRepo.find({
        where: {
          is_active: true,
        },
        order: {
          type: 'ASC',
        },
      });
      const furbishedResponse = await Promise.all(
        eLearnings.map(async (eLearning) => {
          return {
            ...eLearning,
            thumbnail_url: eLearning.thumbnail_url
              ? await helpers.getFileUrlFromAzure(eLearning.thumbnail_url)
              : null,
          };
        }),
      );
      return new ApiResponseBuilder().success(
        furbishedResponse,
        ELEARNING_MESSAGES.ELEARNING_TYPES_FETCHED,
        HttpStatus.OK,
      );
    } catch (error) {
      logger.error(`List elearnings -> ${error}`);
      return new ApiResponseBuilder().error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ---------------------------
  // LIST ALL ELEarnings BY TYPE
  // ---------------------------

  /**
   * Lists all elearnings by type.
   *
   * @param query - Procedure model
   * @returns List of elearnings by type
   */
  async listAllElearningsByType(query: ProcedureModel) {
    logger.info('List elearnings by type...');
    try {
      const eLearnings = await this.proceduresRepo.find({
        where: {
          type: query,
          status: ProcedureStatus.ACTIVE,
        },
        order: {
          title: 'ASC',
        },
      });
      const procedureIds = eLearnings.map((eLearning) => eLearning.id);
      const rawCounts = await this.contentRepo
        .createQueryBuilder('content')
        .select('content.procedure_id', 'procedure_id')
        .addSelect('COUNT(*)', 'videoCount')
        .where('content.procedure_id IN (:...procedureIds)', { procedureIds })
        .andWhere('content.type = :type', { type: ContentType.VIDEO })
        .andWhere('content.status = :status', {
          status: ContentStatus.PUBLISHED,
        })
        .groupBy('content.procedure_id')
        .getRawMany();
      const videoCountMap = rawCounts.reduce<Record<string, number>>(
        (acc, row) => {
          acc[row.procedure_id] = Number(row.videoCount);
          return acc;
        },
        {},
      );
      const ImageCounts = await this.contentRepo
        .createQueryBuilder('content')
        .select('content.procedure_id', 'procedure_id')
        .addSelect('COUNT(*)', 'ImageCount')
        .where('content.procedure_id IN (:...procedureIds)', { procedureIds })
        .andWhere('content.type = :type', { type: ContentType.IMAGE })
        .andWhere('content.status = :status', {
          status: ContentStatus.PUBLISHED,
        })
        .groupBy('content.procedure_id')
        .getRawMany();
      const ImageCountMap = ImageCounts.reduce<Record<string, number>>(
        (acc, row) => {
          acc[row.procedure_id] = Number(row.ImageCount);
          return acc;
        },
        {},
      );
      const result = await Promise.all(
        eLearnings.map(async (eLearning) => ({
          ...eLearning,
          videoCount: videoCountMap[eLearning.id] ?? 0,
          imageCount: ImageCountMap[eLearning.id] ?? 0,
          thumbnail_url: eLearning.thumbnail_url
            ? await helpers.getFileUrlFromAzure(eLearning.thumbnail_url)
            : null,
        })),
      );

      return new ApiResponseBuilder().success(
        result,
        ELEARNING_MESSAGES.ELEARNING_FETCHED,
        HttpStatus.OK,
      );
    } catch (error) {
      logger.error(`List elearnings -> ${error}`);
      return new ApiResponseBuilder().error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ---------------------------
  // FIND ONE PROCEDURE
  // ---------------------------

  /**
   * Finds one procedure.
   *
   * @param id - Procedure ID
   * @returns Procedure
   */
  async findOneProcedure(id: string) {
    logger.info(`Get elearning ${id}...`);
    try {
      const contents = await this.contentRepo.find({
        where: {
          procedure_id: id,
          status: ContentStatus.PUBLISHED,
        },
      });
      if (!contents || contents.length === 0) {
        throw new BadRequestException(
          'No content found for given procedure id',
        );
      }
      const structuredData = await this.buildSectionedResponse(contents);
      return new ApiResponseBuilder().success(
        structuredData,
        ELEARNING_MESSAGES.ELEARNING_FETCHED,
        HttpStatus.OK,
      );
    } catch (error) {
      logger.error(`Get elearning ${id} -> ${error}`);
      return new ApiResponseBuilder().error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ---------------------------
  // TRANSFORM CONTENT
  // ---------------------------

  /**
   * Transforms content.
   *
   * @param content - Content
   * @returns Transformed content
   */
  private async transformContent(content: Content) {
    logger.debug('transformContent --->');
    if (
      content.type === ContentType.IMAGE &&
      Array.isArray(content.content_url)
    ) {
      const imgCountType =
        content.img_count === ImageCountId.SINGLE
          ? ImageCount.SINGLE
          : ImageCount.MULTIPLE;

      return {
        ...content,
        thumbnail_url: content.thumbnail_url
          ? await helpers.getFileUrlFromAzure(content.thumbnail_url)
          : null,
        img_urls: await this.parseImageUrls(
          content.content_url,
          content.img_count,
        ),
        imageCountType: imgCountType,
      };
    }

    // if (content.type === ContentType.VIDEO) {
    //   return {
    //     ...content,
    //     video_url: content.content_url?.[0]
    //       ? await helpers.getFileUrlFromAzure(content.content_url[0])
    //       : null,
    //   };
    // }
    if (content.type === ContentType.VIDEO) {
      const videoPath = content.content_url?.[0];
      const isAzureVideo = videoPath && videoPath.includes('ContentUpload');

      return {
        ...content,
        thumbnailUrl: content.thumbnail_url
          ? await helpers.getFileUrlFromAzure(content.thumbnail_url)
          : null,

        video_url: videoPath
          ? isAzureVideo
            ? await helpers.getFileUrlFromAzure(videoPath)
            : videoPath
          : null,

        video_category: isAzureVideo ? 'azure' : 'out_source',
      };
    }
    if (content.type === ContentType.BLOG) {
      return {
        ...content,
        thumbnailUrl: content.thumbnail_url
          ? await helpers.getFileUrlFromAzure(content.thumbnail_url)
          : null,
      };
    }

    return content;
  }

  // ---------------------------
  // BUILD SECTIONED RESPONSE
  // ---------------------------

  /**
   * Builds sectioned response.
   *
   * @param contents - Contents
   * @returns Sectioned response
   */
  private async buildSectionedResponse(contents: Content[]) {
    logger.debug('buildSectionedResponse --->');
    const basic = [];
    const blogs = [];
    const videos = [];
    const images = [];

    for (const content of contents) {
      const transformed = await this.transformContent(content);

      switch (content.type) {
        case ContentType.ELEARNING:
          if (
            transformed.eLearnings &&
            typeof transformed.eLearnings === 'object'
          ) {
            const orderedLessons = await Promise.all(
              Object.entries(transformed.eLearnings)
                .sort(([keyA], [keyB]) => {
                  const a = Number(keyA.replace('lesson', ''));
                  const b = Number(keyB.replace('lesson', ''));
                  return a - b;
                })
                .map(async ([lessonKey, lessonValue]: [string, any], index) => {
                  const thumbnailUrl = transformed.thumbnail_url
                    ? await helpers.getFileUrlFromAzure(
                        transformed.thumbnail_url,
                      )
                    : null;

                  const contentUrl = lessonValue.content_Url
                    ? await helpers.getFileUrlFromAzure(lessonValue.content_Url)
                    : null;

                  return {
                    lessonIndex: index + 1,
                    lessonKey,
                    ...lessonValue,
                    thumbnailUrl,
                    contentUrl,
                  };
                }),
            );

            basic.push(...orderedLessons);
          }
          break;

        case ContentType.BLOG:
          blogs.push(transformed);
          break;

        case ContentType.VIDEO:
          videos.push(transformed);
          break;

        case ContentType.IMAGE:
          images.push(transformed);
          break;
      }
    }

    const response = [];

    this.pushSection(
      response,
      ELearningContentType.E_LEARNING,
      MobileComponentType.BASICS,
      basic,
    );
    this.pushSection(
      response,
      ELearningContentType.BLOGS,
      MobileComponentType.BLOGS,
      blogs,
    );
    this.pushSection(
      response,
      ELearningContentType.VIDEO,
      MobileComponentType.VIDEO,
      videos,
    );
    this.pushSection(
      response,
      ELearningContentType.IMAGES,
      MobileComponentType.IMAGES,
      images,
    );

    return response;
  }

  // ---------------------------
  // PARSE IMAGE URLS
  // ---------------------------
  /**
   * Parses image URLs.
   *
   * @param urls - Image URLs
   * @param img_count - Image count
   * @returns Parsed image URLs
   */
  private async parseImageUrls(urls: string[] = [], img_count: number) {
    logger.debug('parseImageUrls --->');
    const emptyResult = {
      url_single: null,
      url_before: null,
      url_after: null,
    };
    if (!Array.isArray(urls) || urls.length === 0) {
      return emptyResult;
    }
    if (img_count === ImageCountId.SINGLE) {
      return {
        ...emptyResult,
        url_single: await helpers.getFileUrlFromAzure(urls[0]),
      };
    }
    await Promise.all(
      urls.map(async (rawUrl) => {
        if (rawUrl.startsWith('before:')) {
          emptyResult.url_before = await helpers.getFileUrlFromAzure(
            rawUrl.replace('before:', ''),
          );
        } else if (rawUrl.startsWith('after:')) {
          emptyResult.url_after = await helpers.getFileUrlFromAzure(
            rawUrl.replace('after:', ''),
          );
        }
      }),
    );

    return emptyResult;
  }

  // ---------------------------
  // PUSH SECTION
  // ---------------------------

  /**
   * Pushes section to response.
   *
   * @param response - Response array
   * @param title - Section title
   * @param component - Component type
   * @param data - Section data
   */
  private pushSection(
    response: object[],
    title: string,
    component: string,
    data: object[],
  ) {
    logger.debug('pushSection --->');
    if (!Array.isArray(data) || data.length === 0) {
      return;
    }
    response.push({
      title,
      sections: [
        {
          component,
          basicData: data,
        },
      ],
    });
  }

  // ---------------------------
  // LIST OUR IMAGES OR VIDEOS
  // ---------------------------

  /**
   * Lists our images or videos.
   *
   * - Fetches patient appointments from Zoho (best-effort)
   * - Resolves patient's procedure from consultation
   * - Falls back to default procedure when not available
   * - Fetches published content for the resolved procedure & type
   * - Transforms and groups media URLs for response
   *
   * @param userId - User ID
   * @param token - User token
   * @param type - Content type (IMAGE | VIDEO)
   * @returns List of images or videos
   */
  async listOurImagesOrVideos(
    userId: string,
    token: string,
    type: ContentType,
  ) {
    logger.info('List our images or videos...');

    try {
      const uri = this.configService.get('BASE_INTEGRATION');
      const urlPath = API_ENDPOINTS.ZOHO_SERVICE.APPOINTMENTS;

      const appointments = await this.fetchAppointmentsSafely(
        uri,
        urlPath,
        token,
      );
      // const procedureId =
      //   await this.resolveProcedureIdFromAppointments(appointments);

      const procedureId = '1d73bec7-e91f-4dbe-bc96-8f7cb94a9445';

      const fetchContents = await this.contentRepo.find({
        where: {
          procedure_id: procedureId,
          status: ContentStatus.PUBLISHED,
          type,
        },
      });
      const transformed = await Promise.all(
        fetchContents.map((content) => this.transformContent(content)),
      );

      const mediaUrls = this.extractMediaGroups(transformed);

      logger.info(`List our images or videos -> ${HttpStatus.OK}`);

      return new ApiResponseBuilder().success(
        mediaUrls,
        ELEARNING_MESSAGES.ELEARNING_IMAGES_VIDEOS_FETCHED,
        HttpStatus.OK,
      );
    } catch (error) {
      logger.error('List our images or videos ->', error);
      return new ApiResponseBuilder().error(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Fetches patient appointments from Zoho safely.
   *
   * - Returns empty array on failure
   * - Logs warning if Zoho call fails
   *
   * @param uri - Zoho base URI
   * @param urlPath - Zoho appointments API path
   * @param token - Zoho auth token
   * @returns Appointments array (empty on failure)
   */
  private async fetchAppointmentsSafely(
    uri: string,
    urlPath: string,
    token: string,
  ): Promise<any[]> {
    logger.debug('fetchAppointmentsSafely --->');
    try {
      return await helpers.fetchPatientAppointments(uri, urlPath, token);
    } catch (err) {
      logger.warn('Failed to fetch appointments from Zoho', err);
      return [];
    }
  }

  /**
   * Resolves procedure ID from patient appointments.
   *
   * - Attempts to read consultation.procedure
   * - Fetches procedure entity by title
   * - Falls back to default procedure ID if not found or missing
   *
   * @param appointments - Zoho appointments response
   * @returns Procedure ID to be used for content lookup
   */
  private async resolveProcedureIdFromAppointments(
    appointments: any[],
  ): Promise<string> {
    logger.debug('resolveProcedureIdFromAppointments --->');
    const DEFAULT_PROCEDURE_ID = '1d73bec7-e91f-4dbe-bc96-8f7cb94a9445';

    const patientProcedure = appointments?.[0]?.consultation?.procedure;

    if (!patientProcedure) {
      logger.warn('No consultation.procedure found, using default procedure');
      return DEFAULT_PROCEDURE_ID;
    }

    const fetchProcedure = await this.proceduresRepo.findOne({
      where: { title: patientProcedure },
    });

    if (!fetchProcedure?.id) {
      logger.warn('Procedure not found for title, using default', {
        patientProcedure,
      });
      return DEFAULT_PROCEDURE_ID;
    }
    logger.debug('fetchProcedure.id', { id: fetchProcedure.id });
    return fetchProcedure.id;
  }

  // ---------------------------
  // EXTRACT MEDIA GROUPS
  // ---------------------------

  /**
   * Extracts media groups from contents.
   *
   * @param contents - Contents
   * @returns Media groups
   */
  private extractMediaGroups(contents: any[]) {
    logger.debug('extractMediaGroups --->');
    return contents
      .filter(
        (content) =>
          (content.type === ContentType.IMAGE && content.img_urls) ||
          (content.type === ContentType.VIDEO && content.video_url) ||
          (content.type === ContentType.BLOG && content.thumbnail_url),
      )
      .map((content) => {
        if (content.type === ContentType.IMAGE) {
          return {
            type: ContentType.IMAGE,
            id: content.id,
            thumbnailUrl: content.thumbnail_url ?? null,
            img_urls: {
              url_single: content.img_urls?.url_single ?? null,
              url_before: content.img_urls?.url_before ?? null,
              url_after: content.img_urls?.url_after ?? null,
            },
          };
        }

        if (content.type === ContentType.VIDEO) {
          return {
            type: ContentType.VIDEO,
            id: content.id,
            video_url: content.video_url,
            thumbnailUrl: content.thumbnailUrl ?? null,
          };
        }

        if (content.type === ContentType.BLOG) {
          return {
            type: ContentType.BLOG,
            id: content.id,
            title: content.title,
            description: content.description ?? null,
            blog_header: content.blog_header ?? null,
            thumbnailUrl: content.thumbnailUrl,
            content: content.content,
          };
        }

        return null;
      })
      .filter(Boolean);
  }
}