import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './controller/reports-admin.controller';
import { ReportsService } from './service/reports-admin.service';
import { Task } from '../tasks/entities/task.entity';
import { FormSubmission } from '../forms/entities/form.submission.entity';
import { Content } from 'src/content/entities/content.entity';
import { ReportsStaffController } from './controller/reports-staff.controller';
import { ReportsStaffsService } from './service/reports-staff.service';
import { Dropdown } from 'src/master/entities/dropdown.entity';
import { TaskSubmission } from 'src/tasks/entities/task-submissions.entity';
import { FormAnswer } from 'src/forms/entities/form.answer.entity';
import { GuestUser } from 'src/home/entities/guest-user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Task,
      FormSubmission,
      Content,
      Dropdown,
      TaskSubmission,
      FormAnswer,
      GuestUser,
    ]),
  ],
  controllers: [ReportsController, ReportsStaffController],
  providers: [ReportsService, ReportsStaffsService],
})
export class ReportsModule {}
