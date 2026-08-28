import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { HttpStatus } from '@pallmall/shared-types';
import { ProceduresService } from './procedures.service';
import { CreateProcedureDto, listProcedureDto } from './dto/procedure.dto';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
@ApiTags('procedures')
@Controller('procedures')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class ProceduresController {
  constructor(private readonly proceduresService: ProceduresService) {}

  @Post()
  @ApiOperation({ summary: 'Create new procedure' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Procedure created successfully',
  })
  create(@Body() createProcedureDto: CreateProcedureDto) {
    return this.proceduresService.createProcedures(createProcedureDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all published procedures with filtering' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Procedure list retrieved',
  })
  findAll(@Query() query: listProcedureDto) {
    return this.proceduresService.findAllProcedures(query);
  }
}
