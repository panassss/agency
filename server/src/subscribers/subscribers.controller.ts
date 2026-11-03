import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AdminOnly } from '../common/decorators/admin-only.decorator.js';
import { CreateSubscriberDto } from './dto/create-subscriber.dto.js';
import { SubscribersService } from './subscribers.service.js';

@ApiTags('subscribers')
@Controller('subscribers')
export class SubscribersController {
  constructor(private readonly subscribers: SubscribersService) {}

  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post()
  create(@Body() dto: CreateSubscriberDto) {
    return this.subscribers.create(dto);
  }

  @AdminOnly()
  @Get()
  findAll() {
    return this.subscribers.findAll();
  }
}
