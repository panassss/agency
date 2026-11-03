import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Min,
} from 'class-validator';
import { Trim } from '../../common/dto/trim.js';

export class CreateTeamMemberDto {
  @ApiProperty({ example: 'Олена Коваль' })
  @Trim()
  @IsString({ message: 'Ім’я має бути рядком' })
  @Length(2, 60, { message: 'Ім’я має містити від 2 до 60 символів' })
  name: string;

  @ApiProperty({ example: 'Засновниця та CEO' })
  @Trim()
  @IsString({ message: 'Посада має бути рядком' })
  @Length(2, 80, { message: 'Посада має містити від 2 до 80 символів' })
  position: string;

  @ApiProperty({ example: '/img/team/team-1.webp' })
  @Trim()
  @IsString({ message: 'Фото має бути рядком' })
  @Length(1, 500, { message: 'Шлях до фото має містити до 500 символів' })
  photo: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl({}, { message: 'Facebook: вкажіть коректне посилання' })
  facebook?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl({}, { message: 'Instagram: вкажіть коректне посилання' })
  instagram?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl({}, { message: 'LinkedIn: вкажіть коректне посилання' })
  linkedin?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt({ message: 'Порядок має бути цілим числом' })
  @Min(0, { message: 'Порядок не може бути від’ємним' })
  order?: number;
}
