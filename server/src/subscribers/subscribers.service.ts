import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateSubscriberDto } from './dto/create-subscriber.dto.js';

@Injectable()
export class SubscribersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSubscriberDto) {
    const existing = await this.prisma.subscriber.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Ця адреса вже підписана на розсилку');
    }
    return this.prisma.subscriber.create({ data: dto });
  }

  findAll() {
    return this.prisma.subscriber.findMany({ orderBy: { createdAt: 'desc' } });
  }
}
