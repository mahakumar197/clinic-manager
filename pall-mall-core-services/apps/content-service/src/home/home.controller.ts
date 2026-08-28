import { Controller, Get, Query } from '@nestjs/common';
import { HomeService } from './home.service';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

@ApiTags('Home')
@Controller('api/v1/home')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Get()
  @ApiOperation({
    summary: 'Get home configuration and carousels for guest user',
  })
  @ApiResponse({ status: 200, description: 'Return home config and carousels' })
  @ApiQuery({ name: 'deviceId', required: false })
  async getHomeData(@Query('deviceId') deviceId?: string) {
    return this.homeService.getHomeData({ deviceId });
  }
}
