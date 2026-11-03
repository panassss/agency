import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, type JwtSignOptions } from '@nestjs/jwt';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { OptionalJwtGuard } from './guards/optional-jwt.guard.js';
import { RolesGuard } from './guards/roles.guard.js';
import { TokenVerifierService } from './guards/token-verifier.service.js';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: config.get(
            'JWT_EXPIRES_IN',
            '7d',
          ) as JwtSignOptions['expiresIn'],
        },
      }),
    }),
  ],
  providers: [TokenVerifierService, JwtAuthGuard, OptionalJwtGuard, RolesGuard],
  exports: [
    JwtModule,
    TokenVerifierService,
    JwtAuthGuard,
    OptionalJwtGuard,
    RolesGuard,
  ],
})
export class AuthCommonModule {}
