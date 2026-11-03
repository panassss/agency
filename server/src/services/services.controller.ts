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
import { CreateServiceDto } from './dto/create-service.dto.js';
import { UpdateServiceDto } from './dto/update-service.dto.js';
import { ServicesService } from './services.service.js';

@ApiTags('services')
@Controller('services')
export class ServicesController {
  constructor(private readonly services: ServicesService) {}

  @Get()
  findAll() {
    return this.services.findAll();
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.services.findBySlug(slug);
  }

  @AdminOnly()
  @Post()
  create(@Body() dto: CreateServiceDto) {
    return this.services.create(dto);
  }

  @AdminOnly()
  @Patch(':id')
  update(@Param('id', ParseIdPipe) id: number, @Body() dto: UpdateServiceDto) {
    return this.services.update(id, dto);
  }

  @AdminOnly()
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIdPipe) id: number) {
    return this.services.remove(id);
  }
}
