import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { Trim } from '../../common/dto/trim.js';

export const PROJECT_SORTS = ['newest', 'oldest', 'title'] as const;
export type ProjectSort = (typeof PROJECT_SORTS)[number];

export class ProjectsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Пошук за назвою, підзаголовком або клієнтом',
  })
  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(100, { message: 'Пошуковий запит задовгий' })
  search?: string;

  @ApiPropertyOptional({ description: 'Slug послуги' })
  @IsOptional()
  @IsString()
  service?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) =>
    value === 'true' ? true : value === 'false' ? false : value,
  )
  @IsBoolean({ message: 'featured має бути true або false' })
  featured?: boolean;

  @ApiPropertyOptional({ enum: PROJECT_SORTS, default: 'newest' })
  @IsOptional()
  @IsIn(PROJECT_SORTS, { message: `Сортування: ${PROJECT_SORTS.join(', ')}` })
  sort: ProjectSort = 'newest';
}
