import { Controller, Post, Get, Body, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserProfileService } from './user-profile.service';
import { UpdateUserProfileDto } from './dto/create-user-profile.dto';
import { ApiResponseBuilder, HttpStatus } from '@pallmall/shared-types';
import { USER_PROFILE_MESSAGES } from '@pallmall/common-utils/dist/message';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('user-profile')
@Controller('user-profile')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserProfileController {
  constructor(private readonly profileService: UserProfileService) {}

  @Post()
  @ApiOperation({ summary: 'Create or update user profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile created or updated successfully',
  })
  async createProfile(@Req() req: any, @Body() dto: UpdateUserProfileDto) {
    const profile = await this.profileService.createOrUpdateProfile(
      req.user.userId,
      dto,
    );
    return new ApiResponseBuilder().success(
      profile,
      USER_PROFILE_MESSAGES.PROFILE_CREATED_UPDATED,
      HttpStatus.OK,
    );
  }

  @Get('me')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'Profile fetched successfully' })
  async getProfile(@Req() req: any) {
    const profile = await this.profileService.getProfile(
      req.user.userId,
      req.headers.authorization,
    );
    return new ApiResponseBuilder().success(
      profile,
      USER_PROFILE_MESSAGES.PROFILE_FETCHED,
      HttpStatus.OK,
    );
  }
}
