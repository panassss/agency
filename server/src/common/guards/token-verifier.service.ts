import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service.js';
import type { AuthUser, JwtPayload } from '../types/auth-user.js';

@Injectable()
export class TokenVerifierService {
  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  extractToken(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  /**
   * Resolves the user from the database rather than trusting the token
   * payload, so a role change or account deletion takes effect immediately.
   */
  async verify(token: string): Promise<AuthUser | null> {
    try {
      const payload = await this.jwt.verifyAsync<JwtPayload>(token);
      return await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, name: true, email: true, role: true },
      });
    } catch {
      return null;
    }
  }
}
