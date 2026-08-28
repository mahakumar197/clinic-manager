import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
} from '@nestjs/common';
import { FormQuestionsService } from '../services/form.questions.service';
import { CreateFormQuestionDto, UpdateFormQuestionDto } from '../dto/form.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
@ApiTags('forms-Questions')
@Controller('forms-Questions')
export class FormQuestionsController {
  constructor(private readonly formQuestionsService: FormQuestionsService) {}

  @Post()
  @ApiOperation({ summary: 'creates a form question' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'form question added successfully',
  })
  addFormQuestion(@Body() createFormDto: CreateFormQuestionDto) {
    return this.formQuestionsService.addFormQuestion(createFormDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'deletes a form question' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'form question deleted successfully',
  })
  removeFormQuestion(@Param('id') id: string) {
    return this.formQuestionsService.removeFormQuestion(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'updates a form question' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'form question updated successfully',
  })
  updateFormQuestion(
    @Param('id') id: string,
    @Body() updateFormQuestionDto: UpdateFormQuestionDto,
  ) {
    return this.formQuestionsService.updateFormQuestion(
      id,
      updateFormQuestionDto,
    );
  }
}
