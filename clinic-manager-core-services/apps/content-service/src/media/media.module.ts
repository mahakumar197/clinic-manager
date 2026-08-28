import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthModule } from '@pallmall/shared-types';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' }), AuthModule],
  controllers: [MediaController],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}
