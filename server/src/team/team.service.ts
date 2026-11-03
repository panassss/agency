import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTeamMemberDto } from './dto/create-team-member.dto.js';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto.js';

@Injectable()
export class TeamService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.teamMember.findMany({
      orderBy: [{ order: 'asc' }, { id: 'asc' }],
    });
  }

  create(dto: CreateTeamMemberDto) {
    return this.prisma.teamMember.create({ data: dto });
  }

  update(id: number, dto: UpdateTeamMemberDto) {
    return this.prisma.teamMember.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.prisma.teamMember.delete({ where: { id } });
  }
}
