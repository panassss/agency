import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { NormalizeEmail } from '../../common/dto/trim.js';

export class LoginDto {
  @ApiProperty({ example: 'admin@canvix.ua' })
  @NormalizeEmail()
  @IsEmail({}, { message: 'Вкажіть коректну електронну адресу' })
  email: string;

  @ApiProperty({ example: 'Admin12345' })
  @IsString({ message: 'Пароль має бути рядком' })
  @IsNotEmpty({ message: 'Вкажіть пароль' })
  password: string;
}
