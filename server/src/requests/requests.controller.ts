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
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AdminOnly } from '../common/decorators/admin-only.decorator.js';
import { Authenticated } from '../common/decorators/authenticated.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { OptionalJwtGuard } from '../common/guards/optional-jwt.guard.js';
import { ParseIdPipe } from '../common/pipes/parse-id.pipe.js';
import type { AuthUser } from '../common/types/auth-user.js';
import { CreateRequestDto } from './dto/create-request.dto.js';
import { RequestsQueryDto } from './dto/requests-query.dto.js';
import { UpdateRequestStatusDto } from './dto/update-request-status.dto.js';
import { RequestsService } from './requests.service.js';

@ApiTags('requests')
@Controller('requests')
export class RequestsController {
  constructor(private readonly requests: RequestsService) {}

  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @UseGuards(OptionalJwtGuard)
  @ApiBearerAuth()
  @Post()
  create(@Body() dto: CreateRequestDto, @CurrentUser() user?: AuthUser) {
    return this.requests.create(dto, user?.id);
  }

  @Authenticated()
  @Get('my')
  findMine(@CurrentUser() user: AuthUser) {
    return this.requests.findMine(user.id);
  }

  @Authenticated()
  @Patch(':id/cancel')
  cancel(@Param('id', ParseIdPipe) id: number, @CurrentUser() user: AuthUser) {
    return this.requests.cancel(id, user.id);
  }

  @AdminOnly()
  @Get()
  findAll(@Query() query: RequestsQueryDto) {
    return this.requests.findAll(query);
  }

  @AdminOnly()
  @Patch(':id')
  updateStatus(
    @Param('id', ParseIdPipe) id: number,
    @Body() dto: UpdateRequestStatusDto,
  ) {
    return this.requests.updateStatus(id, dto);
  }

  @AdminOnly()
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIdPipe) id: number) {
    return this.requests.remove(id);
  }
}
