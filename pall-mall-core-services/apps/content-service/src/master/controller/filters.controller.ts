import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Req,
  Query,
} from '@nestjs/common';
import { FiltersService } from '../service/filters.service';
import { CreateFilterDto } from '../dto/master.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Master API - filters')
@Controller('filters')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class FiltersController {
  constructor(private readonly tasksFilterService: FiltersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a user filter' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Filter saved successfully',
  })
  createFilter(@Body() createFilterDto: CreateFilterDto, @Req() req) {
    return this.tasksFilterService.createFilter(
      createFilterDto,
      req.user.userId,
    );
  }
  @Get()
  @ApiOperation({ summary: 'Get user filters by type' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Filter found successfully',
  })
  getFilter(@Query('type') type: string, @Req() req) {
    return this.tasksFilterService.getFilter(type, req.user.userId);
  }

  @Delete(':filterId')
  @ApiOperation({ summary: 'delete a filter by filterId ' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Filter deleted successfully',
  })
  deleteFilter(@Param('filterId') filterId: string) {
    return this.tasksFilterService.removeFilter(filterId);
  }
}
