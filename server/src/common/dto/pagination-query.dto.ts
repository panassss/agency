import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class PaginationQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Номер сторінки має бути цілим числом' })
  @Min(1, { message: 'Номер сторінки має бути не менше 1' })
  page: number = 1;

  @ApiPropertyOptional({ default: 6, minimum: 1, maximum: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Ліміт має бути цілим числом' })
  @Min(1, { message: 'Ліміт має бути не менше 1' })
  @Max(50, { message: 'Ліміт не може перевищувати 50' })
  limit: number = 6;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function paginate<T>(
  items: T[],
  total: number,
  { page, limit }: PaginationQueryDto,
): Paginated<T> {
  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
}
