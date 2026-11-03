import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AdminModule } from './admin/admin.module.js';
import { AuthModule } from './auth/auth.module.js';
import { AuthCommonModule } from './common/auth-common.module.js';
import { validateEnv } from './config/env.validation.js';
import { HealthModule } from './health/health.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { ProjectsModule } from './projects/projects.module.js';
import { RequestsModule } from './requests/requests.module.js';
import { ServicesModule } from './services/services.module.js';
import { SubscribersModule } from './subscribers/subscribers.module.js';
import { TeamModule } from './team/team.module.js';
import { TestimonialsModule } from './testimonials/testimonials.module.js';
import { UsersModule } from './users/users.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    ThrottlerModule.forRoot({
      throttlers: [{ name: 'default', ttl: 60_000, limit: 100 }],
      errorMessage: 'Забагато запитів. Спробуйте трохи пізніше',
    }),
    PrismaModule,
    AuthCommonModule,
    HealthModule,
    AuthModule,
    UsersModule,
    ServicesModule,
    ProjectsModule,
    TeamModule,
    TestimonialsModule,
    RequestsModule,
    SubscribersModule,
    AdminModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
