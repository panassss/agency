import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { TokenVerifierService } from './token-verifier.service.js';

/** Attaches the user when a valid token is present, but never blocks the request. */
@Injectable()
export class OptionalJwtGuard implements CanActivate {
  constructor(private readonly tokens: TokenVerifierService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.tokens.extractToken(request);
    if (token) {
      request.user = (await this.tokens.verify(token)) ?? undefined;
    }
    return true;
  }
}
