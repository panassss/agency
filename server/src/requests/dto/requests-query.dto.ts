import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { Trim } from '../../common/dto/trim.js';
import { RequestStatus } from '../../generated/prisma/client.js';

export class RequestsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: RequestStatus })
  @IsOptional()
  @IsEnum(RequestStatus, {
    message: 'Статус має бути одним із: NEW, IN_PROGRESS, DONE, CANCELLED',
  })
  status?: RequestStatus;

  @ApiPropertyOptional({
    description: 'Пошук за іменем, поштою, телефоном або текстом',
  })
  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(100, { message: 'Пошуковий запит задовгий' })
  search?: string;
}
