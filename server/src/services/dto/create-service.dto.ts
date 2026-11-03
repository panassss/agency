import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Matches,
  Min,
} from 'class-validator';
import { Trim } from '../../common/dto/trim.js';

export const SERVICE_ICONS = [
  'content',
  'graphic',
  'digital',
  'web',
  'it',
  'brand',
] as const;

export class CreateServiceDto {
  @ApiProperty({ example: 'Контент-маркетинг' })
  @Trim()
  @IsString({ message: 'Назва має бути рядком' })
  @Length(2, 80, { message: 'Назва має містити від 2 до 80 символів' })
  title: string;

  @ApiPropertyOptional({ example: 'content-marketing' })
  @IsOptional()
  @Trim()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug може містити лише малі латинські літери, цифри та дефіси',
  })
  @Length(2, 80, { message: 'Slug має містити від 2 до 80 символів' })
  slug?: string;

  @ApiProperty()
  @Trim()
  @IsString({ message: 'Короткий опис має бути рядком' })
  @Length(10, 300, {
    message: 'Короткий опис має містити від 10 до 300 символів',
  })
  shortDescription: string;

  @ApiProperty()
  @Trim()
  @IsString({ message: 'Опис має бути рядком' })
  @Length(10, 5000, { message: 'Опис має містити від 10 до 5000 символів' })
  description: string;

  @ApiProperty({ enum: SERVICE_ICONS })
  @IsIn(SERVICE_ICONS, {
    message: `Іконка має бути однією з: ${SERVICE_ICONS.join(', ')}`,
  })
  icon: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt({ message: 'Порядок має бути цілим числом' })
  @Min(0, { message: 'Порядок не може бути від’ємним' })
  order?: number;
}
