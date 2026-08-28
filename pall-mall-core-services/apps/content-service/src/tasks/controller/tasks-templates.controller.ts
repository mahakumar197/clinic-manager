import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiResponse,
  ApiOperation,
  ApiBody,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { TaskTemplatesService } from '../service/task-templates.service';
import { CreateTaskTemplateDto, UpdateTaskTemplateDto } from '../dto/task.dto';
import { HttpStatus } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Task Templates')
@Controller('task-templates')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class TaskTemplatesController {
  constructor(private readonly templatesService: TaskTemplatesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task template' })
  @ApiBody({ type: CreateTaskTemplateDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Task template created successfully',
  })
  create(@Body() dto: CreateTaskTemplateDto, @Req() req) {
    return this.templatesService.createTaskTemplate(dto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get a task template' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Task template fetched successfully',
  })
  find() {
    return this.templatesService.getTaskTemplate();
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a task template by id' })
  @ApiBody({ type: UpdateTaskTemplateDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Task template updated successfully',
  })
  update(@Param('id') id: string, @Body() dto: UpdateTaskTemplateDto) {
    return this.templatesService.updateTaskTemplate(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a task template by id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Task template deleted successfully',
  })
  delete(@Param('id') id: string) {
    return this.templatesService.deleteTaskTemplate(id);
  }
}
