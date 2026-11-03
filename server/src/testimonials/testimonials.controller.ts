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
import { CreateTestimonialDto } from './dto/create-testimonial.dto.js';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto.js';
import { TestimonialsService } from './testimonials.service.js';

@ApiTags('testimonials')
@Controller('testimonials')
export class TestimonialsController {
  constructor(private readonly testimonials: TestimonialsService) {}

  @Get()
  findAll() {
    return this.testimonials.findAll();
  }

  @AdminOnly()
  @Post()
  create(@Body() dto: CreateTestimonialDto) {
    return this.testimonials.create(dto);
  }

  @AdminOnly()
  @Patch(':id')
  update(
    @Param('id', ParseIdPipe) id: number,
    @Body() dto: UpdateTestimonialDto,
  ) {
    return this.testimonials.update(id, dto);
  }

  @AdminOnly()
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIdPipe) id: number) {
    return this.testimonials.remove(id);
  }
}
