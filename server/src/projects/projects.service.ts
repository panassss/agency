import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma } from '../generated/prisma/client.js';
import { paginate } from '../common/dto/pagination-query.dto.js';
import { uniqueSlug } from '../common/utils/slugify.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { ProjectSort, ProjectsQueryDto } from './dto/projects-query.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';

const WITH_SERVICE = {
  service: { select: { id: true, slug: true, title: true } },
} satisfies Prisma.ProjectInclude;

const ORDER_BY: Record<ProjectSort, Prisma.ProjectOrderByWithRelationInput[]> =
  {
    newest: [{ date: 'desc' }, { id: 'desc' }],
    oldest: [{ date: 'asc' }, { id: 'asc' }],
    title: [{ title: 'asc' }],
  };

const RELATED_LIMIT = 3;

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ProjectsQueryDto) {
    const where: Prisma.ProjectWhereInput = {
      featured: query.featured,
      service: query.service ? { slug: query.service } : undefined,
      OR: query.search
        ? ['title', 'subtitle', 'client'].map((field) => ({
            [field]: { contains: query.search, mode: 'insensitive' },
          }))
        : undefined,
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.project.findMany({
        where,
        include: WITH_SERVICE,
        orderBy: ORDER_BY[query.sort],
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.project.count({ where }),
    ]);
    return paginate(items, total, query);
  }

  async findBySlug(slug: string) {
    const project = await this.prisma.project.findUnique({
      where: { slug },
      include: WITH_SERVICE,
    });
    if (!project) {
      throw new NotFoundException('Проєкт не знайдено');
    }
    return {
      ...project,
      related: await this.findRelated(project.id, project.serviceId),
    };
  }

  /** Projects of the same service come first; the rest is filled with the newest others. */
  private async findRelated(projectId: number, serviceId: number) {
    const sameService = await this.prisma.project.findMany({
      where: { serviceId, id: { not: projectId } },
      include: WITH_SERVICE,
      orderBy: ORDER_BY.newest,
      take: RELATED_LIMIT,
    });
    if (sameService.length === RELATED_LIMIT) {
      return sameService;
    }
    const others = await this.prisma.project.findMany({
      where: { serviceId: { not: serviceId }, id: { not: projectId } },
      include: WITH_SERVICE,
      orderBy: ORDER_BY.newest,
      take: RELATED_LIMIT - sameService.length,
    });
    return [...sameService, ...others];
  }

  async create(dto: CreateProjectDto) {
    await this.assertServiceExists(dto.serviceId);
    const slug =
      dto.slug ??
      (await uniqueSlug(dto.title, async (s) =>
        Boolean(await this.prisma.project.findUnique({ where: { slug: s } })),
      ));
    return this.prisma.project.create({
      data: {
        ...dto,
        slug,
        date: new Date(dto.date),
        gallery: dto.gallery ?? [],
      },
      include: WITH_SERVICE,
    });
  }

  async update(id: number, dto: UpdateProjectDto) {
    if (dto.serviceId !== undefined) {
      await this.assertServiceExists(dto.serviceId);
    }
    return this.prisma.project.update({
      where: { id },
      data: { ...dto, date: dto.date ? new Date(dto.date) : undefined },
      include: WITH_SERVICE,
    });
  }

  async remove(id: number) {
    await this.prisma.project.delete({ where: { id } });
  }

  private async assertServiceExists(serviceId: number) {
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
    });
    if (!service) {
      throw new BadRequestException('Вказана послуга не існує');
    }
  }
}
