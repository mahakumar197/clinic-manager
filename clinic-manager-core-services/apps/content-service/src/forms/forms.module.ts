import { Module } from '@nestjs/common';
import { FormsService } from './services/forms.service';
import { FormsController } from './controllers/forms.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Form } from './entities/form.entity';
import { FormSubmission } from './entities/form.submission.entity';
import { FormQuestion } from './entities/form.question.entity';
import { FormAnswer } from './entities/form.answer.entity';
import { FormResponse } from './entities/form.response.entity';
import { FormQuestionsController } from './controllers/form.questions.controller';
import { FormQuestionsService } from './services/form.questions.service';
import { FormSubmissionController } from './controllers/form.submission.controller';
import { FormSubmissionService } from './services/form.submission.service';
import { FormResponseController } from './controllers/form.response.controller';
import { FormResponseService } from './services/form.response.service';
import { Task } from 'src/tasks/entities/task.entity';
import { TaskTrack } from 'src/tasks/entities/task-track.entity';
import { FormFieldMapping } from './entities/form.field.mapping.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Form,
      FormSubmission,
      FormQuestion,
      FormAnswer,
      FormResponse,
      Task,
      TaskTrack,
      FormFieldMapping,
    ]),
  ],
  controllers: [
    FormsController,
    FormQuestionsController,
    FormSubmissionController,
    FormResponseController,
  ],
  providers: [FormsService, FormQuestionsService, FormSubmissionService, FormResponseService],
})
export class FormsModule {}
