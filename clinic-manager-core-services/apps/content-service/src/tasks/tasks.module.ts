import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksService } from './service/tasks.service';
import { TasksController } from './controller/tasks.controller';
import { Task } from './entities/task.entity';
import { TaskActivity } from './entities/task-activity.entity';
import { TaskComment } from './entities/task-comments.entity';
import { TaskAttachment } from './entities/task-attachment.entity';
import { TaskTemplate } from './entities/task-templates.entity';
import { TaskConfig } from './entities/task-config.entity';
import { TaskCommentsService } from './service/tasks-comments.service';
import { TaskCommentsController } from './controller/tasks-comments.controller';
import { TaskAssignee } from './entities/task-assignees.entity';
import { TasksAttachmentsController } from './controller/tasks-attachments.controller';
import { TaskMobileController } from './controller/task-mobile.controller';
import { TasksAttachmentService } from './service/tasks-attachment.service';
import { TaskTemplatesService } from './service/task-templates.service';
import { TaskMobileService } from './service/task-mobile.service';
import { TaskTemplatesController } from './controller/tasks-templates.controller';
import { TaskAnalyticsService } from './service/task-analytics.service';
import { TaskAnalyticsController } from './controller/task-analytics.controller';
import { PassportModule } from '@nestjs/passport';
import { AuthModule } from '@pallmall/shared-types';
import { HttpModule } from '@nestjs/axios';
import { Dropdown } from 'src/master/entities/dropdown.entity';
import { Form } from 'src/forms/entities/form.entity';
import { ContentService } from 'src/content/content.service';
import { FormsService } from 'src/forms/services/forms.service';
import { Content } from 'src/content/entities/content.entity';
import { TaskTrack } from './entities/task-track.entity';
import { TaskESignature } from './entities/task.eSignature.entity';
import { TaskUpload } from './entities/task-upload.entity';
import { FormSubmission } from 'src/forms/entities/form.submission.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Task,
      TaskActivity,
      TaskComment,
      TaskAttachment,
      TaskTemplate,
      TaskConfig,
      TaskAssignee,
      TaskTrack,
      TaskESignature,
      TaskUpload,
      Dropdown,
      Content,
      Form,
      FormSubmission,
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    AuthModule,
    HttpModule,
  ],

  controllers: [
    TasksController,
    TaskCommentsController,
    TasksAttachmentsController,
    TaskTemplatesController,
    TaskMobileController,
    TaskAnalyticsController,
  ],

  providers: [
    TasksService,
    TaskCommentsService,
    TasksAttachmentService,
    TaskTemplatesService,
    TaskMobileService,
    TaskAnalyticsService,
    ContentService,
    FormsService,
  ],
  exports: [TasksService],
})
export class TasksModule {}
