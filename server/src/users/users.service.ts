import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { UpdateRoleDto } from './dto/update-role.dto.js';

const PUBLIC_USER_FIELDS = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
} as const;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: { ...PUBLIC_USER_FIELDS, _count: { select: { requests: true } } },
    });
  }

  updateRole(id: number, dto: UpdateRoleDto, currentUserId: number) {
    if (id === currentUserId) {
      throw new BadRequestException('Не можна змінити власну роль');
    }
    return this.prisma.user.update({
      where: { id },
      data: { role: dto.role },
      select: PUBLIC_USER_FIELDS,
    });
  }
}
