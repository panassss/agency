import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, MaxLength } from 'class-validator';
import { NormalizeEmail } from '../../common/dto/trim.js';

export class CreateSubscriberDto {
  @ApiProperty({ example: 'reader@example.com' })
  @NormalizeEmail()
  @IsEmail({}, { message: 'Вкажіть коректну електронну адресу' })
  @MaxLength(120, { message: 'Електронна адреса задовга' })
  email: string;
}
