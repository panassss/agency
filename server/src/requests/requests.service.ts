import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, RequestStatus } from '../generated/prisma/client.js';
import { paginate } from '../common/dto/pagination-query.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateRequestDto } from './dto/create-request.dto.js';
import { RequestsQueryDto } from './dto/requests-query.dto.js';
import { UpdateRequestStatusDto } from './dto/update-request-status.dto.js';

const WITH_SERVICE = {
  service: { select: { id: true, slug: true, title: true } },
} satisfies Prisma.RequestInclude;

const WITH_SERVICE_AND_USER = {
  ...WITH_SERVICE,
  user: { select: { id: true, name: true, email: true } },
} satisfies Prisma.RequestInclude;

const SEARCH_FIELDS = [
  'firstName',
  'lastName',
  'email',
  'phone',
  'message',
] as const;

@Injectable()
export class RequestsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRequestDto, userId?: number) {
    if (dto.serviceId !== undefined) {
      const service = await this.prisma.service.findUnique({
        where: { id: dto.serviceId },
      });
      if (!service) {
        throw new BadRequestException('Вказана послуга не існує');
      }
    }
    return this.prisma.request.create({
      data: { ...dto, userId },
      include: WITH_SERVICE,
    });
  }

  findMine(userId: number) {
    return this.prisma.request.findMany({
      where: { userId },
      include: WITH_SERVICE,
      orderBy: { createdAt: 'desc' },
    });
  }

  async cancel(id: number, userId: number) {
    const request = await this.prisma.request.findUnique({ where: { id } });
    if (!request) {
      throw new NotFoundException('Заявку не знайдено');
    }
    if (request.userId !== userId) {
      throw new ForbiddenException('Ви можете скасувати лише власну заявку');
    }
    if (request.status !== RequestStatus.NEW) {
      throw new ConflictException(
        'Скасувати можна лише нову заявку, яку ще не взяли в роботу',
      );
    }
    return this.prisma.request.update({
      where: { id },
      data: { status: RequestStatus.CANCELLED },
      include: WITH_SERVICE,
    });
  }

  async findAll(query: RequestsQueryDto) {
    const where: Prisma.RequestWhereInput = {
      status: query.status,
      OR: query.search
        ? SEARCH_FIELDS.map((field) => ({
            [field]: { contains: query.search, mode: 'insensitive' },
          }))
        : undefined,
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.request.findMany({
        where,
        include: WITH_SERVICE_AND_USER,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.request.count({ where }),
    ]);
    return paginate(items, total, query);
  }

  updateStatus(id: number, dto: UpdateRequestStatusDto) {
    return this.prisma.request.update({
      where: { id },
      data: { status: dto.status },
      include: WITH_SERVICE_AND_USER,
    });
  }

  async remove(id: number) {
    await this.prisma.request.delete({ where: { id } });
  }
}
