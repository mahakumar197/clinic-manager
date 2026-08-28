import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserJourney, JourneyStatus } from './entities/user-journey.entity';
import { JourneyStep, StepStatus } from './entities/journey-step.entity';
import { logger } from '@pallmall/logger';

@Injectable()
export class JourneyService {
  constructor(
    @InjectRepository(UserJourney)
    private journeyRepository: Repository<UserJourney>,
    @InjectRepository(JourneyStep)
    private stepRepository: Repository<JourneyStep>,
  ) {}

  async createJourney(
    userId: string,
    journeyData: any,
  ): Promise<UserJourney | UserJourney[]> {
    logger.info('createJourney --->');
    try {
      const journey = this.journeyRepository.create({
        ...journeyData,
        userId,
        status: JourneyStatus.NOT_STARTED,
      });
      return await this.journeyRepository.save(journey);
    } catch (error) {
      logger.error('createJourney error --->', error);
      throw error;
    }
  }

  async getUserJourneys(userId: string): Promise<UserJourney[]> {
    logger.info('getUserJourneys --->');
    try {
      return await this.journeyRepository.find({
        where: { userId },
        relations: ['steps'],
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      logger.error('getUserJourneys error --->', error);
      throw error;
    }
  }

  async getJourney(id: string): Promise<UserJourney> {
    logger.info(`getJourney ---> id: ${id}`);
    try {
      const journey = await this.journeyRepository.findOne({
        where: { id },
        relations: ['steps'],
      });

      if (!journey) {
        throw new NotFoundException(`Journey with ID ${id} not found`);
      }

      return journey;
    } catch (error) {
      logger.error('getJourney error --->', error);
      throw error;
    }
  }

  async completeStep(journeyId: string, stepId: string): Promise<JourneyStep> {
    logger.info(`completeStep ---> journeyId: ${journeyId}, stepId: ${stepId}`);
    try {
      const step = await this.stepRepository.findOne({
        where: { id: stepId, journeyId },
      });

      if (!step) {
        throw new NotFoundException(`Step not found`);
      }

      step.status = StepStatus.COMPLETED;
      step.completedAt = new Date();
      await this.stepRepository.save(step);

      // Update journey progress
      await this.updateJourneyProgress(journeyId);

      return step;
    } catch (error) {
      logger.error('completeStep error --->', error);
      throw error;
    }
  }

  private async updateJourneyProgress(journeyId: string): Promise<void> {
    logger.debug(`updateJourneyProgress ---> journeyId: ${journeyId}`);
    const journey = await this.getJourney(journeyId);
    const completedSteps = journey.steps.filter(
      (s) => s.status === StepStatus.COMPLETED,
    ).length;
    const totalSteps = journey.steps.length;

    journey.currentStep = completedSteps;
    journey.totalSteps = totalSteps;
    journey.progressPercentage =
      totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

    if (completedSteps === totalSteps && totalSteps > 0) {
      journey.status = JourneyStatus.COMPLETED;
      journey.completedAt = new Date();
    } else if (completedSteps > 0) {
      journey.status = JourneyStatus.IN_PROGRESS;
      if (!journey.startedAt) {
        journey.startedAt = new Date();
      }
    }

    await this.journeyRepository.save(journey);
  }
}