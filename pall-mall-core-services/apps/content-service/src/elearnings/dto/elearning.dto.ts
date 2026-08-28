export class CreateElearningDto {}
import { ApiProperty } from '@nestjs/swagger';

/* ================================
   Surgery Type DTO (API 1)
================================ */
export class ElearningSurgeryTypeDto {
  @ApiProperty({
    example: 'e099e02c-156b-420e-b056-dbdaf1bb221d',
  })
  id: string;

  @ApiProperty({
    example: 'Facial Surgery',
  })
  name: string;

  @ApiProperty({
    example: 'FACIAL',
  })
  type: string;

  @ApiProperty({
    example: true,
  })
  isActive: boolean;
}

/* ================================
   List Surgery Types Response DTO
================================ */
export class ElearningSurgeryTypesResponseDto {
  @ApiProperty({
    type: [ElearningSurgeryTypeDto],
    example: [
      {
        id: 'e099e02c-156b-420e-b056-dbdaf1bb221d',
        name: 'Facial Surgery',
        type: 'FACIAL',
        isActive: true,
      },
      {
        id: 'a199e02c-256b-520e-b056-dbdaf1bb331d',
        name: 'Dental Surgery',
        type: 'DENTAL',
        isActive: true,
      },
      {
        id: 'b299e02c-356b-620e-b056-dbdaf1bb442d',
        name: 'Orthopedic Surgery',
        type: 'ORTHOPEDIC',
        isActive: true,
      },
    ],
  })
  data: ElearningSurgeryTypeDto[];
}

/* ================================
   Elearning Summary DTO (API 2)
================================ */
export class ElearningSummaryDto {
  @ApiProperty({
    example: 'e099e02c-156b-420e-b056-dbdaf1bb221d',
  })
  id: string;

  @ApiProperty({
    example: 'Facial Surgery Basics',
  })
  title: string;

  @ApiProperty({
    example: 'face',
  })
  procedureType: string;

  @ApiProperty({
    example: 'https://example.com/thumbnail.jpg',
  })
  thumbnailUrl: string;

  @ApiProperty({
    example: 'PUBLISHED',
  })
  status: string;
}

/* ================================
   Elearning By Type Response DTO
================================ */
export class ElearningsByTypeResponseDto {
  @ApiProperty({
    type: [ElearningSummaryDto],
    example: [
      {
        id: 'e099e02c-156b-420e-b056-dbdaf1bb221d',
        title: 'Facial Surgery Basics',
        procedureType: 'face',
        thumbnailUrl: 'https://example.com/thumbnail.jpg',
        status: 'PUBLISHED',
      },
      {
        id: 'a199e02c-256b-520e-b056-dbdaf1bb331d',
        title: 'Advanced Facial Recovery',
        procedureType: 'face',
        thumbnailUrl: 'https://example.com/thumbnail2.jpg',
        status: 'PUBLISHED',
      },
    ],
  })
  data: ElearningSummaryDto[];
}

/* ================================
   Elearning Lesson DTO (API 3)
================================ */
export class ElearningLessonDto {
  @ApiProperty({ example: 1 })
  lessonIndex: number;

  @ApiProperty({ example: 'lesson1' })
  lessonKey: string;

  @ApiProperty({ example: 'Introduction to Facial Surgery' })
  title: string;

  @ApiProperty({
    example: 'Detailed eLearning content for facial surgery',
  })
  description: string;

  @ApiProperty({
    example: 'https://example.com/thumbnail.jpg',
  })
  thumbnailUrl: string;

  @ApiProperty({
    example: 'https://example.com/lesson1.mp4',
  })
  contentUrl: string;
}

/* ================================
   Elearning Section DTO
================================ */
export class ElearningSectionDto {
  @ApiProperty({
    example: 'basicVideoComponent',
  })
  component: string;

  @ApiProperty({
    type: [ElearningLessonDto],
  })
  basicData: ElearningLessonDto[];
}

/* ================================
   Elearning Procedure DTO
================================ */
export class ElearningProcedureDto {
  @ApiProperty({ example: 'Basics' })
  title: string;

  @ApiProperty({
    type: [ElearningSectionDto],
  })
  sections: ElearningSectionDto[];
}

/* ================================
   Elearning By Procedure Response DTO
================================ */
export class ElearningByProcedureResponseDto {
  @ApiProperty({
    example: [
      {
        title: 'Basics',
        sections: [
          {
            component: 'basicVideoComponent',
            basicData: [
              {
                lessonIndex: 1,
                lessonKey: 'lesson1',
                title: 'Introduction to Facial Surgery',
                description: 'Detailed eLearning content for facial surgery',
                thumbnailUrl: 'https://example.com/thumbnail.jpg',
                contentUrl: 'https://example.com/lesson1.mp4',
              },
            ],
          },
        ],
      },
    ],
  })
  data: ElearningProcedureDto[];
}
