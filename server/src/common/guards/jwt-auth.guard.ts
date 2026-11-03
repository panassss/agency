import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { TokenVerifierService } from './token-verifier.service.js';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly tokens: TokenVerifierService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.tokens.extractToken(request);
    if (!token) {
      throw new UnauthorizedException('Потрібна авторизація');
    }
    const user = await this.tokens.verify(token);
    if (!user) {
      throw new UnauthorizedException(
        'Сесія недійсна або завершилась. Увійдіть знову',
      );
    }
    request.user = user;
    return true;
  }
}
