import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { PatientInformation } from './entities/patient-information.entity';
import { KafkaProducerModule } from '@pallmall/common-utils';

@Module({
  imports: [TypeOrmModule.forFeature([User, PatientInformation]), KafkaProducerModule],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
