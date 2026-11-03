import { Injectable } from '@nestjs/common';
import { RequestStatus } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async stats() {
    const [projects, services, users, subscribers, byStatus] =
      await Promise.all([
        this.prisma.project.count(),
        this.prisma.service.count(),
        this.prisma.user.count(),
        this.prisma.subscriber.count(),
        this.prisma.request.groupBy({ by: ['status'], _count: { _all: true } }),
      ]);
    const requests = Object.fromEntries(
      Object.values(RequestStatus).map((status) => [status, 0]),
    ) as Record<RequestStatus, number>;
    for (const group of byStatus) {
      requests[group.status] = group._count._all;
    }
    const total = Object.values(requests).reduce(
      (sum, count) => sum + count,
      0,
    );
    return {
      projects,
      services,
      users,
      subscribers,
      requests: { total, ...requests },
    };
  }
}
