import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Thread } from './entities/threads.entity';
import { Message } from './entities/message.entity';
import { Attachment } from './entities/attachments.entity';
import { MessageRead } from './entities/messageReads.entity';
import { ThreadTag } from './entities/threadTags.entity';
import { MessageGateway } from './message.gateway';
import { ThreadStar } from './entities/threadStar.entity';
import { HttpModule } from '@nestjs/axios';
import { Dropdown } from 'src/master/entities/dropdown.entity';

@Module({
  controllers: [MessageController],
  providers: [MessageService, MessageGateway],
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([
      Thread,
      Message,
      Attachment,
      MessageRead,
      ThreadTag,
      ThreadStar,
      Dropdown,
    ]),
  ],
  exports: [MessageService],
})
export class MessageModule {}
