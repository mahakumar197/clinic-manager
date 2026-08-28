import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JourneyService } from './journey.service';
import { JourneyController } from './journey.controller';
import { UserJourney } from './entities/user-journey.entity';
import { JourneyStep } from './entities/journey-step.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserJourney, JourneyStep])],
  controllers: [JourneyController],
  providers: [JourneyService],
  exports: [JourneyService],
})
export class JourneyModule {}
