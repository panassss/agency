import type { Role } from '../../generated/prisma/client.js';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface JwtPayload {
  sub: number;
  role: Role;
}
