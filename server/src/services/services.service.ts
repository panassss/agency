import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { uniqueSlug } from '../common/utils/slugify.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateServiceDto } from './dto/create-service.dto.js';
import { UpdateServiceDto } from './dto/update-service.dto.js';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.service.findMany({
      orderBy: [{ order: 'asc' }, { id: 'asc' }],
    });
  }

  async findBySlug(slug: string) {
    const service = await this.prisma.service.findUnique({
      where: { slug },
      include: { _count: { select: { projects: true } } },
    });
    if (!service) {
      throw new NotFoundException('Послугу не знайдено');
    }
    const { _count, ...rest } = service;
    return { ...rest, projectsCount: _count.projects };
  }

  async create(dto: CreateServiceDto) {
    const slug =
      dto.slug ??
      (await uniqueSlug(dto.title, async (s) =>
        Boolean(await this.prisma.service.findUnique({ where: { slug: s } })),
      ));
    return this.prisma.service.create({ data: { ...dto, slug } });
  }

  update(id: number, dto: UpdateServiceDto) {
    return this.prisma.service.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    const projects = await this.prisma.project.count({
      where: { serviceId: id },
    });
    if (projects > 0) {
      throw new ConflictException(
        `Неможливо видалити послугу: до неї прив’язано проєктів — ${projects}`,
      );
    }
    await this.prisma.service.delete({ where: { id } });
  }
}
