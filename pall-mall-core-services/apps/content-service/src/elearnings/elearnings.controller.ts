import {
  Controller,
  Get,
  Param,
  Query,
  HttpStatus,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ElearningsService } from './elearnings.service';
import { ContentType, ProcedureModel } from '@pallmall/common-utils';
import {
  ElearningSurgeryTypesResponseDto,
  ElearningsByTypeResponseDto,
  ElearningByProcedureResponseDto,
} from './dto/elearning.dto';

import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('elearnings')
@Controller('elearnings')
export class ElearningsController {
  constructor(private readonly elearningsService: ElearningsService) {}

  @ApiOperation({ summary: 'List all surgery types for eLearning' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: ElearningSurgeryTypesResponseDto,
  })
  @Get()
  listElearnings() {
    return this.elearningsService.listElearnings();
  }

  @ApiOperation({ summary: 'List all surgeries for eLearning by type' })
  @ApiQuery({
    name: 'type',
    required: true,
    schema: {
      type: 'string',
      enum: ['face', 'men', 'breast', 'body'],
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: ElearningsByTypeResponseDto,
  })
  @Get('type')
  listAllElearnings(@Query('type') type: ProcedureModel) {
    return this.elearningsService.listAllElearningsByType(type);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary:
      'List all published images and videos for the logged-in user based on this surgery',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List all published images and videos',
  })
  @Get('images-videos')
  getImagesAndVideos(@Req() req, @Query('type') type: ContentType) {
    const token = req.headers.authorization;
    return this.elearningsService.listOurImagesOrVideos(
      req.user.userId,
      token,
      type,
    );
  }

  @ApiOperation({ summary: 'List all published eLearning for selected type' })
  @ApiParam({
    name: 'id',
    description: 'Procedure ID (UUID)',
    schema: {
      type: 'string',
      format: 'uuid',
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: ElearningByProcedureResponseDto,
  })
  @Get(':id')
  findOneProcedure(@Param('id') id: string) {
    return this.elearningsService.findOneProcedure(id);
  }
}
