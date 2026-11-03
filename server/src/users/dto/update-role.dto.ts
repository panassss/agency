import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { Role } from '../../generated/prisma/client.js';

export class UpdateRoleDto {
  @ApiProperty({ enum: Role })
  @IsEnum(Role, { message: 'Роль має бути USER або ADMIN' })
  role: Role;
}
