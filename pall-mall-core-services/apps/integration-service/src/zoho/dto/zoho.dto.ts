import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsUUID,
  ValidateNested,
  IsArray,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class FormAnswerInputDto {
  @ApiProperty({
    example: '36cb90f3-6543-418a-bb4f-975e09a96d9e',
    description: 'Form Question ID',
  })
  @IsUUID()
  questionId: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['John'],
    description:
      'Answer -> plain text {value:"John"} mcq -> use the same key value pair from question\'s options',
  })
  @IsOptional()
  @IsArray()
  answer?: string[];
}

export class FormSubmissionDto {
  @ApiProperty({
    example: 'e65b0784-c025-441e-992a-c8b86edaa3be',
  })
  @IsUUID()
  formId: string;

  @ApiProperty({
    type: [FormAnswerInputDto],
    description: 'Answers keyed by question ID',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FormAnswerInputDto)
  answers: FormAnswerInputDto[];

  @ApiPropertyOptional({
    example:
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==',
    description: 'Signature image in base64 format',
  })
  @IsOptional()
  @IsString()
  signature_image?: string;
}
