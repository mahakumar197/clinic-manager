import { Module } from '@nestjs/common';
import { ElearningsService } from './elearnings.service';
import { ElearningsController } from './elearnings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Procedures } from 'src/procedures/entities/procedures.entity';
import { Content } from 'src/content/entities/content.entity';
import { Elearning } from './entities/elearning.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Procedures, Content, Elearning])],
  controllers: [ElearningsController],
  providers: [ElearningsService],
})
export class ElearningsModule {}
