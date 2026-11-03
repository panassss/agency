import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { RequestStatus } from '../../generated/prisma/client.js';

export class UpdateRequestStatusDto {
  @ApiProperty({ enum: RequestStatus })
  @IsEnum(RequestStatus, {
    message: 'Статус має бути одним із: NEW, IN_PROGRESS, DONE, CANCELLED',
  })
  status: RequestStatus;
}
