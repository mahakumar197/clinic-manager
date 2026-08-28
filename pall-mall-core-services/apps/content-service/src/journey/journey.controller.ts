import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { JourneyService } from './journey.service';
import { CreateJourneyDto } from './dto/journey.dto';

@ApiTags('journey')
@Controller('journey')
@ApiBearerAuth()
export class JourneyController {
  constructor(private readonly journeyService: JourneyService) {}

  @Post()
  @ApiOperation({ summary: 'Create new journey for user' })
  @ApiResponse({ status: 201, description: 'Journey created' })
  create(@Body() body: CreateJourneyDto) {
    if (!body?.userId) {
      throw new BadRequestException('userId is required');
    }

    return this.journeyService.createJourney(body.userId, body);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all journeys for a user' })
  @ApiResponse({ status: 200, description: 'Journeys retrieved' })
  getUserJourneys(@Param('userId') userId: string) {
    return this.journeyService.getUserJourneys(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get journey by ID' })
  @ApiResponse({ status: 200, description: 'Journey found' })
  getJourney(@Param('id') id: string) {
    return this.journeyService.getJourney(id);
  }

  @Patch(':journeyId/steps/:stepId/complete')
  @ApiOperation({ summary: 'Mark journey step as completed' })
  @ApiResponse({ status: 200, description: 'Step completed' })
  completeStep(
    @Param('journeyId') journeyId: string,
    @Param('stepId') stepId: string,
  ) {
    return this.journeyService.completeStep(journeyId, stepId);
  }
}
