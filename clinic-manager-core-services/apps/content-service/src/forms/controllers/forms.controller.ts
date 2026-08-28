import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { FormsService } from '../services/forms.service';
import { CreateFormDto } from '../dto/form.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';

@ApiTags('forms')
@Controller('forms')
export class FormsController {
  constructor(private readonly formsService: FormsService) {}

  @Post()
  @ApiOperation({ summary: 'creates a form' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'form created successfully',
  })
  createForm(@Body() createFormDto: CreateFormDto) {
    return this.formsService.createForm(createFormDto);
  }

  @Get()
  @ApiOperation({ summary: 'gets all forms' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'forms fetched successfully',
  })
  findAll() {
    return this.formsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'gets a form' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'form fetched successfully',
  })
  findOne(@Param('id') id: string) {
    return this.formsService.findOne(id);
  }
}
