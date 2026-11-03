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
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdminOnly } from '../common/decorators/admin-only.decorator.js';
import { ParseIdPipe } from '../common/pipes/parse-id.pipe.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { ProjectsQueryDto } from './dto/projects-query.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';
import { ProjectsService } from './projects.service.js';

@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Get()
  findAll(@Query() query: ProjectsQueryDto) {
    return this.projects.findAll(query);
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.projects.findBySlug(slug);
  }

  @AdminOnly()
  @Post()
  create(@Body() dto: CreateProjectDto) {
    return this.projects.create(dto);
  }

  @AdminOnly()
  @Patch(':id')
  update(@Param('id', ParseIdPipe) id: number, @Body() dto: UpdateProjectDto) {
    return this.projects.update(id, dto);
  }

  @AdminOnly()
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIdPipe) id: number) {
    return this.projects.remove(id);
  }
}
