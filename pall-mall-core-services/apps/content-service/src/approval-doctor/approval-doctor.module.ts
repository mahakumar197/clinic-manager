import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApprovalDoctorService } from './approval-doctor.service';
import { ApprovalDoctorController } from './approval-doctor.controller';

// Entities
import { FormSubmission } from '../forms/entities/form.submission.entity';
import { FormApproval } from './entities/form-approval.entity';
import { Task } from '../tasks/entities/task.entity';
import { Form } from '../forms/entities/form.entity';
import { Dropdown } from '../master/entities/dropdown.entity';
// Import the new entities
import { ApprovalDoctorComment } from './entities/approval-doctor-comments.entity';
import { ApprovalDoctorQuickResponse } from './entities/approval-doctor-quick_response.entity';
import { TaskUpload } from 'src/tasks/entities/task-upload.entity';
import { TaskSubmission } from 'src/tasks/entities/task-submissions.entity';
import { TaskESignature } from 'src/tasks/entities/task.eSignature.entity';
import { TaskComment } from 'src/tasks/entities/task-comments.entity';
import { ApprovalAdminComment } from 'src/approvals-admin/entities/approval-admin-comments.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FormSubmission,
      FormApproval,
      Task,
      Form,
      Dropdown,
      ApprovalDoctorComment,
      ApprovalDoctorQuickResponse,
      TaskUpload,
      TaskSubmission,
      TaskESignature,
      TaskComment,
      ApprovalAdminComment,
    ]),
  ],
  controllers: [ApprovalDoctorController],
  providers: [ApprovalDoctorService],
})
export class ApprovalDoctorModule {}
