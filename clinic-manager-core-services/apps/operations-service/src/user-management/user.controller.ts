import {
  Controller,
  Post,
  Get,
  Query,
  Body,
  Req,
  HttpStatus,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';
import {
  CreateUserDto,
  RolePermissionDto,
  SuspendUserDto,
  UnsuspendUserDto,
  ListUsersDto,
  UpdateUserDto,
} from './dto/user-management.dto';
import { USER_MANAGEMENT_MESSAGES } from '@pallmall/common-utils';

@ApiTags('user-management')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('add-user')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: USER_MANAGEMENT_MESSAGES.USER_CREATED,
  })
  async createUser(@Body() dto: CreateUserDto, @Req() req: any) {
    const actorId = req?.user?.userId ?? req?.user?.id ?? null;
    return this.userService.createUser(dto, actorId);
  }

  @Get('view/:id')
  @ApiOperation({ summary: 'Get single user for edit view' })
  @ApiParam({ name: 'id', description: 'User id', required: true })
  @ApiResponse({
    status: HttpStatus.OK,
    description: USER_MANAGEMENT_MESSAGES.USER_DATA_FETCHED,
  })
  async viewUser(@Param('id') id: string) {
    return this.userService.getUserById(id);
  }

  @Get()
  @ApiOperation({ summary: 'List of all users' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: USER_MANAGEMENT_MESSAGES.USER_DATA_FETCHED,
  })
  async listUsers(@Query() query: ListUsersDto) {
    return this.userService.listUsers(query as any);
  }

  @Post('role-permissions')
  @ApiOperation({ summary: 'Role based permissions' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: USER_MANAGEMENT_MESSAGES.PERMISSION_UPDATED,
  })
  async setRolePermission(@Body() dto: RolePermissionDto, @Req() req: any) {
    const actorId = req?.user?.userId ?? req?.user?.id ?? null;
    return this.userService.setRolePermission(dto as any, actorId);
  }

  @Get('role-permissions/list')
  @ApiOperation({ summary: 'Get role permissions grid for UI' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: USER_MANAGEMENT_MESSAGES.PERMISSIONS_FETCHED,
  })
  async rolePermissionsList() {
    return this.userService.getRolePermissionsList();
  }

  @Get('cards-counts')
  @ApiOperation({ summary: 'Get user cards counts' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: USER_MANAGEMENT_MESSAGES.USER_CARDS_FETCHED,
  })
  async cardsCounts() {
    return this.userService.getCardsCounts();
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile and permissions' })
  @ApiQuery({ name: 'userId', required: true, description: 'User id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: USER_MANAGEMENT_MESSAGES.USER_DATA_FETCHED,
  })
  async profile(@Req() req: any, @Query('userId') userIdQuery?: string) {
    const userId = userIdQuery ?? req?.user?.userId ?? req?.user?.id ?? null;
    const actorId = req?.user?.userId ?? req?.user?.id ?? null;
    return this.userService.getProfile(userId);
  }

  @Post('update')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: USER_MANAGEMENT_MESSAGES.USER_UPDATED,
  })
  async updateUser(@Body() dto: UpdateUserDto, @Req() req: any) {
    const actorId = req?.user?.userId ?? req?.user?.id ?? null;
    return this.userService.updateUser(dto as any, actorId);
  }

  @Post('suspend')
  @ApiOperation({ summary: 'Suspend a user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: USER_MANAGEMENT_MESSAGES.USER_SUSPENDED,
  })
  async suspendUser(@Body() dto: SuspendUserDto, @Req() req: any) {
    const actorId = req?.user?.userId ?? req?.user?.id ?? null;
    return this.userService.suspendUser(dto as any, actorId);
  }

  @Post('unsuspend')
  @ApiOperation({ summary: 'Unsuspend a user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: USER_MANAGEMENT_MESSAGES.USER_UNSUSPENDED,
  })
  async unsuspendUser(@Body() dto: UnsuspendUserDto, @Req() req: any) {
    const actorId = req?.user?.userId ?? req?.user?.id ?? null;
    return this.userService.unsuspendUser(dto as any, actorId);
  }
}
