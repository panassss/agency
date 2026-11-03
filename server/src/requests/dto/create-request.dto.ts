import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import { NormalizeEmail, Trim } from '../../common/dto/trim.js';

export class CreateRequestDto {
  @ApiProperty({ example: 'Олена' })
  @Trim()
  @IsString({ message: 'Ім’я має бути рядком' })
  @Length(2, 60, { message: 'Ім’я має містити від 2 до 60 символів' })
  firstName: string;

  @ApiProperty({ example: 'Коваль' })
  @Trim()
  @IsString({ message: 'Прізвище має бути рядком' })
  @Length(2, 60, { message: 'Прізвище має містити від 2 до 60 символів' })
  lastName: string;

  @ApiProperty({ example: 'olena@example.com' })
  @NormalizeEmail()
  @IsEmail({}, { message: 'Вкажіть коректну електронну адресу' })
  @MaxLength(120, { message: 'Електронна адреса задовга' })
  email: string;

  @ApiProperty({ example: '+380 67 123 45 67' })
  @Trim()
  @IsString({ message: 'Телефон має бути рядком' })
  @Matches(/^\+?[0-9\s()-]{7,20}$/, {
    message:
      'Вкажіть коректний номер телефону (7–20 символів: цифри, пробіли, дужки, дефіси)',
  })
  phone: string;

  @ApiProperty({ example: 'Хочемо обговорити запуск нового бренду.' })
  @Trim()
  @IsString({ message: 'Повідомлення має бути рядком' })
  @Length(10, 2000, {
    message: 'Повідомлення має містити від 10 до 2000 символів',
  })
  message: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt({ message: 'Некоректна послуга' })
  @Min(1, { message: 'Некоректна послуга' })
  serviceId?: number;
}
