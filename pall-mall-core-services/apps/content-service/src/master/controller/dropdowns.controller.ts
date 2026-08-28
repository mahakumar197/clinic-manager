import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { DropdownsService } from '../service/dropdowns.service';
import { CreateDropdownDto } from '../dto/master.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Master API - Dropdowns')
@Controller('dropdowns')
export class DropdownsController {
  constructor(private readonly dropdownsService: DropdownsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a dropdown value' })
  create(@Body() createDropdownDto: CreateDropdownDto) {
    return this.dropdownsService.create(createDropdownDto);
  }

  @Get(':type')
  findAll(@Param('type') type: string) {
    return this.dropdownsService.findAll(type);
  }

  @Get()
  findAllByIds(@Query('ids') ids: string) {
    const idsArray = ids.split(',');
    return this.dropdownsService.findAllByIds(idsArray);
  }
}
