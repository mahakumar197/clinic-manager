import { Module } from '@nestjs/common';
import { ZohoService } from './services/zoho.service';
import { ZohoController } from './controllers/zoho.controller';
import { ZohoFormsController } from './controllers/zoho-forms.controller';
import { ZohoFormsService } from './services/zoho-forms.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ZohoToken } from './entities/zoho-token.entity';
import { HttpModule } from '@nestjs/axios';
import { AuthModule, JwtStrategy } from '@pallmall/shared-types';
import { ZohoForm } from './entities/zoho-form.entity';
import { ZohoFormFieldMapping } from './entities/zoho-form-field-mapping.entity';
import { ZohoFormToken } from './entities/zoho.forms.token.entity';
import { ZohoWebhookLog } from './entities/zoho-form-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ZohoToken, ZohoForm, ZohoFormFieldMapping, ZohoFormToken, ZohoWebhookLog]),
    HttpModule,
    AuthModule,
  ],
  controllers: [ZohoController, ZohoFormsController],
  providers: [ZohoService, ZohoFormsService, JwtStrategy],
  exports: [ZohoService],
})
export class ZohoModule {}
