import { Module } from '@nestjs/common';
import { ApprovalsAdminService } from './approvals-admin.service';
import { ApprovalsAdminController } from './approvals-admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FormSubmission } from 'src/forms/entities/form.submission.entity';
import { ApprovalsAdmin } from './entities/approvals-admin.entity';
import { Task } from 'src/tasks/entities/task.entity';
import { Dropdown } from 'src/master/entities/dropdown.entity';
import { ApprovalAdminComment } from './entities/approval-admin-comments.entity';
import { TaskSubmission } from 'src/tasks/entities/task-submissions.entity';
import { TaskUpload } from 'src/tasks/entities/task-upload.entity';
import { TaskESignature } from 'src/tasks/entities/task.eSignature.entity';
import { FormSubmissionService } from 'src/forms/services/form.submission.service';
import { TaskTrack } from 'src/tasks/entities/task-track.entity';
import { FormQuestion } from 'src/forms/entities/form.question.entity';
import { TaskComment } from 'src/tasks/entities/task-comments.entity';
import { ApprovalDoctorComment } from 'src/approval-doctor/entities/approval-doctor-comments.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FormSubmission,
      TaskTrack,
      FormQuestion,
      ApprovalsAdmin,
      Task,
      Dropdown,
      ApprovalAdminComment,
      TaskSubmission,
      TaskUpload,
      TaskESignature,
      TaskComment,
      ApprovalDoctorComment
    ]),
  ],
  controllers: [ApprovalsAdminController],
  providers: [ApprovalsAdminService, FormSubmissionService],
})
export class ApprovalsAdminModule {}
