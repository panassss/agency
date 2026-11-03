import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Matches,
  Min,
} from 'class-validator';
import { Trim } from '../../common/dto/trim.js';

export class CreateProjectDto {
  @ApiProperty({ example: 'Редизайн інтернет-магазину' })
  @Trim()
  @IsString({ message: 'Назва має бути рядком' })
  @Length(2, 120, { message: 'Назва має містити від 2 до 120 символів' })
  title: string;

  @ApiPropertyOptional({ example: 'redyzain-internet-mahazynu' })
  @IsOptional()
  @Trim()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug може містити лише малі латинські літери, цифри та дефіси',
  })
  @Length(2, 120, { message: 'Slug має містити від 2 до 120 символів' })
  slug?: string;

  @ApiProperty({ example: 'UX-дослідження та новий інтерфейс' })
  @Trim()
  @IsString({ message: 'Підзаголовок має бути рядком' })
  @Length(2, 160, { message: 'Підзаголовок має містити від 2 до 160 символів' })
  subtitle: string;

  @ApiProperty({ example: 1 })
  @IsInt({ message: 'Оберіть послугу' })
  @Min(1, { message: 'Оберіть послугу' })
  serviceId: number;

  @ApiProperty({ example: 'ТОВ «Зерно»' })
  @Trim()
  @IsString({ message: 'Клієнт має бути рядком' })
  @Length(2, 120, {
    message: 'Назва клієнта має містити від 2 до 120 символів',
  })
  client: string;

  @ApiProperty({ example: 'Київ, вул. Хрещатик, 22' })
  @Trim()
  @IsString({ message: 'Локація має бути рядком' })
  @Length(2, 160, { message: 'Локація має містити від 2 до 160 символів' })
  location: string;

  @ApiProperty({ example: '2025-08-23' })
  @IsDateString({}, { message: 'Вкажіть коректну дату' })
  date: string;

  @ApiProperty({ example: '/img/projects/project-1.webp' })
  @Trim()
  @IsString({ message: 'Обкладинка має бути рядком' })
  @Length(1, 500, { message: 'Шлях до обкладинки має містити до 500 символів' })
  coverImage: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray({ message: 'Галерея має бути масивом' })
  @ArrayMaxSize(10, { message: 'Галерея може містити не більше 10 зображень' })
  @IsString({ each: true, message: 'Кожне зображення галереї має бути рядком' })
  @Length(1, 500, {
    each: true,
    message: 'Шлях до зображення має містити до 500 символів',
  })
  gallery?: string[];

  @ApiProperty()
  @Trim()
  @IsString({ message: 'Опис виклику має бути рядком' })
  @Length(10, 5000, {
    message: 'Опис виклику має містити від 10 до 5000 символів',
  })
  challenge: string;

  @ApiProperty()
  @Trim()
  @IsString({ message: 'Опис рішення має бути рядком' })
  @Length(10, 5000, {
    message: 'Опис рішення має містити від 10 до 5000 символів',
  })
  solution: string;

  @ApiProperty()
  @Trim()
  @IsString({ message: 'Опис результату має бути рядком' })
  @Length(10, 5000, {
    message: 'Опис результату має містити від 10 до 5000 символів',
  })
  result: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean({ message: 'Поле «featured» має бути логічним значенням' })
  featured?: boolean;
}
