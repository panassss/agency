import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { Prisma } from '../../generated/prisma/client.js';

const KNOWN_ERRORS: Record<string, { status: HttpStatus; message: string }> = {
  P2002: {
    status: HttpStatus.CONFLICT,
    message: 'Запис з таким унікальним значенням уже існує',
  },
  P2003: {
    status: HttpStatus.CONFLICT,
    message: 'Операція неможлива через пов’язані записи',
  },
  P2025: { status: HttpStatus.NOT_FOUND, message: 'Запис не знайдено' },
};

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const known = KNOWN_ERRORS[exception.code];
    const status = known?.status ?? HttpStatus.INTERNAL_SERVER_ERROR;
    response.status(status).json({
      statusCode: status,
      message: known?.message ?? 'Помилка бази даних',
      error: HttpStatus[status],
    });
  }
}
