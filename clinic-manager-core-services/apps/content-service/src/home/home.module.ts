import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';

import { HomeController } from './home.controller';
import { HomeService } from './home.service';
import { AppHomeConfig } from './entities/app-home-config.entity';
import { HomeCarousel } from './entities/home-carousel.entity';
import { GuestUser } from './entities/guest-user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AppHomeConfig, HomeCarousel, GuestUser]),
    HttpModule,
  ],
  controllers: [HomeController],
  providers: [HomeService],
})
export class HomeModule {}
