import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { UserProfile } from './entities/user-profile.entity';
import { User } from '../users/entities/user.entity';
import { UserProfileService } from './user-profile.service';
import { UserProfileController } from './user-profile.controller';
import { PatientInformation } from '../users/entities/patient-information.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserProfile, User, PatientInformation]),
    HttpModule,
    UsersModule,
  ],
  controllers: [UserProfileController],
  providers: [UserProfileService],
  exports: [TypeOrmModule, UserProfileService],
})
export class UserProfileModule {}
