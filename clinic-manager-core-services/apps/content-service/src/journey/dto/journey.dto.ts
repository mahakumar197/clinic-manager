import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

/* ================================
   Journey Step DTO
================================ */
export class CreateJourneyStepDto {
  @ApiProperty({
    example: 'Day 1 – Rest',
  })
  @IsString()
  title: string;

  @ApiProperty({
    example: 'Complete bed rest and medication',
  })
  @IsString()
  description: string;

  @ApiProperty({
    example: 1,
  })
  @IsNumber()
  order: number;
}

/* ================================
   Create Journey DTO
================================ */
export class CreateJourneyDto {
  @ApiProperty({
    example: '02e4ab35-bedb-4261-a2ad-35d39333fe5a',
    description: 'User ID for whom the journey is created',
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    example: 'Post Surgery Recovery Journey',
  })
  @IsString()
  title: string;

  @ApiProperty({
    example: 'A guided recovery journey for post-surgery patients',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 'e099e02c-156b-420e-b056-dbdaf1bb221d',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  procedureId?: string;

  @ApiProperty({
    example: 'ACTIVE',
    required: false,
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({
    type: [CreateJourneyStepDto],
    required: false,
    example: [
      {
        title: 'Day 1 – Rest',
        description: 'Complete bed rest and medication',
        order: 1,
      },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateJourneyStepDto)
  steps?: CreateJourneyStepDto[];
}
