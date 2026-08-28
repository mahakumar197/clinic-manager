import { Module } from '@nestjs/common';
import { DropdownsService } from './service/dropdowns.service';
import { DropdownsController } from './controller/dropdowns.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dropdown } from './entities/dropdown.entity';
import { FiltersService } from './service/filters.service';
import { Filter } from './entities/filter.entity';
import { FiltersController } from './controller/filters.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Dropdown, Filter])],
  controllers: [DropdownsController, FiltersController],
  providers: [DropdownsService, FiltersService],
})
export class MasterModule {}
