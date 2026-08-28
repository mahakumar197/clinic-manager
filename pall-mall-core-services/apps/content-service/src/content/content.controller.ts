import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ContentService } from './content.service';
import {
  ContentIdParamDto,
  CreateContentDto,
  listContentDto,
  UpdateContentDto,
} from './dto/content.dto';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('content')
@Controller('content')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Post()
  @ApiOperation({ summary: 'Create new content' })
  @ApiResponse({ status: 201, description: 'Content created successfully' })
  create(@Body() createContentDto: CreateContentDto) {
    return this.contentService.createContent(createContentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all published content with filtering' })
  @ApiResponse({ status: 200, description: 'Content list retrieved' })
  findAll(@Query() listContentDto: listContentDto) {
    return this.contentService.findAllContent(listContentDto);
  }

  @Get('/dropdown')
  @ApiOperation({
    summary: 'Get all published content for task creation dropdown',
  })
  @ApiResponse({ status: 200, description: 'Content list retrieved' })
  findAllForDropdown() {
    return this.contentService.findAllContentForDropdown();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get content by ID' })
  @ApiResponse({ status: 200, description: 'Content found' })
  findOne(@Param() params: ContentIdParamDto) {
    return this.contentService.findOneContentbyId(params.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update content' })
  @ApiResponse({ status: 200, description: 'Content updated' })
  update(
    @Param('id') id: string,
    @Body() updateContentDto: UpdateContentDto,
    @Req() req,
  ) {
    return this.contentService.updateContent(
      id,
      updateContentDto,
      req.user.role,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete content' })
  @ApiResponse({ status: 200, description: 'Content deleted' })
  remove(@Param('id') id: string, @Req() req) {
    return this.contentService.removeContent(id, req.user.userId);
  }

  @Post(':id/like')
  @ApiOperation({ summary: 'Like content' })
  @ApiResponse({ status: 200, description: 'Content liked' })
  like(@Param('id') id: string, @Req() req) {
    return this.contentService.incrementLikeContent(id, req.user.userId);
  }
}
