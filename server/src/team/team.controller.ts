import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdminOnly } from '../common/decorators/admin-only.decorator.js';
import { ParseIdPipe } from '../common/pipes/parse-id.pipe.js';
import { CreateTeamMemberDto } from './dto/create-team-member.dto.js';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto.js';
import { TeamService } from './team.service.js';

@ApiTags('team')
@Controller('team')
export class TeamController {
  constructor(private readonly team: TeamService) {}

  @Get()
  findAll() {
    return this.team.findAll();
  }

  @AdminOnly()
  @Post()
  create(@Body() dto: CreateTeamMemberDto) {
    return this.team.create(dto);
  }

  @AdminOnly()
  @Patch(':id')
  update(
    @Param('id', ParseIdPipe) id: number,
    @Body() dto: UpdateTeamMemberDto,
  ) {
    return this.team.update(id, dto);
  }

  @AdminOnly()
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIdPipe) id: number) {
    return this.team.remove(id);
  }
}
