import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length, Matches, MaxLength } from 'class-validator';
import { NormalizeEmail, Trim } from '../../common/dto/trim.js';

export class RegisterDto {
  @ApiProperty({ example: 'Олена Коваль' })
  @Trim()
  @IsString({ message: 'Ім’я має бути рядком' })
  @Length(2, 60, { message: 'Ім’я має містити від 2 до 60 символів' })
  name: string;

  @ApiProperty({ example: 'olena@example.com' })
  @NormalizeEmail()
  @IsEmail({}, { message: 'Вкажіть коректну електронну адресу' })
  @MaxLength(120, { message: 'Електронна адреса задовга' })
  email: string;

  @ApiProperty({ example: 'Secret123', minLength: 8 })
  @IsString({ message: 'Пароль має бути рядком' })
  @Length(8, 72, { message: 'Пароль має містити від 8 до 72 символів' })
  @Matches(/^(?=.*[A-Za-zА-Яа-яІіЇїЄєҐґ])(?=.*\d)/, {
    message: 'Пароль має містити щонайменше одну літеру та одну цифру',
  })
  password: string;
}
