import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTestimonialDto } from './dto/create-testimonial.dto.js';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto.js';

@Injectable()
export class TestimonialsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.testimonial.findMany({ orderBy: { id: 'asc' } });
  }

  create(dto: CreateTestimonialDto) {
    return this.prisma.testimonial.create({ data: dto });
  }

  update(id: number, dto: UpdateTestimonialDto) {
    return this.prisma.testimonial.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.prisma.testimonial.delete({ where: { id } });
  }
}
