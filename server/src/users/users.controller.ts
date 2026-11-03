import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdminOnly } from '../common/decorators/admin-only.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { ParseIdPipe } from '../common/pipes/parse-id.pipe.js';
import type { AuthUser } from '../common/types/auth-user.js';
import { UpdateRoleDto } from './dto/update-role.dto.js';
import { UsersService } from './users.service.js';

@ApiTags('users')
@AdminOnly()
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  findAll() {
    return this.users.findAll();
  }

  @Patch(':id/role')
  updateRole(
    @Param('id', ParseIdPipe) id: number,
    @Body() dto: UpdateRoleDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.users.updateRole(id, dto, user.id);
  }
}
