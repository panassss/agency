import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';
import { Trim } from '../../common/dto/trim.js';

export class CreateTestimonialDto {
  @ApiProperty({ example: 'Ірина Мельник' })
  @Trim()
  @IsString({ message: 'Автор має бути рядком' })
  @Length(2, 60, { message: 'Ім’я автора має містити від 2 до 60 символів' })
  author: string;

  @ApiProperty({ example: 'CEO компанії «Зерно»' })
  @Trim()
  @IsString({ message: 'Посада має бути рядком' })
  @Length(2, 80, { message: 'Посада має містити від 2 до 80 символів' })
  position: string;

  @ApiProperty()
  @Trim()
  @IsString({ message: 'Відгук має бути рядком' })
  @Length(10, 600, { message: 'Відгук має містити від 10 до 600 символів' })
  quote: string;

  @ApiProperty({ example: '/img/testimonials/avatar-1.webp' })
  @Trim()
  @IsString({ message: 'Аватар має бути рядком' })
  @Length(1, 500, { message: 'Шлях до аватара має містити до 500 символів' })
  avatar: string;
}
