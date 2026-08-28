import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Patch,
  Param,
  Delete,
  Query,
  Req,
} from '@nestjs/common';
import { TasksService } from '../service/tasks.service';
import { CreateTaskDto, AutoCreateTasksDto } from '../dto/task.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';
import { TaskFilterQueryDto } from '../dto/task.dto';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReturnDocument } from 'typeorm';
@ApiTags('tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'creates a task' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Task created successfully',
  })
  create(@Body() createTaskDto: CreateTaskDto, @Req() req) {
    createTaskDto.userRole = req.user.role;
    return this.tasksService.createTask(createTaskDto, req.user.userId);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'get all tasks' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Tasks list retrieved' })
  findAll(@Query() filters: TaskFilterQueryDto) {
    return this.tasksService.findAllTasks(filters);
  }

  @Get('task-names')
  @ApiOperation({ summary: 'get all task names' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Task names list retrieved',
  })
  getTaskNames(@Query('taskPhase') taskPhase: number) {
    return this.tasksService.listTaskNames(taskPhase);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'get task by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Task found successfully',
  })
  findOne(@Param('id') id: string) {
    return this.tasksService.findOneTask(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'reassign a task' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Task reassign successfully',
  })
  reassign(
    @Param('id') id: string,
    @Query('assignedTo') assignedTo: string,
    @Req() req,
  ) {
    return this.tasksService.reAssignTask(id, assignedTo, req.user.userId);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'update a task' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Task updated successfully',
  })
  update(
    @Param('id') id: string,
    @Body() updateTaskDto: CreateTaskDto,
    @Req() req,
  ) {
    return this.tasksService.updateTask(id, updateTaskDto, req.user.userId);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'delete a task' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Task deleted successfully',
  })
  remove(@Param('id') id: string, @Req() req) {
    return this.tasksService.removeTask(id, req.user.userId);
  }

  @Post('auto-create')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Automatically create tasks for a patient based on phase',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Tasks created successfully',
  })
  autoCreateTasks(@Body() dto: AutoCreateTasksDto, @Req() req: any) {
    const createdBy = req.user?.userId || 'system';
    return this.tasksService.autoCreateTasksForPhase(
      dto.patientId,
      dto.patientPhaseId,
      dto.procedureType,
      createdBy,
      dto.assignedTo,
    );
  }

  @Post('export')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'export tasks' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tasks exported successfully',
  })
  exportTasks(@Query() query: TaskFilterQueryDto, @Body() body: any) {
    const filters: TaskFilterQueryDto = {
      ...query,
      ...body,
      export: true,
    };
    return this.tasksService.findAllTasks(filters);
  }

  @Patch(':id/recover')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Recover deleted task (within 30 days)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Task recovered successfully',
  })
  recoverTask(@Param('id') id: string, @Req() req) {
    return this.tasksService.recoverTask(id, req.user.userId);
  }

  @Post('task-automation')
  @ApiOperation({ summary: 'get all task templates' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Task templates list retrieved',
  })
  taskAutomation(
    @Query('patientPhaseId') patientPhaseId: string,
    @Query('userId') userId: string,
  ) {
    return this.tasksService.taskAutomation(userId, patientPhaseId);
  }

  @Post('webhook-task-automation')
  @ApiOperation({
    summary: 'Webhook-triggered task automation (skips completion checks)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Webhook task automation processed',
  })
  webhookTaskAutomation(
    @Query('currentPatientPhaseId') currentPatientPhaseId: string,
    @Query('NewPatientPhaseId') NewPatientPhaseId: string,
    @Query('userId') userId: string,
    @Body() payload: any,
  ) {
    return this.tasksService.webhookTaskAutomation(
      userId,
      currentPatientPhaseId,
      NewPatientPhaseId,
      payload,
    );
  }
}
