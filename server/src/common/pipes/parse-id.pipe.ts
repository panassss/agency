import { BadRequestException, ParseIntPipe } from '@nestjs/common';

export const ParseIdPipe = new ParseIntPipe({
  exceptionFactory: () => new BadRequestException('Некоректний ідентифікатор'),
});
