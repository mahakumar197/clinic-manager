import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateDropdownDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  beValue: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  enValue?: string;
}

export class CreateFilterDto {
  @ApiProperty({
    description: 'Type of the saved filter',
    example: 'tasks',
  })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({
    description: 'Name of the saved filter',
    example: 'My Pending Tasks Filter',
  })
  @IsString()
  @IsNotEmpty()
  filterName: string;

  @ApiProperty({
    description: 'JSON payload defining the filter rules',
    example: {
      patient: {
        id: '295190cb-20ed-41fc-a66f-dbe182e56532',
        userName: 'John Doe',
      },
      status: {
        id: '295190cb-20ed-41fc-a66f-dbe182e56532',
        beValue: 'Pending',
      },
      procedureType: {
        id: '295190cb-20ed-41fc-a66f-dbe182e56532',
        beValue: 'Rhinoplasty',
      },
      phase: { id: '295190cb-20ed-41fc-a66f-dbe182e56532', beValue: 'Pre-op' },
    },
  })
  @IsNotEmpty()
  filterData: JSON;
}

export class DropdownValueDto {
  @ApiProperty({ example: 'TASK_STATUS' })
  type: string;

  @ApiProperty({ example: 'OPEN' })
  beValue: string;

  @ApiProperty({ example: 'Open' })
  enValue: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: 94 })
  id: number;

  @ApiProperty({ example: '2026-01-19T09:16:55.549Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-01-19T09:16:55.549Z' })
  updatedAt: string;
}

export class DropdownByTypeResponseDto {
  @ApiProperty({
    type: DropdownValueDto,
    description: 'Dropdown value details',
    example: {
      type: 'TASK_STATUS',
      beValue: 'OPEN',
      enValue: 'Open',
      isActive: true,
      id: 94,
      createdAt: '2026-01-19T09:16:55.549Z',
      updatedAt: '2026-01-19T09:16:55.549Z',
    },
  })
  data: DropdownValueDto;
}
