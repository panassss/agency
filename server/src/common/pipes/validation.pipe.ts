import {
  BadRequestException,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';

function collectMessages(errors: ValidationError[], parent = ''): string[] {
  return errors.flatMap((error) => {
    const path = parent ? `${parent}.${error.property}` : error.property;
    const own = Object.entries(error.constraints ?? {}).map(
      ([constraint, message]) =>
        constraint === 'whitelistValidation'
          ? `Поле «${path}» не підтримується`
          : message,
    );
    return [...own, ...collectMessages(error.children ?? [], path)];
  });
}

export const appValidationPipe = new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
  exceptionFactory: (errors) =>
    new BadRequestException(collectMessages(errors)),
});
